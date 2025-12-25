<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useArchiveData } from '@/composables/article/useArchiveData'

const router = useRouter()
const { getRecentArticles } = useArchiveData()

const recentArticles = computed(() => getRecentArticles(6))

const navigateTo = (path: string) => {
  router.push(path)
}

const goToArchives = () => {
  router.push('/archives')
}

// 格式化日期
const formatDate = (date: Date | null) => {
  if (!date) return '未知日期'

  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`

  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <section class="latest-articles">
    <div class="section-header">
      <h2 class="section-title">
        <svg
          class="title-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          ></path>
        </svg>
        最新文章
      </h2>
      <button class="view-all-btn" @click="goToArchives">
        查看全部
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
    </div>

    <div v-if="recentArticles.length === 0" class="empty-state">
      <p>暂无文章</p>
    </div>

    <div v-else class="articles-grid">
      <article
        v-for="article in recentArticles"
        :key="article.path"
        class="article-card"
        @click="navigateTo(article.path)"
      >
        <div class="card-header">
          <span class="article-date">{{ formatDate(article.date) }}</span>
          <div v-if="article.tags.length > 0" class="article-tag">#{{ article.tags[0] }}</div>
        </div>
        <h3 class="article-title">{{ article.title }}</h3>
        <div class="card-footer">
          <span class="read-more">阅读</span>
          <svg
            class="arrow-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      </article>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.latest-articles {
  padding: 48px 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding: 0 4px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0;
}

.title-icon {
  width: 28px;
  height: 28px;
  color: var(--vp-c-brand-1);
}

.view-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.25s ease;

  svg {
    width: 16px;
    height: 16px;
    transition: transform 0.25s ease;
  }

  &:hover {
    color: var(--vp-c-brand-1);
    background: var(--vp-c-brand-soft);

    svg {
      transform: translateX(4px);
    }
  }
}

.empty-state {
  text-align: center;
  padding: 48px;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-radius: 16px;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.article-card {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: var(--vp-c-brand-soft);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);

    .article-title {
      color: var(--vp-c-brand-1);
    }

    .arrow-icon {
      opacity: 1;
      transform: translateX(4px);
    }
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.article-date {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}

.article-tag {
  font-size: 0.75rem;
  color: var(--vp-c-brand-2);
  background: var(--vp-c-brand-soft);
  padding: 2px 8px;
  border-radius: 12px;
}

.article-title {
  flex: 1;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.5;
  margin-bottom: 16px;
  transition: color 0.2s ease;

  // 限制两行
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: auto;
}

.read-more {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-brand-1);
}

.arrow-icon {
  width: 16px;
  height: 16px;
  color: var(--vp-c-brand-1);
  opacity: 0;
  transition: all 0.2s ease;
}

// 响应式
@media (max-width: 640px) {
  .latest-articles {
    padding: 32px 0;
  }

  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .articles-grid {
    grid-template-columns: 1fr;
  }
}
</style>
