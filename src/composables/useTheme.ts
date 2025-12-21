import { ref, watchEffect, provide, inject, type InjectionKey, type Ref } from 'vue'

const IS_DARK_KEY = Symbol('IS_DARK') as InjectionKey<Ref<boolean>>
const TOGGLE_DARK_KEY = Symbol('TOGGLE_DARK') as InjectionKey<(event?: MouseEvent) => void>

export function useThemeProvider() {
  const isDark = ref(false)

  // Initialize theme
  if (typeof window !== 'undefined') {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // Watch effect to update DOM
  watchEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDark.value)
    }
  })

  const toggleDark = async (event?: MouseEvent) => {
    // 检查浏览器是否支持 View Transitions API
    if (!document.startViewTransition || !event) {
      // 不支持或没有事件对象，直接切换
      isDark.value = !isDark.value
      return
    }

    // 计算点击位置相对于视口的百分比
    const x = event.clientX
    const y = event.clientY
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    // 设置 CSS 自定义属性，用于动画定位
    document.documentElement.style.setProperty('--x', `${x}px`)
    document.documentElement.style.setProperty('--y', `${y}px`)
    document.documentElement.style.setProperty('--end-radius', `${endRadius}px`)

    // 使用 View Transitions API 执行过渡
    const transition = document.startViewTransition(() => {
      isDark.value = !isDark.value
    })

    // 等待过渡完成
    await transition.ready
  }

  provide(IS_DARK_KEY, isDark)
  provide(TOGGLE_DARK_KEY, toggleDark)

  return { isDark, toggleDark }
}

export function useTheme() {
  const isDark = inject(IS_DARK_KEY)
  const toggleDark = inject(TOGGLE_DARK_KEY)

  if (!isDark || !toggleDark) {
    throw new Error('useTheme must be used within a component that calls useThemeProvider')
  }

  return { isDark, toggleDark }
}
