import { ref, watch } from 'vue'

export type ViewMode = 'standard' | 'card' | 'timeline' | 'tree'

export interface ViewModeOption {
  id: ViewMode
  icon: string
  label: string
}

export const viewModeOptions: ViewModeOption[] = [
  { id: 'standard', icon: '📄', label: '标准视图' },
  { id: 'card', icon: '🎨', label: '卡片视图' },
  { id: 'timeline', icon: '📊', label: '时间线视图' },
  { id: 'tree', icon: '🌳', label: '树形视图' }
]

const STORAGE_KEY = 'lumina-view-mode'

// 全局共享状态
const currentMode = ref<ViewMode>((localStorage.getItem(STORAGE_KEY) as ViewMode) || 'standard')

// 持久化到 localStorage
watch(currentMode, (newMode) => {
  localStorage.setItem(STORAGE_KEY, newMode)
})

export function useViewMode() {
  const setMode = (mode: ViewMode) => {
    currentMode.value = mode
  }

  const nextMode = () => {
    const currentIndex = viewModeOptions.findIndex((o) => o.id === currentMode.value)
    const nextIndex = (currentIndex + 1) % viewModeOptions.length
    const nextOption = viewModeOptions[nextIndex]
    if (nextOption) {
      currentMode.value = nextOption.id
    }
  }

  return {
    currentMode,
    viewModeOptions,
    setMode,
    nextMode
  }
}
