<script setup lang="ts">
import { computed } from 'vue'
import { useMetaInfo } from '@/composables/useMetaInfo'

interface Props {
  url: string
  text?: string
}

const props = defineProps<Props>()

// 获取元信息
const { metadata, loading } = useMetaInfo(props.url)

// 计算显示的域名
const domain = computed(() => {
  try {
    const urlObj = new URL(props.url)
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    return props.url
  }
})

// 计算显示的标题
const displayTitle = computed(() => {
  return metadata.value?.title || props.text || domain.value
})

// 计算显示的描述
const displayDescription = computed(() => {
  return metadata.value?.description || ''
})

// 计算图标
const displayFavicon = computed(() => {
  return (
    metadata.value?.favicon || `https://www.google.com/s2/favicons?domain=${domain.value}&sz=64`
  )
})

// 计算大图
const displayImage = computed(() => {
  return metadata.value?.image
})
</script>

<template>
  <a :href="url" class="link-card" target="_blank" rel="noopener noreferrer">
    <!-- 加载状态 -->
    <div v-if="loading" class="link-card-skeleton">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-description"></div>
        <div class="skeleton-domain"></div>
      </div>
    </div>

    <!-- 内容展示 -->
    <div v-else class="link-card-content">
      <!-- 左侧：文本信息 -->
      <div class="link-card-info">
        <div class="link-card-header">
          <img
            v-if="displayFavicon"
            :src="displayFavicon"
            :alt="domain"
            class="link-card-favicon"
            loading="lazy"
          />
          <span class="link-card-domain">{{ domain }}</span>
        </div>
        <h4 class="link-card-title">{{ displayTitle }}</h4>
        <p v-if="displayDescription" class="link-card-description">
          {{ displayDescription }}
        </p>
      </div>

      <!-- 右侧：预览图 -->
      <div v-if="displayImage" class="link-card-image-wrapper">
        <img :src="displayImage" :alt="displayTitle" class="link-card-image" loading="lazy" />
      </div>
    </div>
  </a>
</template>

<style scoped>
.link-card {
  display: block;
  margin: 16px 0;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  overflow: hidden;
}

.link-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

html.dark .link-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 加载骨架屏 */
.link-card-skeleton {
  display: flex;
  gap: 16px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.6;
  }
}

.skeleton-image {
  width: 120px;
  height: 80px;
  background-color: var(--vp-c-divider);
  border-radius: 4px;
  flex-shrink: 0;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-title {
  height: 20px;
  width: 60%;
  background-color: var(--vp-c-divider);
  border-radius: 4px;
}

.skeleton-description {
  height: 16px;
  width: 90%;
  background-color: var(--vp-c-divider);
  border-radius: 4px;
}

.skeleton-domain {
  height: 14px;
  width: 40%;
  background-color: var(--vp-c-divider);
  border-radius: 4px;
}

/* 内容展示 */
.link-card-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.link-card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.link-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.link-card-favicon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.link-card-domain {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

.link-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.link-card-description {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.link-card-image-wrapper {
  width: 120px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  background-color: var(--vp-c-bg-alt);
}

.link-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .link-card-content {
    flex-direction: column-reverse;
  }

  .link-card-image-wrapper {
    width: 100%;
    height: 160px;
  }

  .skeleton-image {
    width: 100%;
    height: 160px;
  }

  .link-card-skeleton {
    flex-direction: column-reverse;
  }
}
</style>
