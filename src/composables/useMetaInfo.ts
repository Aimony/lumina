import { ref } from 'vue'

export interface MetaInfo {
  title: string
  description: string
  image?: string
  favicon?: string
  url: string
}

/**
 * 获取网站元信息的 Composable
 *
 * 策略：
 * 1. 优先使用第三方服务获取（避免 CORS 问题）
 * 2. 失败时返回基本的 URL 信息
 */
export function useMetaInfo(url: string) {
  const metadata = ref<MetaInfo | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  const fetchMetadata = async () => {
    loading.value = true
    error.value = null

    try {
      // 使用 microlink.io API 获取元信息
      // 这是一个免费的服务，支持获取网站的 Open Graph 数据
      const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`

      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error('Failed to fetch metadata')
      }

      const data = await response.json()

      if (data.status === 'success' && data.data) {
        const { title, description, image, logo } = data.data

        metadata.value = {
          title: title || extractDomain(url),
          description: description || '',
          image: image?.url,
          favicon: logo?.url,
          url
        }
      } else {
        // Fallback: 使用基本信息
        useFallbackMetadata()
      }
    } catch (err) {
      console.warn('Failed to fetch metadata for', url, err)
      // Fallback: 使用基本信息
      useFallbackMetadata()
    } finally {
      loading.value = false
    }
  }

  const useFallbackMetadata = () => {
    const domain = extractDomain(url)
    metadata.value = {
      title: domain,
      description: url,
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      url
    }
  }

  // 提取域名
  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace(/^www\./, '')
    } catch {
      return url
    }
  }

  // 立即获取元信息
  fetchMetadata()

  return {
    metadata,
    loading,
    error,
    refetch: fetchMetadata
  }
}
