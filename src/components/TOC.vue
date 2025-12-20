<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface Heading {
  id: string
  text: string
  level: number
}

const props = defineProps<{
  headings: Heading[]
}>()

const activeId = ref('')

// 滚动高亮当前章节
const updateActiveHeading = () => {
  const headingElements = props.headings
    .map((h) => document.getElementById(h.id))
    .filter(Boolean) as HTMLElement[]

  const scrollY = window.scrollY + 100 // 偏移量

  for (let i = headingElements.length - 1; i >= 0; i--) {
    const el = headingElements[i]
    if (el && el.offsetTop <= scrollY) {
      activeId.value = props.headings[i]?.id || ''
      return
    }
  }

  if (headingElements.length > 0) {
    activeId.value = props.headings[0]?.id || ''
  }
}

onMounted(() => {
  window.addEventListener('scroll', updateActiveHeading)
  updateActiveHeading()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveHeading)
})

// 当 headings 更新时重新计算
watch(() => props.headings, updateActiveHeading)

const scrollTo = (id: string) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<!-- 文章目录大纲 -->
<template>
  <div v-if="headings.length > 0" class="toc-container">
    <div class="toc-title">
      本页目录
    </div>

    <ul class="toc-list">
      <li v-for="heading in headings" :key="heading.id" :class="{ 'toc-item-nested': heading.level === 3 }">
        <a @click.prevent="scrollTo(heading.id)" :href="'#' + heading.id" class="toc-link"
          :class="{ active: activeId === heading.id }">
          {{ heading.text }}
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.toc-container {
  padding-left: 16px;
  border-left: 1px solid var(--vp-c-divider);
}

.toc-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item-nested {
  margin-left: 12px;
}

.toc-link {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  padding: 4px 0;
  line-height: 1.5;
  transition: color 0.25s;
}

.toc-link:hover {
  color: var(--vp-c-text-1);
}

.toc-link.active {
  color: var(--vp-c-brand-1);
}
</style>
