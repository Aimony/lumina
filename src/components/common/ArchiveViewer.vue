<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import JSZip from 'jszip'
import FileTreeNode from './FileTreeNode.vue'

interface FileNode {
  name: string
  path: string
  isDirectory: boolean
  size: number
  date: Date | null
  children?: FileNode[]
  file?: JSZip.JSZipObject
  expanded?: boolean
}

const props = defineProps<{
  file: File | null
}>()

const emit = defineEmits<{
  close: []
}>()

// 状态管理
const isLoading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const fileTree = ref<FileNode[]>([])
const searchQuery = ref('')

// 统计信息
const totalFiles = computed(() => {
  const count = (nodes: FileNode[]): number => {
    return nodes.reduce((acc, node) => {
      if (node.isDirectory) {
        return acc + (node.children ? count(node.children) : 0)
      }
      return acc + 1
    }, 0)
  }
  return count(fileTree.value)
})

const totalSize = computed(() => {
  const sum = (nodes: FileNode[]): number => {
    return nodes.reduce((acc, node) => {
      if (node.isDirectory && node.children) {
        return acc + sum(node.children)
      }
      return acc + (node.size || 0)
    }, 0)
  }
  return sum(fileTree.value)
})

// 格式化文件大小
const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// 构建文件树
const buildFileTree = (zip: JSZip): FileNode[] => {
  const tree: FileNode[] = []
  const pathMap = new Map<string, FileNode>()

  // 先创建所有节点
  Object.keys(zip.files).forEach((path) => {
    const zipFile = zip.files[path]
    const parts = path.split('/')
    let currentPath = ''

    parts.forEach((part, index) => {
      if (!part) return // 跳过空部分

      const parentPath = currentPath
      currentPath = currentPath ? `${currentPath}/${part}` : part
      const isLast = index === parts.length - 1
      const isDirectory = zipFile.dir || !isLast

      if (!pathMap.has(currentPath)) {
        const node: FileNode = {
          name: part,
          path: currentPath,
          isDirectory,
          size: isDirectory ? 0 : zipFile._data?.uncompressedSize || 0,
          date: zipFile.date,
          file: isDirectory ? undefined : zipFile,
          children: isDirectory ? [] : undefined,
          expanded: false
        }

        pathMap.set(currentPath, node)

        // 添加到父节点或根节点
        if (parentPath) {
          const parent = pathMap.get(parentPath)
          if (parent && parent.children) {
            parent.children.push(node)
          }
        } else {
          tree.push(node)
        }
      }
    })
  })

  return tree
}

// 加载压缩包
const loadArchive = async () => {
  if (!props.file) return

  isLoading.value = true
  hasError.value = false
  errorMessage.value = ''

  try {
    const arrayBuffer = await props.file.arrayBuffer()
    const zip = await JSZip.loadAsync(arrayBuffer)
    fileTree.value = buildFileTree(zip)
  } catch (error) {
    console.error('Failed to load archive:', error)
    hasError.value = true
    errorMessage.value = error instanceof Error ? error.message : '压缩包加载失败'
  } finally {
    isLoading.value = false
  }
}

// 监听文件变化
watch(
  () => props.file,
  (newFile) => {
    if (newFile) {
      loadArchive()
    }
  },
  { immediate: true }
)

// 切换文件夹展开状态
const toggleExpand = (node: FileNode) => {
  if (node.isDirectory) {
    node.expanded = !node.expanded
  }
}

