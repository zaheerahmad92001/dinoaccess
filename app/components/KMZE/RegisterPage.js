import React, { Component } from 'react'
import { TouchableOpacity, View, ScrollView } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faArrowLeft } from '@fortawesome/pro-regular-svg-icons'
import styled from 'styled-components/native'
import Slider from './RegisterInput/Slider'
import TimeInterval from './RegisterInput/TimeInterval'
import ListSelection from './RegisterInput/ListSelection'
import { connect } from 'react-redux'
import connectWithDevice from '@/modules/connectWithDevice'
import Swatch from '@/assets/Swatch'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import { translate } from '@/services/i18n'

const BackButton = styled.View`
    margin-bottom: 3px;
`

const Text = styled.Text`
    color: white;
    font-size: 18px;
`

const TopBar = styled.View`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding-top: ${getStatusBarHeight()}px;
    padding-left: 20px;
    padding-bottom: 15px;
    background-color: rgba(0, 0, 0, 0.05);
`

class RegisterPage extends Component {

    static navigationOptions = {
        header: null
    }

    render() {
        let register = this.props.navigation.state.params.register

        let components = {
            slider: Slider,
            timeInterval: TimeInterval,
            list: ListSelection,
        }
        let ComponentType = components[register.type] || components.slider

        let colors = this.props.colorScheme.primary

        return (
            <View style={{ backgroundColor: colors[0], height: '100%' }}>
                <ComponentType register={register} colors={colors} />

                <TopBar>
                    <BackButton>
                        <TouchableOpacity style={{ padding: 5, margin: -5 }} onPress={() => this.props.navigation.goBack()}>
                            <FontAwesomeIcon icon={faArrowLeft} color={this.props.colorScheme.opposite[0]} size={18} />
                        </TouchableOpacity>
                    </BackButton>

                    <Text>
                        { translate(register.label) }
                    </Text>
                </TopBar>
            </View>
        )
    }

}

export default connect()(connectWithDevice(RegisterPage, true))
