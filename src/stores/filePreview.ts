import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface OfficePreviewFile {
  src: string
  name: string
  type: string
}

export interface EpubPreviewFile {
  src: string
  name: string
}

export const useFilePreviewStore = defineStore('filePreview', () => {
  // Office 文件预览状态
  const officePreviewFile = ref<OfficePreviewFile | null>(null)

  // 压缩包预览状态
  const archivePreviewFile = ref<File | null>(null)

  // EPUB 预览状态
  const epubPreviewFile = ref<EpubPreviewFile | null>(null)

  // Setters
  const setOfficePreviewFile = (file: OfficePreviewFile | null) => {
    officePreviewFile.value = file
  }

  const setArchivePreviewFile = (file: File | null) => {
    archivePreviewFile.value = file
  }

  const setEpubPreviewFile = (file: EpubPreviewFile | null) => {
    epubPreviewFile.value = file
  }

  // 关闭方法
  const closeOfficePreview = () => {
    officePreviewFile.value = null
  }

  const closeArchivePreview = () => {
    archivePreviewFile.value = null
  }

  const closeEpubPreview = () => {
    epubPreviewFile.value = null
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
    cleanupPreviewListeners
  }
})
