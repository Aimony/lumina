import { onMounted, onUnmounted, createApp, h } from 'vue'
import MermaidDiagram from '@/components/article/MermaidDiagram.vue'

/**
 * Mermaid 图表渲染 Composable
 *
 * 在组件挂载时查找所有 .mermaid-container 容器，
 * 并动态挂载 MermaidDiagram Vue 组件进行渲染。
 */
export function useMermaid() {
  const mountedApps: Array<{ unmount: () => void }> = []

  /**
   * 渲染所有 Mermaid 容器
   */
  function renderAllDiagrams() {
    const containers = document.querySelectorAll('.mermaid-container:not(.vue-mounted)')

    containers.forEach((container) => {
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
    })
  }

  onMounted(() => {
    // 初始渲染
    renderAllDiagrams()

    // 使用 MutationObserver 监听 DOM 变化（路由切换时）
    const observer = new MutationObserver(() => {
      renderAllDiagrams()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    // 保存 observer 以便清理
    ;(window as any).__mermaidObserver = observer
  })

  onUnmounted(() => {
    // 卸载所有挂载的应用
    mountedApps.forEach((app) => app.unmount())
    mountedApps.length = 0

    // 断开 observer
    const observer = (window as any).__mermaidObserver as MutationObserver | undefined
    observer?.disconnect()
  })

  return {
    renderAllDiagrams
  }
}
