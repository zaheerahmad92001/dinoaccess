import Reducer from './Reducer'
import { SessionActions } from '../actions'

let reducer = new Reducer({})
reducer.addFunction(SessionActions.SET_ERROR_MESSAGE, (state, action) => {
    return { ...state, errorMessage: action.message }
})

export default reducer.reducerFunction
