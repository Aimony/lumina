<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import mermaid from 'mermaid'

const props = defineProps<{
  code: string
}>()

// 状态
const scale = ref(1)
const isFullscreen = ref(false)
const isRendered = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const showCopyTip = ref(false)
const svgContent = ref('')

// 拖拽状态
const isDragging = ref(false)
const translateX = ref(0)
const translateY = ref(0)
const startX = ref(0)
const startY = ref(0)
const lastTranslateX = ref(0)
const lastTranslateY = ref(0)

// 缩放配置
const MIN_SCALE = 0.25
const MAX_SCALE = 3
const SCALE_STEP = 0.25
const WHEEL_SCALE_FACTOR = 0.001

// 获取当前主题
function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark')
}

// 渲染 Mermaid 图表
async function renderDiagram() {
  if (!props.code.trim()) return

  try {
    mermaid.initialize({
      startOnLoad: false,
      theme: isDarkMode() ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit'
    })

    const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const { svg } = await mermaid.render(id, props.code.trim())
    svgContent.value = svg
    isRendered.value = true
    hasError.value = false
  } catch (error) {
    hasError.value = true
    errorMessage.value = error instanceof Error ? error.message : '渲染失败'
    console.error('Mermaid 渲染错误:', error)
  }
}

// 放大
function zoomIn() {
  if (scale.value < MAX_SCALE) {
    scale.value = Math.min(scale.value + SCALE_STEP, MAX_SCALE)
  }
}

// 缩小
function zoomOut() {
  if (scale.value > MIN_SCALE) {
    scale.value = Math.max(scale.value - SCALE_STEP, MIN_SCALE)
  }
}

// 归位
function resetZoom() {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

// 复制原代码
async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.code)
    showCopyTip.value = true
    setTimeout(() => {
      showCopyTip.value = false
    }, 2000)
  } catch {
    console.error('复制失败')
  }
}

// 切换全屏
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
    // 进入全屏时重置位置
    translateX.value = 0
    translateY.value = 0
  } else {
    document.body.style.overflow = ''
  }
}

// 关闭全屏（ESC 键）
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isFullscreen.value) {
    toggleFullscreen()
  }
}

// 鼠标滚轮缩放
function handleWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = -e.deltaY * WHEEL_SCALE_FACTOR
  const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale.value + delta))
  scale.value = newScale
}

// 拖拽开始
function handleMouseDown(e: MouseEvent) {
  // 只响应左键
  if (e.button !== 0) return

  isDragging.value = true
  startX.value = e.clientX
  startY.value = e.clientY
  lastTranslateX.value = translateX.value
  lastTranslateY.value = translateY.value

  // 改变鼠标样式
  document.body.style.cursor = 'grabbing'
  document.body.style.userSelect = 'none'
}

// 拖拽移动
function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return

  const deltaX = e.clientX - startX.value
  const deltaY = e.clientY - startY.value

  translateX.value = lastTranslateX.value + deltaX
  translateY.value = lastTranslateY.value + deltaY
}

// 拖拽结束
function handleMouseUp() {
  if (!isDragging.value) return

  isDragging.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// 监听主题变化
let themeObserver: MutationObserver | null = null

onMounted(() => {
  renderDiagram()

  // 监听主题变化
  themeObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.attributeName === 'class') {
        renderDiagram()
        break
      }
    }
  })

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })

  // 监听 ESC 键
  document.addEventListener('keydown', handleKeydown)

  // 全局监听鼠标事件（用于拖拽）
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

// 组件卸载时清理
onUnmounted(() => {
  themeObserver?.disconnect()
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  if (isFullscreen.value) {
    document.body.style.overflow = ''
  }
})

// 监听 code 变化重新渲染
watch(
  () => props.code,
  () => {
    renderDiagram()
  }
)

// 计算 transform 样式
const diagramTransform = () => {
  return `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`
}
</script>

