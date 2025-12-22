<script setup lang="ts">
import { computed } from 'vue'
import { useReadingProgress } from '@/composables/article/useReadingProgress'

const { progress } = useReadingProgress()

const radius = 18
const circumference = 2 * Math.PI * radius
const strokeDashoffset = computed(() => {
  return circumference - (progress.value / 100) * circumference
})

const percentage = computed(() => Math.round(progress.value))

// 点击返回顶部
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <!-- 悬浮阅读进度指示器 -->
  <Transition name="progress-fade">
    <div v-if="progress > 0" class="fixed right-6 bottom-6 z-50 flex items-center justify-center">
      <!-- 主容器 - 玻璃拟态效果 -->
      <div
        @click="scrollToTop"
        class="progress-container relative flex items-center justify-center w-14 h-14 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 hover:shadow-xl cursor-pointer"
        title="点击返回顶部"
      >
        <!-- SVG 进度环 -->
        <svg class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
          <!-- 背景圆环 -->
          <circle
            class="progress-bg"
            stroke="currentColor"
            stroke-width="3"
            fill="transparent"
            :r="radius"
            cx="22"
            cy="22"
          />
          <!-- 进度圆环 - 使用主题色 -->
          <circle
            class="progress-ring transition-all duration-150 ease-out"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            fill="transparent"
            :r="radius"
            cx="22"
            cy="22"
            :style="{
              strokeDasharray: `${circumference} ${circumference}`,
              strokeDashoffset
            }"
          />
        </svg>

        <!-- 百分比文字 -->
        <span class="progress-text relative z-10 text-xs font-semibold tabular-nums">
          {{ percentage }}%
        </span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* 进入/离开过渡动画 */
.progress-fade-enter-active,
.progress-fade-leave-active {
  transition: all 0.3s ease;
}

.progress-fade-enter-from,
.progress-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

/* 主容器背景 - 跟随主题切换 */
.progress-container {
  background-color: var(--vp-c-bg-elv);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--vp-c-divider);
}

/* 进度环背景 */
.progress-bg {
  color: var(--vp-c-divider);
}

/* 进度环使用主题色 */
.progress-ring {
  color: var(--vp-c-brand-1);
}

/* 百分比文字颜色 */
.progress-text {
  color: var(--vp-c-text-1);
}
</style>
