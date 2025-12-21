<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Navbar from '@/components/Navbar.vue'

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
  return routes
    .filter((r) => r.path.startsWith('/docs/') && r.meta?.title)
    .map((r) => ({
      path: r.path,
      title: (r.meta.title as string) || 'Untitled',
      tags: (r.meta.tags as string[]) || []
    }))
})

// 提取所有唯一标签
const allTags = computed(() => {
  const tagsSet = new Set<string>()
  allArticles.value.forEach((article) => {
    article.tags.forEach((tag) => tagsSet.add(tag))
  })
  return Array.from(tagsSet).sort()
})

const selectedTag = ref<string | null>(null)

// 监听路由参数
onMounted(() => {
  const queryTag = route.query.tag as string
  if (queryTag && allTags.value.includes(queryTag)) {
    selectedTag.value = queryTag
  }
})

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

      <div class="tags-cloud">
        <button class="tag-pill" :class="{ active: !selectedTag }" @click="selectTag(null)">
          All
        </button>
        <button
          v-for="tag in allTags"
          :key="tag"
          class="tag-pill"
          :class="{ active: selectedTag === tag }"
          @click="selectTag(tag)"
        >
          #{{ tag }}
        </button>
      </div>

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

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 48px;
}

.tag-pill {
  padding: 6px 16px;
  border-radius: 20px;
  background-color: var(--vp-c-bg-alt);
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-divider);
  cursor: pointer;
  transition: all 0.25s;
  font-size: 14px;
}

.tag-pill:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.tag-pill.active {
  background-color: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
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
