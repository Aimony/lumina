import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export interface ArticleItem {
  path: string
  title: string
  date: Date | null
  tags: string[]
}

export interface MonthGroup {
  month: number
  monthName: string
  articles: ArticleItem[]
}

export interface YearGroup {
  year: number
  months: MonthGroup[]
  totalCount: number
}

/**
 * 获取所有文章的归档数据（按年月分组）
 */
export function useArchiveData() {
  const router = useRouter()
  const isLoading = ref(true)

  // 月份名称映射
  const monthNames = [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月'
  ]

  // 排除的页面路由前缀
  const excludePaths = ['/tags', '/archives', '/timeline', '/games', '/404', '/:all', '/cosmos']

  // 获取所有文章
  const allArticles = computed<ArticleItem[]>(() => {
    const routes = router.getRoutes()
    return (
      routes
        .filter((r) => {
          if (!r.meta?.title) return false
          if (excludePaths.some((prefix) => r.path.startsWith(prefix) || r.path === prefix))
            return false
          if (r.path === '/') return false
          return true
        })
        .map((r) => {
          const dateStr = r.meta.date as string | undefined
          let parsedDate: Date | null = null

          if (dateStr) {
            try {
              parsedDate = new Date(dateStr)
              // 验证日期是否有效
              if (isNaN(parsedDate.getTime())) {
                parsedDate = null
              }
            } catch {
              parsedDate = null
            }
          }

          return {
            path: r.path,
            title: (r.meta.title as string) || 'Untitled',
            date: parsedDate,
            tags: (r.meta.tags as string[]) || []
          }
        })
        // 按日期降序排序（最新在前），没有日期的排在最后
        .sort((a, b) => {
          if (!a.date && !b.date) return 0
          if (!a.date) return 1
          if (!b.date) return -1
          return b.date.getTime() - a.date.getTime()
        })
    )
  })

  // 按年月分组的归档数据
  const archiveGroups = computed<YearGroup[]>(() => {
    const yearMap = new Map<number, Map<number, ArticleItem[]>>()

    // 没有日期的文章单独归类到 "未分类" 年份 (使用 0 表示)
    for (const article of allArticles.value) {
      const year = article.date ? article.date.getFullYear() : 0
      const month = article.date ? article.date.getMonth() : 0

      if (!yearMap.has(year)) {
        yearMap.set(year, new Map())
      }
      const monthMap = yearMap.get(year)!
      if (!monthMap.has(month)) {
        monthMap.set(month, [])
      }
      monthMap.get(month)!.push(article)
    }

    // 转换为数组格式并排序
    const result: YearGroup[] = []

    // 按年份降序排序
    const sortedYears = Array.from(yearMap.keys()).sort((a, b) => b - a)

    for (const year of sortedYears) {
      const monthMap = yearMap.get(year)!
      const months: MonthGroup[] = []

      // 按月份降序排序
      const sortedMonths = Array.from(monthMap.keys()).sort((a, b) => b - a)

      for (const month of sortedMonths) {
        months.push({
          month,
          monthName: year === 0 ? '未分类' : monthNames[month],
          articles: monthMap.get(month)!
        })
      }

      result.push({
        year,
        months,
        totalCount: months.reduce((sum, m) => sum + m.articles.length, 0)
      })
    }

    return result
  })

  // 获取最近 N 篇文章
  const getRecentArticles = (count: number = 6): ArticleItem[] => {
    return allArticles.value.slice(0, count)
  }

  // 统计信息
  const stats = computed(() => ({
    totalArticles: allArticles.value.length,
    yearsCount: archiveGroups.value.filter((y) => y.year !== 0).length,
    articlesWithDate: allArticles.value.filter((a) => a.date !== null).length,
    articlesWithoutDate: allArticles.value.filter((a) => a.date === null).length
  }))

  // 模拟加载完成
  setTimeout(() => {
    isLoading.value = false
  }, 0)

  return {
    allArticles,
    archiveGroups,
    getRecentArticles,
    stats,
    isLoading
  }
}
