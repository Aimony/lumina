<script setup lang="ts">
import type { SearchResult } from '@/composables/core/useSearch'

interface Props {
  item: SearchResult | null
}

defineProps<Props>()

/**
 * 从文档 ID 提取面包屑路径
 */
const getBreadcrumb = (id: string): string[] => {
  // 示例: "/docs/example/test" -> ["docs", "example", "test"]
  return id
    .split('/')
    .filter((part) => part && part !== 'docs')
    .slice(0, -1) // 移除最后的文件名部分
}

/**
 * 格式化内容摘要
 */
const formatContent = (content: string | undefined): string => {
  if (!content) return '暂无内容预览'
  // 移除多余的空白，截取前 200 字符
  return content.replace(/\s+/g, ' ').trim().slice(0, 200) + '...'
}
</script>

<template>
  <div class="preview-card">
    <Transition name="preview-fade" mode="out-in">
      <div v-if="item" :key="item.id" class="preview-content">
        <!-- 路径面包屑 -->
        <div v-if="getBreadcrumb(item.id).length > 0" class="preview-breadcrumb">
          <span
            v-for="(crumb, index) in getBreadcrumb(item.id)"
            :key="index"
            class="breadcrumb-item"
          >
            {{ crumb }}
            <span v-if="index < getBreadcrumb(item.id).length - 1" class="breadcrumb-sep">/</span>
          </span>
        </div>

        <!-- 标题 -->
        <h3 class="preview-title">{{ item.title }}</h3>

        <!-- 标签 -->
        <div v-if="item.tags && item.tags.length > 0" class="preview-tags">
          <span v-for="tag in item.tags.slice(0, 5)" :key="tag" class="preview-tag">
            {{ tag }}
          </span>
        </div>

        <!-- 内容摘要 -->
        <p class="preview-summary">{{ formatContent(item.content) }}</p>

        <!-- 快捷键提示 -->
        <div class="preview-hint"><kbd>↵</kbd> 打开文档</div>
      </div>

      <!-- 空状态 -->
      <div v-else class="preview-empty">
        <div class="empty-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </div>
        <p>选择一个结果以预览</p>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.preview-card {
  width: 280px;
  min-height: 300px;
  padding: 16px;
  border-left: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-alt);
  display: flex;
  flex-direction: column;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// 面包屑路径
.preview-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.breadcrumb-sep {
  color: var(--vp-c-divider);
}

// 标题
.preview-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}

// 标签
.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.preview-tag {
  padding: 2px 8px;
  font-size: 11px;
  border-radius: 10px;
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

// 内容摘要
.preview-summary {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  flex: 1;
}

// 快捷键提示
.preview-hint {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 12px;
  color: var(--vp-c-text-3);

  kbd {
    background-color: var(--vp-c-bg);
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    padding: 2px 6px;
    font-family: inherit;
    font-size: 11px;
  }
}

// 空状态
.preview-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--vp-c-text-3);

  .empty-icon {
    opacity: 0.3;
  }

  p {
    margin: 0;
    font-size: 13px;
  }
}

// 过渡动画
.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: opacity 0.15s ease;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
}
</style>
