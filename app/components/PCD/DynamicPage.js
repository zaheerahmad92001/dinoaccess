import React, { Component } from 'react'
import { View, Text, ScrollView, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import { createStackNavigator } from 'react-navigation'
import RegisterPage from './RegisterPage'
import connectWithDevice from '@/modules/connectWithDevice'
import styled from 'styled-components/native'
import { renderWithDecimals } from '@/modules/registers'
import Toast from 'react-native-easy-toast'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import Wave from '@/components/Wave'
import chroma from 'chroma-js'
import { translate } from '@/services/i18n'
import { connect } from 'react-redux'
import { setErrorMessage } from '@/components/Modals/ErrorMessageModal'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faArrowLeft } from '@fortawesome/pro-regular-svg-icons'
import ActionButton from './ActionButton'
import { createCodeCheckFunction } from '@/modules/helpers'

export const ValueRow = styled.View`
    padding-top: 10px;
    padding-bottom: 15px;
    margin-bottom: 15px;
    flex: 1;
`

const SectionHeader = styled.Text`
    font-weight: bold;
    font-size: 18px;
`

const Section = styled.View`
    padding-left: 5px;
`

const Label = styled.Text`

`

const Value = styled.Text`
    font-size: 40px;
    font-weight: bold;
`

const UnitValue = styled.Text`
    font-size: 20px;
    font-weight: normal;
    color: black;
`

const Divider = styled.View`
    position: absolute;
    bottom: 0;
    border-bottom-color: rgba(0, 0, 0, 0.1);
    border-bottom-width: 1px;
    left: 0;
    right: 20px;
`



export default function (key, settings, children = null) {
    class DynamicPage extends Component {

        state = {
            buttonDisabled: false,
        }

        gotoRegisterPage(register) {
            if (register.readonly === true) return () => {}
            
            return () => {
                this.props.navigation.navigate({
                    routeName: 'Register',
                    params: { register }
                })
            }
        }

        renderValue(setting) {
            let registers = this.props.registers
            let colorScheme = this.props.colorScheme.primary
            let registerNumber = setting.register

            let value = renderWithDecimals(registers[registerNumber], setting.comma)
            let hideUnit = false

            if (setting.visible && !setting.visible(registers)) {
                return null
            }

            if (setting.type == 'button') {
                setting.component = ActionButton
            }

            if (setting.component) {
                let Component = setting.component
                return <Component register={setting} value={registers[registerNumber]} {...this.props} refs={this.refs} />
            }

            if (setting.type == 'list') {
                value = setting.options[Object.keys(setting.options)[0]]
                for (let val of Object.keys(setting.options)) {
                    if (registers[registerNumber] == val) {
                        value = translate(setting.options[val])
                        break
                    }
                }
            }

            if (setting.type == 'timeInterval') {
                let times = setting.registers.map(registerNumber => registers[registerNumber])
                times = [...times].map(value => value % 100).map(value => value >= 10 ? value : `0${value}`)

                value = `${times[0]}:${times[1]} - ${times[2]}:${times[3]}`
                hideUnit = true
            }
            if (typeof setting.enabled == 'function') {
                let code = this.props.enteredCode ? this.props.enteredCode.code : null

                let codeCheck = createCodeCheckFunction(code)
                setting.readonly = !setting.enabled(registers, codeCheck)
            }

            let color = setting.readonly || setting.faded ? chroma(colorScheme[0]).desaturate(4).hex() : chroma(colorScheme[0]).desaturate(1).hex()
            return <TouchableWithoutFeedback onPress={this.gotoRegisterPage(setting)} key={setting.register}>
                <ValueRow>
                    <Label>{ translate(setting.label) }</Label>
                    <Value style={{ color }}>
                        {value}
                        {hideUnit ? null : <UnitValue>  {setting.unit}</UnitValue>}
                    </Value>
                    <Divider />
                </ValueRow>
            </TouchableWithoutFeedback>
        }

        render() {
            let values = []

            if (settings[0] && settings[0].section) {
                for (let section of settings) {
                    if (!(section.visible && !section.visible(this.props.registers))) {
                        values.push(<View style={{ marginBottom: 30 }} key={section.section}>
                            <SectionHeader>{ translate(section.section) }</SectionHeader>
                            <Section>{section.registers.map(this.renderValue.bind(this))}</Section>
                        </View>)
                    }
                }
            } else {
                values = settings.registers.map(this.renderValue.bind(this))
            }

            let goBack = () => {
                this.props.navigation.goBack(null)
            }

            return (
                <ScrollView style={{ backgroundColor: '#f5f5f5' }} contentContainerStyle={{ paddingTop: getStatusBarHeight() }}>
                    <Wave color={this.props.colorScheme.primary[0]} style={{ marginTop: -getStatusBarHeight() }}>
                        <TouchableOpacity style={{ padding: 5, margin: -5 }} onPress={goBack}>
                            <FontAwesomeIcon icon={faArrowLeft} color="white" />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 22, color: this.props.colorScheme.opposite[0], marginTop: 4 }}>{ translate(key) }</Text>
                    </Wave>

                    {children}

                    <View style={{ padding: 20 }}>
                        <View style={{ flex: 1 }}>
                            {values}
                        </View>
                    </View>

                    <Toast ref="toast" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}></Toast>
                </ScrollView>
            )
        }

    }

    return createStackNavigator({
        Index: {
            screen: connect()(connectWithDevice(DynamicPage, true))
        },
        Register: { screen: RegisterPage },
    }, {
        initialRouteName: 'Index',
        navigationOptions: { header: null }
    })
}
