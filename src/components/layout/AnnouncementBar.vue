<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { announcement } from '@/config/announcement'

const STORAGE_KEY = `announcement-closed-${announcement.id}`
const ANNOUNCEMENT_HEIGHT = 36 // px

// 同步读取 localStorage，避免闪烁
const getInitialClosedState = (): boolean => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  }
  return false
}

const isClosed = ref(getInitialClosedState())

// 统一处理公告列表：优先使用 items，否则回退到 text/link
const displayItems = computed(() => {
  if (announcement.items && announcement.items.length > 0) {
    return announcement.items
  }
  return [{ text: announcement.text || '', link: announcement.link }]
})

const isVisible = computed(
  () => announcement.enabled && !isClosed.value && displayItems.value.length > 0
)

// 动态设置 CSS 变量以影响全局布局
watchEffect(() => {
  if (typeof document !== 'undefined') {
    const height = isVisible.value ? `${ANNOUNCEMENT_HEIGHT}px` : '0px'
    document.documentElement.style.setProperty('--announcement-height', height)
  }
})

const closeAnnouncement = () => {
  isClosed.value = true
  localStorage.setItem(STORAGE_KEY, 'true')
}
</script>

<template>
  <Transition name="announcement">
    <div v-if="isVisible" class="announcement-bar">
      <div class="announcement-content">
        <div class="scroll-container">
          <template v-for="(item, index) in displayItems" :key="index">
            <component
              :is="item.link ? 'router-link' : 'span'"
              :to="item.link"
              class="announcement-text"
            >
              {{ item.text }}
            </component>
            <!-- 如果不是最后一项，添加分隔符或间距 -->
            <span v-if="index < displayItems.length - 1" class="separator"></span>
          </template>
        </div>
      </div>
      <button class="close-btn" @click.stop="closeAnnouncement" aria-label="关闭公告">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.announcement-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 40px 0 16px;
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 100;
  background-color: var(--vp-c-brand-1);
  /* 默认品牌色 */
  color: var(--vp-c-bg);
  /* 反色文字 */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 640px) {
    font-size: 0.8rem;
  }
}

.announcement-content {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  max-width: 100%;
}

.scroll-container {
  display: inline-block;
  white-space: nowrap;
  animation: scroll 20s linear infinite;

  &:hover {
    animation-play-state: paused;
  }
}

@keyframes scroll {
  0% {
    transform: translateX(calc(50vw + 50%));
  }

  100% {
    transform: translateX(calc(-50vw - 50%));
  }
}

.announcement-text {
  color: inherit;
  text-decoration: none;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }
}

.separator {
  display: inline-block;
  width: 24px;
  /* 项目间距 */
  height: 100%;
}

.close-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 4px;
  color: inherit;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
}

/* Transition */
.announcement-enter-active,
.announcement-leave-active {
  transition: all 0.3s ease;
}

.announcement-enter-from,
.announcement-leave-to {
  height: 0;
  opacity: 0;
  overflow: hidden;
}
</style>
