<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useReadingProgress } from '@/composables/article/useReadingProgress'
import { useImmersiveMode } from '@/composables/layout/useImmersiveMode'

interface Heading {
  id: string
  text: string
  level: number
}

const props = defineProps<{
  headings: Heading[]
}>()

// 阅读进度
const { progress } = useReadingProgress()
const percentage = computed(() => Math.round(progress.value))

// 沉浸式阅读模式 - 使用 Pinia store
const {
  immersiveMode,
  contentWidth,
  contentBgColor,
  toggleImmersive,
  setContentWidth,
  setContentBgColor
} = useImmersiveMode()

// 计算属性
const isImmersive = computed(() => immersiveMode.value)
const currentWidth = computed(() => contentWidth.value)
// 当前选中的颜色，如果没有设置则为空（即默认）
const currentColor = computed(() => contentBgColor.value)

// 护眼颜色预设
const colorPresets = [
  { name: '默认', value: '' },
  { name: '暖光', value: '#FAF9DE' }, // 杏仁黄
  { name: '护眼', value: '#E3EDCD' }, // 豆沙绿
  { name: '暗灰', value: '#F5F5F5' } // 极简灰
]

// 显示颜色选择器
const showColorPicker = ref(false)
const toggleColorPicker = () => {
  showColorPicker.value = !showColorPicker.value
}
const selectColor = (color: string) => {
  setContentBgColor(color)
  showColorPicker.value = false
}

// 颜色选择器自动关闭
let hideColorPickerTimeout: ReturnType<typeof setTimeout> | null = null
const onPickerMouseEnter = () => {
  if (hideColorPickerTimeout) {
    clearTimeout(hideColorPickerTimeout)
    hideColorPickerTimeout = null
  }
}
const onPickerMouseLeave = () => {
  hideColorPickerTimeout = setTimeout(() => {
    showColorPicker.value = false
  }, 300)
}

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
    // 更新 URL hash，类似 VitePress 的锚点链接
    history.replaceState(null, '', `#${id}`)
  }
}
</script>

<!-- 文章目录大纲 -->
<template>
  <div v-if="headings.length > 0" class="toc-container">
    <div class="toc-header">
      <div class="toc-title">本页目录</div>
      <div class="toc-controls">
        <!-- 阅读进度 -->
        <span v-if="progress > 0" class="reading-progress">{{ percentage }}%</span>

        <!-- 调色盘按钮 -->
        <div
          class="palette-container"
          @mouseleave="onPickerMouseLeave"
          @mouseenter="onPickerMouseEnter"
        >
          <button
            class="icon-button palette-toggle"
            @click="toggleColorPicker"
            :class="{ active: showColorPicker || currentColor }"
            title="设置背景颜色"
          >
            <svg
              viewBox="0 0 24 24"
              class="icon-palette"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
          </button>

          <!-- 颜色选择面板 -->
          <Transition name="fade">
            <div v-if="showColorPicker" class="color-picker-popup">
              <div
                v-for="color in colorPresets"
                :key="color.name"
                class="color-option"
                :class="{ active: currentColor === color.value }"
                @click="selectColor(color.value)"
                :title="color.name"
              >
                <div
                  class="color-circle"
                  :style="
                    color.value
                      ? { backgroundColor: color.value }
                      : { background: 'var(--vp-c-bg)' }
                  "
                ></div>
                <!-- <span class="color-name">{{ color.name }}</span> -->
              </div>
            </div>
          </Transition>
        </div>

        <div class="immersive-controls" @wheel.prevent="onWheel">
          <button
            class="icon-button immersive-toggle"
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
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

.toc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-right: 0;
}

.toc-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toc-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.icon-eye,
.icon-eye-off {
  width: 16px;
  height: 16px;
}

.icon-palette {
  width: 16px;
  height: 16px;
}

.icon-button {
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

.icon-button:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

/* 激活状态：保持透明背景，只改变图标颜色 */
.icon-button.active {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
}

.palette-container {
  display: flex;
  position: relative;
}

.color-picker-popup {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  padding: 8px;
  background: var(--vp-c-bg-elevated);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 8px;
  z-index: 100;
}

.color-option {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--vp-c-divider);
  padding: 2px;
  transition:
    transform 0.2s,
    border-color 0.2s;
}

.color-option:hover {
  transform: scale(1.1);
  border-color: var(--vp-c-text-2);
}

.color-option.active {
  border-color: var(--vp-c-brand-1);
  transform: scale(1.1);
}

.color-circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.05);
  /* 微弱描边增加可见度 */
}

/* 通用淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
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
  flex: 1;
  overflow-y: auto;

  /* 隐藏滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
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
  transition:
    color 0.25s,
    transform 0.25s;
  transform-origin: left;
  display: inline-block;
  /* 必须是块级或行内块级元素才能 transform */
  width: 100%;
}

.toc-link:hover {
  color: var(--vp-c-text-1);
  transform: scale(1.05);
}

.toc-link.active {
  color: var(--vp-c-brand-1);
}

.reading-progress {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-right: 8px;
  font-variant-numeric: tabular-nums;
  opacity: 0.8;
}
</style>
