import React, { Component } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faBookReader, faBallotCheck } from '@fortawesome/pro-regular-svg-icons'
import styled from 'styled-components/native'
import KMZE from '@/assets/deviceconfiguration/kmze/registers'
import messages from '@/assets/deviceconfiguration/kmze/messages'
import connectWithDevice from '@/modules/connectWithDevice'
import { renderWithDecimals } from '@/modules/registers'
import { createStackNavigator } from 'react-navigation'
import Swatch from '@/assets/Swatch'
import { connect } from 'react-redux'
import Wave from '@/components/Wave'
import { faArrowLeft, faSquare, faCheckSquare } from '@fortawesome/pro-regular-svg-icons'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import socket from '@/services/socket'
import { translate } from '@/services/i18n'
import { setErrorMessage } from '@/components/Modals/ErrorMessageModal'
import { createCodeCheckFunction } from '@/modules/helpers'
import OverviewItem from '@/components/KMZE/OverviewItem'

const ButtonArea = styled.View`
    position: absolute;
    top: ${getStatusBarHeight() + 10}px;
    right: 20px;
    display: flex;
    flexDirection: row;
`

class Overview extends Component {

    static navigationOptions = {
        header: null
    }

    componentDidMount() {
        if (!this.props.deviceMeta.isOnline) {
            setErrorMessage(translate('settings.offline'))
            this.props.navigation.navigate('Settings')
        }
    }

