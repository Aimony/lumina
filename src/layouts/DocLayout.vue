<script setup lang="ts">
import {
  provide,
  ref,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
  computed,
  defineAsyncComponent
} from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'

// 布局组件
import Sidebar from '@/components/layout/Sidebar.vue'
import TOC from '@/components/article/TOC.vue'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'

// 文章组件
import Breadcrumb from '@/components/article/Breadcrumb.vue'
import ArticleTags from '@/components/article/ArticleTags.vue'
import ArticleMeta from '@/components/article/ArticleMeta.vue'
import PrevNextNav from '@/components/article/PrevNextNav.vue'
import BacklinkSection from '@/components/article/BacklinkSection.vue'
import ShareLinks from '@/components/article/ShareLinks.vue'
import GraphView from '@/components/article/GraphView.vue'
import ReadingProgress from '@/components/article/ReadingProgress.vue'
import PasswordProtect from '@/components/article/PasswordProtect.vue'
import SmartHoverCard from '@/components/article/SmartHoverCard.vue'

// 通用组件
import BackToTopCat from '@/components/common/BackToTopCat.vue'

// 预览组件 - 异步加载以优化首屏性能
const ImageViewer = defineAsyncComponent(() => import('@/components/common/ImageViewer.vue'))
const ArchiveViewer = defineAsyncComponent(() => import('@/components/common/ArchiveViewer.vue'))
const OfficePreviewModal = defineAsyncComponent(
  () => import('@/components/office/OfficePreviewModal.vue')
)
const EpubPreviewModal = defineAsyncComponent(
  () => import('@/components/office/EpubPreviewModal.vue')
)

// Composables - 核心功能
import { useSidebar } from '@/composables/ui/useSidebar'
import { useTOC } from '@/composables/article/useTOC'
import { useLinkCards } from '@/composables/ui/useLinkCards'
import { useImageZoom } from '@/composables/article/useImageZoom'
import { useMermaid } from '@/composables/article/useMermaid'
import { useTabs } from '@/composables/article/useTabs'
import { useSmartHover } from '@/composables/article/useSmartHover'
import { usePasswordProtect } from '@/composables/article/usePasswordProtect'

// Composables - 布局功能
import { useImmersiveMode } from '@/composables/layout/useImmersiveMode'
import { useSidebarResize } from '@/composables/layout/useSidebarResize'
import { useEdgeTrigger } from '@/composables/layout/useEdgeTrigger'
import { useHashScroll } from '@/composables/layout/useHashScroll'
import { useFilePreview } from '@/composables/layout/useFilePreview'

// ============================================
// Composables 初始化
// ============================================

// 侧边栏开关
const { isOpen: sidebarOpen, toggleSidebar } = useSidebar()

// 密码保护
const { isProtected, isUnlocked } = usePasswordProtect()

// 沉浸模式
const {
  immersiveMode,
  contentWidth,
  contentBgColor,
  initFromStorage: initImmersiveMode,
  provideImmersiveContext
} = useImmersiveMode()

// 侧边栏拖拽
const {
  // sidebarWidth, // unused
  isResizing,
  sidebarStyle,
  getContentStyle,
  startResize,
  setupResizeListeners,
  cleanupResizeListeners
} = useSidebarResize()

// 边缘触发（沉浸模式）
const {
  showNavbarOnHover,
  showSidebarOnHover,
  navbarHiding,
  sidebarHiding,
  setupEdgeTrigger,
  cleanupEdgeTrigger
} = useEdgeTrigger(immersiveMode)

// URL 锚点滚动
const { setupHashScrollWatchers, initHashScroll } = useHashScroll()

// 文件预览
const {
  officePreviewFile,
  archivePreviewFile,
  epubPreviewFile,
  closeOfficePreview,
  closeArchivePreview,
  closeEpubPreview,
  setupPreviewListeners,
  cleanupPreviewListeners,
  provideFilePreviewContext
} = useFilePreview()

// TOC
const { headings } = useTOC()
provide('headings', headings)

// 图片放大
const { currentImage, hide: hideImage } = useImageZoom()

// 其他功能
useLinkCards()
useMermaid()
useTabs()

// 智能悬浮卡
const { attachToContent } = useSmartHover()
const articleRef = ref<HTMLElement | null>(null)
const route = useRoute()

// ============================================
// 生命周期
// ============================================

