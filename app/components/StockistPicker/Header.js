import * as React from 'react'
import { TextInput, View, TouchableOpacity } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faTimes } from '@fortawesome/pro-regular-svg-icons'
import { translate } from '@/services/i18n'

export default StockistList = ({ filter, onChange, onClose }) => {
  return (
    <View style={{ padding: 20, paddingBottom: 0, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity onPress={ onClose }>
        <FontAwesomeIcon
          icon={ faTimes }
          color="black"
          size={23}
          style={{ marginRight: 5 }}
        />
      </TouchableOpacity>

      <TextInput
        value={ filter }
        placeholder={ translate('search') }
        onChangeText={ (text) => onChange(text) }
        style={{ flex: 1, padding: 10 }}
      />
    </View>
  )
}