    render() {
        let registers = this.props.registers || {}

        let colorScheme = this.props.colorScheme
        let backgroundColor = '#f5f5f5'
        backgroundColor = colorScheme.primary[0]
        let code = this.props.enteredCode ? this.props.enteredCode.code : null
        let codeCheck = createCodeCheckFunction(code)
        let isDirect = (registers) => (registers[0] == 2 || registers[0] == 3 || registers[0] == 6 || registers[0] == 7)

        // Piece together the values to display
        let visibleRegisters = [
            {
                // zellSpann
                "label": "kmze.overview.zellSpann",
                "register": 3,
                "unit": "V",
                "comma": 3,
                "decimals": 1
            },
            {
                // q1
                "label": "kmze.overview.q1",
                "register": 4,
                "unit": "l/h",
                "comma": 0,
                "decimals": 1,
            },
            {
                // zellStrom
                "label": "kmze.overview.zellStrom",
                "register": 2,
                "unit": "%",
            },
            {
                // q2
                "label": "kmze.overview.q2",
                "register": 5,
                "unit": "l/h",
                "comma": 1,
                "decimals": 1,
            },
            {
                // stellMSR
                "visible": (registers) => isDirect(registers),
                "label": "kmze.overview.stellMSR",
                "register": 16,
                "unit": "%",
                "comma": 0,
            },
            {
                // istReaktor
                "visible": (registers) => isDirect(registers),
                "label": "kmze.overview.istReaktor",
                "register": 13,
                "unit": "cm",
                "comma": 0,
            },
            {
                // stellHOCL
                "visible": (registers) => isDirect(registers) && codeCheck('D'),
                "label": "kmze.overview.stellHOCL",
                "register": 17,
                "unit": "%",
                "comma": 0,
            },
            {
                // stellEntnahme
                "visible": (registers) => isDirect(registers),
                "label": "kmze.overview.stellEntnahme",
                "register": 18,
                "unit": "%",
                "comma": 0,
            },
            {
                // isNaOCl
                "visible": (registers) => !isDirect(registers),
                "label": "kmze.overview.istProdukttank",
                "register": 13,
                "unit": "cm",
                "comma": 0,
            }
        ]

        let detailedTitle = {
            0: '13 TANK',
            1: '26 TANK',
            2: '13 DIRECT',
            3: '26 DIRECT',
            4: '40 TANK',
            5: '80 TANK',
            6: '40 DIRECT',
            7: '80 DIRECT',
        }[registers['0']]

        visibleRegisters = visibleRegisters.filter((register) => {
            return !register.visible || register.visible(registers)
        })

        let registerRows = visibleRegisters.map((config, i) => {
            return <OverviewItem registers={registers} config={config} />
        })

        let hasMessages = (registers['19'] & 2047) != 0 && (registers['20'] & 2047) != 0 // 2 Melderegister

        return (
            <ScrollView style={{ backgroundColor }} contentContainerStyle={{ flex: 1 }}>
                <View style={{ padding: 20, paddingTop: getStatusBarHeight() + 50, display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <View>
                        <View style={{ marginTop: -38, marginBottom: 20 }}>
                            <Text style={{ fontSize: 17, fontWeight: 'bold', color: colorScheme.opposite[0] }}>{translate('types.KMZE')} - {detailedTitle}</Text>
                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20 }}>
                            {registerRows}
                        </View>
                    </View>

                    <ButtonArea>
                        {codeCheck('D') ?
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Buttons')}>
                                <FontAwesomeIcon icon={faBallotCheck} color={colorScheme.opposite[0]} size={24} style={{ marginRight: 20 }} />
                            </TouchableOpacity>
                            : null
                        }

                        <TouchableOpacity onPress={() => this.props.navigation.navigate('Messages')}>
                            <FontAwesomeIcon icon={faBookReader} color={hasMessages ? Swatch.red : colorScheme.opposite[0]} size={24} />
                        </TouchableOpacity>
                    </ButtonArea>
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

class Messages extends Component {

    render() {
        let registers = this.props.registers || {}
        let messageViews = []

        for (let message of messages.messages) {
            let isSet = !!(registers[message.register] & (1 << (message.bit - 1)))
            if (!isSet) continue
            messageViews.push(<Message key={message.bit}>{translate(message.message)}</Message>)
        }

        return (
            <ScrollView style={{ backgroundColor: '#f5f5f5' }}>
                <Wave color={this.props.colorScheme.primary[0]}>
                    <TouchableOpacity style={{ padding: 5, margin: -5 }} onPress={() => this.props.navigation.goBack()}>
                        <FontAwesomeIcon icon={faArrowLeft} color={this.props.colorScheme.opposite[0]} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 22, color: this.props.colorScheme.opposite[0], marginTop: 4 }}>{translate('kmze.overview.messages.title')}</Text>
                </Wave>

                <View style={{ padding: 20 }}>
                    <View style={{ flex: 1 }}>
                        {messageViews.length ? messageViews : <Text>{translate('kmze.overview.messages.empty')}</Text>}
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

    render() {
        let registers = this.props.registers || {}

        let buttons = [
            {
                registerName: 'AnAus',
                text: translate('kmze.overview.buttons.AnAus'),
            }
        ]

        buttons = buttons.map(button => {
            let registerNumber = KMZE[button.registerName].register
            let value = registers[registerNumber]
            let enabled = value == 1

            let toggle = () => {
                let saved = socket.saveRegister(this.props.token, registerNumber, enabled ? 0 : 1)
            }

            return <Button
                key={button.registerName}
                onPress={toggle}
                disabled={button.disabled}
                style={{ opacity: button.disabled ? 0.3 : 1 }}
            >
                <FontAwesomeIcon icon={enabled ? faCheckSquare : faSquare} />
                <Text style={{ marginLeft: 10 }}>{button.text}</Text>
            </Button>
        })

        return (
            <ScrollView style={{ backgroundColor: '#f5f5f5' }}>
                <Wave color={this.props.colorScheme.primary[0]}>
                    <TouchableOpacity style={{ padding: 5, margin: -5 }} onPress={() => this.props.navigation.goBack()}>
                        <FontAwesomeIcon icon={faArrowLeft} color={this.props.colorScheme.opposite[0]} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 22, color: this.props.colorScheme.opposite[0], marginTop: 4 }}>{translate('kmze.overview.buttons.title')}</Text>
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
        screen: connect(state => ({ canWrite: state.iap.canWriteToKMZE }))(connectWithDevice(Overview, true)),
        navigationOptions: { header: null }
    },
    Messages: { screen: connectWithDevice(Messages, true) },
    Buttons: { screen: connect()(connectWithDevice(Buttons, true)) },
}, {
    initialRouteName: 'Overview',
    navigationOptions: { header: null }
})

export default OverviewNavigator
