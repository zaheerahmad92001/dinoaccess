export function renderWithDecimals (value, commas, fractions = undefined) {
    if (!commas) {
        return value
    }

    if (isNaN(value)) {
        value = 0
    }
    
    let pow = Math.pow(10, commas)
    let integerDigits = Math.floor(value / pow)
    let fractionalDigits = ((value / pow) - integerDigits).toFixed(commas).replace(/^0\./, '')
    fractionalDigits = fractionalDigits.slice(0, fractions)

    return `${integerDigits},${fractionalDigits}`
}