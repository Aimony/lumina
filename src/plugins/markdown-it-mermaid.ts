import type MarkdownIt from 'markdown-it'

/**
 * 将 HTML 特殊字符转义，用于在 data-* 属性中安全存储 Mermaid 代码
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Markdown-it 插件：处理 Mermaid 代码块
 *
 * 将 ```mermaid 代码块转换为 <div class="mermaid-container"> 容器，
 * 而非走默认的代码高亮流程。客户端 JavaScript 会在页面加载后渲染这些容器。
 */
export const mermaidPlugin = (md: MarkdownIt) => {
  const fence = md.renderer.rules.fence!

  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args
    const token = tokens[idx]
    const lang = token.info.trim().split(/\s+/)[0] || ''

    // 只处理 mermaid 代码块
    if (lang === 'mermaid') {
      const code = token.content.trim()
      // 将 mermaid 代码存储在 data-graph 属性中，客户端渲染时读取
      return `
<div class="mermaid-container">
  <pre class="mermaid-source" style="display: none;">${escapeHtml(code)}</pre>
  <div class="mermaid-diagram"></div>
</div>
`
    }

    // 其他语言走默认的代码高亮流程
    return fence(tokens, idx, args[2], args[3], args[4])
  }
}
