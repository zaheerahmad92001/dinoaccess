import React, { Component } from 'react'
import { createBottomTabNavigator, BottomTabBar } from 'react-navigation-tabs'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faTasksAlt, faSlidersVSquare, faBalanceScale, faCogs, faHomeAlt } from '@fortawesome/pro-solid-svg-icons'
import { connect } from 'react-redux'
import { StackActions } from 'react-navigation'
import connectWithDevice from '@/modules/connectWithDevice'
import { EventRegister } from 'react-native-event-listeners'
import { translate } from '@/services/i18n'
import { setErrorMessage } from '@/components/Modals/ErrorMessageModal'

import Overview from './Overview'
import SetpointList, { onPress as onPressSetpoints } from './SetpointList'
import SettingsList, { onPress as onPressSettings } from './SettingsList'

function icon(icon, size = 27) {
    return ({ tintColor }) => <FontAwesomeIcon icon={icon} size={size} color={tintColor} />
}

function onPressHome({ navigation }) {
    navigation.dispatch(StackActions.popToTop())
}

class TabBarComponent extends Component {
    componentWillMount() {
        this.listener = EventRegister.addEventListener('navigateFromDevice', () => {
            onPressHome({ navigation: this.props.navigation })
        })
    }

    componentWillUnmount() {
        EventRegister.removeEventListener(listener)
    }

    render() {
        let props = this.props
        let colors = props.colorScheme.primary

        let onTabPress = (destination) => {
            if (destination.route.key != 'BackHome' && (!this.props.deviceMeta || !this.props.deviceMeta.isOnline)) {
                destination.route.routeName = 'Settings'
                if (destination.route.key != 'Settings') {
                    setErrorMessage(translate('settings.offline'))
                }
            }

            props.onTabPress(destination)
        }

        return <BottomTabBar {...props} activeTintColor={colors[0]} showLabel={false} onTabPress={onTabPress} />
    }
}

const Tab = createBottomTabNavigator({
    BackHome: { screen: () => null, navigationOptions: { tabBarIcon: icon(faHomeAlt, 24), tabBarOnPress: onPressHome } },
    Overview: { screen: Overview, navigationOptions: { tabBarIcon: icon(faTasksAlt, 24) } },
    Setpoints: { screen: SetpointList, navigationOptions: { tabBarIcon: icon(faSlidersVSquare), tabBarOnPress: onPressSetpoints } },
    Settings: { screen: SettingsList, navigationOptions: { tabBarIcon: icon(faCogs), tabBarOnPress: onPressSettings } },
}, {
    initialRouteName: 'Overview',
    tabBarComponent: connect()(connectWithDevice(TabBarComponent, true)),
})

Tab.navigationOptions = {
    header: null,
}

export default Tab
