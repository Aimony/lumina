<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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
  // Check initial state
  updateProgress()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateProgress)
})
</script>

<template>
  <div class="reading-progress-bar" :style="{ width: `${progress}%` }"></div>
</template>

<style scoped>
.reading-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  background-color: var(--vp-c-brand-1);
  z-index: 100;
  transition: width 0.1s;
  pointer-events: none;
}
</style>
