import config from '@/config.js'
import axios from 'axios'
import { store } from '../redux'

const axiosInstance = axios.create({
    baseURL: config.api.baseUrl
})

axiosInstance.interceptors.request.use((config) => {
    if (store.getState().auth.jwt) {
        config.headers.Authorization = `Bearer ${store.getState().auth.jwt}`
    }
    return config
}, (err) => Promise.reject(err))

export default axiosInstance
