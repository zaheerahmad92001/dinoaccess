import React, { Component } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import connectWithDevice from '@/modules/connectWithDevice'
import SettingsSectionList, { ValueItem, ValueItemWrapper } from '@/components/SettingsSectionList'
import styled from 'styled-components/native'
import Swatch from '@/assets/Swatch'
import { DeviceActions } from '@/redux'
import TextInputModal from '@/components/Modals/TextInputModal'
import ListSelectionModal from '@/components/Modals/ListSelectionModal'
import FirmwareUpdatingModal from '@/components/Modals/FirmwareUpdatingModal'
import DeleteModal from '@/components/Modals/DeleteModal'
import axios from '@/services/axios'
import socket from '@/services/socket'
import { EventRegister } from 'react-native-event-listeners'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import Wave from '@/components/Wave'
import { translate, getLocale3 } from '@/services/i18n'
import moment from 'moment'
import CountryPicker from 'react-native-country-picker-modal'
import { setErrorMessage } from '@/components/Modals/ErrorMessageModal'

const DeleteView = styled.View`
    display: flex;
    align-items: center;
    margin-top: 40px;
    padding-bottom: 20px;
`

const DeleteButton = styled.Text`
    opacity: 0.6;
    color: ${Swatch.red};
`

const ColorPreviewWrapper = styled.View`
    display: flex;
    flex-direction: row;
    text-align: right;
    justify-content: flex-end;
    flex: 1;
`

const ColorPreview = styled.View`
    width: 18px;
    height: 18px;
    border-radius: 9px;
    margin-left: 3px;
`

class SettingsList extends Component {

    state = {
        modal: null,
        deviceUpdate: null,
        espUpdate: null,
    }

    textInputModal(name, title, text = '', value = '', onSave) {
        return <TextInputModal
            isVisible={this.state.modal == name}
            title={title}
            description={text}
            value={value}
            onSave={onSave}
            onClose={() => this.setState({ modal: false })}
        />
    }

    deleteModal(name) {
        let onClose = async (deleted) => {
            this.setState({ modal: false })

            if (deleted) {
                await axios.delete(`installation/${this.props.token}/delete`)
                EventRegister.emit('navigateFromDevice')
            }
        }

        return <DeleteModal
            isVisible={this.state.modal == name}
            name={this.props.devices[this.props.token].display_name}
            token={this.props.token}
            onClose={onClose}
        />
    }

    selectModal(name, title, options = {}, value = '', text = '', onSave) {
        return <ListSelectionModal
            isVisible={this.state.modal == name}
            title={title}
            options={options}
            value={value}
            description={text}
            onSave={onSave}
            onClose={() => this.setState({ modal: false })}
        />
    }

    saveFunction(field) {
        return async (value) => {
            this.setState({ modal: false })
            value = value.trim()
            
            if (field == 'interval') {
                let saved = socket.saveRegister(this.props.token, 101, value)
            } else {
                await axios.post(`installation/${this.props.token}/update`, {
                    [field]: value
                })

                let owned = { ...this.props.devices }
                switch (field) {
                    case 'name':
                        owned[this.props.token].display_name = value
                        break
                    case 'zip':
                        owned[this.props.token].address.zip = value
                        break
                    case 'city':
                        owned[this.props.token].address.city = value
                        break
                    case 'country':
                        owned[this.props.token].address.country = value
                        break
                }

                this.props.dispatch({
                    type: DeviceActions.STORE_DEVICES,
                    list: owned
                })
            }
        }
    }

    async searchFirmwareUpdate() {
        try {
            let registers = this.props.registers
            let device = this.props.devices[this.props.token]

            async function searchForUpdate (type, version) {
                let { data } = await axios.get('firmware/list', { params: {
                    type, version,
                }})
                
                return data ? data.update : null
            }

            let deviceUpdate = await searchForUpdate(device.type, `${registers[98]}${registers[99]}`)
            let espUpdate = await searchForUpdate(`ESP_${device.type}`, registers['ESP_fw'])

            if (deviceUpdate || espUpdate) {
                this.setState({ modal: 'firmware', deviceUpdate, espUpdate })
            } else {
                setErrorMessage(translate('settings.nofirmwareupdate'))
            }
        } catch (e) {
            console.warn(e.response.data)
            setErrorMessage(translate('settings.firmwareerror'))
        }
    }

