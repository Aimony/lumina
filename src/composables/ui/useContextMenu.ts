import { ref, readonly, onMounted, onUnmounted } from 'vue'
import { useRouter, type Router } from 'vue-router'

// ==================== 类型定义 ====================

// 上下文类型
export type ContextType =
  | 'text-selection' // 选中文本
  | 'link' // 链接
  | 'image' // 图片
  | 'code-block' // 代码块
  | 'sidebar-item' // 侧边栏项目
  | 'archive' // 压缩包文件
  | 'office' // Office文件
  | 'generic' // 通用区域

// 上下文数据
export interface ContextData {
  // 选中文本
  selectedText?: string
  // 链接
  href?: string
  linkText?: string
  // 图片
  imageSrc?: string
  imageAlt?: string
  // 代码块
  code?: string
  language?: string
  // 侧边栏项目 / 文件
  itemPath?: string
  itemTitle?: string
  itemType?: string // 'article' | 'directory' | 'word' | 'excel' | 'ppt' | 'pdf'
}

// 上下文信息
export interface ContextInfo {
  type: ContextType
  data: ContextData
  element?: HTMLElement
}

// 菜单项接口
export interface MenuItem {
  id: string
  label: string
  icon?: string
  shortcut?: string
  disabled?: boolean
  danger?: boolean
  divider?: boolean
  children?: MenuItem[]
  action?: () => void
}

// ==================== 状态管理 ====================

const isVisible = ref(false)
const position = ref({ x: 0, y: 0 })
const currentContext = ref<ContextInfo | null>(null)
const menuItems = ref<MenuItem[]>([])
let globalRouter: Router | undefined

// 全局事件监听器引用
let globalContextMenuHandler: ((e: MouseEvent) => void) | null = null
let globalClickHandler: ((e: MouseEvent) => void) | null = null
let globalKeydownHandler: ((e: KeyboardEvent) => void) | null = null

// ==================== 工具函数 ====================

const hide = () => {
  isVisible.value = false
  currentContext.value = null
  menuItems.value = []
}

// 复制到剪贴板
const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('复制失败:', err)
    return false
  }
}

// 下载图片
const downloadImage = async (src: string, filename?: string) => {
  try {
    const response = await fetch(src)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || 'image'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('下载失败:', err)
  }
}

// ==================== 菜单项生成 ====================

// 选中文本菜单
const generateTextSelectionMenu = (data: ContextData): MenuItem[] => {
  const text = data.selectedText || ''
  return [
    {
      id: 'copy-text',
      label: '复制',
      icon: 'copy',
      shortcut: 'Ctrl+C',
      action: () => {
        copyToClipboard(text)
        hide()
      }
    },
    {
      id: 'search-text',
      label: '搜索',
      icon: 'search',
      divider: true,
      action: () => {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(text)}`, '_blank')
        hide()
      }
    },
    {
      id: 'search-baidu',
      label: '百度搜索',
      icon: 'search',
      action: () => {
        window.open(`https://www.baidu.com/s?wd=${encodeURIComponent(text)}`, '_blank')
        hide()
      }
    }
  ]
}

// 链接菜单
const generateLinkMenu = (data: ContextData): MenuItem[] => {
  const href = data.href || ''
  const linkText = data.linkText || ''
  return [
    {
      id: 'open-link-new-tab',
      label: '在新标签页打开',
      icon: 'external-link',
      action: () => {
        window.open(href, '_blank')
        hide()
      }
    },
    {
      id: 'copy-link',
      label: '复制链接',
      icon: 'link',
      action: () => {
        copyToClipboard(href)
        hide()
      }
    },
    {
      id: 'copy-link-text',
      label: '复制链接文本',
      icon: 'text',
      divider: true,
      action: () => {
        copyToClipboard(linkText)
        hide()
      }
    }
  ]
}

