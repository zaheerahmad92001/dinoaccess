import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import * as Progress from 'react-native-progress'
import { renderWithDecimals } from '@/modules/registers'
import Swatch from '@/assets/Swatch'
import styled from 'styled-components/native'
import { translate } from '@/services/i18n'

const Box = styled.View`
    border-radius: 6px;
    padding: 10px;
    padding-bottom: 10px;
    background-color: white;
    margin-bottom: 18px;
    shadow-color: black;
    shadow-offset: 1px 0;
    shadow-opacity: 0.9;
    shadow-radius: 10px;
    elevation: 2;
    height: 80px;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
`

export default ({ config, registers }) => (
    <View style={{ width: '48%' }}>
        <Box>
            <Text style={{ fontSize: 14 }}>{translate(config.label)}</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{renderWithDecimals(registers[config.register], config.comma, config.decimals)} {config.unit}</Text>
        </Box>
    </View>
)
