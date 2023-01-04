import React, {Component} from 'react'
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faExclamationTriangle, faBallotCheck, faFireAlt, faForward } from '@fortawesome/pro-regular-svg-icons'
import { faArrowLeft, faSquare, faCheckSquare, faTimes } from '@fortawesome/pro-regular-svg-icons'
import styled from 'styled-components/native'
import CF100 from '@/assets/deviceconfiguration/cf100/registers'
import { messages, faults } from '@/assets/deviceconfiguration/pcd/messages'
import connectWithDevice from '@/modules/connectWithDevice'
import { renderWithDecimals } from '@/modules/registers'
import { createStackNavigator } from 'react-navigation'
import Swatch from '@/assets/Swatch'
import { connect } from 'react-redux'
import Wave from '@/components/Wave'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import socket from '@/services/socket'
import { DeviceActions } from '@/redux'
import { translate } from '@/services/i18n'
import { setErrorMessage } from '@/components/Modals/ErrorMessageModal'
import { createCodeCheckFunction } from '@/modules/helpers'

const Row = styled.View`
    padding-top: 10px;
    padding-bottom: 10px;
    justify-content: flex-end;
    align-items: center;
    display: flex;
    flex-direction: row;
`

const Value = styled.Text`
    font-size: 80px;
    font-weight: bold;
    color: #1E1E1E;
`

const UnitValue = styled.Text`
    font-size: 32px;
    font-weight: normal;
    margin-left: 10px;
    align-self: flex-start;
    color: #1E1E1E;
    text-align: right;
`

const ButtonArea = styled.View`
    position: absolute;
    top: ${getStatusBarHeight() + 10}px;
    right: 20px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
`

function calculateMessages (registers) {
    let result = { messages: [], faults: [] }

    for (let message of messages) {
        let isSet = !!(registers[message.register] & (1 << (message.bit - 1)))
        if (isSet) result.messages.push(message)
    }

    for (let fault of faults) {
        let isSet = !!(registers[fault.register] & (1 << (fault.bit - 1)))
        if (isSet) result.faults.push(fault)
    }

    return result
}

class Overview extends Component {

    static navigationOptions = {
        header: null
    }

    componentDidMount () {
        if (!this.props.deviceMeta.isOnline) {
            setErrorMessage(translate('settings.offline'))
            this.props.navigation.navigate('Settings')
        }
    }