// 图片菜单
const generateImageMenu = (data: ContextData): MenuItem[] => {
  const src = data.imageSrc || ''
  const alt = data.imageAlt || 'image'
  return [
    {
      id: 'open-image-new-tab',
      label: '在新标签页打开图片',
      icon: 'external-link',
      action: () => {
        window.open(src, '_blank')
        hide()
      }
    },
    {
      id: 'copy-image',
      label: '复制图片地址',
      icon: 'link',
      action: () => {
        copyToClipboard(src)
        hide()
      }
    },
    {
      id: 'download-image',
      label: '下载图片',
      icon: 'download',
      divider: true,
      action: () => {
        downloadImage(src, alt)
        hide()
      }
    }
  ]
}

// 代码块菜单
const generateCodeBlockMenu = (data: ContextData): MenuItem[] => {
  const code = data.code || ''
  const language = data.language || ''
  return [
    {
      id: 'copy-code',
      label: '复制代码',
      icon: 'copy',
      shortcut: 'Ctrl+C',
      action: () => {
        copyToClipboard(code)
        hide()
      }
    },
    ...(language
      ? [
          {
            id: 'copy-language',
            label: `语言: ${language}`,
            icon: 'code',
            disabled: true,
            divider: true
          }
        ]
      : [])
  ]
}

// 侧边栏项目菜单
const generateSidebarItemMenu = (data: ContextData): MenuItem[] => {
  const path = data.itemPath || ''
  const title = data.itemTitle || ''
  const isDirectory = data.itemType === 'directory'
  const fullUrl = `${window.location.origin}${path}`

  const baseItems: MenuItem[] = [
    {
      id: 'open-new-tab',
      label: '在新标签页打开',
      icon: 'external-link',
      disabled: isDirectory,
      action: () => {
        if (!isDirectory) {
          window.open(path, '_blank')
        }
        hide()
      }
    },
    {
      id: 'copy-link',
      label: '复制链接',
      icon: 'link',
      action: () => {
        copyToClipboard(fullUrl)
        hide()
      }
    },
    {
      id: 'copy-title',
      label: '复制标题',
      icon: 'text',
      action: () => {
        copyToClipboard(title)
        hide()
      }
    },
    {
      id: 'copy-path',
      label: '复制路径',
      icon: 'folder',
      divider: !isDirectory,
      action: () => {
        copyToClipboard(path)
        hide()
      }
    }
  ]

  // 目录特有菜单项
  if (isDirectory) {
    baseItems.push(
      {
        id: 'expand-all',
        label: '展开全部',
        icon: 'expand',
        action: () => {
          window.dispatchEvent(new CustomEvent('sidebar-expand-all', { detail: { path } }))
          hide()
        }
      },
      {
        id: 'collapse-all',
        label: '折叠全部',
        icon: 'collapse',
        divider: true,
        action: () => {
          window.dispatchEvent(new CustomEvent('sidebar-collapse-all', { detail: { path } }))
          hide()
        }
      }
    )
  }

  // 分享功能
  baseItems.push({
    id: 'share',
    label: '分享',
    icon: 'share',
    action: () => {
      if (navigator.share) {
        navigator.share({ title, url: fullUrl })
      } else {
        copyToClipboard(fullUrl)
      }
      hide()
    }
  })

  return baseItems
}

// 压缩包菜单
const generateArchiveMenu = (data: ContextData): MenuItem[] => {
  const src = data.imageSrc || ''
  const name = data.itemTitle || ''

  return [
    {
      id: 'preview-archive',
      label: '预览压缩包',
      icon: 'expand',
      action: () => {
        window.dispatchEvent(new CustomEvent('preview-archive', { detail: { src, name } }))
        hide()
      }
    },
    {
      id: 'download-archive',
      label: '下载文件',
      icon: 'download',
      divider: true,
      action: () => {
        const a = document.createElement('a')
        a.href = src
        a.download = name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        hide()
      }
    },
    {
      id: 'copy-link',
      label: '复制下载链接',
      icon: 'link',
      action: () => {
        copyToClipboard(src)
        hide()
      }
    },
    {
      id: 'copy-name',
      label: '复制文件名',
      icon: 'text',
      action: () => {
        copyToClipboard(name)
        hide()
      }
    }
  ]
}

