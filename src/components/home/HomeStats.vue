<script setup lang="ts">
import { useKnowledgeStats } from '@/composables/core/useKnowledgeStats'

const { stats, loading, formattedWordCount } = useKnowledgeStats()

interface StatCard {
  icon: string
  label: string
  key: keyof typeof stats.value | 'wordCount'
  suffix?: string
  color: string
}

const statCards: StatCard[] = [
  {
    icon: '📚',
    label: '文档总数',
    key: 'totalDocuments',
    suffix: '篇',
    color: 'var(--vp-c-brand-1)'
  },
  {
    icon: '📁',
    label: '知识分类',
    key: 'totalCategories',
    suffix: '个',
    color: '#3b82f6'
  },
  {
    icon: '🏷️',
    label: '标签数量',
    key: 'totalTags',
    suffix: '个',
    color: '#8b5cf6'
  },
  {
    icon: '🔗',
    label: '知识链接',
    key: 'totalLinks',
    suffix: '条',
    color: '#f59e0b'
  },
  {
    icon: '✍️',
    label: '累计字数',
    key: 'wordCount',
    suffix: '字',
    color: '#ec4899'
  },
  {
    icon: '🔄',
    label: '近期更新',
    key: 'recentUpdates',
    suffix: '篇',
    color: '#10b981'
  }
]

const getStatValue = (key: StatCard['key']) => {
  if (key === 'wordCount') {
    return formattedWordCount.value
  }
  return stats.value[key as keyof typeof stats.value]
}
</script>

<template>
  <section class="stats-section">
    <div class="stats-container">
      <h2 class="stats-title">📊 知识库概览</h2>
      <div class="stats-grid">
        <div
          v-for="card in statCards"
          :key="card.key"
          class="stat-card"
          :style="{ '--accent-color': card.color }"
        >
          <div class="stat-icon">{{ card.icon }}</div>
          <div class="stat-content">
            <div class="stat-value" :class="{ loading }">
              <template v-if="!loading">
                {{ getStatValue(card.key) }}
                <span class="stat-suffix">{{ card.suffix }}</span>
              </template>
              <span v-else class="skeleton"></span>
            </div>
            <div class="stat-label">{{ card.label }}</div>
          </div>
          <div class="stat-accent"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.stats-section {
  padding: 48px 24px;

  @media (min-width: 640px) {
    padding: 64px 48px;
  }

  @media (min-width: 960px) {
    padding: 80px 64px;
  }
}

.stats-container {
  max-width: 1152px;
  margin: 0 auto;
}

.stats-title {
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 32px;

  @media (min-width: 640px) {
    font-size: 28px;
    margin-bottom: 40px;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  @media (min-width: 960px) {
    grid-template-columns: repeat(6, 1fr);
    gap: 24px;
  }
}

.stat-card {
  position: relative;
  background: var(--vp-c-bg-alt);
  border-radius: 16px;
  padding: 20px 16px;
  text-align: center;
  border: 1px solid var(--vp-c-divider);
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    border-color: var(--accent-color);
    box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);

    &::before {
      opacity: 1;
    }

    .stat-accent {
      transform: scale(1.5);
      opacity: 0.12;
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent-color), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  // 玻璃态效果
  @supports (backdrop-filter: blur(10px)) {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);

    :global(.dark) & {
      background: rgba(32, 33, 39, 0.7);
    }
  }
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 12px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.stat-content {
  position: relative;
  z-index: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  line-height: 1.2;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;

  @media (min-width: 640px) {
    font-size: 32px;
  }

  &.loading {
    min-height: 34px;
  }
}

.stat-suffix {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.stat-label {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin-top: 8px;
  font-weight: 500;
}

.stat-accent {
  position: absolute;
  bottom: -20px;
  right: -20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--accent-color);
  opacity: 0.08;
  transition: all 0.3s ease;
}

.skeleton {
  display: inline-block;
  width: 60px;
  height: 28px;
  background: linear-gradient(
    90deg,
    var(--vp-c-bg-soft) 25%,
    var(--vp-c-divider) 50%,
    var(--vp-c-bg-soft) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 6px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
