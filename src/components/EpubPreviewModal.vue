<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import ePub from 'epubjs'
import type Book from 'epubjs/types/book'
import type Rendition from 'epubjs/types/rendition'

const props = defineProps<{
  file: { src: string; name: string } | null
}>()

const emit = defineEmits<{
  close: []
}>()

// DOM 引用
const viewerRef = ref<HTMLDivElement | null>(null)

// 加载状态
const isLoading = ref(true)
const hasError = ref(false)
const errorMessage = ref('')

// EPUB 实例
let book: Book | null = null
let rendition: Rendition | null = null

// 清理 EPUB 实例
function cleanup() {
  if (rendition) {
    rendition.destroy()
    rendition = null
  }
  if (book) {
    book.destroy()
    book = null
  }
}

// 初始化 EPUB
async function initEpub(url: string) {
  if (!viewerRef.value) return

  cleanup()
  isLoading.value = true
  hasError.value = false
  errorMessage.value = ''

  try {
    // 创建 Book 实例
    book = ePub(url)

    // 等待书籍加载完成
    await book.ready

    // 创建 Rendition
    rendition = book.renderTo(viewerRef.value, {
      width: '100%',
      height: '100%',
      spread: 'none',
      flow: 'paginated'
    })

    // 监听渲染完成事件
    rendition.on('rendered', () => {
      isLoading.value = false
    })

    // 监听错误
    rendition.on('displayError', (err: Error) => {
      console.error('EPUB display error:', err)
      hasError.value = true
      errorMessage.value = err.message || '电子书渲染失败'
      isLoading.value = false
    })

    // 显示第一页
    await rendition.display()
    isLoading.value = false
  } catch (err) {
    console.error('EPUB init error:', err)
    hasError.value = true
    errorMessage.value = err instanceof Error ? err.message : '电子书加载失败'
    isLoading.value = false
  }
}

// 翻页
function prevPage() {
  if (rendition) {
    rendition.prev()
  }
}

function nextPage() {
  if (rendition) {
    rendition.next()
  }
}

// 监听文件变化
watch(
  () => props.file,
  async (newFile) => {
    if (newFile) {
      await nextTick()
      // 延迟一帧确保 DOM 已渲染
      requestAnimationFrame(() => {
        initEpub(newFile.src)
      })
    } else {
      cleanup()
    }
  },
  { immediate: true }
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
  cleanup()
  emit('close')
}

// ESC 键关闭，箭头键翻页
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    closeModal()
  } else if (e.key === 'ArrowLeft') {
    prevPage()
  } else if (e.key === 'ArrowRight') {
    nextPage()
  }
}

// 键盘事件监听
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  cleanup()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="file" class="epub-preview-overlay" @click.self="closeModal" tabindex="0">
        <div class="epub-preview-modal">
          <!-- 工具栏 -->
          <div class="epub-preview-toolbar">
            <div class="toolbar-left">
              <span class="file-name">{{ file.name }}</span>
            </div>
            <div class="toolbar-right">
              <!-- 翻页按钮 -->
              <button class="toolbar-btn" @click="prevPage" title="上一页">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button class="toolbar-btn" @click="nextPage" title="下一页">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <div class="toolbar-divider"></div>
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
          <div class="epub-preview-content">
            <!-- 加载中 -->
            <div v-if="isLoading" class="preview-loading">
              <div class="loading-spinner"></div>
              <span>正在加载电子书...</span>
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
              <span>{{ errorMessage || '电子书加载失败' }}</span>
              <button class="retry-btn" @click="downloadFile">下载文件查看</button>
            </div>

            <!-- EPUB 阅读器容器 -->
            <div
              ref="viewerRef"
              class="epub-viewer"
              :class="{ 'is-hidden': isLoading || hasError }"
            ></div>

            <!-- 翻页热区 -->
            <div v-if="!isLoading && !hasError" class="page-nav prev-page" @click="prevPage">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </div>
            <div v-if="!isLoading && !hasError" class="page-nav next-page" @click="nextPage">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.epub-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.epub-preview-modal {
  width: 95vw;
  height: 95vh;
  max-width: 1200px;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

  .dark & {
    background: #1a1a1a;
  }
}

.epub-preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;

  .dark & {
    background: #2a2a2a;
    border-bottom-color: #3a3a3a;
  }
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

  .dark & {
    color: #eee;
  }
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #ddd;
  margin: 0 4px;

  .dark & {
    background: #444;
  }
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

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #333;
  }

  .dark & {
    color: #aaa;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
  }

  &.close-btn:hover {
    background: #ff4444;
    color: #fff;
  }
}

.epub-preview-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  min-height: 0;
  background: #fafafa;

  .dark & {
    background: #1e1e1e;
  }

  &:hover .page-nav {
    opacity: 0.5;
  }
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
  z-index: 10;
  background: #fff;

  .dark & {
    color: #999;
    background: #1a1a1a;
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: #059669;
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
  background: #059669;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #047857;
  }
}

.epub-viewer {
  width: 100%;
  height: 100%;

  &.is-hidden {
    visibility: hidden;
  }
}

// 翻页热区
.page-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: #666;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.05), transparent);
  border-radius: 8px;

  &:hover {
    opacity: 1;
  }

  .dark & {
    color: #aaa;
  }
}

.prev-page {
  left: 8px;

  .dark & {
    background: linear-gradient(to right, rgba(255, 255, 255, 0.05), transparent);
  }
}

.next-page {
  right: 8px;
  background: linear-gradient(to left, rgba(0, 0, 0, 0.05), transparent);

  .dark & {
    background: linear-gradient(to left, rgba(255, 255, 255, 0.05), transparent);
  }
}

// 过渡动画
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;

  .epub-preview-modal {
    transition: transform 0.3s ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .epub-preview-modal {
    transform: scale(0.95);
  }
}
</style>