// Office 文件菜单
const generateOfficeMenu = (data: ContextData): MenuItem[] => {
  const src = data.imageSrc || ''
  const name = data.itemTitle || ''
  const type = data.itemType || 'word'

  return [
    {
      id: 'preview-office',
      label: '预览文档',
      icon: 'expand',
      action: () => {
        window.dispatchEvent(new CustomEvent('preview-office', { detail: { src, name, type } }))
        hide()
      }
    },
    {
      id: 'download-office',
      label: '下载文件',
      icon: 'download',
      divider: true,
      action: () => {
        const a = document.createElement('a')
        a.href = src
        a.download = name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        hide()
      }
    },
    {
      id: 'copy-link',
      label: '复制下载链接',
      icon: 'link',
      action: () => {
        copyToClipboard(src)
        hide()
      }
    },
    {
      id: 'copy-name',
      label: '复制文件名',
      icon: 'text',
      action: () => {
        copyToClipboard(name)
        hide()
      }
    }
  ]
}

// 通用区域菜单
const generateGenericMenu = (): MenuItem[] => {
  // Use the globally captured router instance
  const router = globalRouter

  return [
    {
      id: 'go-back',
      label: '返回',
      icon: 'arrow-left',
      shortcut: 'Alt+←',
      disabled: window.history.length <= 1,
      action: () => {
        router?.back()
        hide()
      }
    },
    {
      id: 'go-forward',
      label: '前进',
      icon: 'arrow-right',
      shortcut: 'Alt+→',
      action: () => {
        router?.forward()
        hide()
      }
    },
    {
      id: 'refresh',
      label: '刷新页面',
      icon: 'refresh',
      shortcut: 'Ctrl+R',
      divider: true,
      action: () => {
        window.location.reload()
      }
    },
    {
      id: 'copy-page-link',
      label: '复制页面链接',
      icon: 'link',
      action: () => {
        copyToClipboard(window.location.href)
        hide()
      }
    },
    {
      id: 'share-page',
      label: '分享页面',
      icon: 'share',
      action: () => {
        if (navigator.share) {
          navigator.share({
            title: document.title,
            url: window.location.href
          })
        } else {
          copyToClipboard(window.location.href)
        }
        hide()
      }
    }
  ]
}

// 根据 Context 生成菜单项
const generateMenuItems = (context: ContextInfo): MenuItem[] => {
  switch (context.type) {
    case 'text-selection':
      return generateTextSelectionMenu(context.data)
    case 'link':
      return generateLinkMenu(context.data)
    case 'image':
      return generateImageMenu(context.data)
    case 'code-block':
      return generateCodeBlockMenu(context.data)
    case 'sidebar-item':
      return generateSidebarItemMenu(context.data)
    case 'archive':
      return generateArchiveMenu(context.data)
    case 'office':
      return generateOfficeMenu(context.data)
    case 'generic':
    default:
      return generateGenericMenu()
  }
}

// ==================== 上下文检测 ====================

