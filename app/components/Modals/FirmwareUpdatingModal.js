import React, { Component } from 'react'
import { Text, View, KeyboardAvoidingView, Dimensions, ScrollView, Platform, PermissionsAndroid, TouchableOpacity } from 'react-native'
import Modal from 'react-native-modal'
import PillButton from '../PillButton'
import styled from 'styled-components/native'
import { translate } from '@/services/i18n'
import Markdown from 'react-native-markdown-renderer'
import { getMaxModalHeight } from '@/modules/helpers'
import axios from '@/services/axios'
import { setErrorMessage } from '@/components/Modals/ErrorMessageModal'
import RNFetchBlob from 'rn-fetch-blob'
import config from '@/config.js'
import { connect } from 'react-redux'
import { DeviceActions } from '@/redux'
import { EventRegister } from 'react-native-event-listeners'
import * as Progress from 'react-native-progress'
import Swatch from '@/assets/Swatch'

const Title = styled.Text`
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 12px;
`

const Description = styled.View`
    margin-bottom: 4px;
    margin-top: 8px;
`

const ModalContent = styled.View`
    padding: 20px;
    border-radius: 4px;
    background-color: white;
`

const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
  
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
  
    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
}

class FirmwareUpdatingModal extends Component {
    constructor (props) {
        super(props)

        this.state = {
            downloading: false,
        }
    }

    async deleteInstallation () {
        this.props.onClose(true)
    }

    onBackdropPress() {
        if (this.state.downloading) return

        this.props.onClose()
    }
    
    async startUpdate() {
        let { type, ip, token, onClose } = this.props
        let { version, deviceType, target } = this.currentUpdate

        this.setState({ downloading: true })

        try {
            // 1. Make sure the local CF100 exists
            let { data: returnedToken } = await axios({
                method: 'get',
                url: `http://${ip}/api/status`,
                responseType: 'text',
                timeout: 10000,
            }) 

            if (token != returnedToken) {
                throw new Error()
            }
        } catch (e) {
            onClose()
            setTimeout(() => setErrorMessage(translate('modals.firmwareupdateavailable.couldnotfind', { type: translate(`types.${type}`) })), 300)
            this.setState({ downloading: false })
            return
        }

        try {
            let response = await RNFetchBlob.config({
                fileCache: true
            }).fetch('GET', `${config.api.baseUrl}/firmware/download/${deviceType}/${version}`)

            let filename = 'cf100_10019EEPROM.dlf'
            let headers = response.info().headers
            if (headers['Content-Disposition']) filename = headers['Content-Disposition'].match(/filename=.+?__(.+);?.*$/i)[1]

            if (Platform.OS == 'ios') {
                let form = new FormData()
                form.append('name', {
                    uri: response.path(),
                    type: 'application/octet-stream',
                    name: filename,
                })

                await fetch(`http://${ip}/api/upload`, {
                    method: 'POST',
                    body: form,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                })
            } else {
                await RNFetchBlob.fetch('POST', `http://${ip}/api/upload`, {
                    'Content-Type': 'multipart/form-data',
                }, [{ name: 'name', filename, data: RNFetchBlob.wrap(response.path()) }])
            }

            onClose()
            setTimeout(() => setErrorMessage(translate('modals.firmwareupdateavailable.done', { type: translate(`types.${type}`) })), 300)

            EventRegister.emit('navigateFromDevice')
            this.props.dispatch({
                type: DeviceActions.START_UPDATE,
                token,
                version,
                target,
            })
        } catch (e) {
            console.warn(e.message)
            onClose()
            setTimeout(() => setErrorMessage(translate('modals.firmwareupdateavailable.error', { type: translate(`types.${type}`) })), 300)
            this.setState({ downloading: false })
        }
    }

    renderDownloading() {
        let size = Math.min(Dimensions.get('window').width - 300, 190)
        return <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Progress.CircleSnail
                size={ size }
                indeterminate thickness={ 5 }
                color={ Swatch.yellow }
                duration={ 2000 }
                spinDuration={ 5000 }
            />
        </View>
    }

    get currentUpdate() {
        let { deviceUpdate, espUpdate, type } = this.props
        
        if (deviceUpdate) return { ...deviceUpdate, deviceType: type, target: 'device' }
        if (espUpdate) return { ...espUpdate, deviceType: `ESP_${type}`, target: 'esp' }
        return {}
    }

    renderInfo() {
        let { onClose, type, deviceUpdate, espUpdate, ...props } = this.props
        let { changelog, version, deviceType } = this.currentUpdate
        
        return <Description>
            <ScrollView style={{ maxHeight: getMaxModalHeight() - 200 }}>
                <Markdown>{ translate('modals.firmwareupdateavailable.description', { version, type: translate(`types.${type}`) }) }</Markdown>
                { deviceUpdate && espUpdate ?
                    <Markdown>{ translate('modals.firmwareupdateavailable.twoupdates') }</Markdown> : null }

                { changelog ? <View style={{ marginTop: 10 }}>
                    <Text style={{ fontWeight: 'bold', marginBottom: -8}}>{ translate('modals.firmwareupdateavailable.changelog') }</Text>
                    <Markdown>{ changelog }</Markdown>
                </View> : null }
            </ScrollView>
        </Description>
    }
    
    render() {
        let { onClose, type, ...props } = this.props
        
        return (
            <View style={{ flex: 1 }}>
                <Modal backdropOpacity={0.5} onBackdropPress={ () => this.onBackdropPress() } {...props}>
                    <KeyboardAvoidingView behavior="padding">
                        <ModalContent style={{ maxHeight: getMaxModalHeight() }}>
                            <Title style={{
                                textAlign: this.state.downloading ? 'center' : 'left'
                            }}>{ translate(this.state.downloading ? 'modals.firmwareupdating.title' : 'modals.firmwareupdateavailable.title', { type }) }</Title>
                            { this.state.downloading ? this.renderDownloading() : this.renderInfo() }

                            { this.state.downloading ? null :
                                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 14 }}>
                                    <PillButton title={translate('modals.firmwareupdateavailable.start')} onPress={ () => this.startUpdate() } />
                                </View>
                            }
                            { this.state.downloading ? null :
                                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                                    <TouchableOpacity onPress={ onClose }><Text>{ translate('cancel') }</Text></TouchableOpacity>
                                </View>
                            }
                        </ModalContent>
                    </KeyboardAvoidingView>
                </Modal>
            </View>
        )
    }
}

export default connect()(FirmwareUpdatingModal)
