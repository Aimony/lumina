import { onMounted, onUnmounted, createApp, h } from 'vue'
import MermaidDiagram from '@/components/article/MermaidDiagram.vue'

/**
 * Mermaid 图表渲染 Composable
 *
 * 使用 Intersection Observer 实现按需渲染：
 * 只有当 .mermaid-container 进入视口时，才动态挂载 MermaidDiagram Vue 组件。
 * 这可以显著减少首屏渲染开销，尤其在包含多个图表的长文档中。
 */
export function useMermaid() {
  const mountedApps: Array<{ unmount: () => void }> = []
  let intersectionObserver: IntersectionObserver | null = null
  let mutationObserver: MutationObserver | null = null

  /**
   * 渲染单个 Mermaid 容器
   */
  function renderDiagram(container: Element) {
    // 防止重复渲染
    if (container.classList.contains('vue-mounted')) return

    const sourceEl = container.querySelector('.mermaid-source')
    if (!sourceEl) return

    const code = sourceEl.textContent || ''
    if (!code.trim()) return

    // 标记为已挂载
    container.classList.add('vue-mounted')

    // 清空容器
    container.innerHTML = ''

    // 创建并挂载 Vue 应用
    const app = createApp({
      render() {
        return h(MermaidDiagram, { code: code.trim() })
      }
    })

    app.mount(container)
    mountedApps.push(app)
  }

  /**
   * Intersection Observer 回调
   * 当容器进入视口时触发渲染
   */
  function handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        renderDiagram(entry.target)
        // 渲染后停止观察该元素
        intersectionObserver?.unobserve(entry.target)
      }
    })
  }

  /**
   * 为所有未挂载的容器添加观察
   */
  function observeAllContainers() {
    if (!intersectionObserver) return

    const containers = document.querySelectorAll('.mermaid-container:not(.vue-mounted)')
    containers.forEach((container) => {
      intersectionObserver!.observe(container)
    })
  }

  onMounted(() => {
    // 创建 Intersection Observer
    // rootMargin: 提前 200px 开始加载，让图表在进入视口前就开始渲染
    intersectionObserver = new IntersectionObserver(handleIntersection, {
      root: null, // 视口
      rootMargin: '200px 0px', // 提前 200px 触发
      threshold: 0 // 只要有一点点进入就触发
    })

    // 初始观察
    observeAllContainers()

    // 使用 MutationObserver 监听 DOM 变化（路由切换时添加新容器）
    mutationObserver = new MutationObserver(() => {
      observeAllContainers()
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    })
  })

  onUnmounted(() => {
    // 卸载所有挂载的应用
    mountedApps.forEach((app) => app.unmount())
    mountedApps.length = 0

    // 断开 observers
    intersectionObserver?.disconnect()
    mutationObserver?.disconnect()
  })

  return {
    observeAllContainers
  }
}
