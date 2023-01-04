import React, { Component } from 'react'
import { ActivityIndicator, StatusBar, Dimensions, View } from 'react-native'
import { AuthenticationActions, IapActions, store } from '@/redux'
import axios from '@/services/axios'
import { connect } from 'react-redux'
import Swatch from '@/assets/Swatch'

class Loading extends Component {

    constructor (props) {
        super(props)
        
        this._bootstrapAsync()
    }

    async _bootstrapAsync () {
        const userToken = store.getState().auth.jwt
        let authenticated = !!userToken

        if (authenticated) {
            try {
                let { data } = await axios.get('/account')
                this.props.dispatch({
                    type: AuthenticationActions.STORE_USERDATA,
                    user: data
                })

                if (typeof data.cf_subscription !== 'undefined') {
                    this.props.dispatch({
                        type: IapActions.CAN_WRITE_TO_CF100,
                        enabled: !! data.cf_subscription,
                    })
                }
            } catch (e) {
                authenticated = false
            }
        }

        this.props.navigation.navigate(authenticated ? 'Authenticated' : 'Unauthenticated')
    }

    render () {
        let size = Math.min(Dimensions.get('window').width - 300, 250)

        return (
            <View style={{ flex: 1, display: 'flex', justifyContent: 'center'}}>
                <StatusBar barStyle="dark-content" />
                
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={ Swatch.yellow } />
                </View>
            </View>
        )
    }

}

export default connect()(Loading)