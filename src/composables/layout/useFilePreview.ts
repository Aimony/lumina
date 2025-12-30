import { useFilePreviewStore } from '@/stores/filePreview'
import { storeToRefs } from 'pinia'

// Re-export types from store
export type { OfficePreviewFile, EpubPreviewFile } from '@/stores/filePreview'

/**
 * 文件预览 Composable
 * 向后兼容 wrapper，内部使用 Pinia store
 */
export function useFilePreview() {
  const store = useFilePreviewStore()
  const { officePreviewFile, archivePreviewFile, epubPreviewFile } = storeToRefs(store)

  return {
    // 状态
    officePreviewFile,
    archivePreviewFile,
    epubPreviewFile,
    // Setters
    setOfficePreviewFile: store.setOfficePreviewFile,
    setArchivePreviewFile: store.setArchivePreviewFile,
    setEpubPreviewFile: store.setEpubPreviewFile,
    // 关闭方法
    closeOfficePreview: store.closeOfficePreview,
    closeArchivePreview: store.closeArchivePreview,
    closeEpubPreview: store.closeEpubPreview,
    // 生命周期
    setupPreviewListeners: store.setupPreviewListeners,
    cleanupPreviewListeners: store.cleanupPreviewListeners,
    // 提供空函数保持接口兼容
    provideFilePreviewContext: () => {}
  }
}
