<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// 菜单状态
const isExpanded = ref(false)

// 路由
const router = useRouter()

// 拖拽相关状态
const isDragging = ref(false)
const position = ref({ x: 24, y: 24 }) // 相对于右下角的偏移
const dragStart = ref({ x: 0, y: 0 })
const positionStart = ref({ x: 0, y: 0 })

// 计算是否可以返回（有历史记录）
const canGoBack = computed(() => {
  return window.history.length > 1
})

// 原路返回
function goBack() {
  if (canGoBack.value) {
    router.back()
  }
}

// 切换菜单展开/收起
function toggleMenu() {
  // 如果正在拖拽，不触发点击
  if (isDragging.value) return
  isExpanded.value = !isExpanded.value
}

// 点击菜单项后自动收起
function handleMenuAction(action: () => void) {
  action()
  isExpanded.value = false
}

// 拖拽开始
function onDragStart(e: MouseEvent | TouchEvent) {
  e.preventDefault()
  isDragging.value = false

  const clientX = 'touches' in e && e.touches[0] ? e.touches[0].clientX : (e as MouseEvent).clientX
  const clientY = 'touches' in e && e.touches[0] ? e.touches[0].clientY : (e as MouseEvent).clientY

  dragStart.value = { x: clientX, y: clientY }
  positionStart.value = { ...position.value }

  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
  document.addEventListener('touchmove', onDragMove, { passive: false })
  document.addEventListener('touchend', onDragEnd)
}

// 拖拽移动
function onDragMove(e: MouseEvent | TouchEvent) {
  e.preventDefault()

  const clientX = 'touches' in e && e.touches[0] ? e.touches[0].clientX : (e as MouseEvent).clientX
  const clientY = 'touches' in e && e.touches[0] ? e.touches[0].clientY : (e as MouseEvent).clientY

  const deltaX = dragStart.value.x - clientX
  const deltaY = dragStart.value.y - clientY

  // 如果移动超过 5px，认为是拖拽而非点击
  if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
    isDragging.value = true
  }

  // 计算新位置（相对于右下角）
  const newX = positionStart.value.x + deltaX
  const newY = positionStart.value.y + deltaY

  // 边界限制
  const menuSize = 56
  const maxX = window.innerWidth - menuSize - 16
  const maxY = window.innerHeight - menuSize - 16

  position.value = {
    x: Math.max(16, Math.min(newX, maxX)),
    y: Math.max(16, Math.min(newY, maxY))
  }
}

// 拖拽结束
function onDragEnd() {
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  document.removeEventListener('touchmove', onDragMove)
  document.removeEventListener('touchend', onDragEnd)

  // 延迟重置，避免触发点击事件
  setTimeout(() => {
    isDragging.value = false
  }, 50)
}

// 组件卸载时清理事件
onUnmounted(() => {
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  document.removeEventListener('touchmove', onDragMove)
  document.removeEventListener('touchend', onDragEnd)
})
</script>

<template>
  <div
    ref="menuRef"
    class="floating-menu"
    :class="{ expanded: isExpanded, dragging: isDragging }"
    :style="{ right: position.x + 'px', bottom: position.y + 'px' }"
  >
    <!-- 主触发按钮 -->
    <button
      class="floating-menu-trigger"
      @mousedown="onDragStart"
      @touchstart="onDragStart"
      @click="toggleMenu"
      :aria-label="isExpanded ? '收起菜单' : '展开菜单'"
    >
      <svg
        class="trigger-icon"
        :class="{ rotated: isExpanded }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>

    <!-- 菜单项列表 -->
    <Transition name="menu-expand">
      <div v-show="isExpanded" class="floating-menu-items">
        <!-- 返回按钮 -->
        <button
          class="floating-menu-item"
          @click="handleMenuAction(goBack)"
          :disabled="!canGoBack"
          :title="canGoBack ? '原路返回' : '没有历史记录'"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span class="menu-item-label">返回</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.floating-menu {
  position: fixed;
  z-index: 1000;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 12px;
  user-select: none;
}

.floating-menu.dragging {
  cursor: grabbing;
}

/* 主触发按钮 */
.floating-menu-trigger {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--vp-c-brand-1) 0%, var(--vp-c-brand-2) 100%);
  border: none;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow:
    0 4px 14px rgba(0, 0, 0, 0.15),
    0 0 0 4px rgba(var(--vp-c-brand-1-rgb, 100, 108, 255), 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  touch-action: none;
}

.floating-menu.dragging .floating-menu-trigger {
  cursor: grabbing;
  transform: scale(1.05);
}

.floating-menu-trigger:hover {
  transform: scale(1.08);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.2),
    0 0 0 6px rgba(var(--vp-c-brand-1-rgb, 100, 108, 255), 0.2);
}

.floating-menu-trigger:active {
  transform: scale(0.95);
}

.trigger-icon {
  width: 24px;
  height: 24px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.trigger-icon.rotated {
  transform: rotate(45deg);
}

/* 菜单项容器 */
.floating-menu-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 单个菜单项 */
.floating-menu-item {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-text-1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.25s ease;
  position: relative;
  overflow: visible;
}

.floating-menu-item:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.floating-menu-item:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.floating-menu-item svg {
  width: 20px;
  height: 20px;
}

/* 菜单项标签（hover 时显示） */
.menu-item-label {
  position: absolute;
  right: calc(100% + 12px);
  white-space: nowrap;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  opacity: 0;
  pointer-events: none;
  transform: translateX(8px);
  transition: all 0.2s ease;
}

.floating-menu-item:hover .menu-item-label {
  opacity: 1;
  transform: translateX(0);
}

/* 菜单展开动画 */
.menu-expand-enter-active,
.menu-expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-expand-enter-from,
.menu-expand-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

/* 响应式：移动端调整 */
@media (max-width: 768px) {
  .floating-menu-trigger {
    width: 48px;
    height: 48px;
  }

  .trigger-icon {
    width: 20px;
    height: 20px;
  }

  .floating-menu-item {
    width: 40px;
    height: 40px;
  }

  .floating-menu-item svg {
    width: 18px;
    height: 18px;
  }
}

/* 暗色模式适配 */
:global(.dark) .floating-menu-trigger {
  box-shadow:
    0 4px 14px rgba(0, 0, 0, 0.3),
    0 0 0 4px rgba(var(--vp-c-brand-1-rgb, 100, 108, 255), 0.2);
}

:global(.dark) .floating-menu-item {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
</style>
