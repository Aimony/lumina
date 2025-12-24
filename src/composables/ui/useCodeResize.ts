import { onMounted, onUnmounted } from 'vue'

/**
 * 代码块高度拖拽调整功能
 * 通过拖拽代码块底部的手柄来调整代码块的高度
 */
export function useCodeResize() {
  let isResizing = false
  let currentWrapper: HTMLElement | null = null
  let currentContent: HTMLElement | null = null
  let startY = 0
  let startHeight = 0
  let originalHeight = 0 // 原始最大高度

  const handleMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    // 检查是否点击了手柄或手柄内的元素
    const handle = target.closest('.code-resize-handle') as HTMLElement
    if (!handle) return

    const wrapper = handle.closest('.code-block-wrapper') as HTMLElement
    if (!wrapper) return

    // 如果代码块已折叠，不允许拖拽
    if (wrapper.classList.contains('collapsed')) return

    const content = wrapper.querySelector('.code-block-content') as HTMLElement
    if (!content) return

    isResizing = true
    currentWrapper = wrapper
    currentContent = content
    startY = e.clientY
    startHeight = content.offsetHeight

    // 如果没有设置过高度，保存原始高度作为最大值
    if (!content.dataset.originalHeight) {
      content.dataset.originalHeight = String(content.offsetHeight)
    }
    originalHeight = parseInt(content.dataset.originalHeight, 10)

    // 添加拖拽时的样式
    wrapper.classList.add('resizing')
    document.body.style.cursor = 'ns-resize'
    document.body.style.userSelect = 'none'

    e.preventDefault()
    e.stopPropagation()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !currentWrapper || !currentContent) return

    const deltaY = e.clientY - startY
    // 最小高度 50px，最大高度为原始高度
    const newHeight = Math.min(originalHeight, Math.max(50, startHeight + deltaY))

    // 直接设置样式，无需 requestAnimationFrame（已移除过渡动画）
    currentContent.style.height = `${newHeight}px`
  }

  const handleMouseUp = () => {
    if (!isResizing) return

    if (currentWrapper) {
      currentWrapper.classList.remove('resizing')
    }

    isResizing = false
    currentWrapper = null
    currentContent = null
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  onMounted(() => {
    document.addEventListener('mousedown', handleMouseDown, true)
    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseup', handleMouseUp)
  })

  onUnmounted(() => {
    document.removeEventListener('mousedown', handleMouseDown, true)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  })
}
