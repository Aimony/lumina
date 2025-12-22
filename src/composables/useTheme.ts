import { ref, watchEffect, provide, inject, type InjectionKey, type Ref } from 'vue'

const IS_DARK_KEY = Symbol('IS_DARK') as InjectionKey<Ref<boolean>>
const TOGGLE_DARK_KEY = Symbol('TOGGLE_DARK') as InjectionKey<(event?: MouseEvent) => void>

const STORAGE_KEY = 'lumina-theme-pref'
const EXPIRY_MS = 3 * 24 * 60 * 60 * 1000 // 3 days

interface ThemePreference {
  value: boolean
  timestamp: number
}

function getStoredTheme(): boolean | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const pref: ThemePreference = JSON.parse(raw)
    const now = Date.now()

    // Check if expired
    if (now - pref.timestamp > EXPIRY_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    return pref.value
  } catch (e) {
    console.error('Failed to parse theme preference', e)
    return null
  }
}

export function useThemeProvider() {
  const isDark = ref(false)

  // Initialize theme
  if (typeof window !== 'undefined') {
    const stored = getStoredTheme()
    if (stored !== null) {
      isDark.value = stored
    } else {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      isDark.value = mediaQuery.matches

      // Listen for system changes if no valid user preference
      const handler = (e: MediaQueryListEvent) => {
        if (getStoredTheme() === null) {
          isDark.value = e.matches
        }
      }
      mediaQuery.addEventListener('change', handler)
    }
  }

  // Watch effect to update DOM
  watchEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDark.value)
    }
  })

  const toggleDark = async (event?: MouseEvent) => {
    const nextValue = !isDark.value

    // Save preference *before* transition to ensure state is captured
    // even if animation fails or is interrupted, though logically it's part of the action.
    // However, purely for visual sync, we might want to do it inside/after.
    // But for reliability, let's treat the user intent as "save this".
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        value: nextValue,
        timestamp: Date.now()
      })
    )

    // 检查浏览器是否支持 View Transitions API
    if (!document.startViewTransition || !event) {
      // 不支持或没有事件对象，直接切换
      isDark.value = nextValue
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
      isDark.value = nextValue
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
