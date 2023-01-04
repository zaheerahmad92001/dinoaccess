import React, { Component } from 'react'
import { Dimensions, Text, ScrollView, View, TouchableOpacity, Image, Linking } from 'react-native'
import axios from '@/services/axios'
import { connect } from 'react-redux'
import { Svg, Path } from 'react-native-svg'
import { AuthenticationActions, store } from '@/redux'
import Swatch from '@/assets/Swatch'
import Checkbox from '@/components/Checkbox'
import PillButton from '@/components/PillButton'
import TextInput from '@/components/TextInput'
import ListSelectionModal from '@/components/Modals/ListSelectionModal'
import { setErrorMessage } from '@/components/Modals/ErrorMessageModal'
import { translate } from '@/services/i18n'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import StockistPicker from '@/components/StockistPicker'

class RegisterStep2 extends Component {

    static navigationOptions = {
        header: null
    }

    constructor (props) {
        super(props)

        this.state = {
            salutationModalVisible: false,
            salutation: 'mr',
            first_name: '',
            last_name: '',
            accepted: 'no',
            stockist: null,
            stockists: [],
            showStockistModal: false,
        }
    }

    async componentDidMount () {
        let { data } = await axios.get('stockists')
        this.setState({ stockists: data })
    }

    onStockistSelected (stockist) {
        this.setState({ stockist, showStockistModal: false })
    }

    async tryRegistration () {
        try {
            let params = this.props.navigation.state.params

            let { data } = await axios.post('register', {
                email: params.email,
                salutation: this.state.salutation,
                firstName: this.state.first_name,
                lastName: this.state.last_name,
                password: params.password,
                default_stockist_id: this.state.stockist ? this.state.stockist.id : null,
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
            if (e.response && e.response.data && e.response.data.errors) {
                let errors = e.response.data.errors
                let options = Object.keys(errors).reduce((prev, curr) => {
                    for (let val of errors[curr]) {
                        prev.push(val)
                    }

                    return prev
                }, [])
                
                setErrorMessage(options.join('\n\n'))
            }

            setErrorMessage(translate('views.auth.register.error'))
        }
    }

    back () {
        this.props.navigation.goBack()
    }

    togglePrivacy () {
        this.setState({ accepted: (this.state.accepted == 'yes' ? 'no' : 'yes') })
    }

    render () {
        const width = Dimensions.get('window').width + 2
        const svg = `M0,70 C236,150 250,-28 ${width},50 L${width},100 L0,100`

        let salutations = {mr: translate('salutation.mr'), mrs: translate('salutation.ms')}
        let buttonDisabled = this.state.first_name.length < 2 || this.state.last_name.length < 2 || this.state.accepted != 'yes'

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
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Registrierung</Text>

                <ListSelectionModal
                    isVisible={this.state.salutationModalVisible}
                    title={ translate('views.auth.register.salutation') }
                    options={salutations}
                    value={ this.state.salutation }
                    onSave={ (value) => this.setState({ salutation: value, salutationModalVisible: false }) }
                    onClose={() => this.setState({ salutationModalVisible: false })}
                />

                <View style={{ borderBottomWidth: 1, borderBottomColor: Swatch.darkGray }}>
                    <Text
                        style={{
                            marginTop: 40,
                            fontSize: 16,
                            padding: 10,
                            paddingLeft: 0,
                            borderBottomWidth: 1,
                            borderBottomColor: Swatch.darkGray
                        }}
                        onPress={ () => this.setState({ salutationModalVisible: true }) }
                    >
                        { salutations[this.state.salutation] }
                    </Text>
                </View>

                <TextInput
                    onChangeText={(text) => this.setState({ first_name: text })}
                    placeholder={ translate('views.auth.register.firstname') }
                    style={{ marginTop: 10 }}
                    value={ this.state.first_name }
                ></TextInput>

                <TextInput
                    onChangeText={(text) => this.setState({ last_name: text })}
                    placeholder={ translate('views.auth.register.lastname') }
                    style={{ marginTop: 10 }}
                    value={ this.state.last_name }
                ></TextInput>

                <TouchableOpacity onPress={ () => this.state.stockists.length && this.setState({ showStockistModal: true }) }>
                    <TextInput
                        editable={ false }
                        value={ this.state.stockist ? this.state.stockist.name : '' }
                        placeholder={ translate('settings.stockist') }
                        style={{ marginTop: 10 }}
                        pointerEvents="none"
                    />
                </TouchableOpacity>

                <View style={{ paddingRight: 20 }}>
                    <Checkbox
                        name="type"
                        value="yes"
                        selected={ this.state.accepted }
                        onSelect={ () => this.togglePrivacy() }
                        color={ Swatch.darkGray }
                        label={ translate('views.auth.register.privacy') }
                        labelStyle={{ marginLeft: 5 }}
                        style={{ marginTop: 10 }}
                    />
                </View>

                <TouchableOpacity
                    onPress={ () => Linking.openURL('https://gb.dinotec.de/datenschutz') }
                    style={{ marginBottom: 40, marginTop: 5 }}
                >
                    <Text style={{ textDecorationLine: 'underline', opacity: 0.6, paddingLeft: 30 }}>
                        { translate('views.auth.register.privacylink') }
                    </Text>
                </TouchableOpacity>

                <StockistPicker
                    data={ this.state.stockists }
                    visible={ this.state.showStockistModal }
                    selected={ this.state.stockist }
                    onSelect={ stockist => this.onStockistSelected(stockist) }
                    onClose={ () => this.setState({ showStockistModal: false }) }
                />

                <PillButton
                    onPress={this.tryRegistration.bind(this)}
                    title={ translate('views.auth.register.register') }
                    disabled={ buttonDisabled }
                    style={{ opacity: buttonDisabled ? 0.7 : 1 }}
                />
                <TouchableOpacity onPress={this.back.bind(this)}><Text style={{ color: Swatch.darkGray, marginTop: 15, textAlign: 'center' }}>{ translate('back') }</Text></TouchableOpacity>
            </View>
        </KeyboardAwareScrollView>
    }

}

export default connect()(RegisterStep2)
