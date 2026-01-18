<!-- 回到顶部组件 -->
<template>
  <div
    class="back-to-top-cat"
    :style="{
      top: top + 'px',
      display: isMobile ? 'none' : 'block'
    }"
    @click="scrollToTop"
    title="回到顶部"
  ></div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const route = useRoute()
const top = ref<number>(-900)
const offsetHeight = ref<number>(0)
const isMobile = ref<boolean>(false)

// 检测是否为移动端
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 点击回到顶部
const scrollToTop = () => {
  top.value = -900
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

let timer: ReturnType<typeof setTimeout> | null = null

const updatePosition = () => {
  if (!timer) {
    timer = setTimeout(() => {
      if (typeof document !== 'undefined') {
        const doc = document.documentElement
        const scrollTop = doc.scrollTop
        const scrollHeight = doc.scrollHeight
        const clientHeight = doc.clientHeight // Visual viewport height

        // Only show after scrolling down a bit
        if (scrollTop < 100) {
          top.value = -900
        } else {
          // Calculate max scrollable distance
          const maxScroll = scrollHeight - clientHeight
          // Calculate scroll percentage (0 to 1)
          const scrollPercent = Math.min(scrollTop / maxScroll, 1)

          // Target range for top:
          // Start: -900 (hidden above)
          // End: clientHeight - 900 (bottom aligned with viewport bottom)
          const targetTop = clientHeight - 900

          // Interpolate
          // actually we want it to slide down as we scroll.
          // If we want it to be fully visible ONLY at the very bottom, use full interpolation.
          // The previous logic brought it down gradually.

          // Let's ensure it never exceeds targetTop.
          // Previous logic: -900 + (scrollTop / H) * 900.
          // Let's modify to: -900 + scrollPercent * (clientHeight)
          // But clamped to not exceed targetTop.

          // Simplified approach: Map scrollPercent 0..1 to -900..targetTop
          top.value = -900 + scrollPercent * (targetTop - -900)
        }
      }
      timer = null
    }, 50) // Reduced throttle time slightly for smoother animation
  }
}

onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  window.addEventListener('scroll', updatePosition)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updatePosition)
  window.removeEventListener('resize', checkIsMobile)
})

// 路由变化时重新计算高度
watch(
  () => route.path,
  () => {
    nextTick(() => {
      if (typeof document !== 'undefined') {
        offsetHeight.value = document.documentElement.offsetHeight
      }
    })
  }
)
</script>

<style scoped>
@keyframes float {
  0% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }

  100% {
    transform: translateY(0);
  }
}

.back-to-top-cat {
  cursor: pointer;
  position: fixed;
  right: 0px;
  top: -900px;
  z-index: 1000;
  width: 70px;
  height: 900px;
  background: url('/img/scroll.gif');
  background-repeat: no-repeat;
  background-position: bottom right;
  transition: all 0.5s ease-in-out;
  opacity: 1;
}

.back-to-top-cat:hover {
  animation: float 2s linear infinite;
}

/* 移动端隐藏 */
@media (max-width: 768px) {
  .back-to-top-cat {
    display: none !important;
  }
}
</style>
