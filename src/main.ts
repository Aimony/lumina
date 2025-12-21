import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'
import App from './App.vue'
import LinkCard from './components/LinkCard.vue'
import './styles/index.css'

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)

// 全局注册 LinkCard 组件
app.component('LinkCard', LinkCard)

app.mount('#app')