onMounted(() => {
  // 初始化沉浸模式
  initImmersiveMode()

  // 设置事件监听
  setupResizeListeners()
  setupEdgeTrigger()
  setupPreviewListeners()

  // 锚点滚动
  initHashScroll()
})

onUnmounted(() => {
  cleanupResizeListeners()
  cleanupEdgeTrigger()
  cleanupPreviewListeners()
})

// Provide 上下文
provideImmersiveContext()
provideFilePreviewContext()

// 设置 hash 滚动监听
setupHashScrollWatchers()

// 监听路由变化，重新绑定悬浮卡事件
watch(
  () => route.path,
  () => {
    nextTick(() => {
      setTimeout(() => {
        if (articleRef.value) {
          attachToContent(articleRef.value)
        }
      }, 500)
    })
  },
  { immediate: true }
)

// ============================================
// 计算属性
// ============================================

const contentStyle = () => getContentStyle(sidebarOpen.value)

// 主题状态
const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

// 背景颜色映射
const darkColorMap: Record<string, string> = {
  '#FAF9DE': '#2C2B25', // 暖光 -> 深暖色
  '#E3EDCD': '#252C26', // 护眼 -> 深绿色
  '#F5F5F5': '#1E1E20' // 暗灰 -> 深灰色
}

// 计算实际应用的背景颜色
const actualContentBgColor = computed(() => {
  if (!contentBgColor.value) return ''

  // 如果是暗黑模式，映射到对应的深色背景
  if (isDark.value) {
    return darkColorMap[contentBgColor.value] || contentBgColor.value
  }

  // 浅色模式保持原色
  return contentBgColor.value
})
</script>

<template>
  <div
    class="doc-layout"
    :class="{ 'immersive-mode': immersiveMode }"
    :style="actualContentBgColor ? { backgroundColor: actualContentBgColor } : {}"
  >
    <!-- Navbar -->
    <Navbar
      v-if="!immersiveMode || showNavbarOnHover"
      :class="{
        'immersive-navbar': immersiveMode && showNavbarOnHover,
        'immersive-navbar-hiding': navbarHiding
      }"
    >
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
    <div class="VPLocalNav"></div>

    <div class="VPContent" :style="sidebarOpen && !immersiveMode ? contentStyle() : {}">
      <!-- Sidebar -->
      <aside
        v-show="(sidebarOpen && !immersiveMode) || (immersiveMode && showSidebarOnHover)"
        class="VPSidebar"
        :class="{
          'immersive-sidebar': immersiveMode && showSidebarOnHover,
          'immersive-sidebar-hiding': sidebarHiding
        }"
        :style="sidebarStyle"
      >
        <Sidebar />
        <div
          class="resize-handle"
          @mousedown="startResize"
          :class="{ 'is-resizing': isResizing }"
        ></div>
      </aside>

      <!-- Content Area -->
      <div class="VPContent-doc">
        <div class="container" :style="immersiveMode ? { maxWidth: contentWidth + 'vw' } : {}">
          <!-- Main Content -->
          <div class="content">
            <main class="main">
              <article ref="articleRef" class="markdown-body">
                <PasswordProtect v-if="isProtected && !isUnlocked" />
                <template v-else>
                  <Breadcrumb v-if="!immersiveMode" />
                  <ArticleTags v-if="!immersiveMode" />
                  <ArticleMeta v-if="!immersiveMode" />
                  <slot />
                  <BacklinkSection v-if="!immersiveMode" />
                  <ShareLinks v-if="!immersiveMode" />
                  <PrevNextNav v-if="!immersiveMode" />
                </template>
              </article>
            </main>
          </div>

          <!-- TOC -->
          <aside class="VPDocAside hidden xl:block">
            <div class="aside-container">
              <div class="aside-content">
                <GraphView v-if="!immersiveMode" />
                <TOC :headings="headings" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>

    <!-- 浮动组件 -->
    <ImageViewer :image="currentImage" @close="hideImage" />
    <ReadingProgress v-if="!immersiveMode" />
    <SmartHoverCard />
    <BackToTopCat v-if="!immersiveMode" />

    <!-- 预览模态框 -->
    <OfficePreviewModal :file="officePreviewFile" @close="closeOfficePreview" />
    <ArchiveViewer :file="archivePreviewFile" @close="closeArchivePreview" />
    <EpubPreviewModal :file="epubPreviewFile" @close="closeEpubPreview" />

    <!-- Footer -->
    <Footer v-if="!immersiveMode" />
  </div>
</template>
