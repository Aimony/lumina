import type MarkdownIt from 'markdown-it'
import type { RenderRule } from 'markdown-it/lib/renderer.mjs'

/**
 * markdown-it 插件：将独占一行的链接标记为卡片样式
 *
 * 检测逻辑：
 * - 链接必须独占整个段落
 * - 段落中除了链接外只能有空白字符
 */
export function linkCardPlugin(md: MarkdownIt) {
  // 保存原始的段落渲染规则
  const defaultParagraphOpen: RenderRule =
    md.renderer.rules.paragraph_open ||
    function (tokens, idx, options, _env, self) {
      return self.renderToken(tokens, idx, options)
    }

  // 重写段落开始标签的渲染规则
  md.renderer.rules.paragraph_open = function (tokens, idx, options, _env, self) {
    const token = tokens[idx]
    if (!token) return defaultParagraphOpen(tokens, idx, options, _env, self)

    const nextToken = tokens[idx + 1]

    // 检查下一个 token 是否为 inline 类型
    if (nextToken && nextToken.type === 'inline' && nextToken.children) {
      const children = nextToken.children

      // 过滤掉纯空白的文本节点
      const nonEmptyChildren = children.filter((child) => {
        if (child.type === 'text') {
          return !/^\s*$/.test(child.content)
        }
        return true
      })

      // 检查是否只有一个链接
      // 格式：link_open + (text/image) + link_close
      if (
        nonEmptyChildren.length === 3 &&
        nonEmptyChildren[0] &&
        nonEmptyChildren[0].type === 'link_open' &&
        nonEmptyChildren[1] &&
        nonEmptyChildren[2] &&
        nonEmptyChildren[2].type === 'link_close'
      ) {
        // 获取链接 Token（已在上面验证存在）
        const linkToken = nonEmptyChildren[0]
        const contentToken = nonEmptyChildren[1]

        // 获取链接 URL
        const href = linkToken.attrGet('href') || ''

        // 获取链接文本
        let linkText = ''
        if (contentToken.type === 'text') {
          linkText = contentToken.content
        } else if (contentToken.type === 'image') {
          linkText = contentToken.content
        }

        // 添加特殊 class 标记这是一个卡片链接
        token.attrPush(['class', 'link-card-wrapper'])

        // 在 link_open token 上添加数据属性
        linkToken.attrPush(['class', 'link-card'])
        linkToken.attrPush(['data-link-card', 'true'])
        linkToken.attrPush(['data-url', href])
        linkToken.attrPush(['data-text', linkText])
        linkToken.attrPush(['target', '_blank'])
        linkToken.attrPush(['rel', 'noopener noreferrer'])
      }
    }

    return defaultParagraphOpen(tokens, idx, options, _env, self)
  }
}
