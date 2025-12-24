import type MarkdownIt from 'markdown-it'

export const codeEnhancementsPlugin = (md: MarkdownIt) => {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (...args: any[]) => {
    const [tokens, idx] = args
    const token = tokens[idx]
    const lang = token.info.trim().split(/\s+/)[0] || ''

    // Get the original render result
    const rawCode = fence(tokens, idx, args[2], args[3], args[4])

    // If no language, just return original
    // if (!lang) return rawCode

    return `
<div class="code-block-wrapper">
  <div class="code-block-header">
    <div class="mac-controls">
      <div class="mac-icon mac-icon-red"></div>
      <div class="mac-icon mac-icon-yellow"></div>
      <div class="mac-icon mac-icon-green"></div>
    </div>
    <div class="code-header-right">
      ${lang ? `<span class="code-lang">${lang}</span>` : ''}
      <button class="code-copy-btn" title="Copy Code">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      </button>
    </div>
  </div>
  <div class="code-block-content">
    ${rawCode}
  </div>
  <div class="code-resize-handle" title="拖拽调整高度">
    <div class="resize-handle-bar"></div>
  </div>
</div>
`
  }
}
