import Reducer from './Reducer'
import { AuthenticationActions } from '../actions'

let reducer = new Reducer({})
reducer.addFunction(AuthenticationActions.STORE_JWT, (state, action) => {
    return { ...state, jwt: action.jwt }
})

reducer.addFunction(AuthenticationActions.STORE_USERDATA, (state, action) => {
    return { ...state, user: action.user }
})

export default reducer.reducerFunction
