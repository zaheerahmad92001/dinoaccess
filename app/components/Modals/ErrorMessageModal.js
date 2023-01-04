import React, { Component } from 'react'
import { Text, View } from 'react-native'
import Modal from 'react-native-modal'
import PillButton from '../PillButton'
import styled from 'styled-components/native'
import { SessionActions, store } from '@/redux'
import { connect } from 'react-redux'
import { translate } from '@/services/i18n'

const ErrorMessage = styled.Text`
    margin-bottom: 4px;
    margin-top: 8px;
`

const ModalContent = styled.View`
    padding: 20px;
    border-radius: 4px;
    background-color: white;
`

export const setErrorMessage = (message) => {
    store.dispatch({
        type: SessionActions.SET_ERROR_MESSAGE,
        message,
    })
}

class ErrorMessageModal extends Component {
    close () {
        setErrorMessage(null)
    }

    render() {
        let { errorMessage } = this.props
        let isVisible = !!errorMessage

        return (
            <Modal
                backdropOpacity={0.3}
                onBackdropPress={ () => this.close() }
                isVisible={ isVisible }
            >
                <ModalContent>
                    <ErrorMessage>{ errorMessage }</ErrorMessage>

                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 14 }}>
                        <PillButton title={ translate('okay') } onPress={ () => this.close() } />
                    </View>
                </ModalContent>
            </Modal>
        )
    }
}

export default connect(state => ({ errorMessage: state.session ? state.session.errorMessage : null }))(ErrorMessageModal)
