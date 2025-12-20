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
    if (headingElements[i].offsetTop <= scrollY) {
      activeId.value = props.headings[i].id
      return
    }
  }
  
  if (headingElements.length > 0) {
    activeId.value = props.headings[0].id
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

<template>
  <div v-if="headings.length > 0">
    <div class="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
      本页目录
    </div>
    
    <ul class="space-y-1 border-l border-[var(--color-border)]">
      <li 
        v-for="heading in headings" 
        :key="heading.id"
        :class="{ 'ml-3': heading.level === 3 }"
      >
        <a
          @click.prevent="scrollTo(heading.id)"
          :href="'#' + heading.id"
          :class="[
            'block py-1 text-sm transition-colors cursor-pointer',
            heading.level === 2 ? 'px-3' : 'px-3',
            activeId === heading.id
              ? 'text-[var(--color-link)] border-l-2 border-[var(--color-link)] -ml-px font-medium'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
          ]"
        >
          {{ heading.text }}
        </a>
      </li>
    </ul>
  </div>
</template>
