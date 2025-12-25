<script setup lang="ts">
import { ref, inject } from 'vue'
import BandizipLogo from '@/assets/office/Bandizip_logo.png'

const props = defineProps<{
  src: string
  name: string
}>()

// 注入压缩包预览状态
const setArchivePreviewFile = inject<(file: File | null) => void>('setArchivePreviewFile')

const loading = ref(false)

const handleClick = async () => {
  if (!setArchivePreviewFile || loading.value) return

  loading.value = true
  try {
    const response = await fetch(props.src)
    if (!response.ok) throw new Error('Network response was not ok')

    const blob = await response.blob()
    const file = new File([blob], props.name, { type: 'application/zip' })

    setArchivePreviewFile(file)
  } catch (error) {
    console.error('Failed to fetch archive:', error)
    alert('无法加载压缩包文件')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <button
    class="archive-file-card"
    :class="{ 'is-loading': loading }"
    @click="handleClick"
    :disabled="loading"
    data-context-type="archive"
    :data-context-src="src"
    :data-context-name="name"
  >
    <div class="archive-icon-wrapper">
      <img :src="BandizipLogo" class="archive-icon" alt="Archive" />
      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
      </div>
    </div>

    <span class="archive-info">
      <span class="archive-name">{{ name }}</span>
      <span class="archive-type">ZIP 压缩包</span>
    </span>

    <span class="archive-action">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
      </svg>
    </span>
  </button>
</template>

<style scoped>
.archive-file-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 400px;
  padding: 16px 20px;
  margin: 16px 0;
  background: rgba(255, 171, 0, 0.1);
  /* Amber/Orange tint */
  border: 1px solid rgba(255, 171, 0, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  font-family: inherit;
  position: relative;
  overflow: hidden;
}

.archive-file-card:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 171, 0, 0.15);
  border-color: #ffab00;
}

.archive-file-card:disabled {
  opacity: 0.7;
  cursor: wait;
}

.archive-icon-wrapper {
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.archive-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.dark .loading-overlay {
  background: rgba(0, 0, 0, 0.6);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ffab00;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.archive-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.archive-name {
  font-size: 14px;
  font-weight: 600;
  color: #d48806;
  /* Darker amber for text */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .archive-name {
  color: #ffc107;
}

.archive-type {
  font-size: 12px;
  color: #666;
}

.dark .archive-type {
  color: #999;
}

.archive-action {
  flex-shrink: 0;
  color: #ffab00;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.archive-file-card:hover .archive-action {
  opacity: 1;
}
</style>
