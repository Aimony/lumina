<script setup lang="ts">
import { ref, onMounted, provide, watch } from 'vue'
import { useRoute } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'
import Sidebar from '@/components/Sidebar.vue'
import TOC from '@/components/TOC.vue'

// 文章标题（从 DOM 提取 h2/h3）
const headings = ref<{ id: string; text: string; level: number }[]>([])
provide('headings', headings)

// 侧边栏展开状态
const sidebarOpen = ref(true)

// Extract headings function
const extractHeadings = () => {
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
}

onMounted(extractHeadings)

// Watch route path to re-extract headings
const route = useRoute()
watch(() => route.path, extractHeadings)
</script>

<template>
  <div class="layout-container">
    <!-- Header (Consistent with DefaultLayout) -->
    <header class="navbar">
      <div class="navbar-wrapper">
        <div class="navbar-container">
          <!-- Left: Toggle & Logo -->
          <div class="navbar-title">
            <button @click="sidebarOpen = !sidebarOpen" class="menu-toggle lg:hidden">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <router-link to="/" class="title-link">
              <span class="logo">📚</span>
              <span class="text">Lumina</span>
            </router-link>
          </div>

          <!-- Right: Nav & Actions -->
          <div class="navbar-content">
            <nav class="navbar-menu hidden md:flex">
              <router-link to="/guide/intro" class="menu-link" active-class="active">
                指南
              </router-link>
              <router-link to="/games/snake" class="menu-link" active-class="active">
                贪吃蛇
              </router-link>
            </nav>
            <div class="navbar-actions">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Layout -->
    <div class="VPLocalNav">
      <!-- Optional: Breadcrumbs or local nav bar could go here -->
    </div>

    <div class="VPContent" :class="{ 'has-sidebar': sidebarOpen }">
      <!-- Sidebar -->
      <aside v-show="sidebarOpen" class="VPSidebar">
        <Sidebar />
      </aside>

      <!-- Content Area -->
      <div class="VPContent-doc">
        <div class="container">
          <!-- Main Content -->
          <div class="content">
            <main class="main">
              <article class="markdown-body">
                <slot />
              </article>
            </main>
          </div>

          <!-- TOC -->
          <aside class="VPDocAside hidden xl:block">
            <div class="aside-container">
              <div class="aside-content">
                <TOC :headings="headings" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout-container {
  min-height: 100vh;
  background-color: var(--vp-c-bg);
  transition: background-color 0.25s;
  padding-top: var(--vp-nav-height);
}

/* Navbar (Reused from Standard, verify consistency) */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  height: var(--vp-nav-height);
  background-color: rgba(255, 255, 255, 0.82);
  backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--vp-c-divider);
  transition: background-color 0.25s, border-color 0.25s;
}

:global(.dark) .navbar {
  background-color: rgba(27, 27, 31, 0.82);
}

.navbar-wrapper {
  /* max-width: 1400px; Remove max-width for full width feel on docs */
  margin: 0 auto;
  height: 100%;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 24px;
}

.navbar-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.menu-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-text-2);
  transition: color 0.25s;
  cursor: pointer;
}

.menu-toggle:hover {
  color: var(--vp-c-text-1);
}

.navbar-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.navbar-menu {
  display: flex;
  gap: 24px;
}

.menu-link {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.menu-link:hover,
.menu-link.active {
  color: var(--vp-c-brand-1);
}

.navbar-actions {
  display: flex;
  align-items: center;
  padding-left: 16px;
  border-left: 1px solid var(--vp-c-divider);
}

/* Sidebar */
.VPSidebar {
  position: fixed;
  top: var(--vp-nav-height);
  bottom: 0;
  left: 0;
  z-index: 40;
  width: 272px;
  background-color: var(--vp-c-bg);
  border-right: 1px solid var(--vp-c-divider);
  overflow-y: auto;
  transition: transform 0.25s;
}

@media (max-width: 960px) {
  .VPSidebar {
    transform: translateX(-100%);
  }
}

/* Content Area */
.VPContent {
  padding-left: 0;
  transition: padding-left 0.25s;
}

@media (min-width: 960px) {
  .VPContent.has-sidebar {
    padding-left: 272px;
  }
}

.VPContent-doc {
  padding: 32px 24px 96px;
}

@media (min-width: 768px) {
  .VPContent-doc {
    padding: 48px 32px 128px;
  }
}

.container {
  margin: 0 auto;
  max-width: 1104px;
  /* VitePress defaultish */
  display: flex;
  gap: 64px;
}

.content {
  flex-grow: 1;
  min-width: 0;
}

/* Right Aside (TOC) */
.VPDocAside {
  display: none;
  flex-shrink: 0;
  width: 224px;
}

@media (min-width: 1280px) {
  .VPDocAside {
    display: block;
  }
}

.aside-container {
  position: sticky;
  top: calc(var(--vp-nav-height) + 32px);
  max-height: calc(100vh - var(--vp-nav-height) - 64px);
  overflow-y: auto;
}
</style>
