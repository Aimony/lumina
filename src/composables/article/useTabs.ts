import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

/**
 * 标签页交互逻辑
 * 处理标签页切换、滑块位置更新等功能
 */
export function useTabs() {
  const route = useRoute()
  const containerRef = ref<HTMLElement | null>(null)

  // 初始化标签页
  function initTabs(container?: HTMLElement) {
    const target = container || document.body
    const tabContainers = target.querySelectorAll('.tabs-container')

    tabContainers.forEach((tabContainer) => {
      const header = tabContainer.querySelector('.tabs-header')
      const indicator = tabContainer.querySelector('.tab-indicator') as HTMLElement
      const buttons = tabContainer.querySelectorAll('.tab-btn')
      const panels = tabContainer.querySelectorAll('.tab-panel')

      if (!header || !indicator || buttons.length === 0) return

      // 更新滑块位置
      function updateIndicator(activeBtn: HTMLElement) {
        indicator.style.left = `${activeBtn.offsetLeft}px`
        indicator.style.width = `${activeBtn.offsetWidth}px`
      }

      // 初始化滑块位置
      const activeBtn = header.querySelector('.tab-btn.active') as HTMLElement
      if (activeBtn) {
        updateIndicator(activeBtn)
      }

      // 添加点击事件
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const index = btn.getAttribute('data-tab-index')

          // 更新按钮状态
          buttons.forEach((b) => b.classList.remove('active'))
          btn.classList.add('active')

          // 更新内容面板
          panels.forEach((panel) => {
            if (panel.getAttribute('data-tab-index') === index) {
              panel.classList.add('active')
            } else {
              panel.classList.remove('active')
            }
          })

          // 更新滑块位置
          updateIndicator(btn as HTMLElement)
        })
      })
    })
  }

  // 页面切换时重新初始化
  watch(
    () => route.path,
    () => {
      // 延迟执行以确保 DOM 已更新
      setTimeout(() => {
        initTabs()
      }, 100)
    }
  )

  onMounted(() => {
    initTabs()
  })

  return {
    containerRef,
    initTabs
  }
}
