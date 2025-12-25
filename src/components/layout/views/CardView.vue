<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDocsTree, type DocTreeNode } from '@/composables/article/useDocsTree'

const router = useRouter()
const { docsTree } = useDocsTree()

// 递归获取所有文章（非目录节点）
const getAllArticles = (nodes: DocTreeNode[]): DocTreeNode[] => {
  const articles: DocTreeNode[] = []
  for (const node of nodes) {
    if (!node.isDirectory) {
      articles.push(node)
    }
    if (node.children) {
      articles.push(...getAllArticles(node.children))
    }
  }
  return articles
}

const articles = computed(() => getAllArticles(docsTree.value))

const navigateTo = (path: string) => {
  router.push(path)
}

// 从路径提取分类标签
const getCategory = (path: string) => {
  const parts = path.split('/').filter(Boolean)
  return parts.length > 1 ? parts[0] : '其他'
}
</script>

<template>
  <div class="card-view">
    <div class="card-grid">
      <div
        v-for="article in articles"
        :key="article.path"
        class="article-card"
        @click="navigateTo(article.path)"
        data-context-type="article"
        :data-context-path="article.path"
        :data-context-title="article.title"
      >
        <div class="card-category">{{ getCategory(article.path) }}</div>
        <h3 class="card-title">{{ article.title }}</h3>
        <div class="card-path">{{ article.path }}</div>
      </div>
    </div>
    <div v-if="articles.length === 0" class="empty-state">暂无文章</div>
  </div>
</template>

<style lang="scss" scoped>
.card-view {
  padding: 16px 12px;
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.article-card {
  padding: 16px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--vp-c-brand-1);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.card-category {
  font-size: 0.75rem;
  color: var(--vp-c-brand-1);
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.card-path {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  color: var(--vp-c-text-3);
  padding: 32px;
}
</style>
