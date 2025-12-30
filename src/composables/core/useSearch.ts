import { useSearchStore, getAllArticles, getArticleByPath } from '@/stores/search'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted } from 'vue'

// Re-export types and functions from store
export type { SearchResult } from '@/stores/search'
export { getAllArticles, getArticleByPath }

/**
 * 搜索 Composable
 * 向后兼容 wrapper，内部使用 Pinia store
 */
export function useSearch() {
  const store = useSearchStore()
  const { query, results, loading, isModalOpen } = storeToRefs(store)

  // 键盘快捷键监听
  const handleKeydown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      store.openModal()
    }
    // ESC 关闭
    if (e.key === 'Escape' && isModalOpen.value) {
      store.closeModal()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    query,
    results,
    loading,
    initSearch: store.initSearch,
    performSearch: store.performSearch,
    isModalOpen,
    openModal: store.openModal,
    closeModal: store.closeModal
  }
}
