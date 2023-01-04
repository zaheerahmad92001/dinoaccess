import React, { Component } from 'react'
import { View, Text, ScrollView, RefreshControl, ImageBackground, TouchableOpacity, Image, SafeAreaView } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faUser } from '@fortawesome/pro-regular-svg-icons'
import styled from 'styled-components/native'
import { connect } from 'react-redux'
import axios from '@/services/axios'
import DeviceListItem from '@/components/DeviceListItem'
import DeviceNotConnectedModal from '@/components/Modals/DeviceNotConnectedModal'
import Swatch from '@/assets/Swatch'
import moment from 'moment'
import Toast, { DURATION } from 'react-native-easy-toast'
import { DeviceActions, ConfigurationActions } from '@/redux'
import { translate } from '@/services/i18n'
import { setErrorMessage } from '@/components/Modals/ErrorMessageModal'

const RoundButton = styled.TouchableOpacity`
    width: 50px;
    height: 50px;
    border-radius: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    backgroundColor: ${Swatch.yellow};
    position: absolute;
    right: 20px;
    bottom: 20px;
`

const NoDevicesText = styled.Text`
    padding: 50px 10px;
    text-align: center;
    color: ${Swatch.darkGray}
`

class Overview extends Component {

    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props)

        this.state = {
            devices: [],
            refreshing: false,
            notConnectedModalVisible: false,
            selectedDevice: null,
            loadingDevice: null,
        }
    }

    async loadData() {
        try {
            let { data } = await axios.get('installation/list')

            let owned = data.owned.map((device) => {
                device.owned = true
                
                return device
            })
    
            this.props.dispatch({
                type: DeviceActions.STORE_DEVICES,
                list: owned.reduce((prev, curr) => {
                    if (this.props.navigateTo && curr.token == this.props.navigateTo) {
                        curr.isOnline = true
                        curr.lastRegisterUpdate = moment().format('YYYY-MM-DD HH:mm:ss')
                    }
                    
                    prev[curr.token] = curr
                    return prev
                }, {})
            })
    
            this.setState({ devices: owned })
        } catch (e) {
            console.warn(e.message)
        }
    }

    async onRefresh() {
        this.setState({ refreshing: true })
        await this.loadData()
        this.setState({ refreshing: false })
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isFocused === this.props.isFocused || !this.props.isFocused) return
    
        let navigateTo = this.props.navigateTo
        if (!navigateTo) return

        let device = this.props.devices[navigateTo]
        device.lastRegisterUpdate = 1
        this.select(device)()

        this.props.dispatch({
            type: ConfigurationActions.DEVICE_FINISHED_CONFIGURATION,
            token: null
        })
    }

    componentDidMount() {
        this.loadData()

        this.props.navigation.addListener('willFocus', () => {
            this.loadData()
        })
    }

    select(item) {
        return async () => {
            if (this.state.loadingDevice) return
            
            if (this.isUpdating(item.token)) {
                return setErrorMessage(translate('modals.firmwareupdating.message', { type: translate(`types.${item.type}`) }))
            }

            this.setState({ loadingDevice: item.token })

            let registers = {}
            try {
                let { data } = await axios.get(`/installation/${item.token}/state`)
    
                this.props.dispatch({
                    type: DeviceActions.UPDATE_REGISTERS,
                    token: item.token,
                    values: data.state,
                    origin: 'api',
                })

                registers = data.state
            } catch (e) {

            } finally {
                this.setState({ loadingDevice: null })
            }

            if (!item.lastRegisterUpdate) {
                return this.setState({ selectedDevice: item, notConnectedModalVisible: true })
            }
            
            if (this.props.updates) {
                let update = this.props.updates[item.token]
                
                if (update && registers) {
                    let version = item.type == 'CF100' ? `${registers[98]}${registers[99]}` : registers[146]
                    if (update.target == 'esp') version = registers['ESP_fw']

                    if (update.version != version) {
                        setErrorMessage(translate('modals.firmwareupdating.error', { type: translate(`types.${item.type}`) }))
                    }

                    this.props.dispatch({
                        type: DeviceActions.REMOVE_UPDATE,
                        token: item.token
                    })    
                }
            }

            this.props.dispatch({
                type: DeviceActions.SET_SELECTED_DEVICE,
                device: item.token
            })

            const routeName = {
                CF100: 'Cf100',
                PCD: 'Pcd',
                'Membrano EC': 'Kmze',
            }[item.type]

            this.props.navigation.navigate({
                routeName,
                params: {
                    token: item.token
                }
            })
        }
    }

    gotoAccountPage() {
        this.props.navigation.navigate('Account')
    }

    isUpdating(token) {
        if (!this.props.updates) return false
        if (!this.props.updates[token]) return false

        let update = this.props.updates[token]
        return Date.now() - update.time <= 30000 // wait for at least 30 seconds
    }

    render() {
        let devices = this.props.devices
        let items = devices ? Object.keys(devices).map((token) => {
            let isOnline = devices[token].isOnline && !this.isUpdating(token)
            return <DeviceListItem
                item={devices[token]}
                online={isOnline}
                key={token}
                loading={this.state.loadingDevice == token }
                onSelect={this.select(devices[token])}
            />
        }) : []

        if (!items.length) {
            items = <NoDevicesText>{ translate('views.dashboard.overview.noinstallations') }</NoDevicesText>
        }

        return <ImageBackground
            source={require('@/assets/images/topography.png')}
            style={{ backgroundColor: 'white', width: '100%', height: '100%' }}
            imageStyle={{ opacity: 0.35 }}
        >
            <SafeAreaView>
                <Toast ref="toast" style={{ marginRight: 20, marginLeft: 20 }} />
                <ScrollView style={{ minHeight: '100%' }}
                    refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={() => this.onRefresh()} />}
                >
                    <View style={{ padding: 20 }}>
                        <DeviceNotConnectedModal
                            navigation={ this.props.navigation }
                            device={ this.state.selectedDevice }
                            isVisible={ this.state.notConnectedModalVisible }
                            onClose={ () => this.setState({ notConnectedModalVisible: false }) }
                        />

                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View>
                                <Text style={{ color: 'black' }}>{ translate('hello') } { translate(`salutation.${this.props.user.salutation}`) } {this.props.user.last_name},</Text>
                                <Text style={{ fontWeight: 'bold', color: 'black' }}>{ translate('views.dashboard.overview.yourinstallations') }</Text>
                            </View>

                            <View style={{ marginTop: 6, marginRight: 5 }}>
                                <TouchableOpacity onPress={() => this.gotoAccountPage()}>
                                    <FontAwesomeIcon icon={faUser} size={24} color={Swatch.darkGray} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 40 }}>
                            {items}
                        </View>
                    </View>
                </ScrollView>

                <RoundButton onPress={() => this.props.navigation.navigate('ConfigurationDetails')}>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>+</Text>
                </RoundButton>
            </SafeAreaView>
        </ImageBackground>
    }

}

export default connect(state => ({
    devices: state.devices.list,
    registers: state.devices.registers,
    updates: state.devices.updating,
    user: state.auth.user,
    navigateTo: state.config.navigateTo
}))(Overview)
