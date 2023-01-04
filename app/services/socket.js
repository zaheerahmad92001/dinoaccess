import SocketIOClient from 'socket.io-client'
import { DeviceActions, store } from '@/redux'
import config from '@/config'
import { translate } from '@/services/i18n'
import { setErrorMessage } from '@/components/Modals/ErrorMessageModal'
import moment from 'moment'

class Socket {
    constructor() {
        this.jwt = null
        this.io = this.getSocket()
    }

    getSocket() {
        // console.warn(config.api.websocket, this.jwt)
        let socket = SocketIOClient(config.api.websocket, {
            secure: true, query: `auth_token=${this.jwt}`,
            autoConnect: false,
        })

        socket.open()

        socket.on('error', (e) => {
            // console.warn('error', e.message)
            console.log(e)
        })
        socket.on('connect', (e) => {
            // console.warn('connected')
        })
        socket.on('connect_error', (e) => {
            // console.warn('connect_error', e)
            console.log(e)
        })

        socket.on('dinoaccess-status', (json) => {
            const { device, ...values } = json

            let { list } = store.getState().devices
            if (list[device]) {
                list[device].lastRegisterUpdate = moment().format('YYYY-MM-DD HH:mm:ss')
                
                store.dispatch({
                    type: DeviceActions.STORE_DEVICES,
                    list
                })
            }
            
            store.dispatch({
                type: DeviceActions.UPDATE_REGISTERS,
                token: device,
                values,
                origin: 'mqtt',
            })
        })

        return socket
    }

    setJWT(jwt) {
        if (this.io) {
            this.io.close()
        }

        this.jwt = jwt
        this.io = this.getSocket()
    }

    saveRegister(token, register, value, localOnly = false) {
        if (!this.io.connected) {
            setTimeout(() => setErrorMessage(translate('notconnectedwriting')), 300)
            return false
        }

        if (!localOnly) {
            this.io.emit('update-dinoaccess', {
                token, register, value
            })
        }

        store.dispatch({
            type: DeviceActions.UPDATE_REGISTERS,
            token,
            values: { [register]: value },
            origin: 'saving',
        })
        
        return true
    }
}

let socketWrapper = new Socket()

let tryAgain = setInterval(() => {
    let jwt = store.getState().auth.jwt
    if (jwt && socketWrapper.jwt != jwt) {
        socketWrapper.setJWT(jwt)
        clearInterval(tryAgain)
    }
}, 100)

export default socketWrapper
