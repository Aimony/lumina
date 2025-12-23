<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAllArticles } from '@/composables/core/useSearch'

const router = useRouter()
const isAnimating = ref(false)

const handleRandomWalk = async () => {
  if (isAnimating.value) return

  isAnimating.value = true

  try {
    const articles = await getAllArticles()
    if (articles.length === 0) {
      console.warn('No articles found for random walk')
      isAnimating.value = false
      return
    }

    // 随机选择一篇文章
    const randomIndex = Math.floor(Math.random() * articles.length)
    const randomArticle = articles[randomIndex]

    // 导航到随机文章（带有优雅的过渡动画）
    if (randomArticle) {
      // 确保使用绝对路径
      const path = randomArticle.id.startsWith('/') ? randomArticle.id : `/${randomArticle.id}`
      router.push(path)
    }
  } catch (error) {
    console.error('Random walk failed:', error)
  } finally {
    // 动画结束后重置状态
    setTimeout(() => {
      isAnimating.value = false
    }, 600)
  }
}
</script>

<!-- 随机漫步 -->
<template>
  <button
    @click="handleRandomWalk"
    class="random-walk-btn"
    :class="{ 'is-animating': isAnimating }"
    title="随机漫步 - 发现一篇被遗忘的笔记"
    :disabled="isAnimating"
  >
    <span class="dice-icon">🎲</span>
    <span class="sparkle sparkle-1">✨</span>
    <span class="sparkle sparkle-2">✨</span>
    <span class="sparkle sparkle-3">✨</span>
  </button>
</template>

<style scoped>
.random-walk-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  margin-right: 10px;
}

.random-walk-btn:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2));
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
}

.random-walk-btn:active {
  transform: scale(0.95);
}

.random-walk-btn:disabled {
  cursor: not-allowed;
}

.dice-icon {
  font-size: 1.25rem;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.random-walk-btn:hover .dice-icon {
  animation: shake 0.5s ease-in-out;
}

.random-walk-btn.is-animating .dice-icon {
  animation: roll 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 闪烁的星星效果 */
.sparkle {
  position: absolute;
  font-size: 0.625rem;
  opacity: 0;
  pointer-events: none;
}

.sparkle-1 {
  top: 2px;
  right: 2px;
}

.sparkle-2 {
  bottom: 2px;
  left: 2px;
}

.sparkle-3 {
  top: 50%;
  left: -4px;
  transform: translateY(-50%);
}

.random-walk-btn.is-animating .sparkle {
  animation: sparkle-burst 0.6s ease-out forwards;
}

.random-walk-btn.is-animating .sparkle-1 {
  animation-delay: 0s;
}

.random-walk-btn.is-animating .sparkle-2 {
  animation-delay: 0.1s;
}

.random-walk-btn.is-animating .sparkle-3 {
  animation-delay: 0.2s;
}

@keyframes shake {
  0%,
  100% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(-10deg);
  }

  75% {
    transform: rotate(10deg);
  }
}

@keyframes roll {
  0% {
    transform: rotate(0deg) scale(1);
  }

  25% {
    transform: rotate(180deg) scale(1.2);
  }

  50% {
    transform: rotate(360deg) scale(1);
  }

  75% {
    transform: rotate(540deg) scale(1.1);
  }

  100% {
    transform: rotate(720deg) scale(1);
  }
}

@keyframes sparkle-burst {
  0% {
    opacity: 0;
    transform: scale(0) translate(0, 0);
  }

  50% {
    opacity: 1;
    transform: scale(1.2) translate(var(--tx, 8px), var(--ty, -8px));
  }

  100% {
    opacity: 0;
    transform: scale(0.5) translate(var(--tx-end, 16px), var(--ty-end, -16px));
  }
}

.sparkle-1 {
  --tx: 8px;
  --ty: -8px;
  --tx-end: 16px;
  --ty-end: -16px;
}

.sparkle-2 {
  --tx: -8px;
  --ty: 8px;
  --tx-end: -16px;
  --ty-end: 16px;
}

.sparkle-3 {
  --tx: -12px;
  --ty: 0;
  --tx-end: -24px;
  --ty-end: 0;
}

/* 深色模式下的增强效果 */
:root.dark .random-walk-btn {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15));
}

:root.dark .random-walk-btn:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(236, 72, 153, 0.25));
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.35);
}
</style>
