import { useImmersiveModeStore } from '@/stores/immersiveMode'
import { storeToRefs } from 'pinia'

/**
 * 沉浸模式 Composable
 * 向后兼容 wrapper，内部使用 Pinia store
 */
export function useImmersiveMode() {
  const store = useImmersiveModeStore()
  const { immersiveMode, contentWidth, contentBgColor } = storeToRefs(store)

  return {
    immersiveMode,
    contentWidth,
    contentBgColor,
    toggleImmersive: store.toggleImmersive,
    setContentWidth: store.setContentWidth,
    setContentBgColor: store.setContentBgColor,
    initFromStorage: store.init,
    // 提供空函数保持接口兼容，Pinia 不需要 provide
    provideImmersiveContext: () => {}
  }
}
