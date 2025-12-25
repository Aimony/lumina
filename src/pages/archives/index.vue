<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import { useArchiveData } from '@/composables/article/useArchiveData'

const router = useRouter()
const { archiveGroups, stats, isLoading } = useArchiveData()

// 展开状态管理
const expandedYears = ref<Set<number>>(new Set())

// 默认展开第一年
watch(
  () => archiveGroups.value,
  (groups) => {
    if (groups.length > 0 && expandedYears.value.size === 0) {
      expandedYears.value.add(groups[0].year)
    }
  },
  { immediate: true }
)

const toggleYear = (year: number) => {
  if (expandedYears.value.has(year)) {
    expandedYears.value.delete(year)
  } else {
    expandedYears.value.add(year)
  }
}

const isYearExpanded = (year: number) => expandedYears.value.has(year)

const navigateTo = (path: string) => {
  router.push(path)
}

// 格式化日期
const formatDate = (date: Date | null) => {
  if (!date) return ''
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

// 年份显示
const getYearLabel = (year: number) => {
  return year === 0 ? '未分类' : `${year} 年`
}
</script>

<template>
  <div class="archives-page">
    <Navbar />
    <div class="archives-content">
      <header class="archives-header">
        <h1 class="page-title">
          <svg
            class="title-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          文章归档
        </h1>
        <p class="page-description">
          共收录 <span class="highlight">{{ stats.totalArticles }}</span> 篇文章， 横跨
          <span class="highlight">{{ stats.yearsCount }}</span> 年时光
        </p>
      </header>

      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <div v-else class="archives-timeline">
        <div v-for="yearGroup in archiveGroups" :key="yearGroup.year" class="year-section">
          <div
            class="year-header"
            @click="toggleYear(yearGroup.year)"
            :class="{ expanded: isYearExpanded(yearGroup.year) }"
          >
            <div class="year-indicator">
              <div class="year-dot"></div>
              <span class="year-label">{{ getYearLabel(yearGroup.year) }}</span>
              <span class="year-count">{{ yearGroup.totalCount }} 篇</span>
            </div>
            <svg
              class="expand-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          <transition name="collapse">
            <div v-show="isYearExpanded(yearGroup.year)" class="year-content">
              <div
                v-for="monthGroup in yearGroup.months"
                :key="monthGroup.month"
                class="month-section"
              >
                <div class="month-header">
                  <div class="month-line"></div>
                  <span class="month-label">{{ monthGroup.monthName }}</span>
                  <span class="month-count">{{ monthGroup.articles.length }}</span>
                </div>

                <div class="articles-list">
                  <div
                    v-for="article in monthGroup.articles"
                    :key="article.path"
                    class="article-item"
                    @click="navigateTo(article.path)"
                  >
                    <div class="article-date">{{ formatDate(article.date) }}</div>
                    <div class="article-info">
                      <span class="article-title">{{ article.title }}</span>
                      <div v-if="article.tags.length > 0" class="article-tags">
                        <span v-for="tag in article.tags" :key="tag" class="tag">#{{ tag }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <div v-if="archiveGroups.length === 0" class="empty-state">
          <svg
            class="empty-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            ></path>
          </svg>
          <p>暂无文章</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.archives-page {
  min-height: 100vh;
  background: var(--vp-c-bg);
  padding-top: var(--vp-nav-height);
}

.archives-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 48px 24px;
}

