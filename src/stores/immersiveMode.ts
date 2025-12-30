import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEYS = {
  IMMERSIVE_MODE: 'lumina-immersive-mode',
  BG_COLOR: 'lumina-bg-color'
} as const

export const useImmersiveModeStore = defineStore('immersiveMode', () => {
  const immersiveMode = ref(false)
  const contentWidth = ref(60)
  const contentBgColor = ref('')

  // 初始化（从 localStorage 恢复状态）
  const init = () => {
    const savedImmersive = localStorage.getItem(STORAGE_KEYS.IMMERSIVE_MODE)
    if (savedImmersive === 'true') {
      immersiveMode.value = true
    }

    const savedColor = localStorage.getItem(STORAGE_KEYS.BG_COLOR)
    if (savedColor) {
      contentBgColor.value = savedColor
    }
  }

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

  return {
    immersiveMode,
    contentWidth,
    contentBgColor,
    init,
    toggleImmersive,
    setContentWidth,
    setContentBgColor
  }
})
