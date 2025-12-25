<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDocsTree, type DocTreeNode } from '@/composables/article/useDocsTree'
import { useViewMode } from '@/composables/ui/useViewMode'
import ViewModeSwitch from './ViewModeSwitch.vue'
import CardView from './views/CardView.vue'
import TimelineView from './views/TimelineView.vue'
import TreeView from './views/TreeView.vue'

const route = useRoute()
const { docsTree } = useDocsTree()
const { currentMode } = useViewMode()

// 追踪展开状态的分组 (使用 path 作为 key)
const expandedGroups = ref<Set<string>>(new Set())

// 切换分组的展开/折叠状态
const toggleGroup = (path: string) => {
  if (expandedGroups.value.has(path)) {
    expandedGroups.value.delete(path)
  } else {
    expandedGroups.value.add(path)
  }
  // 触发响应式更新
  expandedGroups.value = new Set(expandedGroups.value)
}

// 检查分组是否展开
const isExpanded = (path: string) => expandedGroups.value.has(path)

// 计算当前路由的知识库基础路径（第一级）
const currentKnowledgeBasePath = computed(() => {
  const parts = route.path.split('/').filter(Boolean)
  if (parts.length >= 1) {
    return '/' + parts[0]
  }
  return null
})

// 过滤后的导航项 - 显示当前知识库下的所有内容 (跳过知识库根节点本身)
const filteredNavItems = computed(() => {
  if (!currentKnowledgeBasePath.value) return []

  // 找到当前知识库的根节点
  const knowledgeBaseNode = docsTree.value.find(
    (item: DocTreeNode) => item.path === currentKnowledgeBasePath.value
  )

  // 返回其子节点，而不是根节点本身
  return knowledgeBaseNode?.children || []
})

// 递归展开当前路由所在的所有父级分组
const expandToCurrentPath = () => {
  const parts = route.path.split('/').filter(Boolean)
  let currentPath = ''
  for (const part of parts) {
    currentPath += '/' + part
    expandedGroups.value.add(currentPath)
  }
  expandedGroups.value = new Set(expandedGroups.value)
}

// 监听路由变化，自动展开当前分组
watch(() => route.path, expandToCurrentPath, { immediate: true })

// 当文档树加载完成后，展开当前路径
watch(docsTree, () => {
  if (docsTree.value.length > 0) {
    expandToCurrentPath()
  }
})

const isActive = (path: string) => {
  return route.path === path
}

// 递归获取所有子路径
const getAllChildPaths = (node: DocTreeNode): string[] => {
  const paths: string[] = [node.path]
  if (node.children) {
    for (const child of node.children) {
      paths.push(...getAllChildPaths(child))
    }
  }
  return paths
}

// 根据路径查找节点
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

// 展开目录下所有子目录
const expandAll = (path: string) => {
  const node = findNodeByPath(path)
  if (node) {
    const allPaths = getAllChildPaths(node)
    allPaths.forEach((p) => expandedGroups.value.add(p))
    expandedGroups.value = new Set(expandedGroups.value)
  }
}

// 折叠目录下所有子目录
const collapseAll = (path: string) => {
  const node = findNodeByPath(path)
  if (node) {
    const allPaths = getAllChildPaths(node)
    allPaths.forEach((p) => expandedGroups.value.delete(p))
    expandedGroups.value = new Set(expandedGroups.value)
  }
}

// 右键菜单相关事件监听
const handleExpandAllEnv = (e: Event) => {
  const customEvent = e as CustomEvent
  if (customEvent.detail && customEvent.detail.path) {
    expandAll(customEvent.detail.path)
  }
}

const handleCollapseAllEnv = (e: Event) => {
  const customEvent = e as CustomEvent
  if (customEvent.detail && customEvent.detail.path) {
    collapseAll(customEvent.detail.path)
  }
}

// 设置展开/折叠监听
onMounted(() => {
  window.addEventListener('sidebar-expand-all', handleExpandAllEnv)
  window.addEventListener('sidebar-collapse-all', handleCollapseAllEnv)
})

onUnmounted(() => {
  window.removeEventListener('sidebar-expand-all', handleExpandAllEnv)
  window.removeEventListener('sidebar-collapse-all', handleCollapseAllEnv)
})
</script>

