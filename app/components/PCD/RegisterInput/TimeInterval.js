import React, { Component } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import styled from 'styled-components/native'
import Toast, { DURATION } from 'react-native-easy-toast'
import PillButton from '@/components/PillButton'
import connectWithDevice from '@/modules/connectWithDevice'
import DateTimePicker from 'react-native-modal-datetime-picker'
import moment from 'moment'
import socket from '@/services/socket'
import { translate } from '@/services/i18n'
import Checkbox from '@/components/Checkbox'
import Swatch from '@/assets/Swatch'

const TimeInput = styled.Text`
    font-size: 40px;
    color: white;
    padding: 10px 20px;
    text-align: center;
`

const Label = styled.Text`
    color: white;
    opacity: 0.7;
    font-weight: bold;
    margin-bottom: -10px;
    margin-top: 20px;
`

class TimeInterval extends Component {

    constructor(props) {
        super(props)

        let { registers } = this.props
        this.registerNumbers = this.props.register.registers

        let values = this.registerNumbers.map(number => registers[number] % 100).map(value => value < 10 ? `0${value}` : value)
        let [startHour, startMin, stopHour, stopMin] = values

        this.state = {
            fromValue: `${startHour}:${startMin}`,
            toValue: `${stopHour}:${stopMin}`,
            initialFromValue: `${startHour}:${startMin}`,
            initialToValue: `${stopHour}:${stopMin}`,
            editFromTime: false,
            editToTime: false,
        }
    }

    changeFromValue(date) {
        this.setState({ fromValue: moment(date).format('HH:mm'), editFromTime: false })
    }

    changeToValue(date) {
        this.setState({ toValue: moment(date).format('HH:mm'), editToTime: false })
    }

    save() {
        let registerNumbers = this.props.register.registers

        let saved = true
        let values = [...this.state.fromValue.split(':'), ...this.state.toValue.split(':')].map(n => parseInt(n))
        for (let i = 0; i < registerNumbers.length; i++) {
            let thisSaved = socket.saveRegister(this.props.token, registerNumbers[i], values[i])
            if (!thisSaved) saved = false
        }

        if (saved) {
            this.refs.toast.show(translate('pcd.saved'), 2000)

            values = values.map(value => value < 10 ? `0${value}` : value)
            let [startHour, startMin, stopHour, stopMin] = values
    
            this.setState({
                initialFromValue: `${startHour}:${startMin}`,
                initialToValue: `${stopHour}:${stopMin}`,
            })
        }
    }

    date(time) {
        return moment(time, "HH:mm").toDate()
    }

    render() {
        let changed = this.state.initialFromValue != this.state.fromValue
            || this.state.initialToValue != this.state.toValue

        return (
            <View style={{ height: '100%', padding: 20, paddingTop: 150, display: 'flex', alignItems: 'center' }}>
                <View>
                    <Label>{ translate('pcd.setpoints.on') }</Label>
                    <TouchableOpacity onPress={() => this.setState({ editFromTime: true })}>
                        <TimeInput>{this.state.fromValue}</TimeInput>
                    </TouchableOpacity>
                    <DateTimePicker
                        mode="time"
                        onConfirm={date => this.changeFromValue(date)}
                        date={this.date(this.state.fromValue)}
                        onCancel={() => this.setState({ editFromTime: false })}
                        isVisible={this.state.editFromTime}
                    />

                    <Label>{ translate('pcd.setpoints.off') }</Label>
                    <TouchableOpacity onPress={() => this.setState({ editToTime: true })}>
                        <TimeInput>{this.state.toValue}</TimeInput>
                    </TouchableOpacity>
                    <DateTimePicker
                        mode="time"
                        onConfirm={date => this.changeToValue(date)}
                        date={this.date(this.state.toValue)}
                        onCancel={() => this.setState({ editToTime: false })}
                        isVisible={this.state.editToTime}
                    />
                </View>

                <Toast ref="toast" />
                <PillButton style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', marginTop: 40, opacity: changed ? 1 : 0.5 }} textStyle={{ color: 'white' }} title={ translate('pcd.save') } onPress={() => this.save()} disabled={!changed} />
            </View>
        )
    }

}

export default connectWithDevice(TimeInterval, true)
