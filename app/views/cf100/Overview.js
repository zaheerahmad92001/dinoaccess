import React, {Component} from 'react'
import {View, Text, ScrollView, TouchableOpacity, Dimensions} from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faExclamationTriangle, faBallotCheck } from '@fortawesome/pro-regular-svg-icons'
import styled from 'styled-components/native'
import CF100 from '@/assets/deviceconfiguration/cf100/registers'
import messages from '@/assets/deviceconfiguration/cf100/messages'
import connectWithDevice from '@/modules/connectWithDevice'
import { renderWithDecimals } from '@/modules/registers'
import { createStackNavigator } from 'react-navigation'
import Swatch from '@/assets/Swatch'
import { connect } from 'react-redux'
import Wave from '@/components/Wave'
import { faArrowLeft, faSquare, faCheckSquare } from '@fortawesome/pro-regular-svg-icons'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import socket from '@/services/socket'
import { DeviceActions } from '@/redux'
import { translate } from '@/services/i18n'
import { setErrorMessage } from '@/components/Modals/ErrorMessageModal'

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
    color: white;
`

const UnitValue = styled.Text`
    font-size: 32px;
    font-weight: normal;
    margin-left: 10px;
    align-self: flex-start;
    color: white;
    text-align: right;
`

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

    componentDidMount () {
        if (!this.props.deviceMeta.isOnline) {
            setErrorMessage(translate('settings.offline'))
            this.props.navigation.navigate('Settings')
        }
    }

    render () {
        let registers = this.props.registers || {}

        let colorScheme = this.props.colorScheme
        let backgroundColor = '#f5f5f5'
        backgroundColor = colorScheme.primary[0]

        // Piece together the values to display
        let visibleRegisters = [CF100.messWertpH]
        if (registers['91'] == 0) {
            visibleRegisters.push(CF100.messWertRx)
        }
        if (registers['90'] == 1 && registers['79'] == 1) {
            visibleRegisters.push(CF100.messT0)
        }
        if (registers['90'] == 1 && registers['94'] == 1) {
            visibleRegisters.push(CF100.messT1)
        }

        let maxFontSize = Dimensions.get('window').width > 400 ? 110 : 80
        let fontSize = Math.min(maxFontSize, (Dimensions.get('window').height / visibleRegisters.length) / 1.33 - 50)
        let registerRows = visibleRegisters.map((config, i) => {
            return <Row key={ config.register }>
                <Value style={{ fontSize, color: colorScheme.opposite[0] }}>{ renderWithDecimals(registers[config.register], config.comma) }</Value>
                <UnitValue>{ config.unit }</UnitValue>
            </Row>
        })

        let hasMessages = (registers['68'] & 2047) != 0

        return (
            <ScrollView style={{ backgroundColor }}>
                <View style={{ padding: 20, paddingTop: getStatusBarHeight() + 50, display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <ButtonArea>
                        { !this.props.canWrite ? null :
                            <TouchableOpacity onPress={ () => this.props.navigation.navigate('Buttons') }>
                                <FontAwesomeIcon icon={ faBallotCheck } color={ colorScheme.opposite[0] } size={ 24 } style={{ marginRight: 20 }} />
                            </TouchableOpacity>
                        }

                        <TouchableOpacity onPress={ () => this.props.navigation.navigate('Messages') }>
                            <FontAwesomeIcon icon={ faExclamationTriangle } color={ hasMessages ? Swatch.red : colorScheme.opposite[0] } size={ 24 } />
                        </TouchableOpacity>
                    </ButtonArea>
                    
                    <View>
                        <View style={{ display: 'flex', flexDirection: 'column' }}>
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

class Messages extends Component {

    render () {
        let registers = this.props.registers || {}
        let meldeRegister = registers[68]

        let messageViews = []
        for (let message of messages) {
            let isSet = !!(meldeRegister & (1 << (message.bit - 1)))
            if (!isSet) continue

            messageViews.push(<Message key={ message.bit }>{ translate(message.message) }</Message>)
        }

        return (
            <ScrollView style={{ backgroundColor: '#f5f5f5' }}>
                <Wave color={this.props.colorScheme.primary[0]}>
                    <TouchableOpacity style={{ padding: 5, margin: -5 }} onPress={() => this.props.navigation.goBack()}>
                        <FontAwesomeIcon icon={faArrowLeft} color={this.props.colorScheme.opposite[0]} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 22, color: this.props.colorScheme.opposite[0], marginTop: 4 }}>{ translate('cf100.overview.messages.title') }</Text>
                </Wave>

                <View style={{ padding: 20 }}>
                    <View style={{ flex: 1 }}>
                        { messageViews.length ? messageViews : <Text>{ translate('cf100.overview.messages.empty') }</Text> }
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
        let meldeRegister = registers[15]

        let buttons = [
            {
                registerName: 'dosEnable',
                text: translate('cf100.overview.buttons.installation'),
            },
            {
                registerName: 'freigabeChlor',
                text: translate('cf100.overview.buttons.desinfection'),
            },
            {
                registerName: 'freigabePH',
                text: registers[84] == 0 ? translate('cf100.overview.buttons.phlower') : translate('cf100.overview.buttons.phraise'),
            },
            {
                registerName: 'freigabeTemp',
                text: registers[90] == 0 ? translate('cf100.overview.buttons.phraise') : translate('cf100.overview.buttons.heating'),
            },
        ]
        
        if (registers[45] != 995) {
            buttons.push({ registerName: 'fpMan', text: translate('cf100.overview.buttons.filter'), icon: '', disabled: registers[48] != 0 })
        }
        
        buttons = buttons.map(button => {
            let registerNumber = CF100[button.registerName].register
            let value = registers[registerNumber]
            let enabled = value == 1

            if (button.registerName == 'fpMan' && button.disabled && (registers[68] & 2048)) {
                enabled = true
            }

            let toggle = () => {
                let saved = socket.saveRegister(this.props.token, registerNumber, enabled ? 0 : 1)
            }

            return <Button
                key={ button.registerName }
                onPress={ toggle }
                disabled={ button.disabled }
                style={{ opacity: button.disabled ? 0.3 : 1 }}
            >
                <FontAwesomeIcon icon={ enabled ? faCheckSquare : faSquare }/>
                <Text style={{ marginLeft: 10 }}>{ button.text }</Text>
            </Button>
        })

        return (
            <ScrollView style={{ backgroundColor: '#f5f5f5' }}>
                <Wave color={this.props.colorScheme.primary[0]}>
                    <TouchableOpacity style={{ padding: 5, margin: -5 }} onPress={() => this.props.navigation.goBack()}>
                        <FontAwesomeIcon icon={faArrowLeft} color={this.props.colorScheme.opposite[0]} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 22, color: this.props.colorScheme.opposite[0], marginTop: 4 }}>{ translate('cf100.overview.buttons.title') }</Text>
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
