import React from 'react'
import styled from 'styled-components/native'
import Swatch from '@/assets/Swatch'
import Hint from '@/components/Hint'

const View = styled.View`
    margin-bottom: 5px;
`

const TextInput = styled.TextInput`
    background-color: transparent;
    padding: 10px 0;
    font-size: 16px;
`

const TextInputWrapper = styled.View`
    border-color: ${Swatch.darkGray};
    border-bottom-width: 1px;
`

export default class extends React.Component {

    render () {
        let { style, ...props } = this.props

        return <View style={ this.props.style || {} }>
            <TextInputWrapper>
                <TextInput placeholderTextColor={ Swatch.darkGray } {...props}></TextInput>
            </TextInputWrapper>
            { props.hint ? <Hint>{ props.hint }</Hint> : null }
        </View>
    }

}