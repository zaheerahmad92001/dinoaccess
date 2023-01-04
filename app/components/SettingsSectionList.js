import React, { Component } from 'react'
import { View, Text, ScrollView, TouchableOpacity, SectionList, Dimensions } from 'react-native'
import { connect } from 'react-redux'
import styled from 'styled-components/native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronRight } from '@fortawesome/pro-solid-svg-icons'
import { faArrowLeft } from '@fortawesome/pro-regular-svg-icons'
import { Svg, Path } from 'react-native-svg'
import Swatch from '@/assets/Swatch'
import Wave from './Wave'

const Header = styled.Text`
    color: black;
    padding: 25px 20px 10px;
    border-bottom-color: #f7f7f7;
    border-bottom-width: 1px;
    font-size: 15px;
`

export const ValueItemWrapper = styled.TouchableOpacity`
    background-color: white;
    padding: 12px 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`

export const ValueItem = ({ onPress, title, value, readonly, valueStyle, titleStyle }) => (
    <ValueItemWrapper onPress={readonly ? () => {} : onPress} disabled={readonly}>
        <Text style={{ flex: 1, color: 'black', ...titleStyle }}>{title}</Text>
        <Text style={{ textAlign: 'right', ...valueStyle }}>{value ? value.trim() : ''}</Text>
        {
            readonly ? null :
            <View style={{ marginLeft: 10 }}>
                <FontAwesomeIcon icon={faChevronRight} size={12} style={{ top: 3 }} />
            </View>
        }
    </ValueItemWrapper>
)

export default class SettingsSectionList extends Component {

    renderWave() {
        let props = this.props
        if (!props.showWave) return null

        const width = Dimensions.get('window').width + 2
        const svg = `M0,0 L0,80 C196,150 300,-80 ${width + 50},70 L${width},0 L0,0`

        return <Wave>
            <TouchableOpacity style={{ padding: 5, margin: -5 }} onPress={() => props.navigation.goBack()}>
                <FontAwesomeIcon icon={faArrowLeft} color="white" />
            </TouchableOpacity>
            <Text style={{ fontSize: 22, color: 'white', marginTop: 4 }}>{props.pageTitle}</Text>
        </Wave>
    }

    render() {
        let props = this.props

        return <ScrollView style={{ backgroundColor: '#FAFAFA', minHeight: '100%' }}>
            {this.renderWave()}

            <SectionList
                renderSectionHeader={({ section }) => <Header>{section.key}</Header>}
                renderSectionFooter={({ section }) => <View style={{ borderTopColor: '#f7f7f7', borderTopWidth: 1 }} />}
                renderItem={({ item }) => <ValueItem key={item.title} {...item} />}
                {...props}
            />
        </ScrollView>
    }

}
