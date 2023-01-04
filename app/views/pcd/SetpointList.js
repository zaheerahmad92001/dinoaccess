import { createNavigator, onPressOverride } from '@/components/PCD/NavigationListComponent'
import Cf100Setpoints from '@/assets/deviceconfiguration/pcd/index'

const navigator = createNavigator('Setpoints', Cf100Setpoints)

export default navigator.navigationComponent
export const onPress = navigator.onPressOverride