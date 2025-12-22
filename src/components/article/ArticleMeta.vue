<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// 从路由元数据中获取文章信息
const wordCount = computed(() => route.meta.wordCount as number | undefined)
const readingTime = computed(() => route.meta.readingTime as string | undefined)
const date = computed(() => route.meta.date as string | undefined)

// 格式化字数显示
const formattedWordCount = computed(() => {
  if (!wordCount.value) return null
  if (wordCount.value >= 10000) {
    return `${(wordCount.value / 10000).toFixed(1)}万字`
  }
  return `${wordCount.value}字`
})

// 格式化阅读时间（reading-time 库返回的是英文，转换为中文）
const formattedReadingTime = computed(() => {
  if (!readingTime.value) return null
  // "5 min read" -> "5分钟"
  const match = readingTime.value.match(/(\d+)\s*min/)
  if (match) {
    return `${match[1]}分钟`
  }
  return readingTime.value
})

// 格式化日期
const formattedDate = computed(() => {
  if (!date.value) return null
  try {
    const d = new Date(date.value)
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return date.value
  }
})

// 是否有任何元数据需要显示
const hasMeta = computed(
  () => formattedWordCount.value || formattedReadingTime.value || formattedDate.value
)
</script>

<template>
  <div v-if="hasMeta" class="mb-6 pb-4 border-b border-[var(--vp-c-divider)]">
    <div class="flex flex-wrap items-center gap-4">
      <!-- 日期 -->
      <span
        v-if="formattedDate"
        class="inline-flex items-center gap-1.5 text-sm text-[var(--vp-c-text-2)]"
      >
        <svg
          class="w-4 h-4 shrink-0 opacity-70"
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
        <span>{{ formattedDate }}</span>
      </span>

      <!-- 字数 -->
      <span
        v-if="formattedWordCount"
        class="inline-flex items-center gap-1.5 text-sm text-[var(--vp-c-text-2)]"
      >
        <svg
          class="w-4 h-4 shrink-0 opacity-70"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <span>{{ formattedWordCount }}</span>
      </span>

      <!-- 阅读时间 -->
      <span
        v-if="formattedReadingTime"
        class="inline-flex items-center gap-1.5 text-sm text-[var(--vp-c-text-2)]"
      >
        <svg
          class="w-4 h-4 shrink-0 opacity-70"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>{{ formattedReadingTime }}</span>
      </span>
    </div>
  </div>
</template>
