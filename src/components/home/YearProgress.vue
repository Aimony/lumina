<template>
  <div class="year-progress-container">
    <div class="progress-track">
      <div class="progress-filled" :style="{ width: animatedProgress + '%' }"></div>
    </div>
    <div class="month-markers">
      <div
        v-for="marker in monthMarkers"
        :key="marker.month"
        class="month-marker"
        :style="{ left: marker.position + '%' }"
      ></div>
    </div>
    <div class="tooltip-anchor" :style="{ left: animatedProgress + '%' }">
      <div class="tooltip" :style="{ transform: `translateX(-${animatedProgress}%)` }">
        {{ currentDayTooltipText }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// --- Reactive State for Time ---
const now = ref(new Date())

// --- Date Calculations ---
const year = new Date().getFullYear()
const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
const daysInYear = isLeap ? 366 : 365
const daysInMonths = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

const getDayOfYear = (date) => {
  let dayCount = 0
  for (let i = 0; i < date.getMonth(); i++) {
    dayCount += daysInMonths[i]
  }
  dayCount += date.getDate()
  return dayCount
}

// Calculate precise progress including hours, minutes, and seconds
const progressPercentage = computed(() => {
  const currentDate = now.value // 使用响应式 ref
  const dayOfYear = getDayOfYear(currentDate)
  const secondsInDay = 24 * 60 * 60
  const secondsPassedToday =
    currentDate.getHours() * 3600 + currentDate.getMinutes() * 60 + currentDate.getSeconds()
  const totalProgress = ((dayOfYear - 1 + secondsPassedToday / secondsInDay) / daysInYear) * 100
  return totalProgress
})

const animatedProgress = ref(0)

// --- Animation Logic ---
const animateProgress = () => {
  const target = progressPercentage.value
  const step = (target - animatedProgress.value) / 10 // Smoothly approach target
  animatedProgress.value += step
  if (Math.abs(animatedProgress.value - target) < 0.0000001) {
    animatedProgress.value = target // Snap to target when close enough
  }
  animationFrameId = requestAnimationFrame(animateProgress)
}

let animationFrameId = null
let intervalId = null // 用于存储定时器ID

onMounted(() => {
  // 设置定时器，每秒更新一次时间
  intervalId = setInterval(() => {
    now.value = new Date()
  }, 1000)
  animationFrameId = requestAnimationFrame(animateProgress) // Start animation
})

onUnmounted(() => {
  clearInterval(intervalId) // 清除定时器
  cancelAnimationFrame(animationFrameId) // Clean up animation
})

const currentDayTooltipText = computed(() => {
  const currentDate = now.value // 使用响应式 ref
  return `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${animatedProgress.value.toFixed(7)}% of ${year} passed`
})

// --- Month Markers ---
const monthMarkers = computed(() => {
  const markers = []
  let daysElapsed = 0
  for (let i = 0; i < daysInMonths.length - 1; i++) {
    daysElapsed += daysInMonths[i]
    markers.push({
      month: i + 1,
      position: (daysElapsed / daysInYear) * 100
    })
  }
  return markers
})
</script>

<style scoped>
.year-progress-container {
  position: absolute;
  /* 修改为 absolute，相对于 Navbar 定位 */
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  z-index: 1000;
  display: none;
}

@media (min-width: 768px) {
  .year-progress-container {
    display: block;
  }
}

.progress-track {
  width: 100%;
  height: 100%;
  /* Apply blur effect */
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  position: absolute;
  z-index: 1;
}

.dark .progress-track {
  /* Dark mode blur effect */
  background-color: rgba(36, 36, 36, 0.3);
}

.progress-filled {
  width: 0;
  height: 100%;
  background-color: var(--vp-c-brand-1);
  /* 使用项目品牌色 */
  transition: width 0.1s linear;
  position: absolute;
  z-index: 2;
}

.month-markers {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
}

.month-marker {
  position: absolute;
  top: 0;
  height: 100%;
  width: 1px;
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateX(-50%);
}

.dark .month-marker {
  background-color: rgba(255, 255, 255, 0.1);
}

.tooltip-anchor {
  position: absolute;
  top: 0;
  height: 100%;
  pointer-events: none;
  z-index: 4;
}

.tooltip {
  position: absolute;
  top: 6px;
  /* 调整位置 */
  left: 0;
  /* transform 由内联样式动态控制，以防止在边缘被遮挡 */
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 11px;
  white-space: nowrap;
  border: 1px solid var(--vp-c-divider);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(8px);
}

.year-progress-container:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

/* 更多细节优化 */
.year-progress-container:hover {
  height: 4px;
  /* 悬停时稍微加粗 */
  transition: height 0.2s ease;
}
</style>
