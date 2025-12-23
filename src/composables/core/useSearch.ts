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

// 模块级加载函数
async function loadIndex() {
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
    await loadIndex()
    loading.value = false
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

/**
 * 获取文章数据的辅助函数
 */
export async function getArticleByPath(path: string): Promise<SearchResult | undefined> {
  if (!isLoaded.value) {
    await loadIndex()
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
  // 将输入转换为 slug 形式 (例如 "Digital Garden" -> "digital-garden")
  const slug = decoded.toLowerCase().replace(/\s+/g, '-')

  // 遍历所有文档寻找匹配
  const docs = Object.values(docsCache)

  for (const doc of docs) {
    // A. ID 后缀匹配 (例如 "example/digital-garden" 匹配 "digital-garden")
    // 我们检查 id 是否以 /slug 结尾，或者主要部分就是 slug
    if (doc.id === slug || doc.id.endsWith('/' + slug) || doc.id.endsWith(slug)) {
      return doc
    }

    // B. Title 匹配
    if (doc.title && doc.title.toLowerCase() === decoded.toLowerCase()) {
      return doc
    }
  }

  return undefined
}
