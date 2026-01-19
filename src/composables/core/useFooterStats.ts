/**
 * Footer 统计数据 Composable
 *
 * 功能：
 * - 从 Umami API 获取网站统计数据
 * - 支持获取总访问量(PV)、总访客量(UV)
 * - 支持获取当前页面访问统计
 * - 自动缓存和定期刷新
 *
 * @example
 * const { stats, loading, error } = useFooterStats()
 */

import { ref, onMounted, onUnmounted } from 'vue'

// 统计数据接口
export interface FooterStats {
  /** 总访问量 (Pageviews) */
  totalPageviews: number
  /** 总访客量 (Unique Visitors) */
  totalVisitors: number
  /** 当前页访问量 */
  currentPageViews: number
}

// Umami API 响应接口（参考官方文档：https://umami.is/docs/api/website-stats）
interface UmamiStatsResponse {
  pageviews: number
  visitors: number
  visits: number
  bounces: number
  totaltime: number
}

// 配置
const DEFAULT_REFRESH_INTERVAL = 1 * 60 * 1000 // 1分钟
const CACHE_KEY = 'lumina_footer_stats'
const CACHE_EXPIRY = 1 * 60 * 1000 // 缓存1分钟

// 获取 Umami 配置
function getUmamiConfig() {
  return {
    websiteId: import.meta.env.VITE_UMAMI_WEBSITE_ID || '',
    scriptUrl: import.meta.env.VITE_UMAMI_SCRIPT_URL || '',
    username: import.meta.env.VITE_UMAMI_USERNAME || '',
    password: import.meta.env.VITE_UMAMI_PASSWORD || '',
    enabled: import.meta.env.VITE_UMAMI_ENABLED === 'true'
  }
}

// 从缓存读取数据
function getCachedStats(): FooterStats | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const { data, timestamp } = JSON.parse(cached)
    const now = Date.now()

    // 检查缓存是否过期
    if (now - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }

    return data
  } catch (error) {
    return null
  }
}

