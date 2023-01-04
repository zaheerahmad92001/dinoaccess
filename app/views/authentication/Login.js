import React, { Component } from 'react'
import {
    Dimensions,
    Text,
    ScrollView,
    View,
    TouchableOpacity,
    Image,
} from 'react-native'
import styled from 'styled-components/native'
import axios from '@/services/axios'
import { connect } from 'react-redux'
import { Svg, Path } from 'react-native-svg'
import { AuthenticationActions, store } from '@/redux'
import Swatch from '@/assets/Swatch'
import PillButton from '@/components/PillButton'
import TextInput from '@/components/TextInput'
import { translate } from '@/services/i18n'
import { setErrorMessage } from '@/components/Modals/ErrorMessageModal'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const StyledView = styled.View`
    background-color: ${Swatch.yellow};
`

class Login extends Component {
    static navigationOptions = {
        header: null,
    }

    constructor(props) {
        super(props)

        this.state = { email: '', password: '' }
    }

    async tryLogin() {
        try {
            var { data } = await axios.get('login', {
                params: {
                    email: this.state.email,
                    password: this.state.password,
                },
            })

            if (data.authorized) {
                this.props.dispatch({
                    type: AuthenticationActions.STORE_JWT,
                    jwt: data.token,
                })

                this.props.dispatch({
                    type: AuthenticationActions.STORE_USERDATA,
                    user: data.user,
                })

                this.props.navigation.navigate('Dashboard')
            }
        } catch (e) {
            if (e.response && e.response.data && !e.response.data.reset) {
                return setErrorMessage(translate('views.auth.login.error'))
            }

            return setErrorMessage(translate('views.auth.login.generalerror'))
        }
    }

    register() {
        this.props.navigation.navigate('Register')
    }

    forgot() {
        this.props.navigation.navigate('ForgotPassword')
    }

    render() {
        const width = Dimensions.get('window').width + 2
        const svg = `M0,70 C236,150 250,-28 ${width},50 L${width},100 L0,100`

        return (
            <KeyboardAwareScrollView style={{ backgroundColor: Swatch.yellow }}>
                <View style={{ backgroundColor: 'white', minHeight: 150 }}>
                    <Image
                        source={require('../../assets/icons/dinotec.png')}
                        style={{
                            width: 80,
                            height: 80,
                            top: 70,
                            marginLeft: 70,
                        }}
                    />

                    <Svg
                        height="100"
                        width={width}
                        style={{ marginBottom: -3 }}
                    >
                        <Path d={svg} fill={Swatch.yellow} stroke="none" />
                    </Svg>
                </View>
                <View style={{ padding: 30 }}>
                    <Text
                        style={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: 16,
                        }}
                    >
                        { translate('views.auth.login.welcome') }
                    </Text>
                    <Text
                        style={{
                            color: 'black',
                            marginBottom: 50,
                            fontSize: 14,
                        }}
                    >
                        { translate('views.auth.login.pleaselogin') }
                    </Text>

                    <TextInput
                        onChangeText={text => this.setState({ email: text })}
                        placeholder={ translate('views.auth.login.email') }
                        value={this.state.email}
                    />
                    <TextInput
                        onChangeText={text => this.setState({ password: text })}
                        autoComplete="password"
                        secureTextEntry
                        placeholder={ translate('views.auth.login.password') }
                        style={{ marginBottom: 40, marginTop: 20 }}
                        value={this.state.password}
                    />

                    <PillButton
                        onPress={this.tryLogin.bind(this)}
                        title={ translate('continue') }
                    />
                    <TouchableOpacity onPress={this.register.bind(this)}>
                        <Text style={{ color: Swatch.darkGray, marginTop: 20 }}>
                            { translate('views.auth.login.noaccount') }
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.forgot.bind(this)}>
                        <Text style={{ color: Swatch.darkGray, marginTop: 5 }}>
                            { translate('views.auth.login.forgotpassword') }
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        )
    }
}

export default connect()(Login)
