import React, { Component } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Linking } from 'react-native'
import { connect } from 'react-redux'
import Swatch from '@/assets/Swatch'
import styled from 'styled-components/native'
import SettingsSectionList from '@/components/SettingsSectionList'
import TextInputModal from '@/components/Modals/TextInputModal'
import ListSelectionModal from '@/components/Modals/ListSelectionModal'
import { AuthenticationActions, IapActions, store } from '@/redux'
import axios from '@/services/axios'
import CustomModal from '@/components/Modals/CustomModal'
import TextInput from '@/components/TextInput'
import PillButton from '@/components/PillButton'
import { setErrorMessage } from '@/components/Modals/ErrorMessageModal'
import { translate } from '@/services/i18n'
import StockistPicker from '@/components/StockistPicker'

function sleep (timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout))
}

const LogoutView = styled.View`
    display: flex;
    align-items: center;
    margin-top: 30px;
    padding-bottom: 20px;
`

const Logout = styled.Text`
    color: ${Swatch.red};
    font-size: 16px;
    opacity: 0.65;
`

class Account extends Component {

    static navigationOptions = {
        header: null
    }

    state = {
        modal: false,
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
        stockists: [],
        showStockistModal: false,
    }

    async componentDidMount () {
        let { data } = await axios.get('stockists')
        this.setState({ stockists: data })
    }

    logout() {
        this.props.dispatch({
            type: AuthenticationActions.STORE_JWT,
            jwt: null,
        })

        this.props.navigation.navigate('Unauthenticated')
    }

    textInputModal(name, title, value = '') {
        return <TextInputModal
            isVisible={this.state.modal == name}
            title={title}
            value={value}
            onClose={() => this.setState({ modal: false })}
            onSave={this.saveFunction(name)}
        />
    }

    selectModal(name, title, options = {}, value = '', text = '') {
        return <ListSelectionModal
            options={options}
            isVisible={this.state.modal == name}
            title={title}
            description={text}
            value={value}
            onClose={() => this.setState({ modal: false })}
            onSave={this.saveFunction(name)}
        />
    }

