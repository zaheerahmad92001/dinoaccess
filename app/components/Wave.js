import React, { Component } from 'react'
import { View, Dimensions } from 'react-native'
import { Svg, Path } from 'react-native-svg'
import Swatch from '@/assets/Swatch'
import { getStatusBarHeight } from 'react-native-status-bar-height'

export default class Wave extends Component {

    render () {
        let { color, children, style } = this.props
        const width = Dimensions.get('window').width + 2
        const svg = `M0,0 L0,80 C196,150 300,-80 ${width + 50},70 L${width},0 L0,0`

        if (!color) color = Swatch.yellow

        let statusBarHeight = getStatusBarHeight()

        return <View style={{ position: 'relative', marginBottom: -20, ...style }}>
            <View style={{ backgroundColor: color, height: statusBarHeight }} />
            <Svg
                height="120"
                width={width}
                style={{ marginBottom: -3 }}
            >
                <Path d={svg} fill={color} stroke="none" />
            </Svg>
            <View style={{ position: 'absolute', paddingLeft: 20, top: statusBarHeight + 10 }}>
                { children }
            </View>
        </View>
    }

}