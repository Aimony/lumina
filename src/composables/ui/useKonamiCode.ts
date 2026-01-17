import { onMounted, onUnmounted } from 'vue'

/**
 * Konami Code 秘籍序列：↑ ↑ ↓ ↓ ← → ← → B A
 */
const KONAMI_CODE: string[] = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA'
]

const TIMEOUT_MS = 3000 // 3秒超时重置

/**
 * 监听 Konami Code 键盘序列
 * @param callback 成功匹配序列后的回调函数
 */
export function useKonamiCode(callback: () => void) {
  let inputSequence: string[] = []
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const resetSequence = () => {
    inputSequence = []
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    // 忽略输入框中的按键
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return
    }

    // 重置超时计时器
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(resetSequence, TIMEOUT_MS)

    // 添加按键到序列
    inputSequence.push(event.code)

    // 只保留最近的按键（与 Konami Code 长度相同）
    if (inputSequence.length > KONAMI_CODE.length) {
      inputSequence.shift()
    }

    // 检查是否匹配
    if (inputSequence.length === KONAMI_CODE.length) {
      const isMatch = inputSequence.every((key, index) => key === KONAMI_CODE[index])
      if (isMatch) {
        console.log('🎮 Konami Code 激活！')
        resetSequence()
        callback()
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    resetSequence()
  })
}
