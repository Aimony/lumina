/**
 * Umami 分析追踪 Composable
 *
 * 功能：
 * - 动态注入 Umami 脚本
 * - 页面浏览追踪（SPA 路由变化）
 * - 自定义事件追踪
 *
 * @example
 * // 在 main.ts 中初始化
 * import { initAnalytics } from './composables/core/useAnalytics'
 * initAnalytics()
 *
 * @example
 * // 在组件中追踪事件
 * import { trackEvent } from '@/composables/core/useAnalytics'
 * trackEvent('button_click', { button_id: 'submit' })
 */

// Umami 全局对象类型
interface UmamiTracker {
  track: {
    // 追踪自定义事件
    (eventName: string, eventData?: Record<string, unknown>): void
    // 追踪页面浏览（传入属性修改函数）
    (props: (defaultProps: { url: string }) => { url: string }): void
  }
}

declare global {
  interface Window {
    umami?: UmamiTracker
  }
}

// 配置接口
interface AnalyticsConfig {
  websiteId: string
  scriptUrl: string
  enabled: boolean
}

// 获取配置
function getConfig(): AnalyticsConfig {
  return {
    websiteId: import.meta.env.VITE_UMAMI_WEBSITE_ID || '',
    scriptUrl: import.meta.env.VITE_UMAMI_SCRIPT_URL || '',
    enabled: import.meta.env.VITE_UMAMI_ENABLED === 'true'
  }
}

// 是否已初始化
let initialized = false

/**
 * 初始化 Umami 分析脚本
 * 应在应用入口（main.ts）调用一次
 */
export function initAnalytics(): void {
  const config = getConfig()

  // 检查是否启用
  if (!config.enabled) {
    console.debug('[Analytics] Umami 已禁用')
    return
  }

  // 检查配置完整性
  if (!config.websiteId || !config.scriptUrl) {
    console.warn('[Analytics] Umami 配置不完整，请检查环境变量')
    return
  }

  // 防止重复初始化
  if (initialized) {
    console.debug('[Analytics] Umami 已初始化，跳过')
    return
  }

  // 创建并注入脚本
  const script = document.createElement('script')
  script.defer = true
  script.src = config.scriptUrl
  script.setAttribute('data-website-id', config.websiteId)

  // Umami 默认会自动追踪首次页面加载，而 router.afterEach 也会触发一次追踪，导致重复记录
  // 禁用自动追踪，完全由 router.afterEach 手动控制，避免重复记录
  script.setAttribute('data-auto-track', 'false')

  document.head.appendChild(script)
  initialized = true

  console.debug('[Analytics] Umami 初始化完成', {
    websiteId: config.websiteId.substring(0, 8) + '...'
  })
}

/**
 * 手动追踪页面浏览
 * @param url - 页面 URL（完整路径，如 /docs/guide）
 */
export function trackPageview(url?: string): void {
  const config = getConfig()
  if (!config.enabled) return

  // Umami 会自动捕获当前 URL，但对于 SPA 需要手动触发
  if (window.umami) {
    // Umami v2 使用 track() 方法
    window.umami.track((props) => ({
      ...props,
      url: url || window.location.pathname
    }))
  }
}

/**
 * 追踪自定义事件
 * @param eventName - 事件名称（如 'button_click', 'form_submit'）
 * @param eventData - 可选的事件数据
 *
 * @example
 * trackEvent('download', { file: 'guide.pdf' })
 * trackEvent('search', { query: 'vue3', results: 10 })
 */
export function trackEvent(eventName: string, eventData?: Record<string, unknown>): void {
  const config = getConfig()
  if (!config.enabled) return

  if (window.umami) {
    window.umami.track(eventName, eventData)
  }
}

/**
 * Composable hook（可选使用方式）
 */
export function useAnalytics() {
  return {
    init: initAnalytics,
    trackPageview,
    trackEvent
  }
}
