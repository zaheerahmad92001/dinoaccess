import Reducer from './Reducer'
import { DeviceActions } from '../actions'

let reducer = new Reducer({})
reducer.addFunction(DeviceActions.UPDATE_REGISTERS, (state = {}, action) => {
    let { token, values } = action

    let registers = state.registers || {}
    if (registers[token]) values = { ...registers[token], ...values }

    let availableDevices = Object.keys(state.list || {})
    for (let device of Object.keys(registers)) {
        if (!availableDevices.includes(device)) delete state.registers[device]
    }

    return { ...state, registers: { ...registers, [token]: values } }
})

reducer.addFunction(DeviceActions.SET_SELECTED_DEVICE, (state, action) => {
    return { ...state, selectedDevice: action.device }
})

reducer.addFunction(DeviceActions.STORE_DEVICES, (state, action) => {
    return { ...state, list: action.list }
})

reducer.addFunction(DeviceActions.SET_DEVICE_COLOR, (state = {}, action) => {
    let { token, color } = action

    let values = { [token]: color }
    if (state && state.colors) values = { ...state.colors, ...values }

    return { ...state, colors: values }
})

reducer.addFunction(DeviceActions.SET_DEVICE_CODE, (state = {}, action) => {
    let { token, code } = action

    let values = { [token]: { code, entered: Date.now() } }
    let previous = state && state.codes ? state.codes : {}

    return {
        ...state,
        codes: {
            ...previous,
            ...values
        }
    }
})

reducer.addFunction(DeviceActions.START_UPDATE, (state = {}, action) => {
    let updating = state.updating || {}
    updating[action.token] = { version: action.version, time: Date.now(), target: action.target || 'device' }

    let list = state.list
    list[action.token].isOnline = false

    return { ...state, list, updating }
})

reducer.addFunction(DeviceActions.REMOVE_UPDATE, (state = {}, action) => {
    let updating = state.updating || {}

    delete updating[action.token]

    return { ...state, updating }
})

export default reducer.reducerFunction
