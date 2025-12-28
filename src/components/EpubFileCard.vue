<script setup lang="ts">
import { computed, inject } from 'vue'
import EpubIcon from '@/assets/office/Epub.svg'

const props = defineProps<{
  src: string
  name: string
}>()

// 注入预览状态
const setPreviewFile =
  inject<(file: { src: string; name: string } | null) => void>('setEpubPreviewFile')

// 文件类型配置
const fileTypeConfig = computed(() => ({
  icon: EpubIcon,
  label: 'EPUB 电子书',
  color: '#059669',
  bgColor: 'rgba(5, 150, 105, 0.1)'
}))

// 打开预览
function openPreview() {
  if (setPreviewFile) {
    setPreviewFile({
      src: props.src,
      name: props.name
    })
  }
}
</script>

<template>
  <button
    class="epub-file-card"
    :style="{
      '--card-color': fileTypeConfig.color,
      '--card-bg': fileTypeConfig.bgColor
    }"
    @click="openPreview"
    data-context-type="epub"
    :data-context-src="src"
    :data-context-name="name"
  >
    <img :src="fileTypeConfig.icon" alt="" class="epub-file-icon" />
    <span class="epub-file-info">
      <span class="epub-file-name">{{ name }}</span>
      <span class="epub-file-type">{{ fileTypeConfig.label }}</span>
    </span>
    <span class="epub-file-action">
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

<style scoped lang="scss">
.epub-file-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 400px;
  padding: 0px 16px;
  background: var(--card-bg);
  border: 1px solid color-mix(in srgb, var(--card-color) 30%, transparent);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  font-family: inherit;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px color-mix(in srgb, var(--card-color) 20%, transparent);
    border-color: var(--card-color);

    .epub-file-action {
      opacity: 1;
    }
  }
}

.epub-file-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  object-fit: contain;
}

.epub-file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.epub-file-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--card-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.epub-file-type {
  font-size: 12px;
  color: #666;

  .dark & {
    color: #999;
  }
}

.epub-file-action {
  flex-shrink: 0;
  color: var(--card-color);
  opacity: 0.6;
  transition: opacity 0.2s ease;
}
</style>
