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
import Footer from '@/components/layout/Footer.vue'
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

// 处理全局预览事件
const handleArchivePreviewEnv = async (e: Event) => {
  const customEvent = e as CustomEvent
  const { src, name } = customEvent.detail
  if (src && setArchivePreviewFile) {
    // 这里需要 fetch archive blob，类似 ArchiveFileCard 的逻辑
    // 为了复用和简化，建议 ArchiveFileCard 和这里都使用同一个 fetch 逻辑
    // 但现在为了快速支持，我们在这里复制 fetch 逻辑
    try {
      // 显示 loading 状态可能比较难，因为不在 Card 组件内
      // 可以考虑使用全局 loading
      const response = await fetch(src)
      if (!response.ok) throw new Error('Network response was not ok')
      const blob = await response.blob()
      const file = new File([blob], name, { type: 'application/zip' })
      setArchivePreviewFile(file)
    } catch (error) {
      console.error('Failed to fetch archive:', error)
      alert('无法加载压缩包文件')
    }
  }
}

const handleOfficePreviewEnv = (e: Event) => {
  const customEvent = e as CustomEvent
  const { src, name, type } = customEvent.detail
  if (src && setOfficePreviewFile) {
    setOfficePreviewFile({ src, name, type })
  }
}

onMounted(() => {
  document.addEventListener('mousemove', doResize)
  document.addEventListener('mouseup', stopResize)
  window.addEventListener('preview-archive', handleArchivePreviewEnv)
  window.addEventListener('preview-office', handleOfficePreviewEnv)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', doResize)
  document.removeEventListener('mouseup', stopResize)
  window.removeEventListener('preview-archive', handleArchivePreviewEnv)
  window.removeEventListener('preview-office', handleOfficePreviewEnv)
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

// 处理 URL hash 锚点定位（解决新标签打开时锚点不生效问题）
const scrollToHashOnLoad = () => {
  const hash = route.hash
  if (!hash) return

  // 获取原始 hash（不包含 #）
  const rawHash = hash.startsWith('#') ? hash.slice(1) : hash

  // 准备多种可能的 ID 形式
  // markdown-it-anchor 生成的 ID 是 URL 编码的，但浏览器可能已经解码了 hash
  const possibleIds = [
    rawHash, // 原始形式（可能是编码的）
    decodeURIComponent(rawHash), // 解码形式
    encodeURIComponent(decodeURIComponent(rawHash)) // 重新编码形式
  ]

  // 去重
  const uniqueIds = [...new Set(possibleIds)]

  const scrollToTarget = () => {
    // 尝试所有可能的 ID
    for (const id of uniqueIds) {
      const targetElement = document.getElementById(id)
      if (targetElement) {
        // 使用 requestAnimationFrame 确保布局稳定
        requestAnimationFrame(() => {
          const navHeight = 80
          const elementTop = targetElement.getBoundingClientRect().top + window.scrollY - navHeight
          window.scrollTo({ top: elementTop, behavior: 'smooth' })
        })
        return true
      }
    }
    return false
  }

  // 尝试立即滚动
  if (scrollToTarget()) return

  // 如果元素不存在，使用轮询等待 DOM 渲染完成
  let attempts = 0
  const maxAttempts = 50 // 最多等待 5 秒

  const pollForElement = () => {
    attempts++

    if (scrollToTarget()) return

    if (attempts < maxAttempts) {
      setTimeout(pollForElement, 100)
    }
  }

  // 延迟开始轮询，等待组件初始化
  setTimeout(pollForElement, 200)
}

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

// 在组件挂载后处理锚点定位
onMounted(() => {
  // 延迟执行，确保内容开始渲染
  setTimeout(scrollToHashOnLoad, 300)
})

// 监听 hash 变化（用于页面内锚点跳转）
watch(
  () => route.hash,
  (newHash, oldHash) => {
    // 只在 hash 变化时触发（非首次加载）
    if (newHash && oldHash !== undefined) {
      setTimeout(scrollToHashOnLoad, 100)
    }
  }
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

// 沉浸式阅读模式
const immersiveMode = ref(false)
const toggleImmersive = () => {
  immersiveMode.value = !immersiveMode.value
}
provide('immersiveMode', immersiveMode)
provide('toggleImmersive', toggleImmersive)

// 沉浸模式下的文章宽度（百分比）
const contentWidth = ref(60)
const setContentWidth = (width: number) => {
  contentWidth.value = width
}
provide('contentWidth', contentWidth)
provide('setContentWidth', setContentWidth)
</script>

<template>
  <div class="layout-container" :class="{ 'immersive-mode': immersiveMode }">
    <!-- Header (Consistent with DefaultLayout) -->
    <Navbar v-if="!immersiveMode">
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

    <div class="VPContent" :style="sidebarOpen && !immersiveMode ? contentStyle : {}">
      <!-- Sidebar -->
      <aside v-show="sidebarOpen && !immersiveMode" class="VPSidebar" :style="sidebarStyle">
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
        <div class="container" :style="immersiveMode ? { maxWidth: contentWidth + 'vw' } : {}">
          <!-- Main Content -->
          <div class="content">
            <main class="main">
              <article ref="articleRef" class="markdown-body">
                <!-- 密码保护遮罩 -->
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

    <!-- 图片查看器 -->
    <ImageViewer :image="currentImage" @close="hide" />

    <!-- 阅读进度悬浮球 -->
    <ReadingProgress v-if="!immersiveMode" />

    <!-- 智能悬浮卡 -->
    <SmartHoverCard />

    <!-- 小猫回到顶部 -->
    <BackToTopCat v-if="!immersiveMode" />

    <!-- Office 文件预览模态框 -->
    <OfficePreviewModal :file="officePreviewFile" @close="officePreviewFile = null" />

    <!-- 压缩包预览组件 -->
    <ArchiveViewer :file="archivePreviewFile" @close="archivePreviewFile = null" />

    <!-- 全局 Footer -->
    <Footer v-if="!immersiveMode" />
  </div>
</template>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--vp-c-bg);
  transition: background-color 0.25s;
  padding-top: calc(var(--vp-nav-height) + var(--announcement-height, 0px));
}

.VPContent {
  flex: 1;
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
  top: calc(var(--vp-nav-height) + var(--announcement-height, 0px));
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

/* 沉浸式阅读模式样式 */
.layout-container.immersive-mode {
  padding-top: 0;
}

.layout-container.immersive-mode .VPContent-doc {
  padding-top: 32px;
}

.layout-container.immersive-mode .aside-container {
  top: 32px;
  max-height: calc(100vh - 64px);
}

.layout-container.immersive-mode .container {
  transition: max-width 0.3s ease;
}

/* 沉浸模式下 TOC 固定在右侧 */
.layout-container.immersive-mode .VPDocAside {
  position: fixed;
  right: 32px;
  top: 32px;
  width: 224px;
}

@media (min-width: 1280px) {
  .layout-container.immersive-mode .container {
    padding-right: 288px;
    /* 224px (TOC) + 32px (right) + 32px (gap) */
    box-sizing: border-box;
  }
}
</style>
