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

// 滚动时更新小猫位置
const updatePosition = () => {
  if (!timer) {
    timer = setTimeout(() => {
      if (typeof document !== 'undefined') {
        offsetHeight.value = document.documentElement.offsetHeight
        const scrollTop = document.documentElement.scrollTop
        if (scrollTop < 800) {
          top.value = -900
        } else {
          // 根据滚动位置计算小猫的 top 值
          top.value = (900 - (scrollTop / offsetHeight.value) * 900) * -1
        }
      }
      timer = null
    }, 100)
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
