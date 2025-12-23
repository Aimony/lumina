<script setup lang="ts">
import { provide } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import TOC from '@/components/article/TOC.vue'
import Navbar from '@/components/layout/Navbar.vue'
import ImageViewer from '@/components/common/ImageViewer.vue'
import BackToTopCat from '@/components/common/BackToTopCat.vue'
import ReadingProgress from '@/components/article/ReadingProgress.vue'
import PrevNextNav from '@/components/article/PrevNextNav.vue'
import ArticleTags from '@/components/article/ArticleTags.vue'
import ArticleMeta from '@/components/article/ArticleMeta.vue'
import GraphView from '@/components/article/GraphView.vue'
import { useSidebar } from '@/composables/ui/useSidebar'
import { useTOC } from '@/composables/article/useTOC'
import { useLinkCards } from '@/composables/ui/useLinkCards'
import { useImageZoom } from '@/composables/article/useImageZoom'
import { useMermaid } from '@/composables/article/useMermaid'
import { useTabs } from '@/composables/article/useTabs'

// 使用 Composables
const { isOpen: sidebarOpen, toggleSidebar } = useSidebar()
const { headings } = useTOC()

// 处理链接卡片
useLinkCards()

// Mermaid 图表渲染
useMermaid()

// 标签页交互
useTabs()

// 图片放大功能
const { currentImage, hide } = useImageZoom()

// 提供 headings 给子组件 (保持兼容性，虽然 TOC 组件可以直接传参，但 Sidebar 可能也需要?)
// 实际上 TOC 组件是直接传参的 :headings="headings"
provide('headings', headings)
</script>

<template>
  <div class="layout-container">
    <!-- Header (Consistent with DefaultLayout) -->
    <Navbar>
      <template #toggle-bar>
        <button @click="toggleSidebar" class="menu-toggle lg:hidden">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </template>
    </Navbar>

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
                <ArticleTags />
                <ArticleMeta />
                <slot />
                <PrevNextNav />
              </article>
            </main>
          </div>

          <!-- TOC -->
          <aside class="VPDocAside hidden xl:block">
            <div class="aside-container">
              <div class="aside-content">
                <GraphView />
                <TOC :headings="headings" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>

    <!-- 图片查看器 -->
    <ImageViewer :image="currentImage" @close="hide" />

    <!-- 阅读进度悬浮球 -->
    <ReadingProgress />

    <!-- 小猫回到顶部 -->
    <BackToTopCat />
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
/* Moved to Navbar.vue */

.menu-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-text-2);
  transition: color 0.25s;
  cursor: pointer;
  margin-right: 16px;
  /* Added margin for spacing between toggle and logo, since previous layout had gap: 16px on navbar-title */
}

.menu-toggle:hover {
  color: var(--vp-c-text-1);
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
