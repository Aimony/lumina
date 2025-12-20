import { ref, watchEffect, provide, inject, type InjectionKey, type Ref } from 'vue'

const IS_DARK_KEY = Symbol('IS_DARK') as InjectionKey<Ref<boolean>>
const TOGGLE_DARK_KEY = Symbol('TOGGLE_DARK') as InjectionKey<() => void>

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

  const toggleDark = () => {
    isDark.value = !isDark.value
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
