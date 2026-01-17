import { onMounted, onUnmounted, ref } from 'vue'

/**
 * LaTeX 公式点击复制功能
 * 点击公式即可复制原始 Markdown 公式，并显示轻量提示
 */
export function useLatexCopy() {
  const tooltipEl = ref<HTMLElement | null>(null)
  let hideTimeout: ReturnType<typeof setTimeout> | null = null

  // 创建提示元素
  const createTooltip = () => {
    const el = document.createElement('div')
    el.className = 'latex-copy-tooltip'
    el.textContent = '已复制公式'
    document.body.appendChild(el)
    return el
  }

  // 显示提示 (屏幕中上方固定位置)
  const showTooltip = () => {
    if (!tooltipEl.value) return

    // 清除之前的隐藏定时器
    if (hideTimeout) {
      clearTimeout(hideTimeout)
    }

    tooltipEl.value.classList.add('visible')

    // 1.5 秒后隐藏
    hideTimeout = setTimeout(() => {
      tooltipEl.value?.classList.remove('visible')
    }, 1500)
  }

  const handleClick = async (e: MouseEvent) => {
    const target = e.target as HTMLElement

    // 查找 KaTeX 元素（行内公式或块级公式）
    const katexEl =
      target.closest('.katex-display') || // 块级公式
      target.closest('.katex') // 行内公式

    if (!katexEl) return

    // 如果是 .katex-display，真正的 katex 元素可能在里面
    // 我们希望闪光和提示是针对实际内容的
    const actualEl = katexEl.classList.contains('katex-display')
      ? katexEl.querySelector('.katex') || katexEl
      : katexEl

    // 获取原始公式（从 data-latex 属性或 annotation 标签）
    // 注意：data-latex 通常在父级或 annotation 上
    let latex = katexEl.getAttribute('data-latex')

    // 如果没有 data-latex，尝试从 annotation[encoding="application/x-tex"] 获取
    if (!latex) {
      const annotation = katexEl.querySelector('annotation[encoding="application/x-tex"]')
      if (annotation) {
        latex = annotation.textContent
      }
    }

    if (!latex) return

    // 判断是否是块级公式，添加适当的分隔符
    const isBlock = katexEl.classList.contains('katex-display')
    const formulaText = isBlock ? `$$${latex}$$` : `$${latex}$`

    try {
      await navigator.clipboard.writeText(formulaText)

      // 显示提示
      showTooltip()

      // 添加复制成功的视觉反馈
      // 必须转为 HTMLElement 才能访问 classList
      const elToAnimate = actualEl as HTMLElement
      elToAnimate.classList.add('latex-copied')

      // 动画持续 600ms
      setTimeout(() => {
        elToAnimate.classList.remove('latex-copied')
      }, 600)
    } catch (err) {
      console.error('Failed to copy LaTeX formula: ', err)
    }
  }

  onMounted(() => {
    tooltipEl.value = createTooltip()
    window.addEventListener('click', handleClick)
  })

  onUnmounted(() => {
    window.removeEventListener('click', handleClick)
    if (tooltipEl.value) {
      tooltipEl.value.remove()
    }
    if (hideTimeout) {
      clearTimeout(hideTimeout)
    }
  })
}
