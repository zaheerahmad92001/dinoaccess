import React, { Component } from 'react'
import PillButton from '@/components/PillButton'
import { ValueRow } from '@/components/PCD/DynamicPage'
import socket from '@/services/socket'
import { translate } from '@/services/i18n'
import Swatch from '@/assets/Swatch'
import connectWithDevice from '@/modules/connectWithDevice'

class ActionButton extends Component {
    state = {
        buttonDisabled: false,
    }

    render() {
        let { registers, register, value, refs, colorScheme, ...props } = this.props

        let customEnabled = register.enabled && register.enabled(registers)
        let disabled = !customEnabled || this.state.buttonDisabled
        
        let save = () => {
            let saved = socket.saveRegister(props.token, register.writeRegister, register.writeValue)

            if (saved) {
                // refs.toast.show(translate('cf100.calibration.calibrated'), 2000)
                this.setState({ buttonDisabled: true })
                setTimeout(() => this.setState({ buttonDisabled: false }), register.waitPress * 1000)
            }
        }

        let color = colorScheme.primary[0]
        let textColor = colorScheme.opposite[0]

        return <ValueRow style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: -20 }}>
            <PillButton
                title={ translate(register.label) }
                onPress={ save }
                style={{ backgroundColor: color, opacity: disabled ? 0.4 : 1 }}
                textStyle={{ color: textColor }}
                disabled={ disabled }
            />
        </ValueRow>
    }
}

export default connectWithDevice(ActionButton, true)
