import { onMounted, onUnmounted } from 'vue'

/**
 * 页面可见性切换交互
 * 当用户切换标签页时：
 * - Favicon 变为"休息中"图标（ZZZ 睡眠效果）
 * - 标题栏显示挽留文案
 */
export function usePageVisibility() {
  // 保存原始状态
  let originalTitle = ''
  let originalFavicon = ''

  // 休息中图标 - SVG 格式的 ZZZ 睡眠图标
  const sleepingFaviconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="6" fill="#6366f1"/>
      <text x="16" y="22" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white">Z</text>
      <text x="22" y="14" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="white" opacity="0.8">z</text>
      <text x="26" y="8" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="white" opacity="0.6">z</text>
    </svg>
  `.trim()

  // 挽留文案
  const awayTitle = '(つ ﹏ ⊂) 别走鸭～'

  // 将 SVG 转换为 Data URL
  const svgToDataUrl = (svg: string): string => {
    const encoded = encodeURIComponent(svg)
    return `data:image/svg+xml,${encoded}`
  }

  // 获取当前 favicon
  const getCurrentFavicon = (): string => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    return link?.href || '/favicon.ico'
  }

  // 设置 favicon
  const setFavicon = (href: string) => {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = href
  }

  // 处理可见性变化
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // 页面失去焦点 - 切换到休息状态
      originalTitle = document.title
      originalFavicon = getCurrentFavicon()

      document.title = awayTitle
      setFavicon(svgToDataUrl(sleepingFaviconSvg))
    } else {
      // 页面恢复焦点 - 恢复原始状态
      if (originalTitle) {
        document.title = originalTitle
      }
      if (originalFavicon) {
        setFavicon(originalFavicon)
      }
    }
  }

  onMounted(() => {
    // 记录初始状态
    originalTitle = document.title
    originalFavicon = getCurrentFavicon()

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)

    // 恢复原始状态
    if (originalTitle) {
      document.title = originalTitle
    }
    if (originalFavicon) {
      setFavicon(originalFavicon)
    }
  })
}
