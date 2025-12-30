import { defineStore } from 'pinia'
import { ref } from 'vue'
import FlexSearch from 'flexsearch'

export interface SearchResult {
  id: string
  title: string
  content: string
  tags: string[]
  [key: string]: any
}

// FlexSearch 索引实例
const index = new FlexSearch.Document({
  document: {
    id: 'id',
    index: ['title', 'content', 'tags'],
    store: true
  },
  tokenize: 'forward',
  context: {
    depth: 1,
    bidirectional: true,
    resolution: 9
  }
})

// 全局缓存文档数据
let docsCache: Record<string, SearchResult> = {}

export const useSearchStore = defineStore('search', () => {
  const isLoaded = ref(false)
  const isModalOpen = ref(false)
  const query = ref('')
  const results = ref<SearchResult[]>([])
  const loading = ref(false)

  // 加载搜索索引
  const loadIndex = async () => {
    if (isLoaded.value) return

    try {
      const res = await fetch('/search-index.json')
      const data: SearchResult[] = await res.json()

      data.forEach((item) => {
        index.add(item)
        docsCache[item.id] = item
      })
      isLoaded.value = true
    } catch (e) {
      console.error('Failed to load search index:', e)
    }
  }

  const initSearch = async () => {
    if (isLoaded.value) return

    loading.value = true
    await loadIndex()
    loading.value = false
  }

  const openModal = () => {
    isModalOpen.value = true
    initSearch()
  }

  const closeModal = () => {
    isModalOpen.value = false
    query.value = ''
    results.value = []
  }

  const performSearch = (q: string) => {
    query.value = q
    if (!q.trim()) {
      results.value = []
      return
    }

    if (!isLoaded.value) {
      initSearch().then(() => performSearch(q))
      return
    }

    // 执行搜索
    const searchResult = index.search(q, {
      limit: 20,
      enrich: true
    })

    const uniqueIds = new Set<string>()
    const flattenedResults: SearchResult[] = []

    searchResult.forEach((fieldResult: any) => {
      fieldResult.result.forEach((item: any) => {
        if (!uniqueIds.has(item.id)) {
          uniqueIds.add(item.id)
          flattenedResults.push(item.doc)
        }
      })
    })

    results.value = flattenedResults
  }

  return {
    isLoaded,
    isModalOpen,
    query,
    results,
    loading,
    initSearch,
    openModal,
    closeModal,
    performSearch
  }
})

/**
 * 获取所有缓存的文章
 */
export async function getAllArticles(): Promise<SearchResult[]> {
  const store = useSearchStore()
  if (!store.isLoaded) {
    await store.initSearch()
  }
  return Object.values(docsCache)
}

/**
 * 获取文章数据的辅助函数
 */
export async function getArticleByPath(path: string): Promise<SearchResult | undefined> {
  const store = useSearchStore()
  if (!store.isLoaded) {
    await store.initSearch()
  }

  // 1. 精确匹配
  if (docsCache[path]) return docsCache[path]

  // 2. 尝试解码
  let decoded = path
  try {
    decoded = decodeURI(path)
  } catch (e) {
    // ignore
  }
  if (docsCache[decoded]) return docsCache[decoded]

  // 3. 智能匹配 (模拟 Obsidian 链接解析)
  const slug = decoded.toLowerCase().replace(/\s+/g, '-')

  const docs = Object.values(docsCache)

  for (const doc of docs) {
    if (doc.id === slug || doc.id.endsWith('/' + slug) || doc.id.endsWith(slug)) {
      return doc
    }

    if (doc.title && doc.title.toLowerCase() === decoded.toLowerCase()) {
      return doc
    }
  }

  return undefined
}
