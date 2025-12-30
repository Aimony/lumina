import { ref, provide } from 'vue'

// 类型定义
export interface OfficePreviewFile {
  src: string
  name: string
  type: string
}

export interface EpubPreviewFile {
  src: string
  name: string
}

/**
 * 文件预览 Composable
 * 管理 Office、压缩包、EPUB 文件预览的状态
 */
export function useFilePreview() {
  // Office 文件预览状态
  const officePreviewFile = ref<OfficePreviewFile | null>(null)
  const setOfficePreviewFile = (file: OfficePreviewFile | null) => {
    officePreviewFile.value = file
  }

  // 压缩包预览状态
  const archivePreviewFile = ref<File | null>(null)
  const setArchivePreviewFile = (file: File | null) => {
    archivePreviewFile.value = file
  }

  // EPUB 预览状态
  const epubPreviewFile = ref<EpubPreviewFile | null>(null)
  const setEpubPreviewFile = (file: EpubPreviewFile | null) => {
    epubPreviewFile.value = file
  }

  // 处理全局预览事件
  const handleArchivePreviewEvent = async (e: Event) => {
    const customEvent = e as CustomEvent
    const { src, name } = customEvent.detail
    if (src) {
      try {
        const response = await fetch(src)
        if (!response.ok) throw new Error('Network response was not ok')
        const blob = await response.blob()
        const file = new File([blob], name, { type: 'application/zip' })
        setArchivePreviewFile(file)
      } catch (error) {
        console.error('Failed to fetch archive:', error)
        alert('无法加载压缩包文件')
      }
    }
  }

  const handleOfficePreviewEvent = (e: Event) => {
    const customEvent = e as CustomEvent
    const { src, name, type } = customEvent.detail
    if (src) {
      setOfficePreviewFile({ src, name, type })
    }
  }

  // 设置事件监听
  const setupPreviewListeners = () => {
    window.addEventListener('preview-archive', handleArchivePreviewEvent)
    window.addEventListener('preview-office', handleOfficePreviewEvent)
  }

  // 清理事件监听
  const cleanupPreviewListeners = () => {
    window.removeEventListener('preview-archive', handleArchivePreviewEvent)
    window.removeEventListener('preview-office', handleOfficePreviewEvent)
  }

  // 关闭预览
  const closeOfficePreview = () => {
    officePreviewFile.value = null
  }

  const closeArchivePreview = () => {
    archivePreviewFile.value = null
  }

  const closeEpubPreview = () => {
    epubPreviewFile.value = null
  }

  // 提供状态给子组件
  const provideFilePreviewContext = () => {
    provide('setOfficePreviewFile', setOfficePreviewFile)
    provide('setArchivePreviewFile', setArchivePreviewFile)
    provide('setEpubPreviewFile', setEpubPreviewFile)
  }

  return {
    // 状态
    officePreviewFile,
    archivePreviewFile,
    epubPreviewFile,
    // Setters
    setOfficePreviewFile,
    setArchivePreviewFile,
    setEpubPreviewFile,
    // 关闭方法
    closeOfficePreview,
    closeArchivePreview,
    closeEpubPreview,
    // 生命周期
    setupPreviewListeners,
    cleanupPreviewListeners,
    provideFilePreviewContext
  }
}
