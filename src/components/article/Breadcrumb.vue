<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDocsTree, type DocTreeNode } from '@/composables/article/useDocsTree'

const route = useRoute()
const { docsTree } = useDocsTree()

// 构建面包屑项
interface BreadcrumbItem {
  path: string
  title: string
  isClickable: boolean
}

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const parts = route.path.split('/').filter(Boolean)
  if (parts.length === 0) return []

  const items: BreadcrumbItem[] = []
  let currentPath = ''

  // 递归查找节点
  const findNode = (nodes: DocTreeNode[], targetPath: string): DocTreeNode | null => {
    for (const node of nodes) {
      if (node.path === targetPath) return node
      if (node.children) {
        const found = findNode(node.children, targetPath)
        if (found) return found
      }
    }
    return null
  }

  for (const part of parts) {
    currentPath += '/' + part
    const node = findNode(docsTree.value, currentPath)

    items.push({
      path: currentPath,
      title: node?.title || decodeURIComponent(part),
      isClickable: !node?.isDirectory // 只有文件可点击
    })
  }

  return items
})
</script>

<template>
  <nav v-if="breadcrumbs.length > 0" class="breadcrumb" aria-label="面包屑导航">
    <ol class="breadcrumb-list">
      <!-- 首页图标 -->
      <li class="breadcrumb-item">
        <router-link to="/" class="breadcrumb-home" title="首页">
          <svg class="home-icon" viewBox="0 0 20 20" fill="currentColor">
            <path
              d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
            />
          </svg>
        </router-link>
      </li>

      <!-- 面包屑项 -->
      <li v-for="(item, index) in breadcrumbs" :key="item.path" class="breadcrumb-item">
        <span class="breadcrumb-separator">/</span>
        <router-link
          v-if="item.isClickable && index < breadcrumbs.length - 1"
          :to="item.path"
          class="breadcrumb-link"
        >
          {{ item.title }}
        </router-link>
        <span v-else-if="index < breadcrumbs.length - 1" class="breadcrumb-text">
          {{ item.title }}
        </span>
        <span v-else class="breadcrumb-current">
          {{ item.title }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumb {
  padding: 0 0 16px 0;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.875rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.breadcrumb-home {
  display: flex;
  align-items: center;
  color: var(--vp-c-text-3);
  transition: color 0.2s;
}

.breadcrumb-home:hover {
  color: var(--vp-c-brand-1);
}

.home-icon {
  width: 16px;
  height: 16px;
}

.breadcrumb-separator {
  color: var(--vp-c-text-3);
  margin: 0 2px;
  user-select: none;
}

.breadcrumb-link {
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: color 0.2s;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.breadcrumb-link:hover {
  color: var(--vp-c-brand-1);
}

.breadcrumb-text {
  color: var(--vp-c-text-3);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.breadcrumb-current {
  color: var(--vp-c-text-1);
  font-weight: 500;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
