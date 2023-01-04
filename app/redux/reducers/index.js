import { combineReducers } from 'redux'
import authenticationReducer from './authenticationReducer'
import configurationReducer from './configurationReducer'
import deviceReducer from './deviceReducer'
import iapReducer from './iapReducer'
import sessionReducer from './sessionReducer'

export default combineReducers({
    auth: authenticationReducer,
    config: configurationReducer,
    devices: deviceReducer,
    iap: iapReducer,
    session: sessionReducer,
})
