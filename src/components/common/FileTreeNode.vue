<script setup lang="ts">
import type JSZip from 'jszip'

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

defineProps<{
  node: FileNode
  searchQuery?: string
  depth?: number
}>()

defineEmits<{
  toggle: [node: FileNode]
  download: [node: FileNode]
}>()

// 格式化文件大小
const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
</script>

<template>
  <div class="tree-node" :style="{ paddingLeft: `${(depth || 0) * 20}px` }">
    <div class="node-content" @click="$emit('toggle', node)">
      <!-- 展开/折叠图标 -->
      <svg
        v-if="node.isDirectory"
        class="expand-icon"
        :class="{ expanded: node.expanded }"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
      >
        <polyline points="9 18 15 12 9 6" stroke="currentColor" stroke-width="2" />
      </svg>
      <div v-else class="expand-placeholder"></div>

      <!-- 文件/文件夹图标 -->
      <svg
        v-if="node.isDirectory"
        class="folder-icon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z"
        />
      </svg>
      <svg v-else class="file-icon-small" width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"
          stroke="currentColor"
          stroke-width="2"
        />
        <polyline points="13 2 13 9 20 9" stroke="currentColor" stroke-width="2" />
      </svg>

      <!-- 文件名 -->
      <span class="node-name" :title="node.path">{{ node.name }}</span>

      <!-- 文件信息 -->
      <div class="node-info">
        <span v-if="!node.isDirectory" class="node-size">{{ formatSize(node.size) }}</span>
        <button
          v-if="!node.isDirectory"
          class="download-btn"
          @click.stop="$emit('download', node)"
          title="下载"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-width="2" />
            <polyline points="7 10 12 15 17 10" stroke-width="2" />
            <line x1="12" y1="15" x2="12" y2="3" stroke-width="2" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 子节点 -->
    <div v-if="node.isDirectory && node.expanded && node.children" class="node-children">
      <FileTreeNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :search-query="searchQuery"
        :depth="(depth || 0) + 1"
        @toggle="$emit('toggle', $event)"
        @download="$emit('download', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.tree-node {
  user-select: none;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.node-content:hover {
  background: rgba(0, 0, 0, 0.05);
}

:global(.dark) .node-content:hover {
  background: rgba(255, 255, 255, 0.05);
}

.expand-icon {
  flex-shrink: 0;
  color: #999;
  transition: transform 0.15s ease;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.expand-placeholder {
  width: 16px;
  flex-shrink: 0;
}

.folder-icon {
  flex-shrink: 0;
  color: #f39c12;
}

.file-icon-small {
  flex-shrink: 0;
  color: #95a5a6;
}

.node-name {
  flex: 1;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.dark) .node-name {
  color: #ddd;
}

.node-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.node-size {
  font-size: 12px;
  color: #999;
  min-width: 70px;
  text-align: right;
}

.download-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #999;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
}

.node-content:hover .download-btn {
  opacity: 1;
}

.download-btn:hover {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .node-size {
    display: none;
  }
}
</style>
