import Reducer from './Reducer'
import { ConfigurationActions } from '../actions'

let reducer = new Reducer({})
reducer.addFunction(ConfigurationActions.STORE_DEVICE_TOKEN, (state, action) => {
    let config = {
        token: action.token,
        password: action.password,
        type: action.deviceType
    }

    let configurations = state.configurations ? state.configurations : {}
    configurations[action.token] = config

    return {
        ...state,
        ...config,
        restarted: false,
        configurations,
    }
})

reducer.addFunction(ConfigurationActions.RESTART_CONFIGURATION, (state, action) => {
    let config = {
        token: action.token,
        password: action.password,
        type: action.deviceType
    }

    return {
        ...state,
        ...config,
        restarted: true,
    }
})

reducer.addFunction(ConfigurationActions.STORE_WIFI_CREDENTIALS, (state, action) => {
    return { ...state, ssid: action.ssid, passphrase: action.passphrase }
})

reducer.addFunction(ConfigurationActions.DEVICE_FINISHED_CONFIGURATION, (state, action) => {
    let configurations = state.configurations ? state.configurations : {}
    if (configurations[action.token]) delete configurations[action.token]

    return { ...state, navigateTo: action.token, configurations, restarted: false, }
})

export default reducer.reducerFunction
