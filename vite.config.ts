import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Markdown from 'unplugin-vue-markdown/vite'
import Pages from 'vite-plugin-pages'
import { resolve } from 'path'
import Shiki from '@shikijs/markdown-it'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/], // 允许 .md 文件作为 Vue 组件
    }),

    Markdown({
      headEnabled: false, // 禁用 @unhead/vue 集成（暂时）
      markdownItOptions: {
        html: true,
        linkify: true,
        typographer: true,
      },
      // Shiki 代码高亮在 markdown 处理中配置
      async markdownItSetup(md) {
        md.use(await Shiki({
          themes: {
            light: 'vitesse-light',
            dark: 'vitesse-dark',
          }
        }))
      },
    }),
    Pages({
      dirs: [
        { dir: 'src/pages', baseRoute: '' },
        { dir: 'src/docs', baseRoute: '' },
      ],
      extensions: ['vue', 'md'],
      extendRoute(route) {
        // 为 Markdown 页面添加元数据
        if (route.component.endsWith('.md')) {
          return {
            ...route,
            meta: { layout: 'doc' },
          }
        }
        return route
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
