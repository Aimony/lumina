/**
 * 搜索索引 Web Worker
 *
 * 在后台线程中执行索引构建和搜索操作，避免阻塞主线程
 */
import FlexSearch from 'flexsearch'

// 搜索结果类型（兼容 FlexSearch.DocumentData）
export interface SearchResult {
  id: string
  title: string
  content: string
  tags: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: string | string[] | number | boolean | null | any
}

// Worker 消息类型定义
export type WorkerInMessage =
  | { type: 'init'; data: SearchResult[] }
  | { type: 'init-chunk'; chunk: SearchResult[]; isLast: boolean }
  | { type: 'search'; query: string; limit: number }

export type WorkerOutMessage =
  | { type: 'ready' }
  | { type: 'progress'; loaded: number; total: number }
  | { type: 'results'; data: SearchResult[] }
  | { type: 'error'; message: string }

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

// 文档缓存
const docsCache: Record<string, SearchResult> = {}

// 处理消息
self.onmessage = (event: MessageEvent<WorkerInMessage>) => {
  const msg = event.data

  try {
    switch (msg.type) {
      case 'init':
        // 一次性加载全部数据
        msg.data.forEach((item) => {
          index.add(item)
          docsCache[item.id] = item
        })
        postMessage({ type: 'ready' } as WorkerOutMessage)
        break

      case 'init-chunk':
        // 分块加载
        msg.chunk.forEach((item) => {
          index.add(item)
          docsCache[item.id] = item
        })
        if (msg.isLast) {
          postMessage({ type: 'ready' } as WorkerOutMessage)
        }
        break

      case 'search':
        performSearch(msg.query, msg.limit)
        break

      default:
        postMessage({
          type: 'error',
          message: `Unknown message type`
        } as WorkerOutMessage)
    }
  } catch (error) {
    postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as WorkerOutMessage)
  }
}

/**
 * 执行搜索
 */
function performSearch(query: string, limit: number) {
  if (!query.trim()) {
    postMessage({ type: 'results', data: [] } as WorkerOutMessage)
    return
  }

  const searchResult = index.search(query, {
    limit,
    enrich: true
  })

  const uniqueIds = new Set<string>()
  const results: SearchResult[] = []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchResult.forEach((fieldResult: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fieldResult.result.forEach((item: any) => {
      if (!uniqueIds.has(item.id)) {
        uniqueIds.add(item.id)
        results.push(item.doc)
      }
    })
  })

  postMessage({ type: 'results', data: results } as WorkerOutMessage)
}

// 导出用于获取所有文档（主线程无法直接访问）
export function getAllDocs(): SearchResult[] {
  return Object.values(docsCache)
}

export function getDocById(id: string): SearchResult | undefined {
  return docsCache[id]
}
