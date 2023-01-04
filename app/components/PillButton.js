import React from 'react'
import { View } from 'react-native'
import styled from 'styled-components/native'
import Swatch from '@/assets/Swatch'

const Button = styled.TouchableOpacity`
    background-color: ${Swatch.lightGray};
    paddingTop: 10px;
    paddingBottom: 10px;
    text-align: center;
    borderRadius: 5;
    min-width: 200px;
    display: flex;
    align-items: center;
`

const Text = styled.Text`
    color: ${Swatch.darkGray};
    font-weight: bold;
    width: 100%;
    text-align: center;
`

export default ({ title, onPress, textStyle, ...props }) => (
    <Button onPress={ onPress } {...props}>
        <Text style={ textStyle }>{ title }</Text>
    </Button>
)