<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSmartHover } from '@/composables/article/useSmartHover'

const { visible, position, content, loading, isHoveringCard } = useSmartHover()
const router = useRouter()

// 计算卡片位置样式
const cardStyle = computed(() => {
  if (!position) return {}

  // 基础位置
  const style: Record<string, string> = {
    left: `${position.x}px`,
    top: `${position.y}px`
  }

  return style
})

const handleMouseEnter = () => {
  isHoveringCard.value = true
}

const handleMouseLeave = () => {
  isHoveringCard.value = false
}

const handleClick = () => {
  if (content.value?.id) {
    // 确保使用绝对路径，防止路径叠加 (e.g. example/example/xxx)
    const targetPath = content.value.id.startsWith('/') ? content.value.id : `/${content.value.id}`
    router.push(targetPath)
    visible.value = false
  }
}

// 提取摘要：截取前 150 字符
const excerpt = computed(() => {
  if (!content.value?.content) return ''
  return content.value.content.slice(0, 150) + '...'
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="smart-hover-card"
        :style="cardStyle"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @click="handleClick"
        @wheel.prevent.stop
      >
        <div v-if="loading" class="card-loading">
          <div class="spinner"></div>
          <span>Loading preview...</span>
        </div>

        <div v-else-if="content" class="card-content">
          <h3 class="card-title">{{ content.title }}</h3>
          <p class="card-excerpt">{{ excerpt }}</p>
          <div class="card-footer">
            <span class="read-more">Click to read more</span>
            <div class="card-tags" v-if="content.tags && content.tags.length">
              <span v-for="tag in content.tags.slice(0, 3)" :key="tag" class="card-tag"
                >#{{ tag }}</span
              >
            </div>
          </div>
        </div>

        <div v-else class="card-empty">No preview available</div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.smart-hover-card {
  position: fixed;
  z-index: 1000;
  width: 300px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.15),
    0 4px 8px rgba(0, 0, 0, 0.05);
  padding: 16px;
  backdrop-filter: blur(10px);
  /* 确保不被意外选中文字 */
  user-select: none;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.smart-hover-card:hover {
  transform: translateY(-2px);
  border-color: var(--vp-c-brand-1);
}

.card-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}

.card-excerpt {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}

.read-more {
  color: var(--vp-c-brand-1);
  font-weight: 500;
}

.card-tags {
  display: flex;
  gap: 4px;
}

.card-tag {
  color: var(--vp-c-text-3);
  background-color: var(--vp-c-bg-soft);
  padding: 2px 6px;
  border-radius: 4px;
}

.card-loading,
.card-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: var(--vp-c-text-3);
  font-size: 13px;
  gap: 8px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand-1);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
