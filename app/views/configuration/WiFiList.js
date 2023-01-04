import React, { Component } from 'react'
import { ScrollView, View, Text, Button, TouchableOpacity, Dimensions } from 'react-native'
import { connect } from 'react-redux'
import { ConfigurationActions, DeviceActions, store } from '@/redux'
import baseAxios from 'axios'
import axios from '@/services/axios'
import StepList from '@/components/StepList'
import * as Progress from 'react-native-progress'
import Swatch from '@/assets/Swatch'
import styled from 'styled-components/native'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import socket from '@/services/socket'
import { setErrorMessage } from '@/components/Modals/ErrorMessageModal'
import { translate } from '@/services/i18n'

const StatusLabelWrapper = styled.Text`
    padding: 30px;
    width: 100%;
    text-align: center;
`

const StatusLabel = styled.Text`
    font-weight: bold;
    font-size: 16px;
    text-align: center;
`

const StatusLabelWifi = styled.Text`
    font-weight: normal;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.4);
`

function sleep (timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout))
}

class WiFiList extends Component {

    static navigationOptions = {
        header: null
    }

    unmounted = false

    constructor (props) {
        super(props)

        this.state = {
            status: 'waiting',
            deviceConfigured: false,
            tries: 0,
        }
    }

    componentWillUnmount () {
        this.unmounted = true
    }

    async componentDidMount () {
        this.submitConfiguration()
    }

    async submitConfiguration () {
        if (this.unmounted) return
        if (this.state.deviceConfigured) return

        try {
            let { token, type, ssid, passphrase, password } = store.getState().config

            this.setState({ status: 'trying' })
            await sleep(50)

            let instance = baseAxios.create({ baseURL: 'http://192.168.5.1', timeout: 4000 })

            console.warn('Waiting for correct type')
            // Verify that this device is indeed of the correct type
            let { data: response } = await instance.get('/', { responseType: 'text' })
            let title = {
                'CF100': '<title>CF Control 100</title>',
                'PCD': '<title>PC Dynamics</title>',
                'Membrano EC': '<title>KMZE</title>',
            }[type]

            console.warn(type, title, response, response.toUpperCase().indexOf(title.toUpperCase()) === -1)

            if (response.toUpperCase().indexOf(title.toUpperCase()) === -1) {
                setErrorMessage(translate(`views.configuration.wifilist.wrongtype`, { type: translate(`types.${type}`) }))
                await sleep(8000)
            } else {
                await instance.get('/configure', { params: { ssid, passphrase, token, password } })
    
                this.setState({ status: 'configured', deviceConfigured: true })
                await sleep(700)
    
                this.waitForData()
            }
        } catch (e) {
            console.warn(e.message)
            // this.setState({ status: e.request ? 'connectionFailed' : 'failed' })
            await sleep(900)
        }

        this.submitConfiguration()
    }

    setStateAsync (state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        })
    }

    async waitForData () {
        if (this.unmounted) return

        let { token, restarted } = store.getState().config
        await this.setStateAsync({ status: 'waitingForMessage' })
        
        let state = {}
        while (!state.IP) {
            try {
                let { data } = await axios.get(`/installation/${token}/state`)
                state = data.state
            } catch (e) {}

            await this.setStateAsync({ tries: this.state.tries + 1 })
            await sleep(1500)

            if (this.state.tries > 60) {
                // 4. If data doesn't come in within n retries: Show error message, go back
                setErrorMessage(translate('views.configuration.wifilist.devicetimeout'))
                await this.setStateAsync({ tries: 0 })
            }
        }

        this.props.dispatch({
            type: DeviceActions.UPDATE_REGISTERS,
            token,
            values: state,
            origin: 'initialFromApi',
        })
    
        this.props.dispatch({
            type: ConfigurationActions.DEVICE_FINISHED_CONFIGURATION,
            token
        })

        let devices = store.getState().devices.list
        devices[token].isOnline = true

        this.props.dispatch({
            type: DeviceActions.STORE_DEVICES,
            list: devices
        })

        this.setState({ status: 'finished' }) 
        await sleep(1000)
        
        // 5. If data does come in: Go back
        this.props.navigation.pop(restarted ? 2 : 3)
    }

    render () {
        let type = store.getState().config.type
        
        let status = ['waiting', 'trying', 'connected', 'configuring', 'configured', 'failed', 'connectionFailed', 'connectingWithWebsocket', 'waitingForMessage', 'finished'].reduce((accumulator, currentValue) => {
            accumulator[currentValue] = <StatusLabel>{ translate(`views.configuration.wifilist.${currentValue}`) }</StatusLabel>
            return accumulator
        }, {})

        let statusMessage = status[this.state.status] 
        let circleWidth = Math.min(Dimensions.get('window').width - 200, 190)

        return <ScrollView style={{ backgroundColor: 'white', height: '100%' }} contentContainerStyle={{ paddingTop: getStatusBarHeight() }}>
            <StepList steps={ 3 } currentStep={ 2 }>
                <Text style={{ fontWeight: 'bold' }}>{ translate('views.configuration.step', { step: 3 }) }</Text>
                <Text>{ translate('views.configuration.wifilist.title') }</Text>
            </StepList>

            <View style={{ padding: 40 }}>
                <Text style={{ marginBottom: 15, fontSize: 13, marginTop: -40 }}>
                    { translate('views.configuration.wifilist.help1', { type: translate(`types.${type}`)}) }
                </Text>
                <Text style={{ marginBottom: 25, fontSize: 13 }}>
                    { translate('views.configuration.wifilist.help2') } <Text style={{ fontWeight: 'bold'}}>{ type }</Text>.
                </Text>
                <Text style={{ marginBottom: 25, fontSize: 13 }}>
                    { translate('views.configuration.wifilist.help3') }
                </Text>
            </View>

            <View style={{display: 'flex', alignItems: 'center', marginTop: -30 }}>
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: circleWidth, height: circleWidth }}>
                    <Progress.CircleSnail style={{ position: 'absolute' }} size={ Math.min(Dimensions.get('window').width - 200, 190) } indeterminate thickness={ 5 } color={ Swatch.yellow } duration={ 2000 } spinDuration={ 5000 } />
                    { statusMessage }
                </View>
                
                <TouchableOpacity onPress={ () => this.props.navigation.goBack() } style={{ marginTop: 50 }}><Text>{ translate('cancel') }</Text></TouchableOpacity>
            </View>
        </ScrollView>
    }

}

export default connect(state => ({ devices: state.devices }))(WiFiList)
