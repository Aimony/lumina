<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const cursorX = ref(0)
const cursorY = ref(0)
const isVisible = ref(false)
const isHovering = ref(false)

// Track hover state for interactive elements
const checkHover = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  // Check if hovering over link, button, or elements with specific pointer cursor
  if (
    target.tagName === 'A' ||
    target.tagName === 'BUTTON' ||
    target.closest('a') ||
    target.closest('button') ||
    window.getComputedStyle(target).cursor === 'pointer'
  ) {
    isHovering.value = true
  } else {
    isHovering.value = false
  }
}

const updateCursor = (e: MouseEvent) => {
  cursorX.value = e.clientX
  cursorY.value = e.clientY
  if (!isVisible.value) isVisible.value = true
  checkHover(e)
}

const handleMouseLeave = () => {
  isVisible.value = false
}

const handleMouseEnter = () => {
  isVisible.value = true
}

onMounted(() => {
  window.addEventListener('mousemove', updateCursor)
  document.addEventListener('mouseleave', handleMouseLeave)
  document.addEventListener('mouseenter', handleMouseEnter)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', updateCursor)
  document.removeEventListener('mouseleave', handleMouseLeave)
  document.removeEventListener('mouseenter', handleMouseEnter)
})
</script>

<template>
  <div class="cursor-container" :class="{ 'is-hidden': !isVisible, 'is-visible': isVisible }">
    <!-- Center Dot (Fast follower, almost instant) -->
    <div
      class="cursor-dot"
      :style="{
        left: `${cursorX}px`,
        top: `${cursorY}px`,
        transform: `translate(-50%, -50%) scale(${isHovering ? 5 : 1})`,
        opacity: isHovering ? 0.5 : 1
      }"
    />
  </div>
</template>

<style lang="scss" scoped>
.cursor-container {
  pointer-events: none;
  position: fixed;
  z-index: 9999;
  inset: 0;
  overflow: hidden;
  transition: opacity 0.3s ease;
  opacity: 0;

  &.is-visible {
    opacity: 1;
  }
}

.cursor-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  // Use Vue theme color variable
  background-color: var(--vp-c-brand-1);
  mix-blend-mode: difference;
  transition: transform 0.3s ease-out;
  will-change: transform, left, top;
}
</style>
