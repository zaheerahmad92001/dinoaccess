import React, { Component } from 'react'
import { View, Text } from 'react-native'
import KMZE from '@/assets/deviceconfiguration/kmze/registers'
import styled from 'styled-components/native'
import connectWithDevice from '@/modules/connectWithDevice'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faSquare, faCheckSquare } from '@fortawesome/pro-regular-svg-icons'
import { DeviceActions } from '@/redux'
import PillButton from '@/components/PillButton'
import socket from '@/services/socket'
import Toast, { DURATION } from 'react-native-easy-toast'
import { translate } from '@/services/i18n'

const Headline = styled.Text`
    font-size: 20px;
    color: white;
    margin-top: 80px;
    margin-bottom: 40px;
    text-align: center;
`

const ListRow = styled.TouchableOpacity`
    display: flex;
    flex-direction: row;
    padding: 10px 20px;
`

class ListSelection extends Component {

    constructor(props) {
        super(props)

        let { register, registers } = this.props
        let { register: number } = register

        this.state = {
            initialValue: registers[number],
            value: registers[number]
        }
    }

    setValue(value) {
        this.setState({ value })

        let { register, registers } = this.props
        let { register: number } = register
        registers[number] = value
    }

    save() {
        let register = this.props.register
        let saved = socket.saveRegister(this.props.token, register.register, this.state.value)
        
        if (saved) {
            this.refs.toast.show(translate('kmze.saved'), 2000)
            this.setState({ initialValue: this.state.value })
        }
    }

    render() {
        let { register } = this.props

        let options = Object.keys(register.options).map(key => {
            let isSelected = key == this.state.value

            return <ListRow key={key} onPress={() => this.setValue(key)}>
                <FontAwesomeIcon
                    icon={isSelected ? faCheckSquare : faSquare}
                    color="white"
                    size={23}
                    style={{ marginTop: 1 }}
                />

                <Text style={{ color: 'white', fontSize: 18, flex: 1, marginLeft: 15 }}>
                    {register.options[key]}
                </Text>
            </ListRow>
        })

        let changed = this.state.initialValue != this.state.value

        return (
            <View>
                <Headline>{register.label}</Headline>

                {options}

                <Toast ref="toast" />
                <View style={{ display: 'flex', alignItems: 'center' }}>
                    <PillButton style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', marginTop: 40, opacity: changed ? 1 : 0.5 }} textStyle={{ color: 'white' }} title={ translate('kmze.save') } onPress={() => this.save()} disabled={!changed} />
                </View>
            </View>
        )
    }

}

export default connectWithDevice(ListSelection, true)
