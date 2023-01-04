import React from 'react'
import { Text, Image } from 'react-native'
import styled from 'styled-components/native'
import Swatch from '@/assets/Swatch'
import { translate } from '@/services/i18n'

const Card = styled.View`
    background-color: ${Swatch.lightGray};
    padding: 10px 20px;
    border-radius: 2px;
    display: flex;
    flex-direction: row;
    align-items: center;
`

const CardText = styled.Text`
    font-size: 16px;
    font-weight: bold;
    padding: 10px 5px;
`

const TouchableOpacity = styled.TouchableOpacity`
    width: 100%;
    margin-bottom: 20px;
    padding-left: 10px;
    padding-right: 10px;
`

export default ({ navigation, id, settings }) => {
    let navigate = navigation.navigate

    let icon = null

    return (
        <TouchableOpacity onPress={ () => navigate(id) }>
            <Card>
                { icon ? <Image source={ icon } style={{ width: 70, height: 50 }} resizeMode="contain"></Image> : null }
                <CardText>{ translate(id) }</CardText>
            </Card>
        </TouchableOpacity>
    )
}