<template>
  <!-- 正常视图 -->
  <div ref="containerRef" class="mermaid-component" :class="{ error: hasError }">
    <!-- 工具栏 -->
    <div class="mermaid-toolbar">
      <div class="toolbar-left">
        <span class="diagram-label">Mermaid</span>
      </div>
      <div class="toolbar-right">
        <!-- 缩放显示 -->
        <span class="zoom-level">{{ Math.round(scale * 100) }}%</span>

        <!-- 缩小 -->
        <button class="toolbar-btn" title="缩小" :disabled="scale <= MIN_SCALE" @click="zoomOut">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>

        <!-- 放大 -->
        <button class="toolbar-btn" title="放大" :disabled="scale >= MAX_SCALE" @click="zoomIn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>

        <!-- 归位 -->
        <button class="toolbar-btn" title="归位 (100%)" @click="resetZoom">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>

        <!-- 复制代码 -->
        <button class="toolbar-btn" title="复制代码" @click="copyCode">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <span v-if="showCopyTip" class="copy-tip">已复制!</span>
        </button>

        <!-- 全屏 -->
        <button class="toolbar-btn" title="全屏查看" @click="toggleFullscreen">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 图表区域 -->
    <div
      ref="contentRef"
      class="mermaid-content"
      :class="{ dragging: isDragging }"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
    >
      <div
        ref="diagramRef"
        class="mermaid-diagram"
        :style="{ transform: diagramTransform() }"
        v-html="svgContent"
      />
      <span v-if="!isRendered && !hasError" class="loading">正在加载图表...</span>
      <div v-if="hasError" class="mermaid-error">
        {{ errorMessage }}
      </div>
    </div>
  </div>

  <!-- 全屏模态框 -->
  <Teleport to="body">
    <div v-if="isFullscreen" class="mermaid-fullscreen-overlay" @click.self="toggleFullscreen">
      <div class="fullscreen-container">
        <!-- 全屏工具栏 -->
        <div class="fullscreen-toolbar">
          <div class="toolbar-left">
            <span class="diagram-label">Mermaid 图表</span>
            <span class="drag-hint">💡 滚轮缩放 · 拖拽移动</span>
          </div>
          <div class="toolbar-right">
            <span class="zoom-level">{{ Math.round(scale * 100) }}%</span>
            <button
              class="toolbar-btn"
              title="缩小"
              :disabled="scale <= MIN_SCALE"
              @click="zoomOut"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>
            <button class="toolbar-btn" title="放大" :disabled="scale >= MAX_SCALE" @click="zoomIn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>
            <button class="toolbar-btn" title="归位" @click="resetZoom">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </button>
            <button class="toolbar-btn" title="复制代码" @click="copyCode">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <button class="toolbar-btn close-btn" title="关闭 (ESC)" @click="toggleFullscreen">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 全屏图表内容 -->
        <div
          class="fullscreen-content"
          :class="{ dragging: isDragging }"
          @wheel="handleWheel"
          @mousedown="handleMouseDown"
        >
          <div
            class="mermaid-diagram fullscreen-diagram"
            :style="{ transform: diagramTransform() }"
            v-html="svgContent"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.mermaid-component {
  margin: 1.5rem 0;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.mermaid-component:hover {
  border-color: var(--vp-c-brand-soft);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

:global(html.dark) .mermaid-component:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.mermaid-component.error {
  border-color: var(--vp-c-danger-1, #da3633);
}

/* 工具栏 */
.mermaid-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: var(--vp-c-bg-alt);
  border-bottom: 1px solid var(--vp-c-divider);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.diagram-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  opacity: 0.8;
}

.drag-hint {
  font-size: 11px;
  color: var(--vp-c-text-3);
  opacity: 0.7;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.zoom-level {
  font-size: 11px;
  color: var(--vp-c-text-3);
  min-width: 40px;
  text-align: right;
  margin-right: 8px;
}

.toolbar-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background-color: transparent;
  color: var(--vp-c-text-2);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.toolbar-btn:hover:not(:disabled) {
  background-color: var(--vp-c-bg);
  color: var(--vp-c-brand-1);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.copy-tip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 4px;
  padding: 4px 8px;
  background-color: var(--vp-c-brand-1);
  color: white;
  font-size: 11px;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 10;
}

/* 图表内容区 */
.mermaid-content {
  padding: 1.5rem;
  overflow: hidden;
  max-height: 600px;
  text-align: center;
  cursor: grab;
  user-select: none;
}

.mermaid-content.dragging {
  cursor: grabbing;
}

.mermaid-diagram {
  display: inline-block;
  transform-origin: center center;
  transition: transform 0.1s ease;
}

.mermaid-content.dragging .mermaid-diagram {
  transition: none;
}

.mermaid-diagram :deep(svg) {
  max-width: none;
  height: auto;
  pointer-events: none;
}

.loading {
  color: var(--vp-c-text-3);
  font-size: 0.9em;
}

.mermaid-error {
  color: var(--vp-c-danger-1, #da3633);
  font-size: 0.9em;
  padding: 1rem;
}

/* 全屏模态框 */
.mermaid-fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.fullscreen-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-height: 100vh;
}

.fullscreen-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
}

.fullscreen-toolbar .diagram-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.fullscreen-toolbar .drag-hint {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.fullscreen-toolbar .toolbar-btn {
  color: rgba(255, 255, 255, 0.7);
  width: 32px;
  height: 32px;
}

.fullscreen-toolbar .toolbar-btn:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.fullscreen-toolbar .zoom-level {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.close-btn:hover {
  background-color: rgba(218, 54, 51, 0.3) !important;
  color: #ff6b6b !important;
}

.fullscreen-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 2rem;
  cursor: grab;
  user-select: none;
}

.fullscreen-content.dragging {
  cursor: grabbing;
}

.fullscreen-content.dragging .fullscreen-diagram {
  transition: none;
}

.fullscreen-diagram {
  background-color: var(--vp-c-bg-soft, #ffffff);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transform-origin: center center;
  transition: transform 0.1s ease;
}

:global(html.dark) .fullscreen-diagram {
  background-color: var(--vp-c-bg-soft, #1a1a1a);
}
</style>