    render() {
        let registers = this.props.registers

        let device = this.props.devices[this.props.token]
        if (!device) return null
        if (!device.address) device.address = {}

        let refreshInterval = registers[101] || 10000
        let intervals = {
            10000: translate('settings.intervals.10'),
            20000: translate('settings.intervals.20'),
            30000: translate('settings.intervals.30'),
            45000: translate('settings.intervals.45'),
            60000: translate('settings.intervals.60')
        }

        let selectedColor = this.props.colorScheme.name

        const chooseColorScheme = ({ item }) => {
            if (item.title != translate('settings.schema')) return <ValueItem key={item.title} {...item} />

            let selectColor = (name) => {
                this.props.dispatch({
                    type: DeviceActions.SET_DEVICE_COLOR,
                    token: this.props.token,
                    color: name
                })
            }

            let colors = Object.keys(Swatch.schemes)
            let previews = colors.map(name => <TouchableOpacity key={name} onPress={() => selectColor(name)}>
                <ColorPreview style={{ backgroundColor: Swatch.schemes[name][0], opacity: name == selectedColor ? 1 : 0.3 }} />
            </TouchableOpacity>)

            return (
                <ValueItemWrapper key={item.title}>
                    <Text style={{ flex: 1, color: 'black' }}>{item.title}</Text>
                    <ColorPreviewWrapper>{previews}</ColorPreviewWrapper>
                </ValueItemWrapper>
            )
        }

        let calculateSignalStrength = (rssi) => {
            if (rssi >= -50) return '100 %'
            if (rssi <= -100) return '0 %'
            return ((rssi + 100) * 2) + ' %'
        }

        let deviceSettings = [
            { title: translate('settings.name'), value: device.display_name, onPress: () => this.setState({ modal: 'name' }) },
            { title: translate('settings.schema') },
            { title: translate('settings.serial'), value: '' + registers.CF_id, readonly: true },
            { title: translate('settings.firmware'), value: `${registers[98]}${registers[99]}`, readonly: true },
        ]

        if (device.isOnline) {
            deviceSettings.push({ title: '', value: translate('settings.firmwareupdate'), onPress: () => this.searchFirmwareUpdate() })
        }

        if (this.props.canWriteToCF100) {
            deviceSettings.splice(1, 0, { title: translate('settings.interval'), value: intervals[refreshInterval], onPress: () => this.setState({ modal: 'interval' }), readonly: !device.isOnline })
        }

        return <ScrollView style={{ backgroundColor: '#FAFAFA', minHeight: '100%' }} contentContainerStyle={{ paddingTop: getStatusBarHeight() }}>
            {this.textInputModal('name', translate('settings.name'), '', device.display_name, this.saveFunction('name'))}
            {this.selectModal('interval', translate('settings.interval'), intervals, refreshInterval, '', this.saveFunction('interval'))}
            {this.textInputModal('address', translate('settings.city'), '', device.address.city, this.saveFunction('city'))}
            {this.textInputModal('zipcode', translate('settings.zip'), '', device.address.zip, this.saveFunction('zip'))}
            {this.deleteModal('delete')}

            <FirmwareUpdatingModal
                isVisible={this.state.modal == 'firmware'}
                deviceUpdate={ this.state.deviceUpdate }
                espUpdate={ this.state.espUpdate }
                type={ device.type }
                ip={ registers.IP }
                token={ device.token }
                onClose={() => this.setState({ modal: false })}
            />
            
            <Wave color={this.props.colorScheme.primary[0]} style={{ marginTop: -getStatusBarHeight() }}>
                <Text style={{ fontSize: 22, color: this.props.colorScheme.opposite[0], marginTop: 4 }}>{ translate('settings.title') }</Text>
            </Wave>

            <SettingsSectionList
                ListFooterComponent={() => <DeleteView>
                    <TouchableOpacity onPress={() => this.setState({ modal: 'delete' })}>
                        <DeleteButton>{ translate('settings.delete') }</DeleteButton>
                    </TouchableOpacity>
                </DeleteView>}
                sections={[
                    {
                        data: deviceSettings,
                        key: translate('settings.device'),
                        renderItem: chooseColorScheme
                    },
                    {
                        data: [
                            { title: translate('settings.token'), value: device.token, readonly: true },
                            { title: translate('settings.lastupdate'), value: moment(device.lastRegisterUpdate).format('L LTS'), readonly: true },
                            { title: translate('settings.ssid'), value: registers.SSID || '', readonly: true },
                            { title: translate('settings.ip'), value: registers.IP || '', readonly: true },
                            { title: translate('settings.signalstrength'), value: calculateSignalStrength(registers.RSSI), readonly: true },
                            { title: translate('settings.espfw'), value: '' + registers.ESP_fw, readonly: true },
                        ],
                        key: translate('settings.infos')
                    },
                    {
                        data: [
                            { title: translate('settings.zip'), value: device.address.zip, onPress: () => this.setState({ modal: 'zipcode' }) },
                            { title: translate('settings.city'), value: device.address.city, onPress: () => this.setState({ modal: 'address' }) },
                            { title: translate('settings.country'), value: translate(`country.${device.address.country}`), onPress: () => this.countryPicker.openModal() },
                        ],
                        key: translate('settings.position')
                    },
                ]}
            />

            <CountryPicker
                ref={ ref => this.countryPicker = ref }
                cca2={ device.address.country || 'DE' }
                filterable
                translation={ getLocale3() }
                onChange={ country => this.saveFunction('country')(country.cca2) }
            >
                <View />
            </CountryPicker>
        </ScrollView>
    }

}

export default connectWithDevice(connect(state => ({
    user: state.auth.user,
    devices: state.devices.list,
    canWriteToCF100: state.iap.canWriteToCF100
}))(SettingsList))
