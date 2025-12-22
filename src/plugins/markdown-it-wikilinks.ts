import type MarkdownIt from 'markdown-it'

/**
 * markdown-it plugin for Obsidian-style wikilinks
 * Matches [[link]] and [[link|text]]
 */
export function wikilinksPlugin(md: MarkdownIt) {
  md.inline.ruler.push('wikilink', (state, silent) => {
    const src = state.src
    const pos = state.pos

    // Check for ![[ (Embed) or [[ (Link)
    let isEmbed = false
    let start = pos

    if (src.charCodeAt(pos) === 0x21) {
      // '!'
      if (src.charCodeAt(pos + 1) === 0x5b && src.charCodeAt(pos + 2) === 0x5b) {
        // '![['
        isEmbed = true
        start = pos + 2 + 1 // pos + 3
      } else {
        return false
      }
    } else if (src.charCodeAt(pos) === 0x5b && src.charCodeAt(pos + 1) === 0x5b) {
      // '[['
      start = pos + 2
    } else {
      return false
    }

    // Find closing brackets ]]
    const end = src.indexOf(']]', start)
    if (end === -1) {
      return false
    }

    const content = src.slice(start, end)

    // Don't allow newlines in wikilinks
    if (content.includes('\n')) {
      return false
    }

    if (!silent) {
      const parts = content.split('|')
      const target = parts[0]?.trim() || ''
      const text = parts.length > 1 ? parts.slice(1).join('|').trim() : target

      if (isEmbed) {
        // Render as image
        const token = state.push('image', 'img', 0)
        token.attrs = [
          ['src', target],
          ['alt', text]
        ]
        token.children = []
      } else {
        // Render as link
        const token = state.push('link_open', 'a', 1)
        token.attrSet('href', target)
        token.attrSet('class', 'wikilink')

        const textToken = state.push('text', '', 0)
        textToken.content = text

        state.push('link_close', 'a', -1)
      }
    }

    state.pos = end + 2
    return true
  })
}
