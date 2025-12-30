import { useSearchHistoryStore } from '@/stores/searchHistory'
import { storeToRefs } from 'pinia'

/**
 * 搜索历史管理 Composable
 * 向后兼容 wrapper，内部使用 Pinia store
 */
export function useSearchHistory() {
  const store = useSearchHistoryStore()
  const { recentQueries, recentDocs } = storeToRefs(store)

  return {
    recentQueries,
    recentDocs,
    addSearchQuery: store.addSearchQuery,
    addRecentDoc: store.addRecentDoc,
    removeSearchQuery: store.removeSearchQuery,
    removeRecentDoc: store.removeRecentDoc,
    clearHistory: store.clearHistory,
    clearSearchQueries: store.clearSearchQueries,
    clearRecentDocs: store.clearRecentDocs
  }
}
