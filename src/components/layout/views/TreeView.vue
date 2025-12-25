<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocsTree, type DocTreeNode } from '@/composables/article/useDocsTree'

const route = useRoute()
const router = useRouter()
const { docsTree } = useDocsTree()

// 展开状态
const expandedNodes = ref<Set<string>>(new Set())

// ... (keep currentKnowledgeBasePath, filteredTree, expandToPath, watch, toggleNode, isExpanded, isActive, navigateTo) ...

// 当前知识库路径
const currentKnowledgeBasePath = computed(() => {
  const parts = route.path.split('/').filter(Boolean)
  return parts.length >= 1 ? '/' + parts[0] : null
})

// 过滤后的树
const filteredTree = computed(() => {
  if (!currentKnowledgeBasePath.value) return []
  const node = docsTree.value.find((item) => item.path === currentKnowledgeBasePath.value)
  return node?.children || []
})

// 展开到当前路径
const expandToPath = () => {
  const parts = route.path.split('/').filter(Boolean)
  let currentPath = ''
  for (const part of parts) {
    currentPath += '/' + part
    expandedNodes.value.add(currentPath)
  }
  expandedNodes.value = new Set(expandedNodes.value)
}

watch(() => route.path, expandToPath, { immediate: true })
watch(docsTree, () => {
  if (docsTree.value.length > 0) expandToPath()
})

const toggleNode = (path: string) => {
  if (expandedNodes.value.has(path)) {
    expandedNodes.value.delete(path)
  } else {
    expandedNodes.value.add(path)
  }
  expandedNodes.value = new Set(expandedNodes.value)
}

const isExpanded = (path: string) => expandedNodes.value.has(path)
const isActive = (path: string) => route.path === path

const navigateTo = (path: string) => {
  router.push(path)
}

// 递归获取所有子节点路径
const getAllChildPaths = (node: DocTreeNode): string[] => {
  const paths: string[] = [node.path]
  if (node.children) {
    for (const child of node.children) {
      paths.push(...getAllChildPaths(child))
    }
  }
  return paths
}

const findNodeByPath = (
  path: string,
  nodes: DocTreeNode[] = docsTree.value
): DocTreeNode | null => {
  for (const node of nodes) {
    if (node.path === path) return node
    if (node.children) {
      const found = findNodeByPath(path, node.children)
      if (found) return found
    }
  }
  return null
}

const handleExpandAll = (e: Event) => {
  const customEvent = e as CustomEvent
  const path = customEvent.detail.path
  if (!path) return

  // 这里的 path 来自 context menu，可能是某个子目录的 path
  // 我们需要找到这个节点，然后展开它所有的子节点
  const node = findNodeByPath(path)
  if (node) {
    const allPaths = getAllChildPaths(node)
    allPaths.forEach((p) => expandedNodes.value.add(p))
    expandedNodes.value = new Set(expandedNodes.value)
  }
}

const handleCollapseAll = (e: Event) => {
  const customEvent = e as CustomEvent
  const path = customEvent.detail.path
  if (!path) return

  const node = findNodeByPath(path)
  if (node) {
    const allPaths = getAllChildPaths(node)
    allPaths.forEach((p) => expandedNodes.value.delete(p))
    expandedNodes.value = new Set(expandedNodes.value)
  }
}

onMounted(() => {
  window.addEventListener('sidebar-expand-all', handleExpandAll)
  window.addEventListener('sidebar-collapse-all', handleCollapseAll)
})

onUnmounted(() => {
  window.removeEventListener('sidebar-expand-all', handleExpandAll)
  window.removeEventListener('sidebar-collapse-all', handleCollapseAll)
})
</script>

