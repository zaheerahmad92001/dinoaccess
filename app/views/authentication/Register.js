import React, { Component } from 'react'
import { Dimensions, Text, ScrollView, View, TouchableOpacity, Image } from 'react-native'
import styled from 'styled-components/native'
import axios from '@/services/axios'
import { connect } from 'react-redux'
import { Svg, Path } from 'react-native-svg'
import { AuthenticationActions, store } from '@/redux'
import Swatch from '@/assets/Swatch'
import PillButton from '@/components/PillButton'
import TextInput from '@/components/TextInput'
import { setErrorMessage } from '@/components/Modals/ErrorMessageModal'
import { translate } from '@/services/i18n'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const StyledView = styled.View`
  background-color: ${Swatch.yellow};
`

class Register extends Component {

    static navigationOptions = {
        header: null
    }

    constructor (props) {
        super(props)

        this.state = { email: '', password: '', passwordConfirm: '' }
    }

    async gotoStep2 () {
        if (this.state.password.length < 8) {
            return setErrorMessage(translate('views.auth.register.passwordlength'))
        }

        try {
            await axios.post('register', {
                email: this.state.email,
            })
        } catch (e) {
            if (e.response && e.response.data) {
                let emailErrors = e.response.data.errors.email
                if (emailErrors) {
                    return setErrorMessage(emailErrors.join('\n\n'))
                }
            } else {
                return setErrorMessage(translate('views.auth.register.emailerror'))
            }
        }

        this.props.navigation.navigate({
            routeName: 'RegisterStep2',
            params: { email: this.state.email, password: this.state.password }
        })
    }

    back () {
        this.props.navigation.goBack()
    }

    render () {
        const width = Dimensions.get('window').width + 2
        const svg = `M0,70 C236,150 250,-28 ${width},50 L${width},100 L0,100`

        let buttonDisabled = !this.state.email || !this.state.password || this.state.password != this.state.passwordConfirm

        return <KeyboardAwareScrollView style={{ backgroundColor: Swatch.yellow }}>
            <View style={{ backgroundColor: 'white', minHeight: 150 }}>
                <Image source={ require('../../assets/icons/dinotec.png') } style={{ width: 80, height: 80, top: 70, marginLeft: 70 }} />

                <Svg height="100" width={ width } style={{ marginBottom: -3 }}>
                    <Path
                        d={ svg }
                        fill={ Swatch.yellow }
                        stroke="none"
                    />
                </Svg>
            </View>
            <View style={{ padding: 30}}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>{ translate('views.auth.register.registration') }</Text>

                <TextInput
                    onChangeText={(text) => this.setState({ email: text })}
                    style={{ marginTop: 40 }}
                    placeholder={ translate('views.auth.login.email') }
                    value={ this.state.email }
                ></TextInput>

                <TextInput
                    onChangeText={(text) => this.setState({ password: text })}
                    autoComplete="password"
                    secureTextEntry
                    placeholder={ translate('views.auth.login.password') }
                    style={{ marginTop: 10 }}
                    value={ this.state.password }
                ></TextInput>

                <TextInput
                    onChangeText={(text) => this.setState({ passwordConfirm: text })}
                    autoComplete="password"
                    secureTextEntry
                    placeholder={ translate('views.auth.register.repeatpassword') }
                    style={{ marginBottom: 40, marginTop: 10 }}
                    value={ this.state.passwordConfirm }
                ></TextInput>

                <PillButton
                    onPress={this.gotoStep2.bind(this)}
                    title={ translate('continue') }
                    disabled={ buttonDisabled }
                    style={{ opacity: buttonDisabled ? 0.7 : 1 }}
                />
                <TouchableOpacity onPress={this.back.bind(this)}><Text style={{ color: Swatch.darkGray, marginTop: 15 }}>{ translate('views.auth.register.back') }</Text></TouchableOpacity>
            </View>
        </KeyboardAwareScrollView>
    }

}

export default connect()(Register)
