<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMetaInfo } from '@/composables/core/useMetaInfo'

interface Props {
  url: string
  text?: string
}

const props = defineProps<Props>()

// 图片加载失败状态
const imageError = ref(false)
const faviconError = ref(false)

// 处理图片加载失败
const handleImageError = () => {
  imageError.value = true
}

// 处理 favicon 加载失败
const handleFaviconError = () => {
  faviconError.value = true
}

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
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-description"></div>
        <div class="skeleton-footer"></div>
      </div>
      <div class="skeleton-image"></div>
    </div>

    <!-- 内容展示 -->
    <div v-else class="link-card-container">
      <!-- 左侧：文本信息 -->
      <div class="link-card-info">
        <h4 class="link-card-title">{{ displayTitle }}</h4>
        <p v-if="displayDescription" class="link-card-description">
          {{ displayDescription }}
        </p>

        <!-- 底部：图标和域名 -->
        <div class="link-card-footer">
          <img
            v-if="displayFavicon && !faviconError"
            :src="displayFavicon"
            :alt="domain"
            class="link-card-favicon"
            loading="lazy"
            @error="handleFaviconError"
          />
          <span class="link-card-domain">{{ domain }}</span>
        </div>
      </div>

      <!-- 右侧：预览图 -->
      <div v-if="displayImage && !imageError" class="link-card-image-wrapper">
        <img
          :src="displayImage"
          :alt="displayTitle"
          class="link-card-image"
          loading="lazy"
          @error="handleImageError"
        />
      </div>
    </div>
  </a>
</template>

<style scoped>
.link-card {
  display: block;
  margin: 16px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  /* 稍微减小圆角，更精致 */
  background-color: var(--vp-c-bg);
  /* 改为背景色，更干净 */
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  /* 加快动画 */
  overflow: hidden;
}

.link-card:hover {
  background-color: var(--vp-c-bg-alt);
  /* hover 时变色 */
  border-color: var(--vp-c-divider);
  /* 保持边框颜色，避免过于突兀 */
}

html.dark .link-card:hover {
  background-color: var(--vp-c-bg-alt);
}

/* 内部容器 */
.link-card-container {
  display: flex;
  /* height: 120px; fixed height removed to prevent clipping */
  min-height: 100px;
  /* Ensure a decent minimum size */
}

/* 左侧信息区 */
.link-card-info {
  flex: 1;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 8px;
  /* Use gap for spacing instead of space-between */
}

.link-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
  line-height: 1.5;
  /* Increased line-height */
  /* Remove single line constraint to allow wrapping if needed, but keeping ellipsis for standard Notion look */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-card-description {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin: 0;
  /* Align top */
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.link-card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  /* Consistent gap */
  margin-top: auto;
  /* Push to bottom if container grows */
  padding-top: 4px;
  /* Slight separation */
}

.link-card-favicon {
  width: 16px;
  /* Standardize size */
  height: 16px;
  border-radius: 2px;
  flex-shrink: 0;
  margin: 0 !important;
  max-width: none !important;
}

.link-card-domain {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  /* Better contrast */
}

/* 右侧图片区 */
.link-card-image-wrapper {
  width: 160px;
  /* Slightly narrower */
  /* Height will match container due to flex stretch */
  flex-shrink: 0;
  border-left: 1px solid var(--vp-c-divider);
  position: relative;
  display: flex;
  /* Ensure image behaves */
}

.link-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  margin: 0 !important;
  border-radius: 0;
  max-width: none !important;
}

/* 骨架屏样式适配 */
.link-card-skeleton {
  display: flex;
  height: 120px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-content {
  flex: 1;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-title {
  height: 20px;
  width: 70%;
  background-color: var(--vp-c-divider);
  border-radius: 4px;
}

.skeleton-description {
  height: 16px;
  width: 90%;
  background-color: var(--vp-c-divider);
  border-radius: 4px;
}

.skeleton-footer {
  height: 14px;
  width: 30%;
  background-color: var(--vp-c-divider);
  border-radius: 4px;
  margin-top: auto;
}

.skeleton-image {
  width: 180px;
  height: 100%;
  background-color: var(--vp-c-divider);
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

/* 移动端适配 */
@media (max-width: 640px) {
  .link-card-container,
  .link-card-skeleton {
    height: auto;
    flex-direction: column-reverse;
    /* 图片上移或下移？Notion通常是图片在上或并在右侧但变小 */
    /* 这里选择保留图片在下方作为banner，或者隐藏图片？ */
    /* 模仿 Notion 移动端：图片变小缩略图在右侧，或者变为上下结构 */
    /* 采用上下结构：图片在上方 */
    flex-direction: column;
  }

  .link-card-image-wrapper,
  .skeleton-image {
    width: 100%;
    height: 140px;
    border-left: none;
    border-bottom: 1px solid var(--vp-c-divider);
    order: -1;
    /* 图片置顶 */
  }
}
</style>
