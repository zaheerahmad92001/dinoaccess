import * as React from 'react'
import { Modal, SafeAreaView, StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

export default StockistModal = ({
  children,
  withModal,
  ...props
}) => {
  const content = (
    <SafeAreaView style={[styles.container, { backgroundColor: 'white' }]}>
      { children }
    </SafeAreaView>
  )

  if (withModal) {
    return <Modal {...props}>{content}</Modal>
  }
  
  return content
}

StockistModal.defaultProps = {
  animationType: 'slide',
  animated: true,
  withModal: true
}