// 保存数据到缓存
function setCachedStats(stats: FooterStats) {
  // 不缓存全0的无效数据
  if (stats.totalPageviews === 0 && stats.totalVisitors === 0) {
    return
  }

  try {
    const cacheData = {
      data: stats,
      timestamp: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
  } catch (error) {
    // 静默失败
  }
}

// Token缓存
const TOKEN_CACHE_KEY = 'lumina_umami_token'
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // Token缓存24小时

// 从缓存获取Token
function getCachedToken(): string | null {
  try {
    const cached = localStorage.getItem(TOKEN_CACHE_KEY)
    if (!cached) return null

    const { token, timestamp } = JSON.parse(cached)
    const now = Date.now()

    // 检查Token是否过期
    if (now - timestamp > TOKEN_EXPIRY) {
      localStorage.removeItem(TOKEN_CACHE_KEY)
      return null
    }

    return token
  } catch (error) {
    console.warn('[FooterStats] 读取Token缓存失败:', error)
    return null
  }
}

// 保存Token到缓存
function setCachedToken(token: string) {
  try {
    const cacheData = {
      token,
      timestamp: Date.now()
    }
    localStorage.setItem(TOKEN_CACHE_KEY, JSON.stringify(cacheData))
  } catch (error) {
    console.warn('[FooterStats] 保存Token缓存失败:', error)
  }
}

// 登录获取Token
async function loginAndGetToken(
  apiBaseUrl: string,
  username: string,
  password: string
): Promise<string> {
  const loginUrl = `${apiBaseUrl}/api/auth/login`

  try {
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })

    if (!response.ok) {
      throw new Error(`登录失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const token = data.token

    if (!token) {
      throw new Error('登录响应中未包含token')
    }

    // 缓存Token
    setCachedToken(token)

    return token
  } catch (error) {
    console.error('[FooterStats] 登录失败:', error)
    throw error
  }
}

// 从 Umami API 获取统计数据
async function fetchStatsFromUmami(
  websiteId: string,
  apiBaseUrl: string,
  apiToken?: string
): Promise<FooterStats> {
  // Umami API 端点
  const statsUrl = `${apiBaseUrl}/api/websites/${websiteId}/stats`

  // 时间范围：过去30天到现在
  const endAt = Date.now()
  const startAt = endAt - 30 * 24 * 60 * 60 * 1000 // 30天前

  // 构建请求URL
  const url = `${statsUrl}?startAt=${startAt}&endAt=${endAt}`

  // 构建请求头
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }

  // 如果提供了 API Token,添加 Authorization header
  if (apiToken) {
    headers['Authorization'] = `Bearer ${apiToken}`
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers
    })

    if (!response.ok) {
      // 如果是401错误,提示需要配置API Token
      if (response.status === 401) {
        throw new Error(
          'Umami API 需要认证。请在环境变量中配置 VITE_UMAMI_API_TOKEN,或联系管理员获取 API Token。'
        )
      }
      throw new Error(`Umami API 请求失败: ${response.status} ${response.statusText}`)
    }

    const data: UmamiStatsResponse = await response.json()

    // 获取当前页面URL（不含域名）
    const currentPath = window.location.pathname

    // 获取当前页面统计（需要单独请求，使用path参数过滤）
    let currentPageViews = 0
    try {
      const pageStatsUrl = `${statsUrl}?startAt=${startAt}&endAt=${endAt}&path=${encodeURIComponent(
        currentPath
      )}`
      const pageResponse = await fetch(pageStatsUrl, { headers })
      if (pageResponse.ok) {
        const pageData: UmamiStatsResponse = await pageResponse.json()
        currentPageViews = pageData.pageviews || 0
      }
    } catch (error) {
      console.warn('[FooterStats] 获取当前页面统计失败:', error)
    }

    return {
      totalPageviews: data.pageviews || 0,
      totalVisitors: data.visitors || 0,
      currentPageViews
    }
  } catch (error) {
    console.error('[FooterStats] 获取统计数据失败:', error)
    throw error
  }
}

// 主 Composable
export function useFooterStats(refreshInterval: number = DEFAULT_REFRESH_INTERVAL) {
  const stats = ref<FooterStats>({
    totalPageviews: 0,
    totalVisitors: 0,
    currentPageViews: 0
  })
  const loading = ref(false)
  const error = ref<Error | null>(null)

  let refreshTimer: NodeJS.Timeout | null = null

  // 获取统计数据
  async function fetchStats() {
    const config = getUmamiConfig()

    // 检查是否启用
    if (!config.enabled || !config.websiteId || !config.scriptUrl) {
      return
    }

    // 检查是否配置了用户名和密码
    if (!config.username || !config.password) {
      console.warn(
        '[FooterStats] 未配置Umami用户名或密码。请在环境变量中设置 VITE_UMAMI_USERNAME 和 VITE_UMAMI_PASSWORD'
      )
      return
    }

    // 先尝试从缓存读取统计数据
    const cached = getCachedStats()
    if (cached) {
      stats.value = cached
      return
    }

    loading.value = true
    error.value = null

    try {
      // 从 scriptUrl 提取 API 基础地址
      // 例如: https://umami.v.linser.pics/script.js -> https://umami.v.linser.pics
      const apiBaseUrl = config.scriptUrl.replace(/\/script\.js$/, '')

      // 尝试从缓存获取Token
      let token = getCachedToken()

      // 如果没有缓存的Token,登录获取新Token
      if (!token) {
        token = await loginAndGetToken(apiBaseUrl, config.username, config.password)
      }

      // 使用Token获取统计数据
      const data = await fetchStatsFromUmami(config.websiteId, apiBaseUrl, token)
      stats.value = data
      setCachedStats(data)

      console.log('📊 [FooterStats] 数据获取成功:', data)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      console.error('[FooterStats] 获取统计数据失败:', err)

      // 如果是Token过期错误,清除缓存并在下次刷新时重新登录
      if (err instanceof Error && err.message.includes('Token已过期')) {
        localStorage.removeItem(TOKEN_CACHE_KEY)
      }
    } finally {
      loading.value = false
    }
  }

  // 启动定时刷新
  function startRefresh() {
    if (refreshTimer) {
      clearInterval(refreshTimer)
    }
    refreshTimer = setInterval(() => {
      fetchStats()
    }, refreshInterval)
  }

  // 停止定时刷新
  function stopRefresh() {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  // 组件挂载时初始化
  onMounted(() => {
    fetchStats()
    startRefresh()
  })

  // 组件卸载时清理
  onUnmounted(() => {
    stopRefresh()
  })

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  }
}
