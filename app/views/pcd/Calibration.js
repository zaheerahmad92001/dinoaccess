import PillButton from '@/components/PillButton'
import createDynamicPage, { ValueRow } from '@/components/PCD/DynamicPage'
import socket from '@/services/socket'
import React, { Component, Fragment } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { faInfoCircle } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import connectWithDevice from '@/modules/connectWithDevice'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import CustomModal from '@/components/Modals/CustomModal'
import { translate } from '@/services/i18n'
import Markdown from 'react-native-markdown-renderer'
import Swatch from '@/assets/Swatch'
import chroma from 'chroma-js'

class CalibrateButton extends Component {
    state = {
        buttonDisabled: false,
    }

    render() {
        let { registers, register, value, refs, ...props } = this.props

        let disabled = this.state.buttonDisabled
        
        let save = () => {
            let saved = socket.saveRegister(props.token, register.register, 241)

            if (saved) {
                // refs.toast.show(translate('cf100.calibration.calibrated'), 2000)
                this.setState({ buttonDisabled: true })
                setTimeout(() => this.setState({ buttonDisabled: false }), 15000)
            }
        }

        return <ValueRow style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 30 }}>
            <PillButton
                title={ translate(register.label) }
                onPress={ save }
                style={{ backgroundColor: 'transparent', opacity: disabled ? 0.4 : 1, borderColor: Swatch.red, borderWidth: 1, paddingTop: 7, paddingBottom: 7 }}
                textStyle={{ color: Swatch.red, fontWeight: 'normal' }}
                disabled={ disabled }
            />
        </ValueRow>
    }
}

class TwoPointCalibrateButton extends Component {
    state = {
        buttonDisabled: false,
    }

    get shouldBeDisabled () {
        let value = this.props.registers['133']

        return value != 400 && value != 700
    }

    render() {
        let { registers, register, value, refs, ...props } = this.props

        let disabled = this.shouldBeDisabled || this.state.buttonDisabled

        let title = translate('pcd.calibration.calibrate')
        if (registers['133'] == 400) title = translate('pcd.calibration.calibrate4')
        if (registers['133'] == 700) title = translate('pcd.calibration.calibrate7')

        let save = () => {
            let saved = socket.saveRegister(props.token, register.register, registers['133'])

            if (saved) {
                // refs.toast.show(translate('cf100.calibration.calibrated'), 2000)
                this.setState({ buttonDisabled: true })
                setTimeout(() => this.setState({ buttonDisabled: false }), 15000)
            }
        }

        let color = props.colorScheme.primary[0]
        let textColor = props.colorScheme.opposite[0]

        return <ValueRow style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: -20 }}>
            <PillButton
                title={ title }
                onPress={ save }
                style={{ backgroundColor: color, opacity: disabled ? 0.4 : 1 }}
                textStyle={{ color: textColor }}
                disabled={ disabled }
            />
        </ValueRow>
    }
}

function TextComponent ({ register }) {
    return <Text style={{ fontSize: 16, ...register.style}}>{ translate(register.label) }</Text>
}

const key = 'pcd.setpoints.titles.calibration'
const settings = [
    {
        "section": "pcd.calibration.calibrateDes",
        "visible": (registers) => registers[1] != 227 && registers[1] != 228,
        "registers": [
            {
                "label": "pcd.calibration.messWert",
                "register": 123,
                "unit": "mg/l",
                "comma": 2,
                "readonly": true,
            },
            {
                "label": "pcd.calibration.sondenSteilheit",
                "register": 124,
                "unit": "mV",
                "comma": 1,
                "readonly": true,
                "visible": (registers) => registers[1] != 222,
            },
            {
                "label": "pcd.calibration.sondenSteilheit",
                "register": 125,
                "unit": "mA",
                "comma": 1,
                "readonly": true,
                "visible": (registers) => registers[1] == 222,
            },
            {
                "label": "pcd.calibration.inputvoltage",
                "register": 126,
                "unit": "mV",
                "comma": 0,
                "readonly": true,
                "visible": (registers) => registers[1] != 222,
            },
            {
                "label": "pcd.calibration.inputcurrent",
                "register": 127,
                "unit": "mA",
                "comma": 0,
                "readonly": true,
                "visible": (registers) => registers[1] == 222,
            },
            {
                "label": "pcd.calibration.DPD",
                "register": 40,
                "unit": "mg/l",
                "comma": 2,
                "type": "slider",
                "range": [10, 1000],
                "visible": (registers) => registers[128] == 0,
            },
            {
                "register": 7,
                "label": "pcd.calibration.calReset",
                "component": CalibrateButton,
                "visible": (registers) => registers[128] == 0,
            },
            {
                "label": "pcd.calibration.aerActive",
                "component": TextComponent,
                "visible": (registers) => registers[128] > 0,
                "style": {
                    // See https://facebook.github.io/react-native/docs/text-style-props
                "textAlign": "center",
                "color": 'rgb(255,0,0)',

                }
            }
        ]
    },
    {
        "section": "pcd.calibration.calibratePH",
        "visible": (registers) => registers[3] == 241,
        "registers": [
            {
                "component": ({ registers }) => {
                    let text = registers[8] == 245 ? translate('pcd.calibration.onepoint') : translate('pcd.calibration.twopoint')
                
                    return <Text style={{ marginLeft: -5, marginBottom: 10, marginTop: 3 }}>{ text }</Text>
                },
            },
            {
                "label": "pcd.calibration.messWert",
                "register": 129,
                "unit": "pH",
                "comma": 2,
                "readonly": true,
            },
            {
                "label": "pcd.calibration.sondenSteilheit",
                "register": 130,
                "unit": "mV/pH",
                "comma": 0,
                "readonly": true,
            },
            {
                "label": "pcd.calibration.zeropint",
                "register": 131,
                "unit": "mV",
                "comma": 0,
                "readonly": true,
            },
            {
                "label": "pcd.calibration.inputvoltage",
                "register": 132,
                "unit": "mV",
                "comma": 0,
                "readonly": true,
            },
            {
                "label": "pcd.calibration.photometer",
                "register": 41,
                "unit": "pH",
                "comma": 2,
                "type": "slider",
                "range": [400, 1300],
                "visible": (registers) => registers[8] == 245,
            },
            {
                "register": 133,
                "component": TwoPointCalibrateButton,
                "visible": (registers) => registers[8] != 245,
            },
            {
                "register": 9,
                "label": "pcd.calibration.calReset",
                "component": CalibrateButton,
            },
        ]
    },
]

class InfoButton extends Component {
    state = {
        modalOpen: false
    }

    render () {
        let { colorScheme } = this.props

        return (
            <Fragment>
                <CustomModal isVisible={ this.state.modalOpen }
                    onClose={ () => this.setState({ modalOpen: false }) }
                    title={ translate('modals.calibrationinfo.title') }
                >
                    <ScrollView>
                        <Markdown>{ translate('modals.calibrationinfo.description') }</Markdown>
                    </ScrollView>
                </CustomModal>
                <TouchableOpacity
                    onPress={() => this.setState({ modalOpen: true })}
                    style={{
                        position: 'absolute',
                        right: 20,
                        top: getStatusBarHeight() + 25,
                        width: 50,
                        height: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                    <FontAwesomeIcon icon={faInfoCircle} color={ colorScheme.primary[0] } size={20} />
                </TouchableOpacity>
            </Fragment>
        )
    }
}

const ConnectedInfoButton = connectWithDevice(InfoButton, true)

export default createDynamicPage(key, settings, <ConnectedInfoButton />)
