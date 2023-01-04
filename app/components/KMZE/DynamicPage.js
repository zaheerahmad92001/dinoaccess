import React, { Component } from 'react'
import { View, Text, ScrollView, TouchableWithoutFeedback } from 'react-native'
import { createStackNavigator } from 'react-navigation'
import RegisterPage from './RegisterPage'
import KMZE from '@/assets/deviceconfiguration/kmze/registers'
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
            let register = setting
            let registerNumber = register.register

            let value = renderWithDecimals(registers[registerNumber], register.comma)
            let hideUnit = false

            if (setting.visible && !setting.visible(registers)) {
                return null
            }

            if (setting.component) {
                let Component = setting.component
                return <Component register={register} value={registers[registerNumber]} {...this.props} refs={this.refs} />
            }

            if (setting.type == 'list') {
                value = setting.options[Object.keys(setting.options)[0]]
                for (let val of Object.keys(setting.options)) {
                    if (registers[registerNumber]) {
                        value = setting.options[val]
                        break
                    }
                }
            }

            let opacity = setting.readonly ? 0.6 : 1
            return <TouchableWithoutFeedback onPress={this.gotoRegisterPage(setting)} key={setting.register}>
                <ValueRow>
                    <Label>{ translate(setting.label) }</Label>
                    <Value style={{ opacity, color: chroma(colorScheme[0]).desaturate(1).hex() }}>
                        {value}
                        {hideUnit ? null : <UnitValue>  {register.unit}</UnitValue>}
                    </Value>
                    <Divider />
                </ValueRow>
            </TouchableWithoutFeedback>
        }

        render() {
            let values = []
            let list = Array.isArray(settings) ? settings : settings.registers

            if (list[0] && list[0].section) {
                for (let section of list) {
                    values.push(<View style={{ marginBottom: 30 }} key={section.section}>
                        <SectionHeader>{section.section}</SectionHeader>
                        <Section>{section.registers.map(this.renderValue.bind(this))}</Section>
                    </View>)
                }
            } else {
                values = list.map(this.renderValue.bind(this))
            }

            return (
                <ScrollView style={{ backgroundColor: '#f5f5f5' }} contentContainerStyle={{ paddingTop: getStatusBarHeight() }}>
                    <Wave color={this.props.colorScheme.primary[0]} style={{ marginTop: -getStatusBarHeight() }}>
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
