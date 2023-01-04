import React, { Component } from 'react'
import { ScrollView, View, Text, Button, TouchableOpacity, Platform, PermissionsAndroid, NativeModules } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/pro-solid-svg-icons'
import { connect } from 'react-redux'
import { ConfigurationActions, store } from '@/redux'
import axios from '@/services/axios'
import StepList from '@/components/StepList'
import PillButton from '@/components/PillButton'
import TextInput from '@/components/TextInput'
import { NetworkInfo } from 'react-native-network-info'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import { translate } from '@/services/i18n'
import Swatch from '@/assets/Swatch'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const { SSIDReader } = NativeModules

class WiFiCredentials extends Component {

    static navigationOptions = {
        header: null
    }

    constructor (props) {
        super(props)

        this.state = {
            ssid: '',
            passphrase: '',
            showSSID: false,
        }
    }

    async componentDidMount () {
        if (Platform.OS == 'android') { 
            let granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: translate('views.configuration.wifilist.permission.title'),
                    message: translate('views.configuration.wifilist.permission.message')
                }
            )
        }

        let ssid = null
        try { ssid = await NetworkInfo.getSSID() } catch (e) { }

        if (Platform.OS == 'ios' && !ssid) {
            try { ssid = await SSIDReader.getSSID() } catch (e) { }
        }

        if (ssid && ssid != '<unknown ssid>') {
            this.setState({ ssid })
        }
    }

    async onSubmit () {
        let { ssid, passphrase } = this.state

        this.props.dispatch({
            type: ConfigurationActions.STORE_WIFI_CREDENTIALS,
            ssid: ssid.trim(), passphrase,
        })

        this.props.navigation.navigate('ConfigurationWiFiList')
    }

    get canSubmit () {
        let { ssid, passphrase } = this.state
        if (!ssid || !passphrase) return false
        if (passphrase.length < 8) return false
        return true
    }

    render () {
        let { type } = store.getState().config

        return <KeyboardAwareScrollView style={{ backgroundColor: 'white', height: '100%' }} contentContainerStyle={{ paddingTop: getStatusBarHeight() }}>
            <StepList steps={ 3 } currentStep={ 1 }>
                <Text style={{ fontWeight: 'bold' }}>{ translate('views.configuration.step', { step: 2 }) }</Text>
                <Text>{ translate('views.configuration.wificredentials.title') }</Text>
            </StepList>

            <View style={{ padding: 40 }}>
                <Text style={{ marginBottom: 15, fontSize: 13, marginTop: -40 }}>
                    { translate('views.configuration.wificredentials.help1', { type: translate(`types.${type}`)}) }
                </Text>
                <Text style={{ marginBottom: 25, fontSize: 13 }}>
                    { translate('views.configuration.wificredentials.help2') }
                </Text>

                <TextInput placeholder={ translate('views.configuration.ssid') } defaultValue={ this.state.ssid } onChangeText={(ssid) => this.setState({ ssid })} />

                <View>
                    <TextInput placeholder={ translate('views.configuration.passphrase') } autoCompleteType="off" autoCorrect={false} secureTextEntry={ !this.state.showSSID } onChangeText={(passphrase) => this.setState({ passphrase })} hint={ translate('views.configuration.wificredentials.passphrasehint') } />
                    <View style={{ position: 'absolute', right: 0, top: 5 }}>
                        <TouchableOpacity onPress={ () => this.setState({ showSSID: !this.state.showSSID }) } style={{ padding: 5 }}>
                            <FontAwesomeIcon icon={this.state.showSSID ? faEye : faEyeSlash} size={22} color={Swatch.darkGray} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={{ display: 'flex', alignItems: 'center' }}>
                <PillButton onPress={ () => this.onSubmit() } title={ translate('continue') } disabled={ !this.canSubmit } style={ this.canSubmit ? null : { opacity: 0.5 }} />
                <TouchableOpacity onPress={ () => this.props.navigation.goBack() } style={{ marginTop: 10 }}><Text>{ translate('back') }</Text></TouchableOpacity>
            </View>
        </KeyboardAwareScrollView>
    }

}

export default connect()(WiFiCredentials)