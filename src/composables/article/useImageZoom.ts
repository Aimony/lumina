import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 图片放大查看 Composable
 *
 * 功能：
 * - 监听文章图片的点击事件
 * - 管理图片查看器的显示状态
 * - 处理 ESC 键关闭功能
 */
export function useImageZoom() {
  const currentImage = ref<string | null>(null)

  // 显示图片
  const show = (imageUrl: string) => {
    currentImage.value = imageUrl
    // 防止背景滚动
    document.body.style.overflow = 'hidden'
  }

  // 隐藏图片
  const hide = () => {
    currentImage.value = null
    // 恢复滚动
    document.body.style.overflow = ''
  }

  // 处理图片点击事件
  const handleImageClick = (e: Event) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'IMG' && target.closest('.markdown-body')) {
      const img = target as HTMLImageElement
      // 排除已经在链接卡片中的图片和标记为不缩放的图片
      if (!img.closest('.link-card') && !img.hasAttribute('data-no-zoom')) {
        show(img.src)
      }
    }
  }

  // 处理键盘事件
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && currentImage.value) {
      hide()
    }
  }

  onMounted(() => {
    // 使用事件委托监听所有图片点击
    document.addEventListener('click', handleImageClick)
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleImageClick)
    document.removeEventListener('keydown', handleKeydown)
    // 清理样式
    document.body.style.overflow = ''
  })

  return {
    currentImage,
    show,
    hide
  }
}