<template>
  <div class="tree-view">
    <div v-for="node in filteredTree" :key="node.path" class="tree-node">
      <!-- 目录节点 -->
      <div
        v-if="node.isDirectory"
        class="node-header directory"
        :class="{ expanded: isExpanded(node.path) }"
        @click="toggleNode(node.path)"
        data-context-type="directory"
        :data-context-path="node.path"
        :data-context-title="node.title"
      >
        <svg class="node-icon folder" viewBox="0 0 24 24" fill="none">
          <path
            v-if="isExpanded(node.path)"
            d="M3 7a2 2 0 012-2h4.586a1 1 0 01.707.293l1.414 1.414A1 1 0 0012.414 7H19a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
            fill="currentColor"
            opacity="0.3"
          />
          <path
            v-else
            d="M3 7a2 2 0 012-2h4.586a1 1 0 01.707.293l1.414 1.414A1 1 0 0012.414 7H19a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
            stroke="currentColor"
            stroke-width="1.5"
          />
        </svg>
        <span class="node-label">{{ node.title }}</span>
        <svg class="expand-icon" :class="{ rotated: isExpanded(node.path) }" viewBox="0 0 12 12">
          <path
            d="M4.5 2.5L8 6L4.5 9.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <!-- 文件节点 -->
      <div
        v-else
        class="node-header file"
        :class="{ active: isActive(node.path) }"
        @click="navigateTo(node.path)"
        data-context-type="article"
        :data-context-path="node.path"
        :data-context-title="node.title"
      >
        <svg class="node-icon file" viewBox="0 0 24 24" fill="none">
          <path
            d="M7 3a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V9l-6-6H7z"
            stroke="currentColor"
            stroke-width="1.5"
          />
          <path d="M13 3v6h6" stroke="currentColor" stroke-width="1.5" />
        </svg>
        <span class="node-label">{{ node.title }}</span>
      </div>

      <!-- 子节点 -->
      <Transition name="tree-expand">
        <div
          v-if="node.isDirectory && isExpanded(node.path) && node.children?.length"
          class="node-children"
        >
          <div v-for="child in node.children" :key="child.path" class="tree-node child">
            <!-- 递归子目录 -->
            <div
              v-if="child.isDirectory"
              class="node-header directory"
              :class="{ expanded: isExpanded(child.path) }"
              @click="toggleNode(child.path)"
              data-context-type="directory"
              :data-context-path="child.path"
              :data-context-title="child.title"
            >
              <svg class="node-icon folder" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 7a2 2 0 012-2h4.586a1 1 0 01.707.293l1.414 1.414A1 1 0 0012.414 7H19a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                  :fill="isExpanded(child.path) ? 'currentColor' : 'none'"
                  :opacity="isExpanded(child.path) ? '0.3' : '1'"
                  :stroke="isExpanded(child.path) ? 'none' : 'currentColor'"
                  stroke-width="1.5"
                />
              </svg>
              <span class="node-label">{{ child.title }}</span>
              <svg
                class="expand-icon"
                :class="{ rotated: isExpanded(child.path) }"
                viewBox="0 0 12 12"
              >
                <path
                  d="M4.5 2.5L8 6L4.5 9.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>

            <!-- 子文件 -->
            <div
              v-else
              class="node-header file"
              :class="{ active: isActive(child.path) }"
              @click="navigateTo(child.path)"
              data-context-type="article"
              :data-context-path="child.path"
              :data-context-title="child.title"
            >
              <svg class="node-icon file" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 3a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V9l-6-6H7z"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <path d="M13 3v6h6" stroke="currentColor" stroke-width="1.5" />
              </svg>
              <span class="node-label">{{ child.title }}</span>
            </div>

            <!-- 三级子节点 -->
            <Transition name="tree-expand">
              <div
                v-if="child.isDirectory && isExpanded(child.path) && child.children?.length"
                class="node-children"
              >
                <div
                  v-for="subChild in child.children"
                  :key="subChild.path"
                  class="node-header file"
                  :class="{ active: isActive(subChild.path) }"
                  @click="navigateTo(subChild.path)"
                  data-context-type="article"
                  :data-context-path="subChild.path"
                  :data-context-title="subChild.title"
                >
                  <svg class="node-icon file" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 3a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V9l-6-6H7z"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <path d="M13 3v6h6" stroke="currentColor" stroke-width="1.5" />
                  </svg>
                  <span class="node-label">{{ subChild.title }}</span>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tree-view {
  padding: 16px 12px;
}

.tree-node {
  margin-bottom: 2px;

  &.child {
    margin-left: 0;
  }
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--vp-c-bg-soft);
  }

  &.active {
    background: var(--vp-c-brand-soft);

    .node-label {
      color: var(--vp-c-brand-1);
    }
  }
}

.node-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--vp-c-text-3);

  &.folder {
    color: var(--vp-c-brand-1);
  }
}

.node-label {
  flex: 1;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expand-icon {
  width: 12px;
  height: 12px;
  color: var(--vp-c-text-3);
  transition: transform 0.2s ease;
  flex-shrink: 0;

  &.rotated {
    transform: rotate(90deg);
  }
}

.node-children {
  margin-left: 16px;
  padding-left: 12px;
  border-left: 1px solid var(--vp-c-border);
}

// 展开动画
.tree-expand-enter-active,
.tree-expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.tree-expand-enter-from,
.tree-expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.tree-expand-enter-to,
.tree-expand-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
