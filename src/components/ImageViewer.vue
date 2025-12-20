<script setup lang="ts">
defineProps<{
  image: string | null
}>()

const emit = defineEmits<{
  close: []
}>()

// 点击遮罩层关闭
const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="image-viewer">
      <div v-if="image" class="image-viewer" @click="handleBackdropClick">
        <div class="image-container">
          <img :src="image" alt="Preview" class="preview-image" />
        </div>
        <button class="close-button" @click="emit('close')" aria-label="关闭">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.image-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

:global(.dark) .image-viewer {
  background-color: rgba(0, 0, 0, 0.95);
}

.image-container {
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  user-select: none;
  cursor: default;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.close-button {
  position: fixed;
  top: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.close-button:active {
  transform: scale(0.95);
}

/* 过渡动画 */
.image-viewer-enter-active,
.image-viewer-leave-active {
  transition: opacity 0.3s ease;
}

.image-viewer-enter-active .preview-image,
.image-viewer-leave-active .preview-image {
  transition: transform 0.3s ease;
}

.image-viewer-enter-from,
.image-viewer-leave-to {
  opacity: 0;
}

.image-viewer-enter-from .preview-image {
  transform: scale(0.9);
}

.image-viewer-leave-to .preview-image {
  transform: scale(0.9);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .close-button {
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
  }

  .image-container {
    max-width: 95vw;
    max-height: 85vh;
  }

  .preview-image {
    max-height: 85vh;
  }
}
</style>
