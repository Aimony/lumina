import type MarkdownIt from 'markdown-it'

/**
 * markdown-it plugin for Obsidian-style callouts
 * Matches > [!TYPE] Title
 * Support folding with > [!TYPE]+ (open) or > [!TYPE]- (collapsed)
 */
export function obsidianCalloutsPlugin(md: MarkdownIt) {
  // We need to intercept blockquotes that start with [!TYPE]
  // Ideally, we look for paragraphs inside blockquotes that start with [!TYPE]

  // Since implementing a full block parser is complex, we can use a core rule
  // to transform blockquote tokens into details/summary tokens if they match the pattern.

  md.core.ruler.push('obsidian_callout', (state) => {
    const tokens = state.tokens

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === 'blockquote_open') {
        const openToken = tokens[i]
        const closeIndex = findMatchingCloseToken(tokens, i)

        if (closeIndex === -1) continue

        // Look at the first content inside the blockquote
        // It's usually paragraph_open -> inline -> paragraph_close
        const firstContentIndex = i + 1
        if (firstContentIndex >= closeIndex) continue

        if (tokens[firstContentIndex].type === 'paragraph_open') {
          const inlineToken = tokens[firstContentIndex + 1]
          if (inlineToken && inlineToken.type === 'inline' && inlineToken.content) {
            const match = inlineToken.content.match(/^\[!(\w+)\]([+-])?(.*)$/)

            if (match) {
              const type = match[1].toLowerCase()
              const fold = match[2] // + or - or undefined
              const title = match[3].trim()

              // It is a callout!
              // Transform blockquote_open to details_open
              openToken!.type = 'callout_details_open'
              openToken!.tag = 'details'
              openToken!.attrSet('class', `callout callout-${type}`)
              if (fold !== '-') {
                openToken!.attrSet('open', 'true')
              }

              // Transform blockquote_close to details_close
              if (tokens[closeIndex]) {
                tokens[closeIndex].type = 'callout_details_close'
                tokens[closeIndex].tag = 'details'
              }

              // Create summary token
              const summaryOpen = new state.Token('callout_summary_open', 'summary', 1)
              summaryOpen.attrSet('class', 'callout-title')

              const summaryTitle = new state.Token('text', '', 0)
              // If title is empty, use type capitalized
              summaryTitle.content = title || type.charAt(0).toUpperCase() + type.slice(1)

              const summaryClose = new state.Token('callout_summary_close', 'summary', -1)

              // We need to remove the [!TYPE] text from the inline token
              // Or better, replace the paragraph with summary?
              // The [!TYPE] is part of the first paragraph.
              // We should extract the title from there and remove the pattern.

              // Construct: <details><summary>Title</summary><div>Content</div></details>
              // Current structure: <blockquote><p>[!TYPE] Title ...</p>...</blockquote>

              // We want: <details class="callout"><summary>Title</summary><div class="callout-content"><p>...</p>...</div></details>

              // 1. Modify blockquote_open -> details
              // 2. Insert summary tokens after details_open
              // 3. Wrap remaining content in div.callout-content?
              //    Obsidian usually just puts content after summary.
              //    But for styling, a wrapper is nice.
              //    Let's use a div wrapper.

              const contentDivOpen = new state.Token('callout_content_open', 'div', 1)
              contentDivOpen.attrSet('class', 'callout-content')

              const contentDivClose = new state.Token('callout_content_close', 'div', -1)

              // Remove the [!TYPE]... text from the first inline token
              // Actually, usually the title is the rest of the line.
              // The rest of the paragraph content should be the first line of content?
              // Standard Obsidian:
              // > [!INFO] Title
              // > Content

              // If there is text after Title on the same line, it is part of title.
              // Content starts on next line (next paragraph or same paragraph with softbreak?)
              // Markdown parser treats distinct lines in blockquote as one paragraph unless blank line.

              // If we have:
              // > [!INFO] Title
              // > Body
              // It parses as Paragraph: "[!INFO] Title\nBody" (with softbreak)

              // We need to split the first inline token.
              // Find the first softbreak or hardbreak?
              // The regex match `^\[!(\w+)\]([+-])?(.*)$` matches the start string.
              // If strict Obsidian, the title is only the first line.

              // Let's modify the inline token children if they exist, or content.
              if (inlineToken.children) {
                // Logic to clean up children is hard.
                // Simpler: assume the first text node contains the marker.
                // We remove the marker from it.
                // The title we extracted `match[3]` is the title.
                // We should remove the marker line from the content.

                // If the inline content has a newline, we split it?
                // Let's look at `inlineToken.content`.

                // Strategy:
                // 1. Create Summary tokens using the extracted Title.
                // 2. Remove the "[!TYPE] Title" part from the first paragraph.
                //    If the paragraph becomes empty, remove it.

                // Let's try to remove the marker from the source text of the token?
                // Token content: "[!INFO] Title\nContent"
                // Remove "[!INFO] Title": "\nContent" -> "Content"

                const fullMatch = match[0]
                // We need to find where this match ends in the token stream children
                // Too complex to edit children accurately without potentially breaking things.

                // Alternative: Just hide the first paragraph if it only contains the marker?
                // Obsidian behavior:
                // > [!INFO] Title
                // > This is content

                // Parses as:
                // Blockquote
                //   Paragraph
                //     Text: [!INFO] Title
                //     Softbreak
                //     Text: This is content

                // We want:
                // Details
                //   Summary(Title)
                //   Div(Content)
                //     Paragraph
                //       Text: This is content

                // So we insert Summary.
                // Then we remove the "[!INFO] Title" and the Softbreak following it from the first paragraph?

                // Let's iterate children of the inline token.
                const kids = inlineToken.children || []
                let removed = false
                if (kids.length > 0 && kids[0] && kids[0].type === 'text') {
                  const textContent = kids[0].content || ''
                  if (textContent.startsWith(fullMatch)) {
                    kids[0].content = textContent.substring(fullMatch.length).trimStart()
                    // If empty now, remove it?
                    if (!kids[0].content) {
                      kids.shift()
                      // If next is softbreak/hardbreak, remove it too
                      const next = kids[0]
                      if (next && (next.type === 'softbreak' || next.type === 'hardbreak')) {
                        kids.shift()
                      }
                    }
                    removed = true
                  }
                }

                if (!removed) {
                  // Fallback using string replacement if structure is weird
                  inlineToken.content = inlineToken.content.replace(match[0], '').trimStart()
                }

                // If inline token is now effectively empty?
                // Check if children are empty or all formatting with no text?
                // If kids is empty, remove the paragraph?
                if (kids.length === 0) {
                  // Remove paragraph_open (i+1), inline (i+2), paragraph_close (i+3)
                  // But we need to keep the structure valid.
                  // Accessing tokens array and splicing is tricky while iterating.
                  // Mark them as hidden? type = 'hidden'
                  if (tokens[firstContentIndex]) {
                    tokens[firstContentIndex].type = 'hidden'
                    tokens[firstContentIndex].hidden = true
                  }
                  if (tokens[firstContentIndex + 1]) {
                    tokens[firstContentIndex + 1].type = 'hidden'
                    tokens[firstContentIndex + 1].hidden = true
                  }
                  if (tokens[firstContentIndex + 2]) {
                    tokens[firstContentIndex + 2].type = 'hidden'
                    tokens[firstContentIndex + 2].hidden = true
                  }
                }
              }

              // Insert tokens
              // We need to insert Summary + ContentDivOpen after DetailsOpen

              // Splicing into tokens array requires adjusting indices
              // We can't do this easily in a simple for loop without handling index shift.
              // But md.core.ruler allows modification.

              // Insert before firstContentIndex (which is the paragraph)
              // [DetailsOpen, SummaryOpen, Text(Title), SummaryClose, ContentDivOpen, ... (Paragraphs) ..., ContentDivClose, DetailsClose]

              // We already changed tokens[i] to details_open.
              // We need to splice in Summary and ContentDivOpen at i+1
              const newTokens = [summaryOpen, summaryTitle, summaryClose, contentDivOpen]

              tokens.splice(i + 1, 0, ...newTokens)

              // Now we need to find the matching close token again because indices shifted by 4
              // closeIndex was calculating from original array.
              // references to tokens objects are fine.
              // closeIndex needs +4

              // Insert ContentDivClose before the closing details tag
              tokens.splice(closeIndex + 4, 0, contentDivClose)

              // Skip the tokens we just processed
              i = closeIndex + 4 + 1
            }
          }
        }
      }
    }
  })
}

function findMatchingCloseToken(tokens: any[], startIndex: number): number {
  let level = 0
  for (let i = startIndex; i < tokens.length; i++) {
    if (tokens[i].type === 'blockquote_open') {
      level++
    } else if (tokens[i].type === 'blockquote_close') {
      level--
      if (level === 0) {
        return i
      }
    }
  }
  return -1
}
