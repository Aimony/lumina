import { onMounted, onUpdated, nextTick } from 'vue'
import { createApp, h } from 'vue'
import LinkCard from '@/components/common/LinkCard.vue'

/**
 * Composable 用于在 Markdown 内容中检测独占一行的链接并渲染为卡片
 */
export function useLinkCards() {
  const processLinkCards = async () => {
    await nextTick()

    // 查找所有带有 link-card-wrapper 类的段落
    const wrappers = document.querySelectorAll('.markdown-body p.link-card-wrapper')

    wrappers.forEach((wrapper) => {
      // 检查是否已经处理过
      if (wrapper.getAttribute('data-processed') === 'true') {
        return
      }

      // 查找链接元素
      const link = wrapper.querySelector('a[data-link-card="true"]')
      if (!link) return

      const url = link.getAttribute('data-url') || link.getAttribute('href') || ''
      const text = link.getAttribute('data-text') || link.textContent || ''

      if (!url) return

      // 创建 Vue 应用实例来渲染 LinkCard 组件
      const container = document.createElement('div')
      const app = createApp({
        render() {
          return h(LinkCard, { url, text })
        }
      })

      app.mount(container)

      // 替换原有的段落内容
      wrapper.innerHTML = ''
      wrapper.appendChild(container.firstElementChild!)
      wrapper.setAttribute('data-processed', 'true')
    })
  }

  onMounted(() => {
    processLinkCards()
  })

  onUpdated(() => {
    processLinkCards()
  })

  return {
    processLinkCards
  }
}
