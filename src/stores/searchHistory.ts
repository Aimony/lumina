import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { SearchResult } from './search'

const STORAGE_KEY = 'lumina-search-history'
const MAX_RECENT_QUERIES = 10
const MAX_RECENT_DOCS = 8

interface SearchHistoryState {
  recentQueries: string[]
  recentDocs: SearchResult[]
}

export const useSearchHistoryStore = defineStore('searchHistory', () => {
  const recentQueries = ref<string[]>([])
  const recentDocs = ref<SearchResult[]>([])

  // 从 localStorage 加载历史
  const loadHistory = () => {
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
  const saveHistory = () => {
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

  // 添加搜索词到历史
  const addSearchQuery = (query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return

    const filtered = recentQueries.value.filter((q) => q !== trimmed)
    recentQueries.value = [trimmed, ...filtered].slice(0, MAX_RECENT_QUERIES)
  }

  // 添加文档到最近访问
  const addRecentDoc = (doc: SearchResult) => {
    const filtered = recentDocs.value.filter((d) => d.id !== doc.id)
    recentDocs.value = [doc, ...filtered].slice(0, MAX_RECENT_DOCS)
  }

  // 移除单个搜索词
  const removeSearchQuery = (query: string) => {
    recentQueries.value = recentQueries.value.filter((q) => q !== query)
  }

  // 移除单个最近文档
  const removeRecentDoc = (docId: string) => {
    recentDocs.value = recentDocs.value.filter((d) => d.id !== docId)
  }

  // 清除所有历史
  const clearHistory = () => {
    recentQueries.value = []
    recentDocs.value = []
  }

  // 清除搜索词历史
  const clearSearchQueries = () => {
    recentQueries.value = []
  }

  // 清除最近文档历史
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
})
