<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDocsTree, type DocTreeNode } from '@/composables/article/useDocsTree'

const router = useRouter()
const { docsTree } = useDocsTree()

// 递归获取所有文章并按路径分组
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

interface TimelineGroup {
  category: string
  articles: DocTreeNode[]
}

const timelineGroups = computed<TimelineGroup[]>(() => {
  const articles = getAllArticles(docsTree.value)
  const groups = new Map<string, DocTreeNode[]>()

  for (const article of articles) {
    const parts = article.path.split('/').filter(Boolean)
    const category = parts.length > 1 ? parts[0] : '其他'

    if (!groups.has(category)) {
      groups.set(category, [])
    }
    const group = groups.get(category)
    if (group) group.push(article)
  }

  return Array.from(groups.entries()).map(([category, articles]) => ({
    category,
    articles
  }))
})

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="timeline-view">
    <div v-for="group in timelineGroups" :key="group.category" class="timeline-group">
      <div class="timeline-header">
        <div class="timeline-dot"></div>
        <h3 class="timeline-category">{{ group.category }}</h3>
      </div>
      <div class="timeline-items">
        <div
          v-for="article in group.articles"
          :key="article.path"
          class="timeline-item"
          @click="navigateTo(article.path)"
          data-context-type="article"
          :data-context-path="article.path"
          :data-context-title="article.title"
        >
          <div class="item-line"></div>
          <div class="item-content">
            <span class="item-title">{{ article.title }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="timelineGroups.length === 0" class="empty-state">暂无文章</div>
  </div>
</template>

<style lang="scss" scoped>
.timeline-view {
  padding: 16px 12px;
}

.timeline-group {
  margin-bottom: 24px;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  flex-shrink: 0;
}

.timeline-category {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0;
}

.timeline-items {
  margin-left: 5px;
  padding-left: 18px;
  border-left: 2px solid var(--vp-c-border);
}

.timeline-item {
  position: relative;
  padding: 8px 12px;
  margin-bottom: 4px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--vp-c-bg-soft);

    .item-line {
      background: var(--vp-c-brand-1);
    }

    .item-title {
      color: var(--vp-c-brand-1);
    }
  }
}

.item-line {
  position: absolute;
  left: -20px;
  top: 50%;
  width: 8px;
  height: 2px;
  background: var(--vp-c-border);
  transition: background 0.2s ease;
}

.item-content {
  display: flex;
  align-items: center;
}

.item-title {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  transition: color 0.2s ease;
}

.empty-state {
  text-align: center;
  color: var(--vp-c-text-3);
  padding: 32px;
}
</style>
