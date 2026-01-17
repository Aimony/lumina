import type MarkdownIt from 'markdown-it'
import fs from 'node:fs'
import path from 'node:path'

/**
 * 匹配 <demo ... /> 标签的正则
 */
const DEMO_TAG_REGEX = /<demo\s+([^>]*?)\/?>/

/**
 * 解析标签属性
 */
function parseAttrs(attrsStr: string): Record<string, string> {
  /* 移除 parseAttrs，改用更健壮的解析或保留现状 */
  const attrs: Record<string, string> = {}

  const regex = /(\w+)\s*=\s*(["'])(.*?)\2/g
  let match
  while ((match = regex.exec(attrsStr)) !== null) {
    if (match[1] && typeof match[3] === 'string') {
      attrs[match[1]] = match[3]
    }
  }
  return attrs
}

export const demoPlugin = (md: MarkdownIt, options: { demoDir?: string } = {}) => {
  const defaultHtmlBlock = md.renderer.rules.html_block
  const defaultHtmlInline = md.renderer.rules.html_inline
  const demoDir = options.demoDir || 'src/demos'

  // 核心处理逻辑
  const transformDemoTag = (content: string, env: any) => {
    if (!content.trim().startsWith('<demo')) return null

    const match = DEMO_TAG_REGEX.exec(content)
    if (!match || !match[1]) return null

    const attrs = parseAttrs(match[1])
    // 优先级: vue > react > html > src
    const vuePath = attrs.vue
    const reactPath = attrs.react
    const htmlPath = attrs.html
    const srcPath = attrs.src

    // 确定类型和路径
    let filePath = ''
    let type = 'vue'

    if (vuePath) {
      filePath = vuePath
      type = 'vue'
    } else if (reactPath) {
      filePath = reactPath
      type = 'react'
    } else if (htmlPath) {
      filePath = htmlPath
      type = 'html'
    } else if (srcPath) {
      filePath = srcPath
      // 尝试根据后缀推断
      if (srcPath.endsWith('.tsx') || srcPath.endsWith('.jsx')) type = 'react'
      else if (srcPath.endsWith('.html')) type = 'html'
      else type = 'vue'
    } else {
      return null
    }

    const title = attrs.title || ''
    const desc = attrs.desc || ''

    if (!filePath) return null

    // 获取当前处理的 markdown 文件路径
    const currentFilePath = env.filepath || env.path || env.id

    if (!currentFilePath) {
      console.warn('[markdown-it-demo] Current file path not found in env.')
      return null
    }

    let absolutePath = ''

    if (filePath.startsWith('.')) {
      // 相对路径解析
      const dir = path.dirname(currentFilePath)
      absolutePath = path.resolve(dir, filePath)
    } else {
      // 绝对路径（基于 demoDir）
      absolutePath = path.resolve(process.cwd(), demoDir, filePath)
    }

    try {
      // 读取源码
      if (!fs.existsSync(absolutePath)) {
        console.warn(`[markdown-it-demo] File not found: ${absolutePath}`)
        return `<div class="text-red-500">Demo file not found: ${filePath}</div>`
      }

      const sourceCode = fs.readFileSync(absolutePath, 'utf-8')

      // 统一转为 posix 风格路径 (Windows 兼容)
      const normalizedPath = absolutePath.split(path.sep).join('/')

      // 生成相对于项目根目录的路径 (用于 import.meta.glob)
      // 我们需要一个以 /src 开头的路径
      const srcIndex = normalizedPath.lastIndexOf('/src/')
      let relativePath = normalizedPath
      if (srcIndex !== -1) {
        relativePath = normalizedPath.substring(srcIndex)
      }

      // 编码源码以传递给 props
      const encodedSource = encodeURIComponent(sourceCode)
      const encodedTitle = encodeURIComponent(title)
      const encodedDesc = encodeURIComponent(desc)

      // 高亮源码
      let highlightedCode = ''
      if (md.options.highlight) {
        // Shiki doesn't support 'react' language, usuallly expects 'tsx' or 'jsx'
        const lang = type === 'react' ? 'tsx' : type
        highlightedCode = md.options.highlight(sourceCode, lang, '')
      } else {
        // Fallback fallback escaping
        highlightedCode = md.utils.escapeHtml(sourceCode)
        highlightedCode = `<pre class="language-${type}"><code>${highlightedCode}</code></pre>`
      }

      const encodedHighlight = encodeURIComponent(highlightedCode)

      return `<DemoPreview 
        path="${relativePath}" 
        source="${encodedSource}" 
        highlighted-code="${encodedHighlight}"
        title="${encodedTitle}" 
        description="${encodedDesc}"
        type="${type}"
      />`
    } catch (e) {
      console.error(`[markdown-it-demo] Error reading file: ${absolutePath}`, e)
      return `<div class="text-red-500">Error loading demo: ${e}</div>`
    }
  }

  // 拦截 html_block
  md.renderer.rules.html_block = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    if (!token) return ''
    const content = token.content
    const result = transformDemoTag(content, env)
    if (result) {
      return result
    }
    return defaultHtmlBlock ? defaultHtmlBlock(tokens, idx, options, env, self) : content
  }

  // 拦截 html_inline
  md.renderer.rules.html_inline = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    if (!token) return ''
    const content = token.content
    const result = transformDemoTag(content, env)
    if (result) {
      return result
    }
    return defaultHtmlInline ? defaultHtmlInline(tokens, idx, options, env, self) : content
  }
}
