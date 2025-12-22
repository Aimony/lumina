import type MarkdownIt from 'markdown-it'

/**
 * markdown-it plugin for Obsidian-style comments
 * Removes %% content %%
 */
export function commentsPlugin(md: MarkdownIt) {
  md.inline.ruler.push('obsidian_comment', (state, silent) => {
    const src = state.src
    const pos = state.pos

    // Match %%
    if (src.charCodeAt(pos) !== 0x25 || src.charCodeAt(pos + 1) !== 0x25) {
      return false
    }

    // Find closing %%
    const end = src.indexOf('%%', pos + 2)
    if (end === -1) {
      return false
    }

    if (!silent) {
      // We just consume the tokens and output nothing, effectively removing the comment
      // Or we could output an HTML comment if desired, but Obsidian hides them.
    }

    state.pos = end + 2
    return true
  })
}
