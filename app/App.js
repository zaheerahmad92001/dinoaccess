import React, { Component } from 'react'
import { Platform } from 'react-native'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { IapActions, persistor, store } from './redux'
import Navigator from './Navigator'
import ErrorMessageModal from './components/Modals/ErrorMessageModal'
import { setI18nConfig } from './services/i18n'
import * as RNLocalize from 'react-native-localize'
import i18n from 'i18n-js'
import * as RNIap from 'react-native-iap'
import axios from '@/services/axios'

// XMLHttpRequest = GLOBAL.originalXMLHttpRequest ? 
//   GLOBAL.originalXMLHttpRequest : GLOBAL.XMLHttpRequest;
// global.FormData = global.originalFormData;

export default class App extends Component {

    constructor (props) {
        super(props)
        setI18nConfig()
    }

    async componentDidMount () {
        RNLocalize.addEventListener('change', this.handleLocalizationChange)
        this.unsubscribe = store.subscribe(this.handleStoreChange)

        await RNIap.initConnection()
        this.purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async purchase => {
            const receipt = purchase.transactionReceipt
            if (receipt) {
                await axios.post('iap/receipt', { receipt, platform: Platform.OS })
    
                if (Platform.OS == 'ios') {
                    RNIap.finishTransactionIOS(purchase.transactionId)
                } else if (Platform.OS == 'android') {
                    RNIap.acknowledgePurchaseAndroid(purchase.purchaseToken)
                }

                store.dispatch({
                    type: IapActions.CAN_WRITE_TO_CF100,
                    enabled: true
                })
            }
        })

        this.purchaseErrorListener = RNIap.purchaseErrorListener(error => {
            console.warn(error)
        })

        // dinotec.sandbox@padarom.xyz
        // InternetPasswort1
    }

    componentWillUnmount () {
        RNLocalize.removeEventListener('change', this.handleLocalizationChange)
        this.unsubscribe()

        this.purchaseUpdateSubscription.remove()
        this.purchaseErrorListener.remove()
    }

    handleStoreChange = () => {
        let locale = i18n.locale
        let user = store.getState().auth.user
        let defaultLanguage = user ? user.default_language : locale

        if (locale != defaultLanguage) {
            this.handleLocalizationChange()
        }
    }

    handleLocalizationChange = () => {
        setI18nConfig()
        this.forceUpdate()
    }

    render () {
        return (
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <Navigator />

                    <ErrorMessageModal />
                </PersistGate>
            </Provider>
        )
    }

}
