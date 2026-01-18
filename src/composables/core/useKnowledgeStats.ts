import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export interface KnowledgeStats {
  /** 文档总数 */
  totalDocuments: number
  /** 分类数量 */
  totalCategories: number
  /** 标签总数 */
  totalTags: number
  /** 链接总数 (引用关系) */
  totalLinks: number
  /** 字数统计 (估算) */
  estimatedWordCount: number
  /** 本周更新数 */
  recentUpdates: number
}

/**
 * 获取知识库统计数据的 composable
 */
export function useKnowledgeStats() {
  const router = useRouter()
  const stats = ref<KnowledgeStats>({
    totalDocuments: 0,
    totalCategories: 0,
    totalTags: 0,
    totalLinks: 0,
    estimatedWordCount: 0,
    recentUpdates: 0
  })
  const loading = ref(true)

  const computeStats = async () => {
    loading.value = true

    try {
      const routes = router.getRoutes()
      const docsRoutes = routes.filter(
        (route) =>
          route.path.startsWith('/') && route.meta && !route.path.includes(':') && route.components
      )

      // 文档统计
      const docPaths = docsRoutes.filter((r) => !r.path.endsWith('/'))
      stats.value.totalDocuments = docPaths.length

      // 分类统计 (基于路径层级)
      const categories = new Set<string>()
      docPaths.forEach((route) => {
        const parts = route.path.split('/').filter(Boolean)
        if (parts.length > 1 && parts[0]) {
          categories.add(parts[0])
        }
      })
      stats.value.totalCategories = categories.size

      // 标签统计
      const tagSet = new Set<string>()
      docsRoutes.forEach((route) => {
        const tags = route.meta.tags as string[] | undefined
        if (Array.isArray(tags)) {
          tags.forEach((tag) => tagSet.add(tag))
        }
      })
      stats.value.totalTags = tagSet.size

      // 尝试从 graph-data.json 获取链接数量
      try {
        const baseUrl = import.meta.env.BASE_URL || '/'
        const response = await fetch(`${baseUrl}graph-data.json`)
        if (response.ok) {
          const graphData = await response.json()
          stats.value.totalLinks = graphData.links?.length || 0
        }
      } catch {
        stats.value.totalLinks = 0
      }

      // 估算字数 (假设每篇文档平均 1000 字)
      stats.value.estimatedWordCount = stats.value.totalDocuments * 1000

      // 最近更新 (暂时模拟)
      stats.value.recentUpdates = Math.min(stats.value.totalDocuments, 5)
    } catch (error) {
      console.error('Failed to compute knowledge stats:', error)
    } finally {
      loading.value = false
    }
  }

  onMounted(computeStats)

  const formattedWordCount = computed(() => {
    const count = stats.value.estimatedWordCount
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万`
    }
    return count.toString()
  })

  return {
    stats,
    loading,
    formattedWordCount,
    refresh: computeStats
  }
}
