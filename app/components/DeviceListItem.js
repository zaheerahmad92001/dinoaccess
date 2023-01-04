import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import * as Progress from 'react-native-progress'
import Swatch from '@/assets/Swatch'
import styled from 'styled-components/native'
import { translate } from '@/services/i18n'

const Box = styled.View`
    border-radius: 6px;
    padding: 10px;
    padding-bottom: 6px;
    background-color: ${Swatch.lightGray};
    margin-bottom: 10px;
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

const Triangle = styled.View`
    width: 0;
    height: 0;
    backgroundColor: transparent;
    borderStyle: solid;
    borderRightWidth: 26px;
    borderTopWidth: 26px;
    borderRightColor: transparent;
    transform: rotate(180deg);
    position: absolute;
    right: 0;
    bottom: 0;
`

const LoadingOverlay = styled.View`
    position: absolute;
    left: 0;
    right: 0;
    height: 80px;
    background-color: rgba(255, 255, 255, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
`

export default ({ item, online, style, onSelect, loading }) => (
    <TouchableOpacity onPress={onSelect} style={{ width: '48%' }}>
        <Box>
            <Text style={{ fontSize: 18 }}>{item.display_name}</Text>
            <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{ translate(`types.${item.type}`) }</Text>

            <Triangle style={{ borderTopColor: online ? Swatch.green : Swatch.red }} />
            
            { !loading ? null :
                <LoadingOverlay>
                    <Progress.CircleSnail
                        size={ 40 }
                        indeterminate thickness={ 5 }
                        color={ Swatch.yellow }
                        duration={ 200 }
                        spinDuration={ 5000 }
                    />
                </LoadingOverlay>
            }
        </Box>
    </TouchableOpacity>
)