    render () {
        let registers = this.props.registers || {}

        let visibleRegisters = [
            {
                "visible": (registers) => registers[1] == 221,
                "label": "pcd.setpoints.titles.freechlorine",
                "register": 123,
                "unit": "mg/l",
                "comma": 2,
                "color": (registers, value) => {
                    if (value >= registers[116] && value <= registers[114]) return Swatch.green
                    if (value >= registers[117] && value <= registers[113]) return Swatch.yellow
                    return Swatch.red
                },
            },
            {
                "visible": (registers) => registers[1] == 222,
                "label": "pcd.setpoints.titles.organicchlorine",
                "register": 123,
                "unit": "mg/l",
                "comma": 2,
                "color": (registers, value) => {
                    if (value >= registers[116] && value <= registers[114]) return Swatch.green
                    if (value >= registers[117] && value <= registers[113]) return Swatch.yellow
                    return Swatch.red
                },
            },
            {
                "visible": (registers) => registers[1] == 223,
                "label": "pcd.setpoints.titles.brom",
                "register": 123,
                "unit": "mg/l",
                "comma": 2,
                "color": (registers, value) => {
                    if (value >= registers[116] && value <= registers[114]) return Swatch.green
                    if (value >= registers[117] && value <= registers[113]) return Swatch.yellow
                    return Swatch.red
                },
            },
            {
                "visible": (registers) => registers[1] == 224,
                "label": "pcd.setpoints.titles.chlordioxid",
                "register": 123,
                "unit": "mg/l",
                "comma": 2,
                "color": (registers, value) => {
                    if (value >= registers[116] && value <= registers[114]) return Swatch.green
                    if (value >= registers[117] && value <= registers[113]) return Swatch.yellow
                    return Swatch.red
                },
            },
            {
                "visible": (registers) => registers[1] == 225,
                "label": "pcd.setpoints.titles.ozon",
                "register": 123,
                "unit": "mg/l",
                "comma": 2,
                "color": (registers, value) => {
                    if (value >= registers[116] && value <= registers[114]) return Swatch.green
                    if (value >= registers[117] && value <= registers[113]) return Swatch.yellow
                    return Swatch.red
                },
            },
            {
                "visible": (registers) => registers[1] == 226,
                "label": "pcd.setpoints.titles.poolcare",
                "register": 123,
                "unit": "mg/l",
                "comma": 0,
                "color": (registers, value) => {
                    if (value >= registers[116] && value <= registers[114]) return Swatch.green
                    if (value >= registers[117] && value <= registers[113]) return Swatch.yellow
                    return Swatch.red
                },
            },
            {
                "visible": (registers) => registers[1] == 228 || registers[2] == 241,
                "label": "pcd.setpoints.titles.redox",
                "register": 144,
                "unit": "mV",
                "comma": 0,
                "color": (registers, value) => {
                    if (registers[1] != 228) return Swatch.black
                    if (value >= registers[116] && value <= registers[114]) return Swatch.green
                    if (value >= registers[117]) return Swatch.yellow
                    return Swatch.red
                },
            },
            {
                "visible": (registers) => registers[3] == 241,
                "label": "pcd.setpoints.titles.ph",
                "register": 129,
                "unit": "pH",
                "comma": 2,
                "color": (registers, value) => {
                    if (value >= registers[57] && value <= registers[55]) return Swatch.green
                    if (value >= registers[58] && value <= registers[54]) return Swatch.yellow
                    return Swatch.red
                },
            },
            {
                "visible": (registers) => registers[5] != 232,
                "label": "pcd.setpoints.titles.temperature",
                "register": 140,
                "unit": "°C",
                "comma": 1,
                "color": (registers, value) => {
                    if (value >= registers[83] && value <= registers[85]) return Swatch.green
                    if (value >= registers[82] && value <= registers[86]) return Swatch.yellow
                    return Swatch.red
                },
            },
            {
                "visible": (registers) => registers[5] == 233,
                "label": "pcd.setpoints.titles.solar",
                "register": 141,
                "unit": "°C",
                "comma": 1,
                "color": Swatch.black
            },
            {
                "visible": (registers) => registers[16] == 248,
                "label": "pcd.setpoints.titles.flow",
                "register": 135,
                "unit": "l/h",
                "comma": 0,
                "color": (registers, value) => {
                    if (value >= registers[69] && value <= registers[68]) return Swatch.green
                    return Swatch.red
                },
            }
        ]

        visibleRegisters = visibleRegisters.filter((register) => {
            return !register.visible || register.visible(registers)
        })

        let small = Dimensions.get('window').width <= 400
        let fontSize = small ? 70 : 100
        if (visibleRegisters.length >= 6) fontSize -= 15

        let registerRows = visibleRegisters.map(config => {
            let color = config.color ? config.color(registers, registers[config.register]) : '#1e1e1e'

            return <Row key={ config.register }>
                <Value style={{ fontSize, color }}>{ renderWithDecimals(registers[config.register], config.comma) }</Value>
                <UnitValue>{ config.unit }</UnitValue>
            </Row>
        })

        let messages = calculateMessages(registers)
        let hasMessages = (messages.messages.length + messages.faults.length) > 0

        return (
            <ScrollView contentContainerStyle={{ flex: 1 }} style={{ backgroundColor: '#fafafa' }}>
                <View style={{ padding: 20, paddingTop: getStatusBarHeight() + 50, display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <ButtonArea>
                        { registers['143'] & (0x8000) ?
                            <TouchableOpacity onPress={ () => this.props.navigation.navigate('Buttons') } style={{ marginRight: 'auto' }}>
                                <FontAwesomeIcon icon={ faFireAlt } color="#1E1E1E" size={ 24 } style={{ marginRight: 20 }} />
                            </TouchableOpacity>
                          : null
                        }
                        { registers['143'] & (0x4000) ?
                            <TouchableOpacity onPress={ () => this.props.navigation.navigate('Buttons') } style={{ marginRight: 'auto' }}>
                                <FontAwesomeIcon icon={ faForward } color="#1E1E1E" size={ 24 } style={{ marginRight: 20 }} />
                            </TouchableOpacity>
                          : null
                        }

                        <TouchableOpacity onPress={ () => this.props.navigation.navigate('Buttons') }>
                            <FontAwesomeIcon icon={ faBallotCheck } color="#1E1E1E" size={ 24 } style={{ marginRight: 20 }} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={ () => this.props.navigation.navigate('Messages') }>
                            <FontAwesomeIcon icon={ faExclamationTriangle } color={ hasMessages ? Swatch.red : "#1E1E1E" } size={ 24 } />
                        </TouchableOpacity>
                    </ButtonArea>
                    
                    <View>
                        <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '100%', paddingVertical: small ? 10 : 50 }}>
                            { registerRows }
                        </View>
                    </View>
                </View>
            </ScrollView>
        )
    }

}

