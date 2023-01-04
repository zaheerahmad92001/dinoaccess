import Reducer from './Reducer'
import { IapActions } from '../actions'

let reducer = new Reducer({})
reducer.addFunction(IapActions.CAN_WRITE_TO_CF100, (state, action) => {
    return { ...state, canWriteToCF100: action.enabled }
})

export default reducer.reducerFunction
