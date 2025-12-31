import { createApp } from 'vue'
import { pinia } from './stores'
import router from './router'
import App from './App.vue'
import LinkCard from './components/common/LinkCard.vue'
import OfficeFileCard from './components/office/OfficeFileCard.vue'
import ArchiveFileCard from './components/office/ArchiveFileCard.vue'
import EpubFileCard from './components/office/EpubFileCard.vue'
import './styles/index.css'
import './styles/theme-transition.css'

const app = createApp(App)
app.use(pinia)
app.use(router)

// 全局注册 LinkCard 组件
app.component('LinkCard', LinkCard)

// 全局注册 OfficeFileCard 组件（用于 markdown-it 插件渲染）
app.component('OfficeFileCard', OfficeFileCard)
app.component('ArchiveFileCard', ArchiveFileCard)
app.component('EpubFileCard', EpubFileCard)

app.mount('#app')