const Message = styled.Text`
    background: rgba(255, 255, 255, 0.5);
    padding: 15px 20px;
    margin-bottom: 15px;
    font-size: 16px;
    border-radius: 3px;
`

const Fault = ({ children }) => {
    return <Message>{ children }</Message>
}

class Messages extends Component {

    render () {
        let registers = this.props.registers || {}
        let messages = calculateMessages(registers)

        let messageViews = []
        for (let message of messages.messages) {
            messageViews.push(<Message key={ message.bit }>{ translate(message.message) }</Message>)
        }

        let faultViews = []
        for (let fault of messages.faults) {
            let onPress = () => {
                let value = registers[fault.register] - (1 << (fault.bit - 1))
                socket.saveRegister(this.props.token, fault.register, value)
            }

            faultViews.push(<TouchableOpacity onPress={ onPress } key={ fault.bit }>
                <Fault>{ translate(fault.message) }</Fault>
            </TouchableOpacity>)
        }

        let unsetFaults = () => {
            let saved = socket.saveRegister(this.props.token, 145, 0x0001)

            if (saved) {
                let faultRegisters = {}

                for (let fault of faults) {
                    if (!faultRegisters[fault.register]) faultRegisters[fault.register] = registers[fault.register]
                    faultRegisters[fault.register] &= ~(1 << (fault.bit - 1))
                }

                for (let register of Object.keys(faultRegisters)) {
                    socket.saveRegister(this.props.token, register, faultRegisters[register], true)
                }
            }
        }

        let empty = !messageViews.length && !faultViews.length

        return (
            <ScrollView style={{ backgroundColor: '#f5f5f5' }}>
                <Wave color={this.props.colorScheme.primary[0]}>
                    <TouchableOpacity style={{ padding: 5, margin: -5 }} onPress={() => this.props.navigation.goBack()}>
                        <FontAwesomeIcon icon={faArrowLeft} color={this.props.colorScheme.opposite[0]} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 22, color: this.props.colorScheme.opposite[0], marginTop: 4 }}>{ translate('pcd.overview.messages.title') }</Text>
                </Wave>

                <View style={{ padding: 20 }}>
                    <View style={{ flex: 1 }}>
                        { empty ? <Text>{ translate('pcd.overview.messages.empty') }</Text> : null }
                        { messageViews }

                        <View>
                            { faultViews.length ? <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, }}>
                                <Text style={{ fontWeight: 'bold' }}>{translate('pcd.overview.faults.title')}</Text>
                                <TouchableOpacity style={{ padding: 5, margin: -5 }} onPress={unsetFaults}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </TouchableOpacity>
                            </View> : null }
                            { faultViews }
                        </View>
                    </View>
                </View>
            </ScrollView>
        )
    }

}

const Button = styled.TouchableOpacity`
    background: rgba(255, 255, 255, 0.5);
    padding: 15px 20px;
    margin-bottom: 15px;
    font-size: 16px;
    border-radius: 3px;
    display: flex;
    flex-direction: row;
`

class Buttons extends Component {

