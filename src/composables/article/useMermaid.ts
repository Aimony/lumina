import { onMounted, onUnmounted } from 'vue'
import mermaid from 'mermaid'

/**
 * Mermaid 图表渲染 Composable
 *
 * 在组件挂载时初始化 Mermaid 并渲染所有图表容器，
 * 同时监听主题变化以切换 Mermaid 主题。
 */
export function useMermaid() {
  let isInitialized = false
  let renderCounter = 0

  /**
   * 获取当前主题（亮/暗）
   */
  function isDarkMode(): boolean {
    return document.documentElement.classList.contains('dark')
  }

  /**
   * 初始化 Mermaid 配置
   */
  function initMermaid() {
    mermaid.initialize({
      startOnLoad: false,
      theme: isDarkMode() ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      sequence: {
        useMaxWidth: true,
        showSequenceNumbers: false,
        wrap: true
      }
    })
    isInitialized = true
  }

  /**
   * 渲染所有 Mermaid 容器
   */
  async function renderAllDiagrams() {
    const containers = document.querySelectorAll('.mermaid-container')

    for (const container of containers) {
      const sourceEl = container.querySelector('.mermaid-source')
      const diagramEl = container.querySelector('.mermaid-diagram')

      if (!sourceEl || !diagramEl) continue

      const code = sourceEl.textContent || ''
      if (!code.trim()) continue

      try {
        // 为每个图表生成唯一 ID
        const id = `mermaid-${Date.now()}-${renderCounter++}`
        const { svg } = await mermaid.render(id, code)
        diagramEl.innerHTML = svg
        container.classList.add('rendered')
        container.classList.remove('error')
      } catch (error) {
        console.error('Mermaid 渲染错误:', error)
        container.classList.add('error')
        diagramEl.innerHTML = `<div class="mermaid-error">图表渲染失败：${error instanceof Error ? error.message : '未知错误'}</div>`
      }
    }
  }

  /**
   * 主题变化时重新渲染
   */
  function handleThemeChange() {
    if (isInitialized) {
      initMermaid() // 重新初始化以应用新主题
      renderAllDiagrams()
    }
  }

  // 设置 MutationObserver 监听主题变化
  let observer: MutationObserver | null = null

  onMounted(() => {
    initMermaid()
    renderAllDiagrams()

    // 监听 documentElement 的 class 变化（主题切换）
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          handleThemeChange()
          break
        }
      }
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return {
    renderAllDiagrams,
    initMermaid
  }
}
