import PillButton from '@/components/PillButton'
import createDynamicPage, { ValueRow } from '@/components/CF100/DynamicPage'
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

class CalibrateButton extends Component {
    state = {
        buttonDisabled: false,
    }

    get shouldBeDisabled () {
        return this.props.registers['38'] == 0
    }

    render() {
        let { registers, register, value, refs, ...props } = this.props

        let disabled = this.shouldBeDisabled || this.state.buttonDisabled
        let title = translate('cf100.calibration.calibrate')
        if (registers['38'] == 4) title = translate('cf100.calibration.calibrate4')
        if (registers['38'] == 7) title = translate('cf100.calibration.calibrate7')

        let save = () => {
            let saved = socket.saveRegister(props.token, register.register, 1)
            if (saved) {
                refs.toast.show(translate('cf100.calibration.calibrated'), 2000)
                this.setState({ buttonDisabled: true })
            }

            setTimeout(() => this.setState({ buttonDisabled: false }), 15000)
        }

        let color = props.colorScheme.primary[0]
        let textColor = props.colorScheme.opposite[0]

        return <ValueRow style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 30 }}>
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

const key = 'calibration'
const settings = [
    {
        "register": "messWertpH",
        "label": "cf100.calibration.messWertpH",
        "readonly": true
    },
    {
        "register": "sondenSteilheitPH",
        "label": "cf100.calibration.sondenSteilheitPH",
        "readonly": true
    },
    {
        "register": "sondenSpannungPH",
        "label": "cf100.calibration.sondenSpannungPH",
        "readonly": true
    },
    {
        "register": "phStartCal",
        "component": CalibrateButton,
    }
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
