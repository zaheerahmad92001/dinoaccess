import React from 'react'
import axios from '@/services/axios'
import socket from '@/services/socket'
import { connect } from 'react-redux'
import { DeviceActions } from '@/redux'
import Swatch from '@/assets/Swatch'

export default function connectWithDevice(WrappedComponent, useStoreToken = false) {
    class WrapperComponent extends React.Component {
        constructor(props) {
            super(props)

            socket.io.emit('subscribe-dinoaccess', this.token)

            if (!useStoreToken) {
                this.props.dispatch({
                    type: DeviceActions.SET_SELECTED_DEVICE,
                    device: this.token
                })
            }
        }

        get token() {
            let navigationToken = null
            try {
                navigationToken = this.props.navigation.state ? this.props.navigation.state.params.token : null
            } catch (e) { }

            if (useStoreToken || !navigationToken) return this.props.devices.selectedDevice
            return navigationToken
        }

        render() {
            let registers = this.props.devices.registers ? (this.props.devices.registers[this.token] || {}) : {}

            let colors = this.props.colors || {}
            let colorSchemeName = colors[this.token] || 'yellow'
            let scheme = Swatch.schemes[colorSchemeName]
            let oppositeScheme = Swatch.oppositeSchemes[colorSchemeName]

            let codes = this.props.codes || {}
            let code = codes[this.token]

            return <WrappedComponent
                registers={registers}
                token={this.token}
                enteredCode={code}
                colorScheme={{ primary: scheme, opposite: oppositeScheme, name: colorSchemeName }}
                deviceMeta={this.props.devices.list[this.token]}
                {...this.props}
            />
        }
    }

    return connect(state => ({
        devices: state.devices,
        colors: state.devices.colors,
        codes: state.devices.codes,
    }))(WrapperComponent)
}