.archives-header {
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

.archives-timeline {
  position: relative;
  padding-left: 32px;

  // 主时间轴线
  &::before {
    content: '';
    position: absolute;
    left: 7px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(
      to bottom,
      var(--vp-c-brand-1) 0%,
      var(--vp-c-divider) 15%,
      var(--vp-c-divider) 85%,
      transparent 100%
    );
    opacity: 0.6;
  }
}

.year-section {
  position: relative;
  margin-bottom: 32px;

  // 年份头部
  .year-header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    margin-left: -32px; // 延伸到左侧覆盖线条
    background: var(--vp-c-bg-alt);
    border: 1px solid transparent;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    z-index: 2;

    &:hover {
      background: var(--vp-c-bg-soft);
      border-color: var(--vp-c-brand-soft);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);

      .year-dot {
        transform: scale(1.2);
        box-shadow:
          0 0 0 6px var(--vp-c-bg),
          0 0 12px rgba(var(--vp-c-brand-1-rgb), 0.4);
      }
    }

    &.expanded {
      background: var(--vp-c-bg-soft);

      .expand-icon {
        transform: rotate(180deg);
      }
    }
  }

  .year-indicator {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .year-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--vp-c-brand-1);
    border: 3px solid var(--vp-c-bg);
    box-shadow: 0 0 0 2px var(--vp-c-brand-1);
    transition: all 0.3s ease;
  }

  .year-label {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--vp-c-text-1);
    letter-spacing: -0.5px;
  }

  .year-count {
    font-size: 0.8rem;
    color: var(--vp-c-text-2);
    background: var(--vp-c-bg);
    padding: 4px 10px;
    border-radius: 20px;
    font-weight: 600;
  }

  .expand-icon {
    width: 20px;
    height: 20px;
    color: var(--vp-c-text-3);
    transition: transform 0.3s ease;
  }
}

.year-content {
  padding-top: 24px;
}

.month-section {
  position: relative;
  margin-bottom: 24px;
  padding-left: 8px;

  // 月份头部
  .month-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    position: relative;

    .month-line {
      position: absolute;
      left: -32px;
      width: 20px;
      height: 1px;
      background: var(--vp-c-divider);
      opacity: 0.8;
      display: flex;
      align-items: center;

      // 月份节点圆点
      &::before {
        content: '';
        position: absolute;
        left: 0;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--vp-c-bg);
        border: 2px solid var(--vp-c-divider);
        transform: translateX(-50%);
        transition: all 0.3s ease;
      }
    }

    &:hover .month-line::before {
      border-color: var(--vp-c-brand-1);
      background: var(--vp-c-brand-1);
    }

    .month-label {
      font-size: 1rem;
      font-weight: 700;
      color: var(--vp-c-text-2);
    }

    .month-count {
      font-size: 0.75rem;
      color: var(--vp-c-brand-1);
      background: var(--vp-c-brand-soft);
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 600;
    }
  }
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.article-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 16px 20px;
  background: var(--vp-c-bg-alt);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  margin-left: -8px; // 视觉修正

  &:hover {
    background: var(--vp-c-bg);
    border-color: var(--vp-c-brand-soft);
    transform: translateX(6px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .article-title {
      color: var(--vp-c-brand-1);
    }

    .article-date {
      color: var(--vp-c-text-1);
    }
  }

  .article-date {
    flex-shrink: 0;
    width: 60px;
    font-size: 0.85rem;
    color: var(--vp-c-text-3);
    font-family: var(--vp-font-family-mono);
    line-height: 1.6;
    transition: color 0.2s ease;
  }

  .article-info {
    flex: 1;
    min-width: 0;
  }

  .article-title {
    font-size: 1.05rem;
    color: var(--vp-c-text-1);
    font-weight: 500;
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
      padding: 2px 8px;
      border-radius: 6px;
      transition: all 0.2s ease;

      &:hover {
        color: var(--vp-c-brand-1);
        background: var(--vp-c-brand-soft);
      }
    }
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

// 折叠动画
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 2000px;
  transform: translateY(0);
}

// 响应式
@media (max-width: 640px) {
  .archives-content {
    padding: 32px 16px;
  }

  .page-title {
    font-size: 1.75rem !important;
  }

  .year-header {
    padding: 12px 16px !important;
  }

  .article-item {
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
  }

  .article-date {
    width: auto !important;
    font-size: 0.8rem;
  }
}
</style>
