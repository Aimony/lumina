import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'
import { trackPageview } from '@/composables/core/useAnalytics'

const router = createRouter({
  // 使用 Vite 的 BASE_URL 环境变量，支持 GitHub Pages 子路径部署
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, _savedPosition) {
    // 主页不应用滚动逻辑
    if (to.path === '/') {
      return
    }

    // 如果有锚点（hash），不在这里处理
    // 由 DocLayout 组件的 scrollToHashOnLoad 函数处理锚点滚动
    // 因为 markdown-it-anchor 生成的 ID 是 URL 编码的，需要特殊处理
    if (to.hash) {
      return false // 返回 false 表示不滚动
    }

    // 如果是同一页面刷新（路径相同），且没有锚点，滚动到顶部
    // 如果是切换到新文章（路径不同），滚动到顶部
    return { top: 0, behavior: 'smooth' }
  }
})

// 处理 URL 编码的中文路径
router.beforeEach((to, _from, next) => {
  // 如果路由未匹配且路径包含编码字符
  if (to.matched.length === 0 && to.path.includes('%')) {
    try {
      const decodedPath = decodeURIComponent(to.path)
      // 只有解码后路径不同时才重定向
      if (decodedPath !== to.path) {
        next({ path: decodedPath, query: to.query, hash: to.hash, replace: true })
        return
      }
    } catch {
      // 解码失败，继续正常路由
    }
  }
  next()
})

// 页面浏览追踪
router.afterEach((to) => {
  trackPageview(to.fullPath)
})

export default router
