<script setup lang="ts">
import { ref } from 'vue'
import { useKonamiCode } from '@/composables/ui/useKonamiCode'

const isActive = ref(false)
const ANIMATION_DURATION = 4000 // 动画持续时间

const triggerEasterEgg = () => {
  if (isActive.value) return // 防止重复触发

  isActive.value = true

  // 添加全站效果类
  document.documentElement.classList.add('easter-egg-hue-rotate')

  // 获取主要内容元素并添加重力崩溃效果
  const elements = document.querySelectorAll(
    'main, .navbar, footer, article, section, .card, img, h1, h2, h3, p, button, a'
  )

  elements.forEach((el, index) => {
    const htmlEl = el as HTMLElement
    htmlEl.style.setProperty('--fall-delay', `${index * 50}ms`)
    htmlEl.style.setProperty('--fall-rotate', `${(Math.random() - 0.5) * 60}deg`)
    htmlEl.style.setProperty('--fall-offset', `${(Math.random() - 0.5) * 200}px`)
    htmlEl.classList.add('easter-egg-gravity-fall')
  })

  // 动画结束后恢复
  setTimeout(() => {
    document.documentElement.classList.remove('easter-egg-hue-rotate')
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.classList.remove('easter-egg-gravity-fall')
      htmlEl.style.removeProperty('--fall-delay')
      htmlEl.style.removeProperty('--fall-rotate')
      htmlEl.style.removeProperty('--fall-offset')
    })
    isActive.value = false
  }, ANIMATION_DURATION)
}

// 监听 Konami Code
useKonamiCode(triggerEasterEgg)
</script>

<template>
  <Teleport to="body">
    <div v-if="isActive" class="easter-egg-flash" />
  </Teleport>
</template>

<style lang="scss">
// 色相旋转动画
@keyframes hue-rotate-cycle {
  0% {
    filter: hue-rotate(0deg);
  }

  25% {
    filter: hue-rotate(90deg);
  }

  50% {
    filter: hue-rotate(180deg);
  }

  75% {
    filter: hue-rotate(270deg);
  }

  100% {
    filter: hue-rotate(360deg);
  }
}

// 重力崩溃动画
@keyframes gravity-fall {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 1;
  }

  20% {
    transform: translateY(-20px) translateX(var(--fall-offset, 0))
      rotate(calc(var(--fall-rotate, 0deg) * 0.2));
  }

  100% {
    transform: translateY(100vh) translateX(var(--fall-offset, 0)) rotate(var(--fall-rotate, 30deg));
    opacity: 0;
  }
}

// 恢复动画
@keyframes gravity-recover {
  0% {
    transform: translateY(100vh) rotate(var(--fall-rotate, 30deg));
    opacity: 0;
  }

  60% {
    transform: translateY(-10px) rotate(0deg);
    opacity: 1;
  }

  80% {
    transform: translateY(5px) rotate(0deg);
  }

  100% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
}

// 闪光效果
@keyframes flash {
  0% {
    opacity: 1;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, transparent 70%);
  }

  100% {
    opacity: 0;
    background: radial-gradient(circle, rgba(255, 255, 255, 0) 0%, transparent 70%);
  }
}

// 全站色相旋转
.easter-egg-hue-rotate {
  animation: hue-rotate-cycle 1s linear infinite;
}

// 重力崩溃效果
.easter-egg-gravity-fall {
  animation:
    gravity-fall 2s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards,
    gravity-recover 1.5s ease-out 2.5s forwards;
  animation-delay: var(--fall-delay, 0ms);
}

// 触发时的闪光
.easter-egg-flash {
  position: fixed;
  inset: 0;
  z-index: 99999;
  pointer-events: none;
  animation: flash 0.5s ease-out forwards;
}
</style>
