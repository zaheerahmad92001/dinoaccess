import React, { Component } from 'react'
import { Text, View } from 'react-native'
import Modal from 'react-native-modal'
import TextInput from '../TextInput'
import PillButton from '../PillButton'
import styled from 'styled-components/native'
import Swatch from '@/assets/Swatch'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faSquare, faCheckSquare } from '@fortawesome/pro-regular-svg-icons'

const Title = styled.Text`
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 22px;
    padding: 20px;
    padding-bottom: 0;
`

const Description = styled.Text`
    margin-bottom: 4px;
    margin-top: 8px;
`

const ModalContent = styled.View`
    border-radius: 4px;
    background-color: white;
    overflow: hidden;
`

const ListRow = styled.TouchableOpacity`
    display: flex;
    flex-direction: row;
    border-color: #e5e5e5;
    border-top-width: 1px;
    padding: 15px 20px;
    border-bottom-width: 1px;
    margin-bottom: -1px;
`

export default class ListSelectionModal extends Component {
    
    render() {
        let { onClose, title, description, children, onSave, options, value, ...props } = this.props

        options = Object.keys(options).map((key, i) => {
            let isSelected = key == value
            let isLast = i == Object.keys(options).length - 1
            
            return <ListRow
                key={key}
                onPress={() => onSave(key)}
                style={{
                    borderBottomWidth: isLast ? 0 : 1,
                    backgroundColor: isSelected ? Swatch.lightGray : 'white',
                    opacity: isSelected ? 1 : 0.8
                }}
            >
                <Text style={{ fontSize: 16 }}>
                    {options[key]}
                </Text>
            </ListRow>
        })

        return (
            <View style={{ flex: 1 }}>
                <Modal backdropOpacity={0.5} onBackdropPress={onClose} {...props}>
                    <ModalContent>
                        {title ? <Title>{title}</Title> : null}
                        {description ? <Description>{description}</Description> : null}

                        {options}
                    </ModalContent>
                </Modal>
            </View>
        )
    }
}
