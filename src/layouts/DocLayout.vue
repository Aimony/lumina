<script setup lang="ts">
import { inject, ref, onMounted, provide } from 'vue'
import { useRoute } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'
import Sidebar from '@/components/Sidebar.vue'
import TOC from '@/components/TOC.vue'

const route = useRoute()
const isDark = inject<{ value: boolean }>('isDark')

// 文章标题（从 DOM 提取 h2/h3）
const headings = ref<{ id: string; text: string; level: number }[]>([])
provide('headings', headings)

// 侧边栏展开状态
const sidebarOpen = ref(true)

onMounted(() => {
  // 延迟提取标题，等待 Markdown 渲染完成
  setTimeout(() => {
    const h2h3 = document.querySelectorAll('.markdown-body h2, .markdown-body h3')
    headings.value = Array.from(h2h3).map((el) => ({
      id: el.id || el.textContent?.toLowerCase().replace(/\s+/g, '-') || '',
      text: el.textContent || '',
      level: el.tagName === 'H2' ? 2 : 3,
    }))
    
    // 为没有 id 的标题添加 id
    h2h3.forEach((el) => {
      if (!el.id) {
        el.id = el.textContent?.toLowerCase().replace(/\s+/g, '-') || ''
      }
    })
  }, 100)
})
</script>

<template>
  <div class="min-h-screen bg-[var(--color-bg)]">
    <!-- Header -->
    <header class="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-sm">
      <div class="max-w-[1800px] mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <!-- 侧边栏切换按钮 -->
          <button 
            @click="sidebarOpen = !sidebarOpen"
            class="p-2 rounded-lg hover:bg-[var(--color-sidebar-bg)] transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          
          <router-link to="/" class="flex items-center gap-2 text-xl font-bold text-[var(--color-text)]">
            <span class="text-2xl">📚</span>
            <span>KB-Vue</span>
          </router-link>
        </div>
        
        <nav class="flex items-center gap-6">
          <router-link 
            to="/" 
            class="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            首页
          </router-link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
    
    <!-- Main Layout: Sidebar | Content | TOC -->
    <div class="max-w-[1800px] mx-auto flex">
      <!-- Sidebar -->
      <aside 
        v-show="sidebarOpen"
        class="w-64 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-sidebar-bg)] sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto"
      >
        <Sidebar />
      </aside>
      
      <!-- Content -->
      <main class="flex-1 min-w-0 px-8 py-6">
        <article class="markdown-body max-w-3xl mx-auto">
          <slot />
        </article>
      </main>
      
      <!-- TOC -->
      <aside class="w-56 shrink-0 hidden xl:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-6 pr-4">
        <TOC :headings="headings" />
      </aside>
    </div>
  </div>
</template>
