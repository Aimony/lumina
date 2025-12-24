```vue
<script setup lang="ts">
import { provide, ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
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
import SmartHoverCard from '@/components/article/SmartHoverCard.vue'
import BacklinkSection from '@/components/article/BacklinkSection.vue' // Added import
import ShareLinks from '@/components/article/ShareLinks.vue'
import Breadcrumb from '@/components/article/Breadcrumb.vue'
import PasswordProtect from '@/components/article/PasswordProtect.vue'
import OfficePreviewModal from '@/components/OfficePreviewModal.vue'
import ArchiveViewer from '@/components/common/ArchiveViewer.vue'
import { useSidebar } from '@/composables/ui/useSidebar'
import { useTOC } from '@/composables/article/useTOC'
import { useLinkCards } from '@/composables/ui/useLinkCards'
import { useImageZoom } from '@/composables/article/useImageZoom'
import { useMermaid } from '@/composables/article/useMermaid'
import { useTabs } from '@/composables/article/useTabs'
import { useSmartHover } from '@/composables/article/useSmartHover'
import { usePasswordProtect } from '@/composables/article/usePasswordProtect'

// 使用 Composables
const { isOpen: sidebarOpen, toggleSidebar } = useSidebar()

// 密码保护
const { isProtected, isUnlocked } = usePasswordProtect()

// 侧边栏宽度调整
const sidebarWidth = ref(272)
const isResizing = ref(false)
const minWidth = 180
const maxWidth = 400

const sidebarStyle = computed(() => ({
  width: `${sidebarWidth.value}px`
}))

const contentStyle = computed(() => ({
  paddingLeft: sidebarOpen.value ? `${sidebarWidth.value}px` : '0'
}))

const startResize = (e: MouseEvent) => {
  isResizing.value = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  e.preventDefault()
}

const doResize = (e: MouseEvent) => {
  if (!isResizing.value) return
  const newWidth = e.clientX
  sidebarWidth.value = Math.min(maxWidth, Math.max(minWidth, newWidth))
}

const stopResize = () => {
  isResizing.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

onMounted(() => {
  document.addEventListener('mousemove', doResize)
  document.addEventListener('mouseup', stopResize)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', doResize)
  document.removeEventListener('mouseup', stopResize)
})
const { headings } = useTOC()

// 处理链接卡片
useLinkCards()

// Mermaid 图表渲染
useMermaid()

// 标签页交互
useTabs()

// 智能悬浮卡
const { attachToContent } = useSmartHover()
const articleRef = ref<HTMLElement | null>(null)
const route = useRoute()

// 监听路由变化，重新绑定悬浮卡事件
watch(
  () => route.path,
  () => {
    nextTick(() => {
      // 延迟一点确保 DOM 更新
      setTimeout(() => {
        if (articleRef.value) {
          attachToContent(articleRef.value)
        }
      }, 500)
    })
  },
  { immediate: true }
)

// 图片放大功能
const { currentImage, hide } = useImageZoom()

// 提供 headings 给子组件 (保持兼容性，虽然 TOC 组件可以直接传参，但 Sidebar 可能也需要?)
// 实际上 TOC 组件是直接传参的 :headings="headings"
provide('headings', headings)

// Office 文件预览状态管理
const officePreviewFile = ref<{ src: string; name: string; type: string } | null>(null)
const setOfficePreviewFile = (file: { src: string; name: string; type: string } | null) => {
  officePreviewFile.value = file
}
provide('setOfficePreviewFile', setOfficePreviewFile)

// 压缩包预览状态管理
const archivePreviewFile = ref<File | null>(null)
const setArchivePreviewFile = (file: File | null) => {
  archivePreviewFile.value = file
}
provide('setArchivePreviewFile', setArchivePreviewFile)
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

    <div class="VPContent" :style="sidebarOpen ? contentStyle : {}">
      <!-- Sidebar -->
      <aside v-show="sidebarOpen" class="VPSidebar" :style="sidebarStyle">
        <Sidebar />
        <!-- 拖拽调整手柄 -->
        <div
          class="resize-handle"
          @mousedown="startResize"
          :class="{ 'is-resizing': isResizing }"
        ></div>
      </aside>

      <!-- Content Area -->
      <div class="VPContent-doc">
        <div class="container">
          <!-- Main Content -->
          <div class="content">
            <main class="main">
              <article ref="articleRef" class="markdown-body">
                <!-- 密码保护遮罩 -->
                <PasswordProtect v-if="isProtected && !isUnlocked" />
                <template v-else>
                  <Breadcrumb />
                  <ArticleTags />
                  <ArticleMeta />
                  <slot />
                  <BacklinkSection />
                  <ShareLinks />
                  <PrevNextNav />
                </template>
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

    <!-- 智能悬浮卡 -->
    <SmartHoverCard />

    <!-- 小猫回到顶部 -->
    <BackToTopCat />

    <!-- Office 文件预览模态框 -->
    <OfficePreviewModal :file="officePreviewFile" @close="officePreviewFile = null" />

    <!-- 压缩包预览组件 -->
    <ArchiveViewer :file="archivePreviewFile" @close="archivePreviewFile = null" />
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
  background-color: var(--vp-c-bg);
  border-right: 1px solid var(--vp-c-divider);
  overflow-y: auto;
}

/* 拖拽调整手柄 */
.resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  background: transparent;
  transition: background-color 0.2s;
}

.resize-handle:hover,
.resize-handle.is-resizing {
  background-color: var(--vp-c-brand-1);
}

@media (max-width: 960px) {
  .VPSidebar {
    transform: translateX(-100%);
  }
}

/* Content Area */
.VPContent {
  transition: padding-left 0.15s;
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

  /* 隐藏滚动条但保留滚动功能 */
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE and Edge */
}

.aside-container::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari, Opera */
}
</style>
