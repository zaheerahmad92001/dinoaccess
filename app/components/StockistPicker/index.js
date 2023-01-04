import React, { Component } from 'react'
import StockistModal from './Modal'
import StockistList from './StockistList'
import Header from './Header'

export default class StockistPicker extends Component {
    constructor (props) {
        super(props)

        this.state = {
            filter: '',
        }
    }

    render () {
        let { visible, data, onSelect, onClose } = this.props

        return <StockistModal visible={ visible }>
            <Header
                filter={ this.state.filter }
                onChange={ (filter) => this.setState({ filter }) }
                onClose={ onClose }
            />
            <StockistList
                data={ data }
                filter={ this.state.filter }
                onSelect={ onSelect }
            />
        </StockistModal>
    }
}