// 下载单个文件
const downloadFile = async (node: FileNode) => {
  if (!node.file) return

  try {
    const blob = await node.file.async('blob')
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = node.name
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to download file:', error)
    alert('下载失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

// 下载整个压缩包
const downloadAll = () => {
  if (!props.file) return

  const url = URL.createObjectURL(props.file)
  const link = document.createElement('a')
  link.href = url
  link.download = props.file.name
  link.click()
  URL.revokeObjectURL(url)
}

// 过滤文件树
const filterTree = (nodes: FileNode[], query: string): FileNode[] => {
  if (!query) return nodes

  const lowerQuery = query.toLowerCase()

  return nodes
    .map((node) => {
      const matchesName = node.name.toLowerCase().includes(lowerQuery)
      const filteredChildren = node.children ? filterTree(node.children, query) : undefined

      if (matchesName || (filteredChildren && filteredChildren.length > 0)) {
        return {
          ...node,
          children: filteredChildren,
          expanded: filteredChildren && filteredChildren.length > 0 ? true : node.expanded
        }
      }
      return null
    })
    .filter((node): node is FileNode => node !== null)
}

const filteredFileTree = computed(() => {
  return filterTree(fileTree.value, searchQuery.value)
})

// 关闭模态框
const handleClose = () => {
  emit('close')
}

// ESC 键关闭
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    handleClose()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="file"
        class="archive-viewer-overlay"
        @click.self="handleClose"
        @keydown="handleKeydown"
        tabindex="0"
      >
        <div class="archive-viewer-modal">
          <!-- 工具栏 -->
          <div class="archive-toolbar">
            <div class="toolbar-left">
              <svg class="file-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <polyline points="13 2 13 9 20 9" stroke="currentColor" stroke-width="2" />
              </svg>
              <span class="file-name">{{ file.name }}</span>
            </div>
            <div class="toolbar-right">
              <button class="toolbar-btn" @click="downloadAll" title="下载全部">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-width="2" />
                  <polyline points="7 10 12 15 17 10" stroke-width="2" />
                  <line x1="12" y1="15" x2="12" y2="3" stroke-width="2" />
                </svg>
              </button>
              <button class="toolbar-btn close-btn" @click="handleClose" title="关闭">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18" stroke-width="2" />
                  <line x1="6" y1="6" x2="18" y2="18" stroke-width="2" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 搜索栏 -->
          <div class="search-bar">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
              <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索文件..."
              class="search-input"
            />
          </div>

          <!-- 内容区域 -->
          <div class="archive-content">
            <!-- 加载中 -->
            <div v-if="isLoading" class="content-state">
              <div class="loading-spinner"></div>
              <span>正在解析压缩包...</span>
            </div>

            <!-- 错误提示 -->
            <div v-else-if="hasError" class="content-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="2" />
                <line x1="12" y1="8" x2="12" y2="12" stroke-width="2" />
                <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2" />
              </svg>
              <span>{{ errorMessage }}</span>
              <button class="retry-btn" @click="loadArchive">重试</button>
            </div>

            <!-- 文件树 -->
            <div v-else class="file-tree">
              <FileTreeNode
                v-for="node in filteredFileTree"
                :key="node.path"
                :node="node"
                :search-query="searchQuery"
                @toggle="toggleExpand"
                @download="downloadFile"
              />
            </div>
          </div>

          <!-- 底部状态栏 -->
          <div v-if="!isLoading && !hasError" class="archive-footer">
            <span>共 {{ totalFiles }} 个文件</span>
            <span class="separator">•</span>
            <span>总大小 {{ formatSize(totalSize) }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.archive-viewer-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.archive-viewer-modal {
  width: 90vw;
  max-width: 1000px;
  height: 85vh;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

:global(.dark) .archive-viewer-modal {
  background: #1a1a1a;
}

.archive-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

:global(.dark) .archive-toolbar {
  background: #2a2a2a;
  border-bottom-color: #3a3a3a;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-icon {
  color: #666;
}

:global(.dark) .file-icon {
  color: #aaa;
}

.file-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

:global(.dark) .file-name {
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

:global(.dark) .toolbar-btn {
  color: #aaa;
}

:global(.dark) .toolbar-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.close-btn:hover {
  background: #ff4444 !important;
  color: #fff !important;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: #fafafa;
  border-bottom: 1px solid #e0e0e0;
}

:global(.dark) .search-bar {
  background: #222;
  border-bottom-color: #3a3a3a;
}

.search-icon {
  color: #999;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
  color: #333;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #3498db;
}

:global(.dark) .search-input {
  background: #2a2a2a;
  border-color: #3a3a3a;
  color: #eee;
}

:global(.dark) .search-input:focus {
  border-color: #3498db;
}

.archive-content {
  flex: 1;
  overflow: auto;
  position: relative;
}

.content-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #666;
}

:global(.dark) .content-state {
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

.file-tree {
  padding: 8px 0;
}

.archive-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
  font-size: 13px;
  color: #666;
}

:global(.dark) .archive-footer {
  background: #2a2a2a;
  border-top-color: #3a3a3a;
  color: #999;
}

.separator {
  color: #ccc;
}

/* 过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .archive-viewer-modal,
.modal-leave-active .archive-viewer-modal {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .archive-viewer-modal,
.modal-leave-to .archive-viewer-modal {
  transform: scale(0.95);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .archive-viewer-modal {
    width: 95vw;
    height: 90vh;
  }

  .search-bar {
    padding: 10px 16px;
  }

  .archive-toolbar,
  .archive-footer {
    padding: 12px 16px;
  }
}
</style>
