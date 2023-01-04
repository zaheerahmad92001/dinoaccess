import React, { Component } from 'react'
import { View, TouchableOpacity, PanResponder, Dimensions } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronUp, faChevronDown } from '@fortawesome/pro-regular-svg-icons'
import CF100 from '@/assets/deviceconfiguration/cf100/registers'
import connectWithDevice from '@/modules/connectWithDevice'
import { renderWithDecimals } from '@/modules/registers'
import PillButton from '@/components/PillButton'
import socket from '@/services/socket'
import Toast, { DURATION } from 'react-native-easy-toast'
import { translate } from '@/services/i18n'

import Svg, {
    Circle,
    Text,
    Line,
    Defs,
    Mask,
} from 'react-native-svg'

function pointOnCircle(cx, cy, radius, angle) {
    return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
    }
}

function map(num, in_min, in_max, out_min, out_max) {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

const innerRadius = 38
const outerRadius = 50
const reservedAngle = 60 / 180 * Math.PI // 20°

class Slider extends Component {

    constructor(props) {
        super(props)

        let { register, registers } = this.props
        let { register: number } = CF100[register.register]

        this.state = {
            initialValue: registers[number],
            value: registers[number],
            isMoving: false,
        }

        this.gesturePosition = null
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: () => true,

            onPanResponderGrant: (evt, gestureState) => this.setSelectedPosition(gestureState.x0, gestureState.y0, true),
            onPanResponderMove: (evt, gestureState) => this.setSelectedPosition(gestureState.moveX, gestureState.moveY, false),
            onPanResponderRelease: () => this.setState({ isMoving: false }),
        })
    }

    increase() {
        let { register } = this.props
        let { range } = CF100[register.register]

        let value = Math.min(range[1], this.state.value + 1)
        this.setState({ value })
    }

    decrease() {
        let { register } = this.props
        let { range } = CF100[register.register]

        let value = Math.max(range[0], this.state.value - 1)
        this.setState({ value })
    }

    setSelectedPosition(x, y, startMovement) {
        let window = Dimensions.get('window')
        let screenCenter = {
            x: window.width / 2,
            y: window.height / 2,
        }

        let circleRadius = (window.width - 40) / 2
        let xDifference = (x - screenCenter.x) / circleRadius * 100 / 2
        let yDifference = (y - screenCenter.y) / circleRadius * 100 / 2 + 12

        let clickedRadius = Math.sqrt(Math.pow(xDifference, 2) + Math.pow(yDifference, 2))
        if ((clickedRadius < innerRadius || clickedRadius > outerRadius) && !this.state.isMoving) {
            return
        }

        if (startMovement) {
            this.setState({ isMoving: true })
        }

        let angle = Math.atan2(xDifference, yDifference)
        if (angle > 0) angle = (Math.PI - angle) + Math.PI
        if (angle < 0) angle = -angle
        if (angle < reservedAngle / 2 || angle > (Math.PI * 2 - reservedAngle / 2)) return

        let ratio = (angle - reservedAngle / 2) / (Math.PI * 2 - reservedAngle)

        let { register } = this.props
        let { range } = CF100[register.register]

        let diff = range[1] - range[0]
        let selectedValue = Math.round(ratio * diff) + range[0]

        this.setState({ value: selectedValue })
    }

    save() {
        let register = CF100[this.props.register.register]
        let saved = socket.saveRegister(this.props.token, register.register, this.state.value)
        
        if (saved) {
            this.refs.toast.show(translate('cf100.saved'), 2000)
            this.setState({ initialValue: this.state.value })
        }
    }

    render() {
        let { register, registers, colors } = this.props
        let { register: number, range, unit, comma, label } = CF100[register.register]

        let lineCount = Math.max(70, Math.min(range[1] - range[0], 140))
        let selectedLine = Math.min(lineCount - 1, Math.round((this.state.value - range[0]) / (range[1] - range[0]) * lineCount))
        let initialSelectedLine = Math.round((this.state.initialValue - range[0]) / (range[1] - range[0]) * lineCount)

        let lines = []
        for (let i = 0; i < lineCount; i++) {
            let angle = i / (lineCount - 1) * Math.PI * 2
            angle = map(angle, 0, Math.PI * 2, reservedAngle / 2, Math.PI * 2 - reservedAngle / 2) + Math.PI / 2

            let isInitial = initialSelectedLine == i
            let isSelected = selectedLine == i
            let isIntermediate = selectedLine > initialSelectedLine ? (i > initialSelectedLine && i < selectedLine) : (i < initialSelectedLine && i > selectedLine)

            let outerPoint = pointOnCircle(50, 50, outerRadius - 2, angle)
            let innerPoint = pointOnCircle(50, 50, innerRadius - (isSelected ? 2 : 0), angle)
            let stroke = (isSelected || isIntermediate) ? 'white' : 'rgba(255, 255, 255, 0.6)'
            if (isInitial && !isSelected) {
                stroke = 'rgba(255, 255, 255, 0.8)'
            }

            let strokeWidth = 0.3
            if (isIntermediate) strokeWidth = 0.5
            if (isInitial) strokeWidth = 1.2
            if (isSelected) strokeWidth = 1.2

            lines.push(<Line key={i} x1={outerPoint.x} y1={outerPoint.y} x2={innerPoint.x} y2={innerPoint.y} stroke={stroke} strokeWidth={strokeWidth} />)
        }

        let value = renderWithDecimals(this.state.value, comma)
        let window = Dimensions.get('window')

        let changed = this.state.initialValue != this.state.value

        return (
            <View style={{ height: '100%', padding: 20, paddingTop: 52, display: 'flex', alignItems: 'center' }}>
                <View style={{ position: 'absolute', height: window.width, width: '100%', display: 'flex', justifyContent: 'center', top: '50%', marginTop: -(window.width / 2) + 20 }}>
                    <Svg height="100%" width="100%" viewBox="0 0 100 100">
                        <Defs>
                            <Mask id="innerCircle">
                                <Circle cx="50" cy="50" r={outerRadius} fill="white" />
                                <Circle cx="50" cy="50" r={innerRadius} fill="black" />
                            </Mask>
                        </Defs>

                        <Text x="50" y="57" fill="white" textAnchor="middle" fontWeight="bold" fontSize="22">{value}</Text>
                        <Text x="50" y="36" fill="white" textAnchor="middle" fontSize="6">{unit}</Text>

                        <Circle
                            cx="50"
                            cy="50"
                            r={outerRadius}
                            fill="rgba(255,255,255,0.25)"
                            mask="url(#innerCircle)"
                            {...this.panResponder.panHandlers}
                        />

                        {lines}
                    </Svg>

                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: -70 }} pointerEvents="box-none">
                        <TouchableOpacity onPress={() => this.decrease()} style={{ width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FontAwesomeIcon icon={faChevronDown} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => this.increase()} style={{ width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FontAwesomeIcon icon={faChevronUp} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                <Toast ref="toast" />

                <View style={{ position: 'absolute', bottom: 30, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PillButton style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', opacity: changed ? 1 : 0.5 }} textStyle={{ color: 'white' }} title={ translate('cf100.save') } onPress={() => this.save()} disabled={!changed} />
                </View>
            </View>
        )
    }

}

export default connectWithDevice(Slider, true)
