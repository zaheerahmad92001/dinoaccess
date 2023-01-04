import React from 'react'
import {View,Dimensions} from 'react-native'
import Swatch from '@/assets/Swatch'
import styled from 'styled-components/native'

const Circle = styled.View`
    width: 14px;
    height: 14px;
    position: relative;
    borderRadius: 7px;
    marginBottom: 50px;
    marginTop: 8px;
`

export default function ({ steps, currentStep, children }) {
    let dots = Array.apply(0, Array(steps)).map((_, index) => <Circle 
        style={{ marginLeft: !index ? 0 : 40, backgroundColor: index == currentStep ? Swatch.darkGray : Swatch.lightGray }}
        key={ index }
    >
        <View style={{ position: 'absolute', left: -20, top: 20, width: 400 }}>{ index == currentStep ? children : null }</View>
    </Circle>)

    return <View>
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', padding: 20 }}>
            { dots }
        </View>
    </View>
}