import React, { Component } from 'react'
import { ScrollView, View, Text, Button, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import { ConfigurationActions, DeviceActions, store } from '@/redux'
import axios from '@/services/axios'
import StepList from '@/components/StepList'
import PillButton from '@/components/PillButton'
import TextInput from '@/components/TextInput'
import Checkbox from '@/components/Checkbox'
import Hint from '@/components/Hint'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import { translate, getLocale3 } from '@/services/i18n'
import CountryPicker from 'react-native-country-picker-modal'
import Swatch from '@/assets/Swatch'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

class Details extends Component {

    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props)

        this.state = {
            type: 'PCD',
            name: '',
            city: '',
            zip: '',
            country: ''
        }
    }

    async onSubmit() {
        let { type, name, city, zip, country } = this.state

        try {
            let { data } = await axios.post('installation/register', {
                type, name, city, zip, country
            })

            let token = data.token
            this.props.dispatch({
                type: ConfigurationActions.STORE_DEVICE_TOKEN,
                token,
                password: data.password,
                deviceType: type
            })

            let devices = store.getState().devices.list
            devices[token] = data.installation
            devices[token].owned = true

            this.props.dispatch({
                type: DeviceActions.STORE_DEVICES,
                list: devices
            })

            this.props.navigation.navigate('ConfigurationWiFiCredentials')
        } catch (e) {
            console.warn('Error', e)
            // z.B. 400 (falsche Daten), oder 401 (ungültiger Nutzer)
        }
    }

    get canSubmit() {
        let { type, name, city, zip, country } = this.state
        if (!name || !city || !zip || !country) return false
        return true
    }

    render() {
        return <KeyboardAwareScrollView style={{ backgroundColor: 'white', height: '100%' }} contentContainerStyle={{ paddingTop: getStatusBarHeight() }}>
            <StepList steps={3} currentStep={0}>
                <Text style={{ fontWeight: 'bold' }}>{translate('views.configuration.step', { step: 1 })}</Text>
                <Text>{translate('views.configuration.details.title')}</Text>
            </StepList>

            <View style={{ padding: 40 }}>
                <View style={{ display: 'flex', flexDirection: 'column' }}>
                    <Checkbox name="type" value="PCD" label={translate('types.PCD')} selected={this.state.type} onSelect={(attr) => this.setState(attr)} style={{ marginBottom: 8 }} />
                    
                    <Checkbox name="type" value="CF100" label={translate('types.CF100')} selected={this.state.type} onSelect={(attr) => this.setState(attr)} />
                </View>
                <Hint style={{marginBottom: 20, fontWeight: 'bold' }}>{translate('views.configuration.details.typehint')}</Hint>

                <TextInput placeholder={translate('views.configuration.details.name')} hint={translate('views.configuration.details.namehint')} onChangeText={(name) => this.setState({ name })}></TextInput>
                <TextInput placeholder={translate('views.configuration.details.zip')} onChangeText={(zip) => this.setState({ zip })}></TextInput>
                <TextInput placeholder={translate('views.configuration.details.city')} onChangeText={(city) => this.setState({ city })}></TextInput>

                <TouchableOpacity onPress={() => this.countryPicker.openModal()}>
                    <View style={{ borderBottomColor: Swatch.darkGray, borderBottomWidth: 1, paddingVertical: 10 }}>
                        <Text style={{ fontSize: 16 }}>{translate(this.state.country ? `country.${this.state.country}` : 'views.configuration.details.country')}</Text>
                    </View>
                </TouchableOpacity>

                <CountryPicker
                    ref={ref => this.countryPicker = ref}
                    cca2={this.state.country}
                    filterable
                    translation={getLocale3()}
                    onChange={country => this.setState({ country: country.cca2 })}
                >
                    <View />
                </CountryPicker>


            </View>

            <View style={{ display: 'flex', alignItems: 'center' }}>
                <PillButton onPress={() => this.onSubmit()} title={translate('continue')} disabled={!this.canSubmit} style={this.canSubmit ? null : { opacity: 0.5 }} />
                <TouchableOpacity onPress={() => this.props.navigation.goBack()} style={{ marginTop: 10 }}><Text>{translate('back')}</Text></TouchableOpacity>
            </View>
        </KeyboardAwareScrollView>
    }

}

export default connect()(Details)
