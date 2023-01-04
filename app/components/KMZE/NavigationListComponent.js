import React from 'react'
import { ScrollView, View, Text } from 'react-native'
import { createSwitchNavigator, NavigationActions } from 'react-navigation'
import createDynamicPage from './DynamicPage'
import NavigationOption from './NavigationOption'
import styled from 'styled-components/native'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import connectWithDevice from '@/modules/connectWithDevice'
import Wave from '@/components/Wave'
import { translate } from '@/services/i18n'

const NavigationListWrapper = styled.View`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 10px;
    padding-top: 20px;
`

export const createNavigationListComponent = (settings) => {
    return ({ navigation, registers, colorScheme }) => {
        let keys = Object.keys(settings).filter(key => {
            if (!settings[key].visible) return true
            return settings[key].visible(registers)
        })

        return (
            <ScrollView style={{ backgroundColor: 'white' }} contentContainerStyle={{ paddingTop: getStatusBarHeight() }}>
                <Wave color={colorScheme.primary[0]} style={{ marginTop: -getStatusBarHeight() }}>
                    <Text style={{ fontSize: 22, color: colorScheme.opposite[0], marginTop: 4 }}>{ translate('kmze.setpoints.title') }</Text>
                </Wave>
                
                <NavigationListWrapper>
                    { keys.map(key => <NavigationOption key={ key } navigation={ navigation } id={ key } settings={ settings[key] } />) }
                </NavigationListWrapper>
            </ScrollView>
        )
    }
}

export const createNavigator = (name, settings) => {
    let listComponentName = `${name}ListComponent`

    let navigationTargets = {}
    for (let key of Object.keys(settings)) {
        navigationTargets[key] = { screen: createDynamicPage(key, settings[key]) }
    }

    let SwitchNavigator = createSwitchNavigator({
        [listComponentName]: { screen: connectWithDevice(createNavigationListComponent(settings), true) },
        ...navigationTargets
    }, {
        initialRouteName: listComponentName,
    })

    let navigatorInstance = null
    let Navigator = () => <SwitchNavigator ref={ ref => navigatorInstance = ref } />

    let onPressOverride = ({ defaultHandler}) => {
        if (navigatorInstance) {
            navigatorInstance.dispatch(NavigationActions.navigate({ routeName: listComponentName }))
        }

        defaultHandler()
    }

    return { navigationComponent: connectWithDevice(Navigator, true), onPressOverride }
}
