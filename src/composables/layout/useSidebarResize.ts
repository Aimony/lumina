import { ref, computed } from 'vue'

// 常量
const DEFAULT_WIDTH = 272
const MIN_WIDTH = 180
const MAX_WIDTH = 400

/**
 * 侧边栏拖拽调整 Composable
 * 管理侧边栏宽度的拖拽调整功能
 */
export function useSidebarResize() {
  const sidebarWidth = ref(DEFAULT_WIDTH)
  const isResizing = ref(false)

  // 计算属性：侧边栏样式
  const sidebarStyle = computed(() => ({
    width: `${sidebarWidth.value}px`
  }))

  // 计算属性：内容区域样式（需要传入 sidebarOpen）
  const getContentStyle = (sidebarOpen: boolean) => ({
    paddingLeft: sidebarOpen ? `${sidebarWidth.value}px` : '0'
  })

  // 开始拖拽
  const startResize = (e: MouseEvent) => {
    isResizing.value = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    e.preventDefault()
  }

  // 拖拽中
  const doResize = (e: MouseEvent) => {
    if (!isResizing.value) return
    const newWidth = e.clientX
    sidebarWidth.value = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, newWidth))
  }

  // 结束拖拽
  const stopResize = () => {
    isResizing.value = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  // 设置全局事件监听
  const setupResizeListeners = () => {
    document.addEventListener('mousemove', doResize)
    document.addEventListener('mouseup', stopResize)
  }

  // 清理事件监听
  const cleanupResizeListeners = () => {
    document.removeEventListener('mousemove', doResize)
    document.removeEventListener('mouseup', stopResize)
  }

  return {
    sidebarWidth,
    isResizing,
    sidebarStyle,
    getContentStyle,
    startResize,
    setupResizeListeners,
    cleanupResizeListeners
  }
}
