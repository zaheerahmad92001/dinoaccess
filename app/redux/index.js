import { createStore, combineReducers, applyMiddleware } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import hardSet from 'redux-persist/lib/stateReconciler/hardSet'
import storage from 'redux-persist/lib/storage'

import logger from 'redux-logger'
import rootReducer from './reducers'

const persistConfig = {
  key: 'primary',
  storage,
  stateReconciler: hardSet,
  blacklist: ['session'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export * from './actions'
export const store = createStore(persistedReducer, applyMiddleware(logger))
export const persistor = persistStore(store)
