import { useThemeStore } from '@/stores/theme'

/**
 * @deprecated 使用 useThemeStore 替代
 * 保留此函数用于向后兼容
 */
export function useThemeProvider() {
  const store = useThemeStore()
  store.init()
  return { isDark: store.isDark, toggleDark: store.toggleDark }
}

/**
 * 获取主题状态
 * 简化 API，内部调用 store
 */
export function useTheme() {
  const store = useThemeStore()
  return { isDark: store.isDark, toggleDark: store.toggleDark }
}
