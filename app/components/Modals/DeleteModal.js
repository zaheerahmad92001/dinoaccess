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

const NamePreview = styled.Text`
    font-weight: bold;
`

const ModalContent = styled.View`
    padding: 20px;
    border-radius: 4px;
    background-color: white;
`

export default class DeleteModal extends Component {
    constructor (props) {
        super(props)

        this.state = {
            value: ''
        }
    }

    async deleteInstallation () {
        this.props.onClose(true)
    }
    
    render() {
        let { onClose, name, token, ...props } = this.props
        
        return (
            <View style={{ flex: 1 }}>
                <Modal backdropOpacity={0.5} onBackdropPress={() => onClose()} {...props}>
                    <KeyboardAvoidingView behavior="padding">
                        <ModalContent>
                            <Title>{ translate('modals.delete.title') }</Title>
                            <Description>{ translate('modals.delete.description1') } ("<NamePreview>{ name }</NamePreview>") { translate('modals.delete.description2') }</Description>

                            <TextInput
                                onChangeText={(value) => this.setState({ value })}
                                value={this.state.value}
                            />

                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 14 }}>
                                <PillButton title={translate('delete')} onPress={() => this.deleteInstallation()} disabled={ this.state.value != name } style={ this.state.value == name ? null : { opacity: 0.5 }} />
                            </View>
                        </ModalContent>
                    </KeyboardAvoidingView>
                </Modal>
            </View>
        )
    }
}
