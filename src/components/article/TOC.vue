<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, inject, computed, type Ref } from 'vue'

interface Heading {
  id: string
  text: string
  level: number
}

const props = defineProps<{
  headings: Heading[]
}>()

// 沉浸式阅读模式
const immersiveModeRef = inject<Ref<boolean>>('immersiveMode')
const toggleImmersive = inject<() => void>('toggleImmersive', () => {})
const contentWidthRef = inject<Ref<number>>('contentWidth')
const setContentWidth = inject<(width: number) => void>('setContentWidth', () => {})

// 安全访问 inject 的值
const isImmersive = computed(() => immersiveModeRef?.value ?? false)
const currentWidth = computed(() => contentWidthRef?.value ?? 60) // 默认 60%

// 显示宽度提示
const showWidthTip = ref(false)
let hideWidthTipTimeout: ReturnType<typeof setTimeout> | null = null

// 鼠标滚轮调节宽度（百分比）
const onWheel = (e: WheelEvent) => {
  if (!isImmersive.value) return

  e.preventDefault()
  const delta = e.deltaY > 0 ? -5 : 5 // 向下滚动减小，向上滚动增大
  const newWidth = Math.min(90, Math.max(40, currentWidth.value + delta))
  setContentWidth(newWidth)

  // 显示宽度提示
  showWidthTip.value = true
  if (hideWidthTipTimeout) {
    clearTimeout(hideWidthTipTimeout)
  }
  hideWidthTipTimeout = setTimeout(() => {
    showWidthTip.value = false
  }, 1000)
}

const activeId = ref('')

// 滚动高亮当前章节
const updateActiveHeading = () => {
  const headingElements = props.headings
    .map((h) => document.getElementById(h.id))
    .filter(Boolean) as HTMLElement[]

  const scrollY = window.scrollY + 100 // 偏移量

  for (let i = headingElements.length - 1; i >= 0; i--) {
    const el = headingElements[i]
    if (el && el.offsetTop <= scrollY) {
      activeId.value = props.headings[i]?.id || ''
      return
    }
  }

  if (headingElements.length > 0) {
    activeId.value = props.headings[0]?.id || ''
  }
}

onMounted(() => {
  window.addEventListener('scroll', updateActiveHeading)
  updateActiveHeading()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveHeading)
})

// 当 headings 更新时重新计算
watch(() => props.headings, updateActiveHeading)

const scrollTo = (id: string) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<!-- 文章目录大纲 -->
<template>
  <div v-if="headings.length > 0" class="toc-container">
    <div class="toc-header">
      <div class="toc-title">本页目录</div>
      <div class="immersive-controls" @wheel.prevent="onWheel">
        <button
          class="immersive-toggle"
          @click="toggleImmersive"
          :class="{ active: isImmersive }"
          :title="isImmersive ? '退出沉浸式阅读（滚轮调节宽度）' : '沉浸式阅读'"
        >
          <!-- 眼睛图标 -->
          <svg
            v-if="!isImmersive"
            class="icon-eye"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <!-- 闭眼图标 -->
          <svg
            v-else
            class="icon-eye-off"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
            />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        </button>
        <!-- 宽度提示 -->
        <Transition name="tip-fade">
          <div v-if="showWidthTip && isImmersive" class="width-tip">{{ currentWidth }}%</div>
        </Transition>
      </div>
    </div>

    <ul class="toc-list">
      <li
        v-for="heading in headings"
        :key="heading.id"
        :class="{ 'toc-item-nested': heading.level === 3 }"
      >
        <a
          @click.prevent="scrollTo(heading.id)"
          :href="'#' + heading.id"
          class="toc-link"
          :class="{ active: activeId === heading.id }"
        >
          {{ heading.text }}
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.toc-container {
  padding-left: 16px;
  border-left: 1px solid var(--vp-c-divider);
}

.toc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-right: 0;
}

.toc-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.immersive-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.25s ease;
}

.immersive-toggle:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.immersive-toggle.active {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.icon-eye,
.icon-eye-off {
  width: 16px;
  height: 16px;
}

.immersive-controls {
  position: relative;
}

.width-tip {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  padding: 6px 12px;
  background: var(--vp-c-bg-elevated);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  white-space: nowrap;
  z-index: 100;
}

/* 提示淡入淡出动画 */
.tip-fade-enter-active,
.tip-fade-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.tip-fade-enter-from,
.tip-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item-nested {
  margin-left: 12px;
}

.toc-link {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  padding: 4px 0;
  line-height: 1.5;
  transition: color 0.25s;
}

.toc-link:hover {
  color: var(--vp-c-text-1);
}

.toc-link.active {
  color: var(--vp-c-brand-1);
}
</style>
