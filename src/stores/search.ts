import { defineStore } from 'pinia'
import { ref } from 'vue'
import SearchWorker from '@/workers/search.worker?worker'
import type { WorkerInMessage, WorkerOutMessage, SearchResult } from '@/workers/search.worker'
import { isIndexedDBSupported, getCachedIndex, setCachedIndex } from '@/utils/searchIndexDB'

// 重新导出类型
export type { SearchResult } from '@/workers/search.worker'

// 索引清单类型
interface SearchIndexManifest {
  version: string
  totalDocs: number
  chunks: number
  chunkSize: number
}

// Worker 实例（单例）
let worker: Worker | null = null
let workerReady = false
let pendingSearchCallbacks: Map<string, (results: SearchResult[]) => void> = new Map()

// 全局缓存文档数据（用于 getAllArticles 等同步访问）
let docsCache: Record<string, SearchResult> = {}

/**
 * 获取或创建 Worker 实例
 */
function getWorker(): Worker {
  if (!worker) {
    worker = new SearchWorker()
    worker.onmessage = handleWorkerMessage
    worker.onerror = (e) => {
      console.error('Search worker error:', e)
    }
  }
  return worker
}

/**
 * 处理 Worker 消息
 */
function handleWorkerMessage(event: MessageEvent<WorkerOutMessage>) {
  const msg = event.data

  switch (msg.type) {
    case 'ready':
      workerReady = true
      break

    case 'results':
      // 查找并执行回调
      const callback = pendingSearchCallbacks.values().next().value
      if (callback) {
        callback(msg.data)
        pendingSearchCallbacks.delete(pendingSearchCallbacks.keys().next().value!)
      }
      break

    case 'error':
      console.error('Search worker error:', msg.message)
      break
  }
}

/**
 * 发送消息到 Worker
 */
function postToWorker(message: WorkerInMessage) {
  getWorker().postMessage(message)
}

/**
 * 在 Worker 中执行搜索
 */
function searchInWorker(query: string, limit: number): Promise<SearchResult[]> {
  return new Promise((resolve) => {
    const id = Math.random().toString(36).slice(2)
    pendingSearchCallbacks.set(id, resolve)
    postToWorker({ type: 'search', query, limit })
  })
}

export const useSearchStore = defineStore('search', () => {
  const isLoaded = ref(false)
  const isModalOpen = ref(false)
  const query = ref('')
  const results = ref<SearchResult[]>([])
  const loading = ref(false)
  const loadingProgress = ref(0) // 0-100

  /**
   * 加载搜索索引
   * 优先从 IndexedDB 缓存加载，否则从网络获取
   */
  const loadIndex = async () => {
    if (isLoaded.value) return

    try {
      // 1. 获取索引清单
      const manifestRes = await fetch('/search-index-manifest.json')

      // 如果清单不存在，回退到旧的单文件模式
      if (!manifestRes.ok) {
        return await loadLegacyIndex()
      }

      const manifest: SearchIndexManifest = await manifestRes.json()

      // 2. 检查 IndexedDB 缓存
      if (isIndexedDBSupported()) {
        const cached = await getCachedIndex(manifest.version)
        if (cached) {
          console.log('[Search] Using cached index from IndexedDB')
          docsCache = Object.fromEntries(
            (cached.data as SearchResult[]).map((item) => [item.id, item])
          )
          postToWorker({ type: 'init', data: cached.data as SearchResult[] })
          isLoaded.value = true
          loadingProgress.value = 100
          return
        }
      }

      // 3. 分块加载
      const allData: SearchResult[] = []

      for (let i = 0; i < manifest.chunks; i++) {
        const chunkRes = await fetch(`/search-index-${i}.json`)
        const chunkData: SearchResult[] = await chunkRes.json()

        allData.push(...chunkData)

        // 增量发送到 Worker
        postToWorker({
          type: 'init-chunk',
          chunk: chunkData,
          isLast: i === manifest.chunks - 1
        })

        // 更新进度
        loadingProgress.value = Math.round(((i + 1) / manifest.chunks) * 100)
      }

      // 4. 缓存到本地
      docsCache = Object.fromEntries(allData.map((item) => [item.id, item]))

      if (isIndexedDBSupported()) {
        await setCachedIndex({
          version: manifest.version,
          data: allData,
          lastUpdated: Date.now()
        })
        console.log('[Search] Index cached to IndexedDB')
      }

      isLoaded.value = true
    } catch (e) {
      console.error('Failed to load search index:', e)
      // 尝试回退到旧模式
      await loadLegacyIndex()
    }
  }

  /**
   * 兼容旧的单文件索引加载
   */
  const loadLegacyIndex = async () => {
    try {
      const res = await fetch('/search-index.json')
      const data: SearchResult[] = await res.json()

      docsCache = Object.fromEntries(data.map((item) => [item.id, item]))
      postToWorker({ type: 'init', data })

      isLoaded.value = true
      loadingProgress.value = 100
    } catch (e) {
      console.error('Failed to load legacy search index:', e)
    }
  }

  const initSearch = async () => {
    if (isLoaded.value) return

    loading.value = true
    loadingProgress.value = 0
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

  const performSearch = async (q: string) => {
    query.value = q
    if (!q.trim()) {
      results.value = []
      return
    }

    if (!isLoaded.value) {
      await initSearch()
    }

    // 等待 Worker 就绪
    if (!workerReady) {
      await new Promise<void>((resolve) => {
        const check = setInterval(() => {
          if (workerReady) {
            clearInterval(check)
            resolve()
          }
        }, 50)
      })
    }

    const searchResults = await searchInWorker(q, 20)
    results.value = searchResults
  }

  return {
    isLoaded,
    isModalOpen,
    query,
    results,
    loading,
    loadingProgress,
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
  } catch {
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
