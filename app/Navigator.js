import React, { Component } from 'react'
import { createSwitchNavigator, createStackNavigator, withNavigationFocus } from 'react-navigation'

import AuthLoading from './views/authentication/Loading'
import Login from './views/authentication/Login'
import ForgotPassword from './views/authentication/ForgotPassword'
import Register from './views/authentication/Register'
import RegisterStep2 from './views/authentication/RegisterStep2'
import Dashboard from './views/dashboard/Overview'
import Account from './views/dashboard/Account'

import ConfigurationDetails from './views/configuration/Details'
import ConfigurationWaiting from './views/configuration/Waiting'
import ConfigurationWiFiList from './views/configuration/WiFiList'
import ConfigurationWiFiCredentials from './views/configuration/WiFiCredentials'

import Pcd from './views/pcd'
import Cf100 from './views/cf100'
import Kmze from './views/kmze'

export const Authenticated = createStackNavigator({
    Dashboard: { screen: withNavigationFocus(Dashboard) },
    Account: { screen: Account },
    ConfigurationDetails: { screen: ConfigurationDetails },
    ConfigurationWaiting: { screen: ConfigurationWaiting },
    ConfigurationWiFiList: { screen: ConfigurationWiFiList },
    ConfigurationWiFiCredentials: { screen: ConfigurationWiFiCredentials },
    Pcd: { screen: Pcd },
    Cf100: { screen: Cf100 },
    Kmze: { screen: Kmze },
}, {
    initialRouteName: 'Dashboard',
})

export const Unauthenticated = createStackNavigator({
    Login: { screen: Login },
    ForgotPassword: { screen: ForgotPassword },
    Register: { screen: Register },
    RegisterStep2: { screen: RegisterStep2 },
}, {
    initialRouteName: 'Login',
})

export const AppNavigator = createSwitchNavigator({
    AuthLoading: { screen: AuthLoading },
    Unauthenticated: { screen: Unauthenticated },
    Authenticated: { screen: Authenticated },
}, {
    initialRouteName: 'AuthLoading',
})

export default AppNavigator
