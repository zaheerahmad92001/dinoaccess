import React, { Component } from 'react'
import { Text, View, KeyboardAvoidingView } from 'react-native'
import Modal from 'react-native-modal'
import styled from 'styled-components/native'
import { getMaxModalHeight } from '@/modules/helpers'

const ModalContent = styled.View`
    padding: 20px;
    border-radius: 4px;
    background-color: white;
`

const Title = styled.Text`
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 12px;
`

export default class TextInputModal extends Component {
    constructor (props) {
        super(props)
    }
    
    render() {
        let { onClose, children, title, ...props } = this.props

        return (
            <View style={{ flex: 1 }}>
                <Modal backdropOpacity={0.5} onBackdropPress={onClose} {...props}>
                    <KeyboardAvoidingView behavior="padding">
                        <ModalContent style={{ maxHeight: getMaxModalHeight() }}>
                            { title ? <Title>{title}</Title> : null }

                            { children }
                        </ModalContent>
                    </KeyboardAvoidingView>
                </Modal>
            </View>
        )
    }
}
