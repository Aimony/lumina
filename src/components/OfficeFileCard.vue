<script setup lang="ts">
import { computed, inject } from 'vue'
import WordIcon from '@/assets/office/Word.svg'
import ExcelIcon from '@/assets/office/Excel.svg'
import PptIcon from '@/assets/office/PPT.svg'
import PdfIcon from '@/assets/office/PDF.svg'

const props = defineProps<{
  src: string
  name: string
  type: 'word' | 'excel' | 'ppt' | 'pdf'
}>()

// 注入预览状态
const setPreviewFile =
  inject<(file: { src: string; name: string; type: string } | null) => void>('setOfficePreviewFile')

// 文件类型配置
interface FileTypeConfig {
  icon: string
  label: string
  color: string
  bgColor: string
}

const fileTypeConfig = computed((): FileTypeConfig => {
  const configs: Record<string, FileTypeConfig> = {
    word: {
      icon: WordIcon,
      label: 'Word 文档',
      color: '#2b579a',
      bgColor: 'rgba(43, 87, 154, 0.1)'
    },
    excel: {
      icon: ExcelIcon,
      label: 'Excel 表格',
      color: '#217346',
      bgColor: 'rgba(33, 115, 70, 0.1)'
    },
    ppt: {
      icon: PptIcon,
      label: 'PowerPoint 演示',
      color: '#d24726',
      bgColor: 'rgba(210, 71, 38, 0.1)'
    },
    pdf: {
      icon: PdfIcon,
      label: 'PDF 文档',
      color: '#f40f02',
      bgColor: 'rgba(244, 15, 2, 0.1)'
    }
  }
  return configs[props.type] ?? configs.word!
})

// 打开预览
function openPreview() {
  if (setPreviewFile) {
    setPreviewFile({
      src: props.src,
      name: props.name,
      type: props.type
    })
  }
}
</script>

<template>
  <button
    class="office-file-card"
    :style="{
      '--card-color': fileTypeConfig.color,
      '--card-bg': fileTypeConfig.bgColor
    }"
    @click="openPreview"
    data-context-type="office"
    :data-context-src="src"
    :data-context-name="name"
    :data-context-file-type="type"
  >
    <img :src="fileTypeConfig.icon" alt="" class="office-file-icon" />
    <span class="office-file-info">
      <span class="office-file-name">{{ name }}</span>
      <span class="office-file-type">{{ fileTypeConfig.label }}</span>
    </span>
    <span class="office-file-action">
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
.office-file-card {
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
}

.office-file-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--card-color) 20%, transparent);
  border-color: var(--card-color);
}

.office-file-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  object-fit: contain;
}

.office-file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.office-file-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--card-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.office-file-type {
  font-size: 12px;
  color: #666;
}

.dark .office-file-type {
  color: #999;
}

.office-file-action {
  flex-shrink: 0;
  color: var(--card-color);
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.office-file-card:hover .office-file-action {
  opacity: 1;
}
</style>
