import { ref, provide, onMounted } from 'vue'

// 常量
const STORAGE_KEYS = {
  IMMERSIVE_MODE: 'lumina-immersive-mode',
  BG_COLOR: 'lumina-bg-color'
} as const

// 沉浸模式状态
const immersiveMode = ref(false)
const contentWidth = ref(60)
const contentBgColor = ref('')

/**
 * 沉浸模式 Composable
 * 管理沉浸式阅读模式的状态和持久化
 */
export function useImmersiveMode() {
  // 切换沉浸模式
  const toggleImmersive = () => {
    immersiveMode.value = !immersiveMode.value
    localStorage.setItem(STORAGE_KEYS.IMMERSIVE_MODE, immersiveMode.value ? 'true' : 'false')
  }

  // 设置内容宽度
  const setContentWidth = (width: number) => {
    contentWidth.value = width
  }

  // 设置背景颜色
  const setContentBgColor = (color: string) => {
    contentBgColor.value = color
    if (color) {
      localStorage.setItem(STORAGE_KEYS.BG_COLOR, color)
    } else {
      localStorage.removeItem(STORAGE_KEYS.BG_COLOR)
    }
  }

  // 初始化（从 localStorage 恢复状态）
  const initFromStorage = () => {
    const savedImmersive = localStorage.getItem(STORAGE_KEYS.IMMERSIVE_MODE)
    if (savedImmersive === 'true') {
      immersiveMode.value = true
    }

    const savedColor = localStorage.getItem(STORAGE_KEYS.BG_COLOR)
    if (savedColor) {
      contentBgColor.value = savedColor
    }
  }

  // 提供状态给子组件
  const provideImmersiveContext = () => {
    provide('immersiveMode', immersiveMode)
    provide('toggleImmersive', toggleImmersive)
    provide('contentWidth', contentWidth)
    provide('setContentWidth', setContentWidth)
    provide('contentBgColor', contentBgColor)
    provide('setContentBgColor', setContentBgColor)
  }

  return {
    immersiveMode,
    contentWidth,
    contentBgColor,
    toggleImmersive,
    setContentWidth,
    setContentBgColor,
    initFromStorage,
    provideImmersiveContext
  }
}
