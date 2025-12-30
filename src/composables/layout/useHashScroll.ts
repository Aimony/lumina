import { watch } from 'vue'
import { useRoute } from 'vue-router'

// 常量
const NAV_HEIGHT = 80
const MAX_POLL_ATTEMPTS = 50 // 最多等待 5 秒
const POLL_INTERVAL = 100 // 轮询间隔（毫秒）
const INITIAL_DELAY = 200 // 初始延迟（毫秒）

/**
 * URL Hash 滚动 Composable
 * 处理 URL 锚点定位，解决新标签打开时锚点不生效的问题
 */
export function useHashScroll() {
  const route = useRoute()

  // 滚动到锚点
  const scrollToHashOnLoad = () => {
    const hash = route.hash
    if (!hash) return

    // 获取原始 hash（不包含 #）
    const rawHash = hash.startsWith('#') ? hash.slice(1) : hash

    // 准备多种可能的 ID 形式
    // markdown-it-anchor 生成的 ID 是 URL 编码的，但浏览器可能已经解码了 hash
    const possibleIds = [
      rawHash, // 原始形式（可能是编码的）
      decodeURIComponent(rawHash), // 解码形式
      encodeURIComponent(decodeURIComponent(rawHash)) // 重新编码形式
    ]

    // 去重
    const uniqueIds = [...new Set(possibleIds)]

    const scrollToTarget = (): boolean => {
      for (const id of uniqueIds) {
        const targetElement = document.getElementById(id)
        if (targetElement) {
          requestAnimationFrame(() => {
            const elementTop =
              targetElement.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT
            window.scrollTo({ top: elementTop, behavior: 'smooth' })
          })
          return true
        }
      }
      return false
    }

    // 尝试立即滚动
    if (scrollToTarget()) return

    // 如果元素不存在，使用轮询等待 DOM 渲染完成
    let attempts = 0

    const pollForElement = () => {
      attempts++
      if (scrollToTarget()) return
      if (attempts < MAX_POLL_ATTEMPTS) {
        setTimeout(pollForElement, POLL_INTERVAL)
      }
    }

    // 延迟开始轮询
    setTimeout(pollForElement, INITIAL_DELAY)
  }

  // 设置监听
  const setupHashScrollWatchers = () => {
    // 监听 hash 变化（用于页面内锚点跳转）
    watch(
      () => route.hash,
      (newHash, oldHash) => {
        if (newHash && oldHash !== undefined) {
          setTimeout(scrollToHashOnLoad, 100)
        }
      }
    )
  }

  // 初始化
  const initHashScroll = () => {
    setTimeout(scrollToHashOnLoad, 300)
  }

  return {
    scrollToHashOnLoad,
    setupHashScrollWatchers,
    initHashScroll
  }
}
