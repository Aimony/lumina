import { onMounted, onUnmounted } from 'vue'

export function useCodeCopy() {
  const handleCopy = async (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('.code-copy-btn')
    if (!target) return

    const wrapper = target.closest('.code-block-wrapper')
    if (!wrapper) return

    const pre = wrapper.querySelector('pre')
    if (!pre) return

    const code = pre.textContent || ''

    try {
      await navigator.clipboard.writeText(code)

      // Provide feedback
      const originalHtml = target.innerHTML
      target.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>'

      setTimeout(() => {
        target.innerHTML = originalHtml
      }, 2000)
    } catch (err) {
      console.error('Failed to copy code: ', err)
    }
  }

  onMounted(() => {
    window.addEventListener('click', handleCopy)
  })

  onUnmounted(() => {
    window.removeEventListener('click', handleCopy)
  })
}