    render () {
        let registers = this.props.registers || {}

        let des = registers[21] == 235 || registers[23] == 235 || registers[25] == 235 || registers[27] == 235
        let phraise = registers[21] == 237 || registers[23] == 237 || registers[25] == 237 || registers[27] == 237
        let phlower = registers[21] == 236 || registers[23] == 236 || registers[25] == 236 || registers[27] == 236
        let filter = registers[0] == 303 & registers[4] == 241
        let bit = (register, mask) => {
            return (registers[register] & mask) - mask + 1 > 0
        }

        let buttons = [
            {
                type: 'text',
                text: translate('pcd.overview.buttons.filter'),
                enable: (registers, code) => code('C'),
                visible: () => filter,
            },
            {
                write: {
                    enable: 0x0002,
                    disable: 0x0004,
                },
                read: {
                    register: 143,
                    mask: 0x2000,
                },
                text: translate('pcd.overview.buttons.filtermanual'),
                enable: (registers, code) => code('C'),
                visible: () => filter,
            },
            {
                write: {
                    enable: 0x0008,
                    disable: 0x0010,
                },
                read: {
                    register: 143,
                    mask: 0x4000,

                    // negate: true,
                    // Kann gesetzt werden, wenn das entsprechende Bit den Button nicht dann anschaltet, wenn es auf 1
                    // steht, sondern der Button eingeschaltet ist, wenn das Bit auf 0 gesetzt ist.
                },
                visible: () => bit(143, 0x2000) && filter,
                text: translate('pcd.overview.buttons.filteron'),
                enable: (registers, code) => code('C'),
            },
            {
                type: 'text',
                text: translate('pcd.overview.buttons.desinfection'),
                enable: (registers, code) => code('C'),
                visible: () => des,
            },
            {
                write: {
                    enable: 0x0020,
                    disable: 0x0040,
                },
                read: {
                    register: 143,
                    mask: 0x0800,
                },
                text: translate('pcd.overview.buttons.desmanual'),
                enable: (registers, code) => code('C'),
                visible: () => des,
            },
            {
                write: {
                    enable: 0x0080,
                    disable: 0x0100,
                },
                read: {
                    register: 145,
                    mask: 0x0001,
                },
                visible: () => bit(143, 0x0800) && des,
                enable: (registers, code) => code('C'),
                text: translate('pcd.overview.buttons.deson'),
            },
            {
                type: 'text',
                text: translate('pcd.overview.buttons.ph'),
                enable: (registers, code) => code('C'),
                visible: () => phraise || phlower
            },
            {
                write: {
                    enable: 0x0200,
                    disable: 0x0400,
                },
                read: {
                    register: 143,
                    mask: 0x1000,
                },
                text: translate('pcd.overview.buttons.phmanual'),
                enable: (registers, code) => code('C'),
                visible: () => phraise || phlower
            },
            {
                write: {
                    enable: 0x0800,
                    disable: 0x1000,
                },
                read: {
                    register: 145,
                    mask: 0x0002,
                },
                visible: () => bit(143, 0x1000) &&  (phraise || phlower) ,
                enable: (registers, code) => code('C'),
                text: translate('pcd.overview.buttons.phon'),
            },
        ]
        
        buttons = buttons.map((button, i) => {
            let visible = typeof button.visible === 'undefined' ? true : button.visible()
            if (!visible) return null

            if (button.type == 'text') {
                return <Text style={{ fontWeight: 'bold', marginBottom: 10 }} key={ button.text }>{ button.text }</Text>
            }

            let value = registers[button.read.register] & button.read.mask
            let checked = value != 0
            if (button.read.negate) checked = !checked

            let toggle = () => {
                let sendValue = checked ? button.write.disable : button.write.enable
                let saved = socket.saveRegister(this.props.token, 145, sendValue)

                // Override the local value
                if (saved) {
                    let value = registers[button.read.register]
                    socket.saveRegister(this.props.token, button.read.register, value ^ button.read.mask, true)
                }
            }

            let code = this.props.enteredCode ? this.props.enteredCode.code : null
            let codeCheck = createCodeCheckFunction(code)

            let enabled = true
            if (button.enable) enabled = button.enable(registers, codeCheck)

            return <Button
                key={ i }
                onPress={ toggle }
                disabled={ !enabled }
                style={{ opacity: enabled ? 1 : 0.4, backgroundColor: "rgba(0, 0, 0, 0.1)" }}
            >
                <FontAwesomeIcon icon={ checked ? faCheckSquare : faSquare }/>
                <Text style={{ marginLeft: 10 }}>{ button.text }</Text>
            </Button>
        })

        return (
            <ScrollView style={{ backgroundColor: '#f5f5f5' }}>
                <Wave color={this.props.colorScheme.primary[0]}>
                    <TouchableOpacity style={{ padding: 5, margin: -5 }} onPress={() => this.props.navigation.goBack()}>
                        <FontAwesomeIcon icon={faArrowLeft} color={this.props.colorScheme.opposite[0]} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 22, color: this.props.colorScheme.opposite[0], marginTop: 4 }}>{ translate('pcd.overview.buttons.title') }</Text>
                </Wave>

                <View style={{ padding: 20 }}>
                    <View style={{ flex: 1 }}>
                        {buttons}
                    </View>
                </View>
            </ScrollView>
        )
    }

}

const OverviewNavigator = createStackNavigator({
    Overview: {
        screen: connect(state => ({ canWrite: state.iap.canWriteToCF100 }))(connectWithDevice(Overview, true)),
        navigationOptions: { header: null }
    },
    Messages: { screen: connectWithDevice(Messages, true) },
    Buttons: { screen: connect()(connectWithDevice(Buttons, true)) },
}, {
    initialRouteName: 'Overview',
    navigationOptions: { header: null }
})

export default OverviewNavigator
