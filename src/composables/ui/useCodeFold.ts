import { onMounted, onUnmounted } from 'vue'

export function useCodeFold() {
  const handleFold = (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('.mac-icon-red')
    if (!target) return

    const wrapper = target.closest('.code-block-wrapper') as HTMLElement
    if (!wrapper) return

    const content = wrapper.querySelector('.code-block-content') as HTMLElement
    if (!content) return

    const isCollapsing = !wrapper.classList.contains('collapsed')

    if (isCollapsing) {
      // 折叠：从当前高度过渡到 0
      const currentHeight = content.offsetHeight

      // 清除拖拽设置的高度
      content.style.height = ''
      delete content.dataset.originalHeight

      // 禁用过渡，设置起始高度
      content.style.transition = 'none'
      content.style.maxHeight = `${currentHeight}px`

      // 强制重绘
      content.offsetHeight

      // 恢复过渡并触发折叠动画
      content.style.transition = ''
      wrapper.classList.add('collapsed')
      content.style.maxHeight = '0'
    } else {
      // 展开：从 0 过渡到大值
      wrapper.classList.remove('collapsed')

      // 确保从 0 开始
      content.style.transition = 'none'
      content.style.maxHeight = '0'

      // 强制重绘
      content.offsetHeight

      // 恢复过渡并展开到大值
      content.style.transition = ''
      content.style.maxHeight = '999px'
    }
  }

  onMounted(() => {
    window.addEventListener('click', handleFold)
  })

  onUnmounted(() => {
    window.removeEventListener('click', handleFold)
  })
}
