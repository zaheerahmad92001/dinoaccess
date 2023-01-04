export default class Reducer {
    reducerMap = {}

    constructor (initialState) {
        this.initialState = initialState
    }

    reducerFunction = (state = this.initialState, action) => {
        if (this.reducerMap[action.type]) {
            return this.reducerMap[action.type](state, action)
        }

        return state
    }

    addFunction (action, func) {
        this.reducerMap[action] = func
    }
}