import React, { Component } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import styled from 'styled-components/native'
import KMZE from '@/assets/deviceconfiguration/kmze/registers'
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

        let { register, registers } = this.props

        let registerNames = [register.register, ...register.others]
        this.registerNumbers = registerNames.map(name => KMZE[name].register)

        let values = this.registerNumbers.map(number => registers[number] % 100).map(value => value < 10 ? `0${value}` : value)
        let [startHour, startMin, stopHour, stopMin] = values

        this.state = {
            fromValue: `${startHour}:${startMin}`,
            toValue: `${stopHour}:${stopMin}`,
            initialFromValue: `${startHour}:${startMin}`,
            initialToValue: `${stopHour}:${stopMin}`,
            editFromTime: false,
            editToTime: false,
            initiallyEnabled: this.isDisabled ? 'no' : 'yes',
            enabled: this.isDisabled ? 'no' : 'yes',
        }
    }

    changeFromValue(date) {
        this.setState({ fromValue: moment(date).format('HH:mm'), editFromTime: false })
    }

    changeToValue(date) {
        this.setState({ toValue: moment(date).format('HH:mm'), editToTime: false })
    }

    save() {
        let { register, registers } = this.props
        let registerNames = [register.register, ...register.others]
        let registerNumbers = registerNames.map(name => KMZE[name].register)

        let on = this.state.enabled == 'yes' ? 2 : 0
        let off = this.state.enabled == 'yes' ? 1 : 0

        let saved = true
        let values = [...this.state.fromValue.split(':'), ...this.state.toValue.split(':'), on, off].map(n => parseInt(n))
        for (let i = 0; i < registerNumbers.length; i++) {
            let thisSaved = socket.saveRegister(this.props.token, registerNumbers[i], values[i])
            if (!thisSaved) saved = false
        }

        if (saved) {
            this.refs.toast.show(translate('kmze.saved'), 2000)

            values = values.map(value => value < 10 ? `0${value}` : value)
            let [startHour, startMin, stopHour, stopMin] = values
    
            this.setState({
                initialFromValue: `${startHour}:${startMin}`,
                initialToValue: `${stopHour}:${stopMin}`,
                initiallyEnabled: this.state.enabled,
            })
        }
    }

    date(time) {
        return moment(time, "HH:mm").toDate()
    }

    get isDisabled() {
        let { register, registers } = this.props
        let registerNames = [register.register, ...register.others]
        let registerNumbers = registerNames.map(name => KMZE[name].register)

        let on = registerNumbers[4]
        let off = registerNumbers[5]

        return registers[on] == 0 || registers[off] == 0
    }

    render() {
        let changed = this.state.initialFromValue != this.state.fromValue
            || this.state.initialToValue != this.state.toValue
            || this.state.initiallyEnabled != this.state.enabled

        return (
            <View style={{ height: '100%', padding: 20, paddingTop: 150, display: 'flex', alignItems: 'center' }}>
                <Checkbox
                    name="enabled"
                    value="yes"
                    selected={ this.state.enabled }
                    onSelect={ () => this.setState({ enabled: this.state.enabled == 'yes' ? 'no' : 'yes' }) }
                    color={ Swatch.darkGray }
                    label={translate('kmze.setpoints.' + (this.state.enabled != 'yes' ? 'deactivated' : 'activated'))}
                    labelStyle={{ marginLeft: 5, fontSize: 16 }}
                    style={{ marginTop: 10, marginBottom: 30 }}
                />
                
                <View style={{ opacity: this.state.enabled == 'yes' ? 1 : 0.6 }}>
                    <Label>{ translate('kmze.setpoints.on') }</Label>
                    <TouchableOpacity onPress={() => this.setState({ editFromTime: true })} disabled={ this.state.enabled != 'yes' }>
                        <TimeInput>{this.state.fromValue}</TimeInput>
                    </TouchableOpacity>
                    <DateTimePicker
                        mode="time"
                        onConfirm={date => this.changeFromValue(date)}
                        date={this.date(this.state.fromValue)}
                        onCancel={() => this.setState({ editFromTime: false })}
                        isVisible={this.state.editFromTime}
                    />

                    <Label>{ translate('kmze.setpoints.off') }</Label>
                    <TouchableOpacity onPress={() => this.setState({ editToTime: true })} disabled={ this.state.enabled != 'yes' }>
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
                <PillButton style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', marginTop: 40, opacity: changed ? 1 : 0.5 }} textStyle={{ color: 'white' }} title={ translate('kmze.save') } onPress={() => this.save()} disabled={!changed} />
            </View>
        )
    }

}

export default connectWithDevice(TimeInterval, true)
