import { onMounted, onUnmounted } from 'vue'

export function useCodeFold() {
  const handleFold = (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('.mac-icon-red')
    if (!target) return

    const wrapper = target.closest('.code-block-wrapper')
    if (!wrapper) return

    wrapper.classList.toggle('collapsed')
  }

  onMounted(() => {
    window.addEventListener('click', handleFold)
  })

  onUnmounted(() => {
    window.removeEventListener('click', handleFold)
  })
}
