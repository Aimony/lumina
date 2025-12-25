<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import { useArchiveData } from '@/composables/article/useArchiveData'

const router = useRouter()
const { allArticles, stats, isLoading } = useArchiveData()

// 按日期分组的时间轴数据
interface TimelineDay {
  dateStr: string
  dateLabel: string
  articles: typeof allArticles.value
  isToday: boolean
}

const timelineGroups = computed<TimelineDay[]>(() => {
  const groups = new Map<string, typeof allArticles.value>()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const article of allArticles.value) {
    if (!article.date) continue

    const isoString = article.date.toISOString()
    const dateStr = isoString.split('T')[0] || isoString
    if (!groups.has(dateStr)) {
      groups.set(dateStr, [])
    }
    groups.get(dateStr)!.push(article)
  }

  return Array.from(groups.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([dateStr, articles]) => {
      const date = new Date(dateStr)
      const isToday = date.getTime() === today.getTime()

      return {
        dateStr,
        dateLabel: formatDateLabel(date, isToday),
        articles,
        isToday
      }
    })
})

// 没有日期的文章
const undatedArticles = computed(() => {
  return allArticles.value.filter((a) => !a.date)
})

// 格式化日期标签
function formatDateLabel(date: Date, isToday: boolean): string {
  if (isToday) return '今天'

  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 1) return '昨天'
  if (days === 2) return '前天'
  if (days < 7) return `${days} 天前`

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="timeline-page">
    <Navbar />
    <div class="timeline-content">
      <header class="timeline-header">
        <h1 class="page-title">
          <svg
            class="title-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          最新动态
        </h1>
        <p class="page-description">
          记录知识的足迹，共 <span class="highlight">{{ stats.totalArticles }}</span> 篇文章
        </p>
      </header>

      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <div v-else class="timeline-wrapper">
        <div class="timeline-line"></div>

        <div
          v-for="(dayGroup, index) in timelineGroups"
          :key="dayGroup.dateStr"
          class="timeline-day"
          :class="{ 'is-today': dayGroup.isToday }"
        >
          <div class="day-marker">
            <div class="marker-dot" :class="{ pulse: index === 0 }"></div>
            <span class="day-label">{{ dayGroup.dateLabel }}</span>
            <span class="day-count">{{ dayGroup.articles.length }} 篇</span>
          </div>

          <div class="day-articles">
            <div
              v-for="article in dayGroup.articles"
              :key="article.path"
              class="article-card"
              @click="navigateTo(article.path)"
            >
              <div class="card-content">
                <h3 class="article-title">{{ article.title }}</h3>
                <div v-if="article.tags.length > 0" class="article-tags">
                  <span v-for="tag in article.tags" :key="tag" class="tag">#{{ tag }}</span>
                </div>
              </div>
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
          </div>
        </div>

        <!-- 无日期文章 -->
        <div v-if="undatedArticles.length > 0" class="timeline-day undated">
          <div class="day-marker">
            <div class="marker-dot"></div>
            <span class="day-label">更早</span>
            <span class="day-count">{{ undatedArticles.length }} 篇</span>
          </div>

          <div class="day-articles">
            <div
              v-for="article in undatedArticles"
              :key="article.path"
              class="article-card"
              @click="navigateTo(article.path)"
            >
              <div class="card-content">
                <h3 class="article-title">{{ article.title }}</h3>
                <div v-if="article.tags.length > 0" class="article-tags">
                  <span v-for="tag in article.tags" :key="tag" class="tag">#{{ tag }}</span>
                </div>
              </div>
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
          </div>
        </div>

        <div v-if="timelineGroups.length === 0 && undatedArticles.length === 0" class="empty-state">
          <svg
            class="empty-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>暂无文章</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.timeline-page {
  min-height: 100vh;
  background: var(--vp-c-bg);
  padding-top: var(--vp-nav-height);
}

.timeline-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 48px 24px;
}

