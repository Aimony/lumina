import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'
import App from './App.vue'
import './style.css'

const router = createRouter({
    history: createWebHistory(),
    routes,
})

const app = createApp(App)
app.use(router)
app.mount('#app')
