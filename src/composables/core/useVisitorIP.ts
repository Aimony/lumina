/**
 * 访客 IP 信息组合函数
 * 获取访客的 IP 地址、地理位置和运营商信息
 */

import { ref, onMounted, onUnmounted } from 'vue'

export interface VisitorIPInfo {
  /** IP 地址 */
  ip: string
  /** 国家代码 (ISO 3166-1 alpha-2) */
  countryCode: string
  /** 国家名称 */
  country: string
  /** 城市名称 */
  city: string
  /** 地区/省份 */
  region: string
  /** 运营商/ISP */
  isp: string
  /** ASN */
  asn: string
  /** 组织名称 */
  org: string
}

// 国家代码到旗帜 emoji 的转换
function countryCodeToFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌐'
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// 默认空数据
const defaultIPInfo: VisitorIPInfo = {
  ip: '',
  countryCode: '',
  country: '',
  city: '',
  region: '',
  isp: '',
  asn: '',
  org: ''
}

/**
 * 使用访客 IP 信息
 * @param refreshInterval 刷新间隔（毫秒），默认 5 分钟
 */
export function useVisitorIP(refreshInterval = 5 * 60 * 1000) {
  const ipInfo = ref<VisitorIPInfo>({ ...defaultIPInfo })
  const loading = ref(true)
  const error = ref<string | null>(null)

  let intervalId: ReturnType<typeof setInterval> | null = null

  /**
   * 获取 IP 信息
   * 使用 ip-api.com 免费 API（无需 API key，支持 CORS）
   */
  async function fetchIPInfo(): Promise<void> {
    try {
      loading.value = true
      error.value = null

      // ip-api.com 免费 API，返回完整的 IP 信息
      // 使用 http 因为免费版不支持 https（付费版支持）
      // 可以改用其他支持 https 的 API
      const response = await fetch('https://ipapi.co/json/')

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.reason || 'Failed to get IP info')
      }

      ipInfo.value = {
        ip: data.ip || '',
        countryCode: data.country_code || data.country || '',
        country: data.country_name || '',
        city: data.city || '',
        region: data.region || '',
        isp: data.org || '',
        asn: data.asn || '',
        org: data.org || ''
      }

      console.log('🌍 [VisitorIP] IP 信息获取成功:', ipInfo.value)
    } catch (err) {
      console.error('🌍 [VisitorIP] IP 信息获取失败:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  // 格式化显示信息
  function getFormattedLocation(): string {
    const { countryCode, city } = ipInfo.value
    if (!countryCode) return '获取中...'
    const flag = countryCodeToFlag(countryCode)
    return `${flag} ${countryCode}${city ? ' · ' + city : ''}`
  }

  function getFormattedIP(): string {
    return ipInfo.value.ip || '...'
  }

  function getFormattedISP(): string {
    const { asn, org } = ipInfo.value
    if (!asn && !org) return '...'
    return `${asn || ''} ${org || ''}`.trim()
  }

  onMounted(() => {
    // 立即获取一次
    fetchIPInfo()

    // 设置定时刷新
    if (refreshInterval > 0) {
      intervalId = setInterval(fetchIPInfo, refreshInterval)
    }
  })

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  })

  return {
    ipInfo,
    loading,
    error,
    refresh: fetchIPInfo,
    getFormattedLocation,
    getFormattedIP,
    getFormattedISP,
    countryCodeToFlag
  }
}
