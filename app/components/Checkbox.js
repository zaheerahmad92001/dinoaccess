import React from 'react'
import { View, Text } from 'react-native'
import styled from 'styled-components/native'
import Swatch from '@/assets/Swatch'

const Checkbox = styled.View`
    border-color: ${Swatch.darkGray};
    border-width: 1px;
    width: 20px;
    height: 20px;
    border-radius: 3px;
    margin-right: 5px;
`

const Checkmark = styled.View`
    width: 10px;
    height: 10px;
    border-radius: 2px;
    left: 4px;
    top: 4px;
`

const TouchableOpacity = styled.TouchableOpacity`
    display: flex;
    flex-direction: row;
    align-items: center;
`

export default ({ style, hint, onSelect, selected, label, name, value, color, labelStyle, ...props }) => <View style={ style }>
    <TouchableOpacity onPress={ () => onSelect({ [name]: value }) }>
        <Checkbox>{ selected == value ? <Checkmark style={{ backgroundColor: color || Swatch.yellow }} /> : null }</Checkbox>
        <Text style={ labelStyle }>{ label ? label : value}</Text>
    </TouchableOpacity>
</View>