<template>
  <div class="sidebar-container">
    <!-- 视图模式切换器 -->
    <ViewModeSwitch />

    <!-- 根据当前模式渲染不同视图 -->
    <CardView v-if="currentMode === 'card'" />
    <TimelineView v-else-if="currentMode === 'timeline'" />
    <TreeView v-else-if="currentMode === 'tree'" />

    <!-- 标准视图 (默认) -->
    <nav v-else class="sidebar-nav">
      <!-- 使用递归组件渲染树 -->
      <template v-for="item in filteredNavItems" :key="item.path">
        <!-- 如果是目录，显示分组标题 -->
        <div v-if="item.isDirectory" class="nav-group">
          <div
            class="nav-group-title collapsible"
            :class="{ expanded: isExpanded(item.path) }"
            @click="toggleGroup(item.path)"
            data-context-type="directory"
            :data-context-path="item.path"
            :data-context-title="item.title"
          >
            <span class="nav-group-title-text">{{ item.title }}</span>
            <svg
              class="collapse-icon"
              :class="{ rotated: isExpanded(item.path) }"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
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

          <Transition name="collapse">
            <div
              v-show="isExpanded(item.path)"
              v-if="item.children?.length"
              class="nav-group-children"
            >
              <!-- 递归渲染子节点 -->
              <template v-for="child in item.children" :key="child.path">
                <div v-if="child.isDirectory" class="nav-subgroup">
                  <div
                    class="nav-subgroup-title collapsible"
                    :class="{ expanded: isExpanded(child.path) }"
                    @click="toggleGroup(child.path)"
                    data-context-type="directory"
                    :data-context-path="child.path"
                    :data-context-title="child.title"
                  >
                    <span class="nav-subgroup-title-text">{{ child.title }}</span>
                    <svg
                      class="collapse-icon"
                      :class="{ rotated: isExpanded(child.path) }"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
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
                  <Transition name="collapse">
                    <ul
                      v-show="isExpanded(child.path)"
                      v-if="child.children?.length"
                      class="nav-group-items"
                    >
                      <li v-for="subItem in child.children" :key="subItem.path">
                        <router-link
                          :to="subItem.path"
                          class="nav-link"
                          :class="{ active: isActive(subItem.path) }"
                          :data-context-type="subItem.isDirectory ? 'directory' : 'article'"
                          :data-context-path="subItem.path"
                          :data-context-title="subItem.title"
                        >
                          {{ subItem.title }}
                        </router-link>
                      </li>
                    </ul>
                  </Transition>
                </div>

                <!-- 如果是文件，直接显示链接 -->
                <router-link
                  v-else
                  :to="child.path"
                  class="nav-link direct-link"
                  :class="{ active: isActive(child.path) }"
                  :data-context-type="child.isDirectory ? 'directory' : 'article'"
                  :data-context-path="child.path"
                  :data-context-title="child.title"
                >
                  {{ child.title }}
                </router-link>
              </template>
            </div>
          </Transition>
        </div>

        <!-- 如果是文件（顶级），直接显示链接 -->
        <router-link
          v-else
          :to="item.path"
          class="nav-link top-level"
          :class="{ active: isActive(item.path) }"
          :data-context-type="item.isDirectory ? 'directory' : 'article'"
          :data-context-path="item.path"
          :data-context-title="item.title"
        >
          {{ item.title }}
        </router-link>
      </template>
    </nav>
  </div>
</template>

<style scoped>
.sidebar-nav {
  padding: 24px 0;
}

.nav-group {
  margin-bottom: 24px;
}

.nav-group:last-child {
  margin-bottom: 0;
}

.nav-group-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
  padding: 4px 12px;
  line-height: 24px;
  border-radius: 6px;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.nav-group-title.collapsible {
  cursor: pointer;
  user-select: none;
}

.nav-group-title.collapsible:hover {
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
}

.nav-group-title-text {
  flex: 1;
}

.collapse-icon {
  color: var(--vp-c-text-3);
  transition:
    transform 0.25s ease,
    color 0.2s;
  flex-shrink: 0;
}

.collapse-icon.rotated {
  transform: rotate(90deg);
}

.nav-group-title.collapsible:hover .collapse-icon {
  color: var(--vp-c-brand-1);
}

.nav-group-children {
  padding-left: 12px;
  border-left: 1px solid var(--vp-c-border);
  margin-left: 12px;
  margin-top: 4px;
}

.nav-subgroup {
  margin-bottom: 8px;
}

.nav-subgroup-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-bottom: 4px;
  padding: 2px 8px;
  line-height: 22px;
  border-radius: 4px;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.nav-subgroup-title.collapsible {
  cursor: pointer;
  user-select: none;
}

.nav-subgroup-title.collapsible:hover {
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
}

.nav-subgroup-title-text {
  flex: 1;
}

.nav-subgroup-title.collapsible:hover .collapse-icon {
  color: var(--vp-c-brand-1);
}

.direct-link {
  margin-bottom: 2px;
}

.nav-group-items {
  border-left: 1px solid var(--vp-c-border);
  padding-left: 14px;
  margin-left: 8px;
}

.nav-link {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  padding: 4px 12px;
  line-height: 24px;
  transition: color 0.25s;
  border-left: 2px solid transparent;
  margin-left: -16px;
  /* Offset for border */
  padding-left: 16px;
}

.nav-group-items .nav-link {
  margin-left: -15px;
  /* Adjust for nested border */
  padding-left: 14px;
  border-left: none;
  /* Borders handled by group line mostly, but VP uses text color change */
}

/* Hover State */
.nav-link:hover {
  color: var(--vp-c-brand-1);
}

/* Active State */
.nav-link.active {
  color: var(--vp-c-brand-1);
}

.nav-link.top-level {
  font-weight: 600;
}

/* 折叠展开动画 */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}
</style>
