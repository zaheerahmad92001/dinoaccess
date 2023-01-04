import { createNavigator, onPressOverride } from '@/components/KMZE/NavigationListComponent'
import KmzeSetpoints from '@/assets/deviceconfiguration/kmze/index'

const navigator = createNavigator('Setpoints', KmzeSetpoints)

export default navigator.navigationComponent
export const onPress = navigator.onPressOverride