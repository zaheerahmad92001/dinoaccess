import React, { Component } from 'react'
import { Text, View, KeyboardAvoidingView } from 'react-native'
import Modal from 'react-native-modal'
import TextInput from '../TextInput'
import PillButton from '../PillButton'
import styled from 'styled-components/native'
import { translate } from '@/services/i18n'

const Title = styled.Text`
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 12px;
`

const Description = styled.Text`
    margin-bottom: 4px;
    margin-top: 8px;
`

const ModalContent = styled.View`
    padding: 20px;
    border-radius: 4px;
    background-color: white;
`

export default class TextInputModal extends Component {
    constructor (props) {
        super(props)

        this.state = {
            value: props.value
        }
    }
    
    render() {
        let { onClose, title, description, children, onSave, keyboardInputType, ...props } = this.props

        return (
            <View style={{ flex: 1 }}>
                <Modal backdropOpacity={0.5} onBackdropPress={onClose} {...props}>
                    <KeyboardAvoidingView behavior="padding">
                        <ModalContent>
                            {title ? <Title>{title}</Title> : null}
                            {description ? <Description>{description}</Description> : null}

                            <TextInput
                                onChangeText={(value) => this.setState({ value })}
                                value={this.state.value}
                                keyboardType={ keyboardInputType }
                            />

                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 14 }}>
                                <PillButton title={translate('save')} onPress={() => onSave(this.state.value)} />
                            </View>
                        </ModalContent>
                    </KeyboardAvoidingView>
                </Modal>
            </View>
        )
    }
}
