import { ref, watch } from 'vue'
import type { SearchResult } from '@/composables/core/useSearch'

// 存储键名
const STORAGE_KEY = 'lumina-search-history'

// 配置常量
const MAX_RECENT_QUERIES = 10
const MAX_RECENT_DOCS = 8

// 历史状态接口
interface SearchHistoryState {
  recentQueries: string[]
  recentDocs: SearchResult[]
}

// 模块级响应式状态（单例模式）
const recentQueries = ref<string[]>([])
const recentDocs = ref<SearchResult[]>([])

// 从 localStorage 加载历史
function loadHistory(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data: SearchHistoryState = JSON.parse(raw)
      recentQueries.value = data.recentQueries || []
      recentDocs.value = data.recentDocs || []
    }
  } catch (e) {
    console.warn('Failed to load search history:', e)
  }
}

// 保存历史到 localStorage
function saveHistory(): void {
  try {
    const data: SearchHistoryState = {
      recentQueries: recentQueries.value,
      recentDocs: recentDocs.value
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to save search history:', e)
  }
}

// 初始化加载
loadHistory()

// 监听变化自动保存
watch([recentQueries, recentDocs], saveHistory, { deep: true })

/**
 * 搜索历史管理 Composable
 */
export function useSearchHistory() {
  /**
   * 添加搜索词到历史
   */
  const addSearchQuery = (query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return

    // 移除已存在的相同搜索词（避免重复）
    const filtered = recentQueries.value.filter((q) => q !== trimmed)
    // 添加到开头
    recentQueries.value = [trimmed, ...filtered].slice(0, MAX_RECENT_QUERIES)
  }

  /**
   * 添加文档到最近访问
   */
  const addRecentDoc = (doc: SearchResult) => {
    // 移除已存在的相同文档
    const filtered = recentDocs.value.filter((d) => d.id !== doc.id)
    // 添加到开头
    recentDocs.value = [doc, ...filtered].slice(0, MAX_RECENT_DOCS)
  }

  /**
   * 移除单个搜索词
   */
  const removeSearchQuery = (query: string) => {
    recentQueries.value = recentQueries.value.filter((q) => q !== query)
  }

  /**
   * 移除单个最近文档
   */
  const removeRecentDoc = (docId: string) => {
    recentDocs.value = recentDocs.value.filter((d) => d.id !== docId)
  }

  /**
   * 清除所有历史
   */
  const clearHistory = () => {
    recentQueries.value = []
    recentDocs.value = []
  }

  /**
   * 清除搜索词历史
   */
  const clearSearchQueries = () => {
    recentQueries.value = []
  }

  /**
   * 清除最近文档历史
   */
  const clearRecentDocs = () => {
    recentDocs.value = []
  }

  return {
    recentQueries,
    recentDocs,
    addSearchQuery,
    addRecentDoc,
    removeSearchQuery,
    removeRecentDoc,
    clearHistory,
    clearSearchQueries,
    clearRecentDocs
  }
}