    passwordModal() {
        let disabled = !this.state.oldPassword || !this.state.newPassword || this.state.newPassword.length < 6 || this.state.newPassword != this.state.confirmPassword

        let save = async () => {
            this.setState({ modal: false })

            try {
                await axios.post('account/password/update', {
                    password: this.state.newPassword,
                    old_password: this.state.oldPassword,
                })

                await sleep(300)
                setErrorMessage(translate('views.dashboard.account.passwordchanged'))
            } catch (e) {
                await sleep(300)
                if (e.response && e.response.data && e.response.data.error == 'password') {
                    setErrorMessage(translate('views.dashboard.account.passwordnotmatching'))
                } else {
                    setErrorMessage(translate('views.dashboard.account.passwordissue'))
                }
            }
        }

        return <CustomModal
            isVisible={this.state.modal == 'password'}
            onClose={() => this.setState({ modal: false })}
            title={ translate('views.dashboard.account.changepassword') }
        >
            <TextInput placeholder={ translate('views.dashboard.account.currentpassword') } autoComplete="password" secureTextEntry onChangeText={text => this.setState({ oldPassword: text })} />
            <TextInput placeholder={ translate('views.dashboard.account.newpassword') } secureTextEntry style={{ marginTop: 20 }} onChangeText={text => this.setState({ newPassword: text })} />
            <TextInput placeholder={ translate('views.dashboard.account.repeatnewpassword') } secureTextEntry onChangeText={text => this.setState({ confirmPassword: text })} />

            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 14 }}>
                <PillButton title={translate('save')} disabled={ disabled } style={{ opacity: disabled ? 0.6 : 1 }} onPress={save} />
            </View>
        </CustomModal>
    }

    saveFunction(field) {
        return async (value) => {
            this.setState({ modal: false })
            value = value && value.trim ? value.trim() : value
            
            try {
                await axios.post('account/update', {
                    [field]: value
                })
    
                let user = this.props.user
                user[field] = value
    
                this.props.dispatch({
                    type: AuthenticationActions.STORE_USERDATA,
                    user
                })
                this.forceUpdate()
            } catch (e) {
                await sleep(300)

                if (field == 'email' && e.response && e.response.data && e.response.data.error == 'email') {
                    setErrorMessage(translate('views.dashboard.account.emailexists'))
                } else {
                    setErrorMessage(translate('views.dashboard.account.emailissue'))
                }
            }
        }
    }

    saveStockist(stockist) {
        let saveName = this.saveFunction('default_stockist_name')
        let saveID = this.saveFunction('default_stockist_id')

        saveName(stockist.name)
        saveID(stockist.id)

        this.setState({ showStockistModal: false })
    }

    toggleWriteable () {
        this.props.dispatch({
            type: IapActions.CAN_WRITE_TO_CF100,
            enabled: !this.props.canWriteToCF100
        })
    }

    render() {
        let user = this.props.user

        let salutations = { mr: translate('salutation.mr'), mrs: translate('salutation.ms') }
        let salutation = salutations[user.salutation]
        const width = Dimensions.get('window').width + 2
        const svg = `M0,0 L0,80 C196,150 300,-80 ${width + 50},70 L${width},0 L0,0`

        let languages = { en: 'English', de: 'Deutsch', fr: 'Français', nl: 'Nederlands', ru: 'Pусский', it: 'Italiano', pl: 'Polski', sl: 'Slovenski', hr: 'Hrvatski' }

        let truncate = (string, n) => (string.length > n) ? string.substr(0, n-1) + '...' : string

        return <ScrollView style={{ backgroundColor: '#FAFAFA', minHeight: '100%' }}>
            {this.selectModal('salutation', translate('views.dashboard.account.salutation'), salutations, user.salutation )}
            {this.textInputModal('first_name', translate('views.dashboard.account.firstname'), user.first_name)}
            {this.textInputModal('last_name', translate('views.dashboard.account.lastname'), user.last_name)}
            {this.textInputModal('email', translate('views.dashboard.account.emaillong'), user.email)}
            {this.selectModal('default_language', translate('views.dashboard.account.language'), languages, user.default_language)}

            {this.passwordModal()}

            <StockistPicker
                data={ this.state.stockists }
                visible={ this.state.stockists.length && this.state.showStockistModal }
                onSelect={ stockist => this.saveStockist(stockist) }
                onClose={ () => this.setState({ showStockistModal: false }) }
            />

            <SettingsSectionList
                showWave pageTitle={translate('views.dashboard.account.title')} navigation={this.props.navigation}
                ListFooterComponent={() => <LogoutView>
                    <TouchableOpacity onPress={() => this.logout()}>
                        <Logout>{ translate('views.dashboard.account.logout') }</Logout>
                    </TouchableOpacity>
                </LogoutView>}
                sections={[
                    {
                        data: [
                            { title: translate('views.dashboard.account.salutation'), value: salutation, onPress: () => this.setState({ modal: 'salutation' }) },
                            { title: translate('views.dashboard.account.firstname'), value: user.first_name, onPress: () => this.setState({ modal: 'first_name' }) },
                            { title: translate('views.dashboard.account.lastname'), value: user.last_name, onPress: () => this.setState({ modal: 'last_name' }) },
                            { title: translate('settings.stockist'), value: truncate(user.default_stockist_name || '-', 25), onPress: () => this.setState({ showStockistModal: true }) },
                            { title: translate('views.dashboard.account.email'), value: user.email, onPress: () => this.setState({ modal: 'email' }) },
                            { title: translate('views.dashboard.account.password'), value: '******', onPress: () => this.setState({ modal: 'password' }) },
                        ],
                        key: translate('views.dashboard.account.profile')
                    },
                    {
                        data: [
                            { title: translate('views.dashboard.account.language'), value: languages[user.default_language], onPress: () => this.setState({ modal: 'default_language' }) },
                            { title: translate('views.dashboard.account.subscription'), value: this.props.canWriteToCF100 ? 'Ja' : translate('views.dashboard.account.subscriptioninactive'), readonly: true },
                        ],
                        key: 'dinoAccess'
                    },
                    {
                        data: [
                            { title: translate('views.dashboard.account.privacy'), value: '', onPress: () => Linking.openURL('https://remote.dinotec.de/terms') },
                            { title: 'dinotec GmbH', value: '', onPress: () => Linking.openURL('https://www.dinotec.de/') },
                        ],
                        key: translate('views.dashboard.account.misc')
                    },
                ]}
            />
        </ScrollView>
    }

}

export default connect(state => ({
    user: state.auth.user,
    canWriteToCF100: state.iap.canWriteToCF100
}))(Account)
