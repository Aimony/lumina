<script setup lang="ts">
import { ref, computed, watch, defineAsyncComponent } from 'vue'

const props = defineProps<{
  file: { src: string; name: string; type: string } | null
}>()

const emit = defineEmits<{
  close: []
}>()

// 动态加载对应的 vue-office 组件
const VueOfficeDocx = defineAsyncComponent(() => import('@vue-office/docx'))
const VueOfficeExcel = defineAsyncComponent(() => import('@vue-office/excel'))
const VueOfficePptx = defineAsyncComponent(() => import('@vue-office/pptx'))
const VueOfficePdf = defineAsyncComponent(() => import('@vue-office/pdf'))

// 当前使用的组件
const currentComponent = computed(() => {
  if (!props.file) return null
  switch (props.file.type) {
    case 'word':
      return VueOfficeDocx
    case 'excel':
      return VueOfficeExcel
    case 'ppt':
      return VueOfficePptx
    case 'pdf':
      return VueOfficePdf
    default:
      return null
  }
})

// 加载状态
const isLoading = ref(true)
const hasError = ref(false)

// 文件加载成功
function onRendered() {
  isLoading.value = false
}

// 文件加载失败
function onError(e: Error) {
  console.error('Office file render error:', e)
  isLoading.value = false
  hasError.value = true
}

// 监听文件变化，重置状态
watch(
  () => props.file,
  () => {
    isLoading.value = true
    hasError.value = false
  }
)

// 下载文件
function downloadFile() {
  if (!props.file) return
  const link = document.createElement('a')
  link.href = props.file.src
  link.download = props.file.name
  link.click()
}

// 关闭模态框
function closeModal() {
  emit('close')
}

// ESC 键关闭
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    closeModal()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="file"
        class="office-preview-overlay"
        @click.self="closeModal"
        @keydown="handleKeydown"
        tabindex="0"
      >
        <div class="office-preview-modal">
          <!-- 工具栏 -->
          <div class="office-preview-toolbar">
            <div class="toolbar-left">
              <span class="file-name">{{ file.name }}</span>
            </div>
            <div class="toolbar-right">
              <button class="toolbar-btn" @click="downloadFile" title="下载文件">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
              <button class="toolbar-btn close-btn" @click="closeModal" title="关闭">
                <svg
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

          <!-- 内容区域 -->
          <div class="office-preview-content">
            <!-- 加载中 -->
            <div v-if="isLoading" class="preview-loading">
              <div class="loading-spinner"></div>
              <span>正在加载文档...</span>
            </div>

            <!-- 错误提示 -->
            <div v-if="hasError" class="preview-error">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>文档加载失败</span>
              <button class="retry-btn" @click="downloadFile">下载文件查看</button>
            </div>

            <!-- 文档预览 -->
            <component
              v-if="currentComponent && !hasError"
              :is="currentComponent"
              :src="file.src"
              @rendered="onRendered"
              @error="onError"
              class="office-viewer"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.office-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.office-preview-modal {
  width: 95vw;
  height: 95vh;
  max-width: 1400px;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.dark .office-preview-modal {
  background: #1a1a1a;
}

.office-preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.dark .office-preview-toolbar {
  background: #2a2a2a;
  border-bottom-color: #3a3a3a;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.dark .file-name {
  color: #eee;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

.dark .toolbar-btn {
  color: #aaa;
}

.dark .toolbar-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.close-btn:hover {
  background: #ff4444;
  color: #fff;
}

.office-preview-content {
  flex: 1;
  overflow: auto;
  position: relative;
}

.preview-loading,
.preview-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #666;
}

.dark .preview-loading,
.dark .preview-error {
  color: #999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.retry-btn {
  margin-top: 8px;
  padding: 8px 16px;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.retry-btn:hover {
  background: #2980b9;
}

.office-viewer {
  width: 100%;
  height: 100%;
}

/* 过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .office-preview-modal,
.modal-leave-active .office-preview-modal {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .office-preview-modal,
.modal-leave-to .office-preview-modal {
  transform: scale(0.95);
}
</style>
