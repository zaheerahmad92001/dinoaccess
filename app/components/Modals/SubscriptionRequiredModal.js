import React, { Component } from 'react'
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native'
import Modal from 'react-native-modal'
import PillButton from '../PillButton'
import styled from 'styled-components/native'
import Swatch from '@/assets/Swatch'
import { translate } from '@/services/i18n'
import * as RNIap from 'react-native-iap'
import { setErrorMessage } from './ErrorMessageModal'
import Markdown from 'react-native-markdown-renderer'
import { find } from 'lodash'

const ModalContent = styled.View`
    padding: 20px;
    border-radius: 4px;
    background-color: white;
`

export default class SubscriptionRequiredModal extends Component {

    state = {
        subscription: null
    }

    async componentDidMount () { 
        let subscriptions = await RNIap.getSubscriptions(['de.dinotec.dinoaccess.cf100.control'])
        this.setState({ subscription: find(subscriptions, ['productId', 'de.dinotec.dinoaccess.cf100.control']) })
    }
    
    async purchaseSubscription() {
        if (!this.state.subscription) {
            this.props.onClose()
            setTimeout(() => setErrorMessage(`Could not find subscription.`), 300)
            return
        }

        try {
            this.props.onClose()
            await RNIap.requestSubscription(this.state.subscription.productId)
        } catch (e) {}
    }

    render() {
        let { onClose, ...props } = this.props

        let sub = this.state.subscription
        if (!sub) return null

        return (
            <View style={{ flex: 1 }}>
                <Modal backdropOpacity={0.5} onBackdropPress={onClose} {...props}>
                    <ModalContent style={{ paddingTop: 8 }}>
                        <Markdown style={ styles }>{translate('modals.subscription.message', { title: sub.title || 'CF Control 100 Steuerung', price: sub.localizedPrice, month: 3 })}</Markdown>

                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 18 }}>
                            <PillButton title={translate('modals.subscription.yes')} onPress={ () => this.purchaseSubscription() } />
                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                            <TouchableOpacity onPress={ onClose }><Text>{ translate('cancel') }</Text></TouchableOpacity>
                        </View>
                    </ModalContent>
                </Modal>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    heading3: {
        marginTop: 20,
        fontSize: 18,
    }
})
