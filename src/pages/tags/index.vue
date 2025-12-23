<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import ArticleTags from '@/components/article/ArticleTags.vue'

// 使用 useRouter 来获取所有路由信息
const router = useRouter()
const route = useRoute()

interface Article {
  path: string
  title: string
  date?: string
  tags: string[]
}

const allArticles = computed<Article[]>(() => {
  const routes = router.getRoutes()
  // 排除的页面路由前缀
  const excludePaths = ['/tags', '/games', '/404', '/:all']
  return routes
    .filter((r) => {
      // 必须有 title 元数据
      if (!r.meta?.title) return false
      // 排除特定页面路由
      if (excludePaths.some((prefix) => r.path.startsWith(prefix) || r.path === prefix))
        return false
      // 排除根路径
      if (r.path === '/') return false
      return true
    })
    .map((r) => ({
      path: r.path,
      title: (r.meta.title as string) || 'Untitled',
      tags: (r.meta.tags as string[]) || []
    }))
})

const selectedTag = ref<string | null>(null)

// 监听路由参数
const updateTagFromRoute = () => {
  const queryTag = route.query.tag as string
  if (queryTag) {
    selectedTag.value = queryTag
  } else {
    selectedTag.value = null
  }
}

onMounted(() => {
  updateTagFromRoute()
})

import { watch } from 'vue'
watch(
  () => route.query.tag,
  () => {
    updateTagFromRoute()
  }
)

const filteredArticles = computed(() => {
  if (!selectedTag.value) {
    return allArticles.value
  }
  return allArticles.value.filter((article) => article.tags.includes(selectedTag.value!))
})

const selectTag = (tag: string | null) => {
  selectedTag.value = tag
  // 更新 URL query，但不刷新页面
  if (tag) {
    router.replace({ query: { tag } })
  } else {
    router.replace({ query: {} })
  }
}
</script>

<template>
  <div class="page-container">
    <Navbar />
    <div class="content">
      <h1 class="page-title">Tags</h1>

      <div class="word-cloud-section">
        <ArticleTags cloud />
      </div>

      <div class="filter-status" v-if="selectedTag">
        <span
          >Filtering by: <span class="current-tag">#{{ selectedTag }}</span></span
        >
        <button class="clear-btn" @click="selectTag(null)">Clear Filter (Show All)</button>
      </div>

      <!-- Remove original tags-cloud since ArticleTags provides the list and cloud -->
      <!-- <div class="tags-cloud"> ... </div> -->

      <div class="articles-list">
        <div v-if="filteredArticles.length === 0" class="no-articles">No articles found.</div>
        <router-link
          v-for="article in filteredArticles"
          :key="article.path"
          :to="article.path"
          class="article-card"
        >
          <div class="article-title">{{ article.title }}</div>
          <div class="article-meta">
            <span v-for="tag in article.tags" :key="tag" class="mini-tag">#{{ tag }}</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: var(--vp-c-bg);
  padding-top: var(--vp-nav-height);
}

.content {
  max-width: 800px;
  margin: 0 auto;
  padding: 48px 24px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 32px;
  color: var(--vp-c-text-1);
}

.word-cloud-section {
  margin-bottom: 48px;
}

.filter-status {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  font-size: 16px;
  color: var(--vp-c-text-2);
}

.current-tag {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.clear-btn {
  padding: 4px 12px;
  border-radius: 4px;
  background-color: var(--vp-c-bg-mute);
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.25s;
}

.clear-btn:hover {
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-card {
  display: block;
  padding: 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background-color: var(--vp-c-bg-alt);
  transition: all 0.25s;
  text-decoration: none;
}

.article-card:hover {
  transform: translateY(-2px);
  border-color: var(--vp-c-brand-1);
  background-color: var(--vp-c-bg-soft);
}

.article-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}

.article-meta {
  display: flex;
  gap: 8px;
}

.mini-tag {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.no-articles {
  text-align: center;
  color: var(--vp-c-text-2);
  margin-top: 32px;
}
</style>
