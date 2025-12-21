import type MarkdownIt from 'markdown-it'

/**
 * markdown-it 插件：为所有图片添加懒加载属性
 *
 * 功能：
 * - 自动为 Markdown 中的图片添加 loading="lazy" 属性
 * - 防止线上带宽不足造成页面卡顿
 * - 优化首屏加载性能
 */
export function imageLazyPlugin(md: MarkdownIt): void {
  // 保存原始的图片渲染规则
  const defaultImageRender =
    md.renderer.rules.image ||
    function (tokens, idx, options, _env, self) {
      return self.renderToken(tokens, idx, options)
    }

  // 重写图片渲染规则
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx]

    if (token) {
      // 添加 loading="lazy" 属性
      token.attrSet('loading', 'lazy')

      // 添加 decoding="async" 属性，进一步优化性能
      token.attrSet('decoding', 'async')
    }

    // 调用原始渲染规则
    return defaultImageRender(tokens, idx, options, env, self)
  }
}
