import type MarkdownIt from 'markdown-it'
import type StateBlock from 'markdown-it/lib/rules_block/state_block.mjs'

interface TabInfo {
  label: string
  content: string
}

/**
 * Markdown-it 插件：处理标签页容器
 *
 * 语法：
 * :::tabs
 * @tab TabName1
 * Content for tab 1
 * @tab TabName2
 * Content for tab 2
 * :::
 */
export const tabsPlugin = (md: MarkdownIt) => {
  // 处理 :::tabs 容器
  const tabsContainerRule = (
    state: StateBlock,
    startLine: number,
    endLine: number,
    silent: boolean
  ): boolean => {
    const startPos = (state.bMarks[startLine] ?? 0) + (state.tShift[startLine] ?? 0)
    const maxPos = state.eMarks[startLine] ?? 0
    const lineText = state.src.slice(startPos, maxPos).trim()

    // 检查是否以 :::tabs 开始
    if (!lineText.startsWith(':::tabs')) {
      return false
    }

    if (silent) {
      return true
    }

    // 寻找结束标记 :::
    let nextLine = startLine + 1
    let found = false

    while (nextLine < endLine) {
      const pos = (state.bMarks[nextLine] ?? 0) + (state.tShift[nextLine] ?? 0)
      const max = state.eMarks[nextLine] ?? 0
      const line = state.src.slice(pos, max).trim()

      if (line === ':::') {
        found = true
        break
      }
      nextLine++
    }

    if (!found) {
      return false
    }

    // 提取容器内容
    const contentStart = state.bMarks[startLine + 1] ?? 0
    const contentEnd = state.bMarks[nextLine] ?? 0
    const content = state.src.slice(contentStart, contentEnd)

    // 解析标签页
    const tabs = parseTabsContent(content, md)

    // 创建 token
    const token = state.push('tabs_container', 'div', 0)
    token.content = content
    token.map = [startLine, nextLine + 1]
    token.meta = { tabs }

    state.line = nextLine + 1

    return true
  }

  // 解析标签页内容
  function parseTabsContent(content: string, md: MarkdownIt): TabInfo[] {
    const tabs: TabInfo[] = []
    const lines = content.split('\n')

    let currentTab: TabInfo | null = null
    let currentContent: string[] = []

    for (const line of lines) {
      const tabMatch = line.match(/^@tab\s+(.+)$/)

      if (tabMatch && tabMatch[1]) {
        // 保存上一个标签页
        if (currentTab) {
          currentTab.content = md.render(currentContent.join('\n').trim())
          tabs.push(currentTab)
        }

        // 开始新标签页
        currentTab = {
          label: tabMatch[1].trim(),
          content: ''
        }
        currentContent = []
      } else if (currentTab) {
        currentContent.push(line)
      }
    }

    // 保存最后一个标签页
    if (currentTab) {
      currentTab.content = md.render(currentContent.join('\n').trim())
      tabs.push(currentTab)
    }

    return tabs
  }

  // 渲染标签页容器
  md.renderer.rules.tabs_container = (tokens, idx) => {
    const token = tokens[idx]
    if (!token) return ''
    const tabs: TabInfo[] = token.meta?.tabs || []

    if (tabs.length === 0) {
      return ''
    }

    // 生成唯一ID
    const containerId = `tabs-${Math.random().toString(36).substring(2, 9)}`

    // 生成标签按钮
    const tabButtons = tabs
      .map(
        (tab, index) =>
          `<button class="tab-btn${index === 0 ? ' active' : ''}" data-tab-index="${index}">${escapeHtml(tab.label)}</button>`
      )
      .join('')

    // 生成标签内容
    const tabPanels = tabs
      .map(
        (tab, index) =>
          `<div class="tab-panel${index === 0 ? ' active' : ''}" data-tab-index="${index}">${tab.content}</div>`
      )
      .join('')

    return `
<div class="tabs-container" id="${containerId}">
  <div class="tabs-header">
    ${tabButtons}
    <div class="tab-indicator"></div>
  </div>
  <div class="tabs-content">
    ${tabPanels}
  </div>
</div>
`
  }

  // 注册规则
  md.block.ruler.before('fence', 'tabs_container', tabsContainerRule)
}

/**
 * 转义 HTML 特殊字符
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
