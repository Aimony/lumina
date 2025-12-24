import type MarkdownIt from 'markdown-it'

/**
 * Markdown-it 插件:将压缩包文件标签转换为 Vue 组件
 * 支持的语法: <ArchiveFileCard src="..." name="..." />
 */
export function archivePreviewPlugin(md: MarkdownIt) {
  // 保存原始的 html_inline 渲染规则
  const defaultHtmlInlineRender =
    md.renderer.rules.html_inline ||
    function (tokens, idx, options, _env, self) {
      return self.renderToken(tokens, idx, options)
    }

  // 重写 html_inline 渲染规则
  md.renderer.rules.html_inline = function (tokens, idx, options, env, self) {
    const token = tokens[idx]
    if (!token) {
      return defaultHtmlInlineRender(tokens, idx, options, env, self)
    }
    const content = token.content

    // 匹配 <ArchiveFileCard src="..." name="..." />
    const archiveMatch = content.match(/<ArchiveFileCard\s+src="([^"]+)"\s+name="([^"]+)"\s*\/>/i)

    if (archiveMatch) {
      const src = archiveMatch[1]
      const name = archiveMatch[2]

      // 返回 Vue 组件标签
      return `<ArchiveFileCard src="${src}" name="${name}" />`
    }

    // 如果不匹配,使用默认渲染
    return defaultHtmlInlineRender(tokens, idx, options, env, self)
  }
}
