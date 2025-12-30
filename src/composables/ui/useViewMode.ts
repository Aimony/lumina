import { useViewModeStore, viewModeOptions } from '@/stores/viewMode'
import { storeToRefs } from 'pinia'
import type { ViewMode, ViewModeOption } from '@/stores/viewMode'

// Re-export types
export type { ViewMode, ViewModeOption }
export { viewModeOptions }

/**
 * 视图模式 Composable
 * 向后兼容 wrapper，内部使用 Pinia store
 */
export function useViewMode() {
  const store = useViewModeStore()
  const { currentMode } = storeToRefs(store)

  return {
    currentMode,
    viewModeOptions,
    setMode: store.setMode,
    nextMode: store.nextMode
  }
}
