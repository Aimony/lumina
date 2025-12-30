import { ref, type Ref } from 'vue'

// 常量
const EDGE_THRESHOLD = 50 // 触发距离（像素）
const NAVBAR_HEIGHT = 64 // 导航栏高度
const SIDEBAR_WIDTH = 280 // 侧边栏宽度
const HIDE_DELAY = 500 // 延迟隐藏时间（毫秒）
const ANIMATION_DURATION = 300 // 动画持续时间（毫秒）

/**
 * 边缘触发 Composable
 * 管理沉浸模式下鼠标边缘触发 Navbar 和 Sidebar 显示的逻辑
 */
export function useEdgeTrigger(immersiveMode: Ref<boolean>) {
  // 显示状态
  const showNavbarOnHover = ref(false)
  const showSidebarOnHover = ref(false)

  // 动画状态（用于淡出效果）
  const navbarHiding = ref(false)
  const sidebarHiding = ref(false)

  // 定时器
  let hideNavbarTimeout: ReturnType<typeof setTimeout> | null = null
  let hideSidebarTimeout: ReturnType<typeof setTimeout> | null = null

  // 清理定时器
  const clearNavbarTimeout = () => {
    if (hideNavbarTimeout) {
      clearTimeout(hideNavbarTimeout)
      hideNavbarTimeout = null
    }
  }

  const clearSidebarTimeout = () => {
    if (hideSidebarTimeout) {
      clearTimeout(hideSidebarTimeout)
      hideSidebarTimeout = null
    }
  }

  // 鼠标移动处理
  const onMouseMove = (e: MouseEvent) => {
    if (!immersiveMode.value) return

    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    const oneThirdWidth = screenWidth / 3
    const oneThirdHeight = screenHeight / 3

    // 状态检查
    const isNavbarActive = showNavbarOnHover.value || navbarHiding.value
    const isSidebarActive = showSidebarOnHover.value || sidebarHiding.value

    // 触发区域定义
    const inTopEdge = e.clientY <= EDGE_THRESHOLD && e.clientX <= oneThirdWidth
    const inLeftEdge = e.clientX <= EDGE_THRESHOLD && e.clientY <= oneThirdHeight

    // 保持显示区域定义 (Keep Alive)
    const inNavbarArea = e.clientY <= NAVBAR_HEIGHT
    const inSidebarArea = e.clientX <= SIDEBAR_WIDTH

    // 互斥逻辑 Case 1: 导航栏处于激活状态
    if (isNavbarActive) {
      if (inNavbarArea || inTopEdge) {
        clearNavbarTimeout()
        navbarHiding.value = false
        showNavbarOnHover.value = true
      } else {
        if (showNavbarOnHover.value && !hideNavbarTimeout) {
          hideNavbarTimeout = setTimeout(() => {
            navbarHiding.value = true
            setTimeout(() => {
              showNavbarOnHover.value = false
              navbarHiding.value = false
              hideNavbarTimeout = null
            }, ANIMATION_DURATION)
          }, HIDE_DELAY)
        }
      }
      return // 导航栏激活时阻止侧边栏触发
    }

    // 互斥逻辑 Case 2: 侧边栏处于激活状态
    if (isSidebarActive) {
      if (inSidebarArea || inLeftEdge) {
        clearSidebarTimeout()
        sidebarHiding.value = false
        showSidebarOnHover.value = true
      } else {
        if (showSidebarOnHover.value && !hideSidebarTimeout) {
          hideSidebarTimeout = setTimeout(() => {
            sidebarHiding.value = true
            setTimeout(() => {
              showSidebarOnHover.value = false
              sidebarHiding.value = false
              hideSidebarTimeout = null
            }, ANIMATION_DURATION)
          }, HIDE_DELAY)
        }
      }
      return // 侧边栏激活时阻止导航栏触发
    }

    // 互斥逻辑 Case 3: 两者都未激活，检测新触发
    if (inTopEdge && inLeftEdge) {
      // 角落冲突：优先触发距离最近的边缘
      if (e.clientX < e.clientY) {
        clearSidebarTimeout()
        sidebarHiding.value = false
        showSidebarOnHover.value = true
      } else {
        clearNavbarTimeout()
        navbarHiding.value = false
        showNavbarOnHover.value = true
      }
    } else if (inTopEdge) {
      clearNavbarTimeout()
      navbarHiding.value = false
      showNavbarOnHover.value = true
    } else if (inLeftEdge) {
      clearSidebarTimeout()
      sidebarHiding.value = false
      showSidebarOnHover.value = true
    }
  }

  // 设置事件监听
  const setupEdgeTrigger = () => {
    window.addEventListener('mousemove', onMouseMove)
  }

  // 清理
  const cleanupEdgeTrigger = () => {
    window.removeEventListener('mousemove', onMouseMove)
    clearNavbarTimeout()
    clearSidebarTimeout()
  }

  return {
    showNavbarOnHover,
    showSidebarOnHover,
    navbarHiding,
    sidebarHiding,
    setupEdgeTrigger,
    cleanupEdgeTrigger
  }
}
