import React from 'react'
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'
import { createStackNavigator, NavigationActions } from 'react-navigation'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faArrowLeft } from '@fortawesome/pro-regular-svg-icons'
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

export const createNavigationListComponent = (settings, prefix = '') => {
    return ({ navigation, registers, colorScheme }) => {
        let keys = Object.keys(settings).filter(key => {
            if (!settings[key].visible) return true
            return settings[key].visible(registers)
        })

        let canGoBack = prefix != ''

        return (
            <ScrollView style={{ backgroundColor: 'white' }} contentContainerStyle={{ paddingTop: getStatusBarHeight() }}>
                <Wave color={colorScheme.primary[0]} style={{ marginTop: -getStatusBarHeight() }}>
                    { !canGoBack ? null :
                        <TouchableOpacity style={{ padding: 5, margin: -5 }} onPress={() => navigation.goBack()}>
                            <FontAwesomeIcon icon={faArrowLeft} color="white" />
                        </TouchableOpacity>
                    }
                    <Text style={{ fontSize: 22, color: colorScheme.opposite[0], marginTop: 4 }}>{ translate('cf100.setpoints.title') }</Text>
                </Wave>
                
                <NavigationListWrapper>
                    { keys.map(key => <NavigationOption key={ key } prefix={ prefix } navigation={ navigation } id={ key } settings={ settings[key] } />) }
                </NavigationListWrapper>
            </ScrollView>
        )
    }
}

export const createNavigator = (name, settings) => {
    let listComponentName = `${name}ListComponent`

    let navigationTargets = {}
    const addDynamicPages = (settings, path = '') => {
        for (let key of Object.keys(settings)) {
            let newPath = `${path}${key}.`
            
            if (settings[key].pages) {
                navigationTargets[newPath] = { screen: connectWithDevice(createNavigationListComponent(settings[key].pages, newPath)) }
                addDynamicPages(settings[key].pages, newPath)
            } else {
                navigationTargets[newPath] = { screen: createDynamicPage(key, settings[key]) }
            }
        }
    }

    addDynamicPages(settings)

    let StackNavigator = createStackNavigator({
        [listComponentName]: { screen: connectWithDevice(createNavigationListComponent(settings), true) },
        ...navigationTargets
    }, {
        initialRouteName: listComponentName,
        navigationOptions: {
            header: null,
        },
    })

    let navigatorInstance = null
    let Navigator = () => <StackNavigator ref={ ref => navigatorInstance = ref } />

    let onPressOverride = ({ defaultHandler}) => {
        if (navigatorInstance) {
            navigatorInstance.dispatch(NavigationActions.navigate({ routeName: listComponentName }))
        }

        defaultHandler()
    }

    return { navigationComponent: connectWithDevice(Navigator, true), onPressOverride }
}
