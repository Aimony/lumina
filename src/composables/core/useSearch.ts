import { ref, onMounted, onUnmounted } from 'vue'
import FlexSearch from 'flexsearch'

export interface SearchResult {
  id: string
  title: string
  content: string
  tags: string[]
  [key: string]: any
}

const isLoaded = ref(false)
const isModalOpen = ref(false)
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

// 全局缓存文档数据，用于结果展示
let docsCache: Record<string, SearchResult> = {}

export function useSearch() {
  const query = ref('')
  const results = ref<SearchResult[]>([])
  const loading = ref(false)

  const openModal = () => {
    isModalOpen.value = true
    initSearch() // 打开时尝试初始化
  }

  const closeModal = () => {
    isModalOpen.value = false
    query.value = ''
    results.value = []
  }

  // 键盘快捷键监听
  const handleKeydown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      openModal()
    }
    // ESC 关闭
    if (e.key === 'Escape' && isModalOpen.value) {
      closeModal()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  const initSearch = async () => {
    if (isLoaded.value) return

    loading.value = true
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
    } finally {
      loading.value = false
    }
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
    query,
    results,
    loading,
    initSearch,
    performSearch,
    isModalOpen,
    openModal,
    closeModal
  }
}
