import * as React from 'react'
import { FlatList, View, Text, TouchableOpacity, SafeAreaView } from 'react-native'
import Fuse from 'fuse.js'
import { translate } from '@/services/i18n'

const ListItem = ({ item, onSelect }) => {
  return (
    <TouchableOpacity onPress={ () => onSelect(item) }>
      <Text style={[
          { paddingVertical: 15, paddingHorizontal: 5, fontSize: 15 },
          item.type == 'reset' ? { color: 'rgba(0, 0, 0, 0.4)' } : null
      ]}>{ item.type == 'reset' ? translate('reset') : item.name }</Text>
      <View style={{ borderBottomColor: 'rgba(0, 0, 0, 0.14)', borderBottomWidth: 1 }} />
    </TouchableOpacity>
  )
}

export default StockistList = ({ data, filter, onSelect }) => {
  let fuse = new Fuse(data, {
    shouldSort: true,
    threshold: 0.2,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
      "name"
    ]
  })

  let filteredData = filter ? fuse.search(filter) : data

  return (
    <SafeAreaView>
      <FlatList
        data={ [{ id: null, name: '', type: 'reset' }, ...filteredData] }
        renderItem={ ({ item }) => <ListItem item={item} onSelect={onSelect} /> }
        keyExtractor={ item => `${item.id}` }
        style={{ padding: 20 }}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  )
}
