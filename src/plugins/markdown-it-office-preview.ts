import type MarkdownIt from 'markdown-it'
import type { RenderRule } from 'markdown-it/lib/renderer.mjs'

/**
 * Office 文件类型映射
 */
const OFFICE_EXTENSIONS: Record<string, string> = {
  '.docx': 'word',
  '.doc': 'word',
  '.xlsx': 'excel',
  '.xls': 'excel',
  '.pptx': 'ppt',
  '.ppt': 'ppt',
  '.pdf': 'pdf'
}

/**
 * 获取文件扩展名
 */
function getFileExtension(url: string): string {
  const match = url.match(/\.[a-zA-Z0-9]+$/)
  return match ? match[0].toLowerCase() : ''
}

/**
 * 获取文件名（不含路径），并解码 URL 编码
 */
function getFileName(url: string): string {
  const parts = url.split('/')
  const encodedName = parts[parts.length - 1] || url
  try {
    return decodeURIComponent(encodedName)
  } catch {
    return encodedName
  }
}

/**
 * markdown-it 插件：将 Office 文件链接转换为预览卡片
 *
 * 检测逻辑：
 * - 链接必须指向支持的 Office 文件类型（.docx, .xlsx, .pptx, .pdf 等）
 * - 将链接渲染为 OfficeFileCard 组件
 */
export function officePreviewPlugin(md: MarkdownIt) {
  // 保存原始的链接渲染规则
  const defaultLinkOpen: RenderRule =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, _env, self) {
      return self.renderToken(tokens, idx, options)
    }

  const defaultLinkClose: RenderRule =
    md.renderer.rules.link_close ||
    function (tokens, idx, options, _env, self) {
      return self.renderToken(tokens, idx, options)
    }

  // 用于跟踪当前是否在 Office 文件链接内
  let isOfficeLink = false
  let currentOfficeFile: { src: string; name: string; type: string } | null = null

  // 重写链接开始标签的渲染规则
  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx]
    if (!token) return defaultLinkOpen(tokens, idx, options, env, self)

    const href = token.attrGet('href') || ''
    const ext = getFileExtension(href)
    const fileType = OFFICE_EXTENSIONS[ext]

    if (fileType) {
      isOfficeLink = true
      currentOfficeFile = {
        src: href,
        name: getFileName(href),
        type: fileType
      }
      // 返回组件开始标签
      return `<OfficeFileCard src="${href}" name="${currentOfficeFile.name}" type="${fileType}">`
    }

    return defaultLinkOpen(tokens, idx, options, env, self)
  }

  // 重写链接结束标签的渲染规则
  md.renderer.rules.link_close = function (tokens, idx, options, env, self) {
    if (isOfficeLink) {
      isOfficeLink = false
      currentOfficeFile = null
      return '</OfficeFileCard>'
    }

    return defaultLinkClose(tokens, idx, options, env, self)
  }

  // 处理链接内的文本，对于 Office 链接不渲染文本（由组件自己显示）
  const defaultText =
    md.renderer.rules.text ||
    function (tokens, idx) {
      return tokens[idx]?.content || ''
    }

  md.renderer.rules.text = function (tokens, idx, options, env, self) {
    if (isOfficeLink) {
      // Office 链接内的文本由组件自己处理，这里不渲染
      return ''
    }
    return defaultText(tokens, idx, options, env, self)
  }
}
