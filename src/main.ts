import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'
import App from './App.vue'
import LinkCard from './components/common/LinkCard.vue'
import OfficeFileCard from './components/OfficeFileCard.vue'
import './styles/index.css'
import './styles/theme-transition.css'

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, _savedPosition) {
    // 主页不应用滚动逻辑
    if (to.path === '/') {
      return
    }

    // 如果有锚点（hash），滚动到锚点位置
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 80 // 导航栏高度偏移
      }
    }

    // 如果是同一页面刷新（路径相同），且没有锚点，滚动到顶部
    // 如果是切换到新文章（路径不同），滚动到顶部
    return { top: 0, behavior: 'smooth' }
  }
})

const app = createApp(App)
app.use(router)

// 全局注册 LinkCard 组件
app.component('LinkCard', LinkCard)

// 全局注册 OfficeFileCard 组件（用于 markdown-it 插件渲染）
app.component('OfficeFileCard', OfficeFileCard)

app.mount('#app')
