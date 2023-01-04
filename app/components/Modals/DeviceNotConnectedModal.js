import React, { Component } from 'react'
import { Text, View } from 'react-native'
import Modal from 'react-native-modal'
import styled from 'styled-components/native'
import Swatch from '@/assets/Swatch'
import { connect } from 'react-redux'
import { DeviceActions, ConfigurationActions } from '@/redux'
import axios from '@/services/axios'
import { translate } from '@/services/i18n'

const Title = styled.Text`
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 10px;
    padding: 20px;
    padding-bottom: 0;
`

const Description = styled.Text`
    margin-bottom: 14px;
    margin-top: 8px;
    padding-left: 20px;
    padding-right: 20px;
`

const ModalContent = styled.View`
    border-radius: 4px;
    background-color: white;
    overflow: hidden;
`

const ListRow = styled.TouchableOpacity`
    display: flex;
    flex-direction: row;
    border-color: #e5e5e5;
    border-top-width: 1px;
    padding: 15px 20px;
    border-bottom-width: 1px;
    margin-bottom: -1px;
`

class DeviceNotConnectedModal extends Component {

    state = {
        loading: false,
    }

    componentDidUpdate (prevProps) {
        if (this.props.token !== prevProps.token) {
            this.setState({ loading: false })
        }
    }
    
    render () {
        let { device, list, dispatch, ...props } = this.props
        
        let onClose = () => {
            this.setState({ loading: false })
            this.props.onClose()
        }

        let options = [
            {
                title: translate('modals.notconnected.continue'),
                onPress: () => {
                    dispatch({
                        type: ConfigurationActions.RESTART_CONFIGURATION,
                        token: device.token,
                        deviceType: device.type,
                        password: device.password,
                    })

                    this.props.navigation.navigate('ConfigurationWiFiCredentials')
                    onClose()
                }
            },
            {
                title: translate('modals.notconnected.delete'),
                style: { color: Swatch.red },
                onPress: async () => {
                    if (this.state.loading) return
                    this.setState({ loading: true })

                    await axios.delete(`installation/${this.props.device.token}/delete`)

                    delete list[device.token]
                    dispatch({
                        type: DeviceActions.STORE_DEVICES,
                        list
                    })

                    onClose()
                }
            },
            {
                title: translate('cancel'),
                onPress: onClose,
            },
        ]

        options = options.map((option, i) => {
            let isLast = i == options.length - 1
            
            return <ListRow
                key={option.title}
                onPress={option.onPress}
                style={{
                    borderBottomWidth: isLast ? 0 : 1,
                }}
            >
                <Text style={{ fontSize: 16, ...option.style }}>
                    {option.title}
                </Text>
            </ListRow>
        })

        return (
            <View style={{ flex: 1 }}>
                <Modal backdropOpacity={0.5} onBackdropPress={onClose} {...props}>
                    <ModalContent>
                        <Title>{ translate('modals.notconnected.title') }</Title>
                        <Description>{ translate('modals.notconnected.description') }</Description>

                        {options}
                    </ModalContent>
                </Modal>
            </View>
        )
    }
}

export default connect(state => ({ list: state.devices.list }))(DeviceNotConnectedModal)