const detectContext = (event: MouseEvent): ContextInfo => {
  const target = event.target as HTMLElement
  const selection = window.getSelection()

  // 1. 检查文本选择（最高优先级）
  if (selection && selection.toString().trim().length > 0) {
    return {
      type: 'text-selection',
      data: { selectedText: selection.toString() },
      element: target
    }
  }

  // 2. 检查带 data-context-type 的元素
  const contextElement = target.closest('[data-context-type]') as HTMLElement
  if (contextElement) {
    const contextType = contextElement.dataset.contextType

    // 侧边栏项目
    if (contextType === 'article' || contextType === 'directory') {
      return {
        type: 'sidebar-item',
        data: {
          itemPath: contextElement.dataset.contextPath,
          itemTitle: contextElement.dataset.contextTitle,
          itemType: contextType
        },
        element: contextElement
      }
    }

    // 压缩包
    if (contextType === 'archive') {
      return {
        type: 'archive',
        data: {
          imageSrc: contextElement.dataset.contextSrc,
          itemTitle: contextElement.dataset.contextName
        },
        element: contextElement
      }
    }

    // Office 文件
    if (contextType === 'office') {
      return {
        type: 'office',
        data: {
          imageSrc: contextElement.dataset.contextSrc,
          itemTitle: contextElement.dataset.contextName,
          itemType: contextElement.dataset.contextFileType
        },
        element: contextElement
      }
    }
  }

  // 3. 检查代码块
  const codeBlock = target.closest('pre, .vp-code-block, [class*="language-"]') as HTMLElement
  if (codeBlock) {
    const codeElement = codeBlock.querySelector('code') || codeBlock
    const language = codeBlock.className.match(/language-(\w+)/)?.[1] || ''
    return {
      type: 'code-block',
      data: {
        code: codeElement.textContent || '',
        language
      },
      element: codeBlock
    }
  }

  // 4. 检查图片
  const img = target.closest('img') as HTMLImageElement
  if (img) {
    return {
      type: 'image',
      data: {
        imageSrc: img.src,
        imageAlt: img.alt
      },
      element: img
    }
  }

  // 5. 检查链接
  const link = target.closest('a[href]') as HTMLAnchorElement
  if (link) {
    return {
      type: 'link',
      data: {
        href: link.href,
        linkText: link.textContent || ''
      },
      element: link
    }
  }

  // 6. 默认通用区域
  return {
    type: 'generic',
    data: {},
    element: target
  }
}

// ==================== 菜单控制与显示 ====================

const show = (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()

  // 检测上下文
  const context = detectContext(event)
  currentContext.value = context
  menuItems.value = generateMenuItems(context)

  // 计算位置
  const menuWidth = 220
  const menuHeight = 350
  let x = event.clientX
  let y = event.clientY

  if (x + menuWidth > window.innerWidth) {
    x = window.innerWidth - menuWidth - 16
  }
  if (y + menuHeight > window.innerHeight) {
    y = window.innerHeight - menuHeight - 16
  }

  position.value = { x, y }
  isVisible.value = true
}

const executeAction = (item: MenuItem) => {
  if (!item.disabled && item.action) {
    item.action()
  }
}

// ==================== 全局事件管理与导出 ====================

export function useGlobalContextMenu() {
  // 在 setup 中获取 router 实例
  globalRouter = useRouter()

  const setupGlobalListeners = () => {
    // 全局右键菜单事件
    globalContextMenuHandler = (event: MouseEvent) => {
      show(event)
    }

    // 点击其他区域关闭菜单
    globalClickHandler = (event: MouseEvent) => {
      if (isVisible.value) {
        hide()
      }
    }

    // ESC 键关闭菜单
    globalKeydownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible.value) {
        hide()
      }
    }

    document.addEventListener('contextmenu', globalContextMenuHandler)
    document.addEventListener('click', globalClickHandler)
    document.addEventListener('keydown', globalKeydownHandler)
  }

  const cleanupGlobalListeners = () => {
    if (globalContextMenuHandler) {
      document.removeEventListener('contextmenu', globalContextMenuHandler)
    }
    if (globalClickHandler) {
      document.removeEventListener('click', globalClickHandler)
    }
    if (globalKeydownHandler) {
      document.removeEventListener('keydown', globalKeydownHandler)
    }
  }

  onMounted(() => {
    setupGlobalListeners()
  })

  onUnmounted(() => {
    cleanupGlobalListeners()
  })

  return {
    isVisible: readonly(isVisible),
    position: readonly(position),
    currentContext: readonly(currentContext),
    menuItems: readonly(menuItems),
    hide,
    executeAction
  }
}

export function useContextMenu() {
  return {
    isVisible: readonly(isVisible),
    position: readonly(position),
    currentContext: readonly(currentContext),
    menuItems: readonly(menuItems),
    show,
    hide,
    executeAction
  }
}
