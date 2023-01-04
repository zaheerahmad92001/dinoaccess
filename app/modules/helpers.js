import { Platform, Dimensions } from 'react-native'
import { getStatusBarHeight as originalGetStatusBarHeight } from 'react-native-status-bar-height'

export function getStatusBarHeight (negativeSpacingForAndroid = false) {
    return getStatusBarHeight() - (negativeSpacingForAndroid && Platform.OS == 'android' ? 20 : 0)
}

export function getMaxModalHeight () {
    return Math.min(500, Dimensions.get('window').height - 50)
}

export function getSuperuserCode () {
    const date = new Date()
    let code = date.getFullYear() - 1000
    code *= (date.getDate() % 2) ? (date.getDate() + 4) : (53 - date.getDate())
    code -= (date.getMonth() + 1) + 8 + date.getDate()
    return code
}

export function createCodeCheckFunction (code) {
    return (minimumCode) => {
        switch (minimumCode) {
            case 'D': return code == getSuperuserCode()
            case 'C': return code == 178
            case 'B': return code == 178 || code == 87
            default: return true
        }
    }
}
