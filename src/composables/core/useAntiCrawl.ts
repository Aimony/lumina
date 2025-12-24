import { onMounted, onUnmounted } from 'vue'

/**
 * 反爬虫/反调试保护 Composable
 * 提供基础的客户端保护措施
 */
export function useAntiCrawl(
  options: { disableRightClick?: boolean; detectDevTools?: boolean } = {}
) {
  const { disableRightClick = false, detectDevTools = false } = options

  // 禁用右键菜单
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault()
    return false
  }

  // 禁用常见快捷键 (F12, Ctrl+Shift+I, Ctrl+U)
  const handleKeyDown = (e: KeyboardEvent) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault()
      return false
    }
    // Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault()
      return false
    }
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault()
      return false
    }
  }

  // DevTools 检测（通过 debugger 语句耗时检测）
  let devToolsInterval: ReturnType<typeof setInterval> | null = null

  const detectDevToolsOpen = () => {
    const threshold = 160
    const start = performance.now()
    // eslint-disable-next-line no-debugger
    debugger
    const end = performance.now()
    if (end - start > threshold) {
      console.warn('🔒 开发者工具已打开')
      // 可以在这里添加其他响应逻辑
    }
  }

  onMounted(() => {
    if (disableRightClick) {
      document.addEventListener('contextmenu', handleContextMenu)
      document.addEventListener('keydown', handleKeyDown)
    }

    if (detectDevTools) {
      devToolsInterval = setInterval(detectDevToolsOpen, 1000)
    }
  })

  onUnmounted(() => {
    if (disableRightClick) {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
    }

    if (devToolsInterval) {
      clearInterval(devToolsInterval)
    }
  })
}
