import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Markdown from 'unplugin-vue-markdown/vite'
import Pages from 'vite-plugin-pages'
import { resolve } from 'path'
import Shiki from '@shikijs/markdown-it'
import anchor from 'markdown-it-anchor'
import footnote from 'markdown-it-footnote'
import taskLists from 'markdown-it-task-lists'
import { default as githubAlerts } from 'markdown-it-github-alerts'
import { linkCardPlugin } from './src/plugins/markdown-it-link-card'
import { codeEnhancementsPlugin } from './src/plugins/markdown-it-code-enhancements'
import { imageLazyPlugin } from './src/plugins/markdown-it-image-lazy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/] // 允许 .md 文件作为 Vue 组件
    }),

    Markdown({
      headEnabled: false, // 禁用 @unhead/vue 集成（暂时）
      markdownItOptions: {
        html: true,
        linkify: true,
        typographer: true
      },
      // Shiki 代码高亮在 markdown 处理中配置
      async markdownItSetup(md) {
        // GFM 扩展插件
        md.use(anchor, { permalink: false }) // 标题锚点
        md.use(footnote) // 脚注支持
        md.use(taskLists, { enabled: true, label: true }) // 任务列表
        md.use(githubAlerts) // GitHub 告警块

        md.use(
          await Shiki({
            themes: {
              light: 'one-dark-pro',
              dark: 'one-dark-pro'
            }
          })
        )
        // 注册链接卡片插件
        md.use(linkCardPlugin)
        // 注册代码块增强插件
        md.use(codeEnhancementsPlugin)
        // 注册图片懒加载插件
        md.use(imageLazyPlugin)
      }
    }),
    Pages({
      dirs: [
        { dir: 'src/pages', baseRoute: '' },
        { dir: 'src/docs', baseRoute: '' }
      ],
      extensions: ['vue', 'md'],
      extendRoute(route) {
        // 为 Markdown 页面添加元数据
        if (route.component.endsWith('.md')) {
          return {
            ...route,
            meta: { layout: 'doc' }
          }
        }
        return route
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
