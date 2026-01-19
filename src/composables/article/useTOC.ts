import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'

export interface Heading {
  id: string
  text: string
  level: number
}

export function useTOC() {
  const headings = ref<Heading[]>([])
  const route = useRoute()
  let observer: MutationObserver | null = null

  const extractHeadings = () => {
    const container = document.querySelector('.markdown-body')
    if (!container) {
      headings.value = []
      return
    }

    const selector = 'h2, h3'
    const elements = container.querySelectorAll(selector)

    headings.value = Array.from(elements).map((el) => {
      const id = el.id || el.textContent?.toLowerCase().replace(/\s+/g, '-') || ''
      // Ensure element has an ID for linking
      if (!el.id) {
        el.id = id
      }
      // 获取标题文本，排除锚点链接的 # 符号
      const clone = el.cloneNode(true) as HTMLElement
      const anchor = clone.querySelector('.header-anchor')
      if (anchor) {
        anchor.remove()
      }
      const text = clone.textContent?.trim() || ''
      return {
        id,
        text,
        level: el.tagName === 'H2' ? 2 : 3
      }
    })
  }

  const setupObserver = () => {
    // 先清理旧的 observer
    if (observer) {
      observer.disconnect()
    }

    // 使用 MutationObserver 监听 .markdown-body 的 DOM 变化
    const observeTarget = () => {
      const container = document.querySelector('.markdown-body')
      if (container) {
        observer = new MutationObserver(() => {
          // 当 DOM 变化时重新提取标题
          extractHeadings()
        })
        observer.observe(container, {
          childList: true,
          subtree: true
        })
        // 立即提取一次
        extractHeadings()
      } else {
        // 如果容器还不存在，等待下一帧再试
        requestAnimationFrame(observeTarget)
      }
    }

    observeTarget()
  }

  onMounted(() => {
    setupObserver()

    // 处理 URL hash，页面加载时自动滚动到对应标题
    const hash = window.location.hash
    if (hash) {
      const targetId = hash.slice(1) // 去掉 # 号
      // 延迟执行以确保 DOM 已完全渲染
      setTimeout(() => {
        const el = document.getElementById(targetId)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  // 路由变化时，清空 headings 并重新设置 observer
  watch(
    () => route.path,
    () => {
      headings.value = []
      nextTick(() => {
        setupObserver()
      })
    }
  )

  return {
    headings
  }
}
