import { ref, onMounted, onUnmounted } from 'vue'

export function useReadingProgress() {
  const progress = ref(0)

  const updateProgress = () => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight

    if (docHeight > 0) {
      progress.value = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100))
    } else {
      progress.value = 0
    }
  }

  onMounted(() => {
    window.addEventListener('scroll', updateProgress)
    updateProgress()
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', updateProgress)
  })

  return {
    progress
  }
}
