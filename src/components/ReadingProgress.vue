<script setup lang="ts">
import { computed } from 'vue'
import { useReadingProgress } from '@/composables/useReadingProgress'

const { progress } = useReadingProgress()

const radius = 10
const circumference = 2 * Math.PI * radius
const strokeDashoffset = computed(() => {
  return circumference - (progress.value / 100) * circumference
})

const percentage = computed(() => Math.round(progress.value))
</script>

<template>
  <div class="reading-progress-circle">
    <svg class="progress-ring" width="24" height="24" viewBox="0 0 24 24">
      <circle
        class="progress-ring__circle bg"
        stroke="currentColor"
        stroke-width="2"
        fill="transparent"
        r="10"
        cx="12"
        cy="12"
      />
      <circle
        class="progress-ring__circle progress"
        stroke="currentColor"
        stroke-width="2"
        fill="transparent"
        r="10"
        cx="12"
        cy="12"
        :style="{ strokeDasharray: `${circumference} ${circumference}`, strokeDashoffset }"
      />
    </svg>
    <div class="progress-text">{{ percentage }}</div>
  </div>
</template>

<style scoped>
.reading-progress-circle {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring__circle {
  transition: stroke-dashoffset 0.1s;
}

.progress-ring__circle.bg {
  color: var(--vp-c-divider);
}

.progress-ring__circle.progress {
  color: var(--vp-c-brand-1);
}

.progress-text {
  position: absolute;
  font-size: 8px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
</style>