.timeline-header {
  text-align: center;
  margin-bottom: 64px;

  .page-title {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-size: 2.25rem;
    font-weight: 800;
    color: var(--vp-c-text-1);
    margin-bottom: 16px;
    letter-spacing: -0.5px;
  }

  .title-icon {
    width: 36px;
    height: 36px;
    color: var(--vp-c-brand-1);
  }

  .page-description {
    font-size: 1.1rem;
    color: var(--vp-c-text-2);

    .highlight {
      color: var(--vp-c-brand-1);
      font-weight: 600;
      font-family: var(--vp-font-family-mono);
      padding: 0 4px;
    }
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 64px;
  color: var(--vp-c-text-2);

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--vp-c-divider);
    border-top-color: var(--vp-c-brand-1);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.timeline-wrapper {
  position: relative;
  padding-left: 32px;
}

.timeline-line {
  position: absolute;
  left: 7px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(
    to bottom,
    var(--vp-c-brand-1) 0%,
    var(--vp-c-brand-2) 30%,
    var(--vp-c-divider) 100%
  );
  opacity: 0.7;
}

.timeline-day {
  position: relative;
  margin-bottom: 40px;
  animation: slideIn 0.5s ease-out backwards;

  // 错落动画延迟
  @for $i from 1 through 10 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.1}s;
    }
  }

  &.is-today {
    .marker-dot {
      background: var(--vp-c-brand-1);
      border-color: var(--vp-c-bg);
      transform: scale(1.2);
    }

    .day-label {
      color: var(--vp-c-brand-1);
      font-size: 1.1rem;
    }
  }

  &.undated {
    opacity: 0.8;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.day-marker {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  margin-left: -32px;

  .marker-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--vp-c-bg-alt);
    border: 3px solid var(--vp-c-brand-1);
    box-shadow: 0 0 0 3px var(--vp-c-bg);
    z-index: 2;
    transition: all 0.3s ease;

    &.pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  }

  .day-label {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--vp-c-text-1);
    transition: color 0.3s ease;
  }

  .day-count {
    font-size: 0.75rem;
    color: var(--vp-c-text-2);
    background: var(--vp-c-bg-soft);
    padding: 2px 10px;
    border-radius: 20px;
    font-weight: 600;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--vp-c-brand-1-rgb), 0.4);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(var(--vp-c-brand-1-rgb), 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(var(--vp-c-brand-1-rgb), 0);
  }
}

.day-articles {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: var(--vp-c-bg-alt);
  border: 1px solid transparent;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;

  // 悬停效果
  &:hover {
    background: var(--vp-c-bg);
    border-color: var(--vp-c-brand-soft);
    transform: translateY(-4px) scale(1.01);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);

    .article-title {
      color: var(--vp-c-brand-1);
    }

    .arrow-icon {
      opacity: 1;
      transform: translateX(4px);
    }
  }

  .card-content {
    flex: 1;
    min-width: 0;
  }

  .article-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--vp-c-text-1);
    transition: color 0.2s ease;
    word-break: break-word;
    margin-bottom: 8px;
    line-height: 1.5;
  }

  .article-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .tag {
      font-size: 0.75rem;
      color: var(--vp-c-text-2);
      background: var(--vp-c-bg-mute);
      padding: 3px 10px;
      border-radius: 6px;
      transition: all 0.2s ease;

      &:hover {
        color: var(--vp-c-brand-1);
        background: var(--vp-c-brand-soft);
      }
    }
  }

  .arrow-icon {
    width: 20px;
    height: 20px;
    color: var(--vp-c-brand-1);
    opacity: 0;
    transition: all 0.3s ease;
    flex-shrink: 0;
    margin-left: 16px;
  }
}

.empty-state {
  text-align: center;
  padding: 96px 24px;
  color: var(--vp-c-text-3);

  .empty-icon {
    width: 64px;
    height: 64px;
    margin-bottom: 24px;
    opacity: 0.3;
  }

  p {
    font-size: 1.1rem;
  }
}

// 响应式
@media (max-width: 640px) {
  .timeline-content {
    padding: 32px 16px;
  }

  .page-title {
    font-size: 1.75rem !important;
  }

  .timeline-wrapper {
    padding-left: 24px;
  }

  .day-marker {
    margin-left: -24px;
  }

  .article-card {
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .arrow-icon {
      display: none;
    }
  }
}
</style>
