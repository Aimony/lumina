import { ref } from 'vue'
import { useRouter } from 'vue-router'

export interface TagInfo {
  name: string
  count: number
}

/**
 * 获取所有文章的标签统计信息
 */
export function useTags() {
  const router = useRouter()
  const tags = ref<TagInfo[]>([])

  const getAllTags = () => {
    const routes = router.getRoutes()
    const tagMap = new Map<string, number>()

    routes.forEach((route) => {
      const routeTags = route.meta.tags as string[] | undefined
      if (Array.isArray(routeTags)) {
        routeTags.forEach((tag) => {
          if (tag) {
            tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
          }
        })
      }
    })

    const sortedTags = Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    tags.value = sortedTags
    return sortedTags
  }

  // 初始化时获取一次
  getAllTags()

  return {
    tags,
    getAllTags
  }
}
