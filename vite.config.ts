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
import Sitemap from 'vite-plugin-sitemap'
import matter from 'gray-matter'
import fs from 'node:fs'
import readingTime from 'reading-time'
import { wikilinksPlugin } from './src/plugins/markdown-it-wikilinks'
import { obsidianCalloutsPlugin } from './src/plugins/markdown-it-obsidian-callouts'
import { commentsPlugin } from './src/plugins/markdown-it-comments'
import mark from 'markdown-it-mark'
import { mermaidPlugin } from './src/plugins/markdown-it-mermaid'

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
        // Obsidian 语法支持
        md.use(wikilinksPlugin)
        md.use(obsidianCalloutsPlugin)
        md.use(commentsPlugin)
        md.use(mark)
        // Mermaid 图表支持
        md.use(mermaidPlugin)
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
          const filePath = resolve(__dirname, route.component.slice(1))
          const content = fs.readFileSync(filePath, 'utf-8')
          const { data, content: markdownBody } = matter(content)
          const stats = readingTime(markdownBody)

          return {
            ...route,
            meta: {
              layout: 'doc',
              ...data,
              readingTime: stats.text,
              wordCount: stats.words,
              // 确保 tags 是数组
              tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : []
            }
          }
        }
        return route
      }
    }),
    Sitemap({
      hostname: 'https://lumina.site', // TODO: Replace with actual hostname
      dynamicRoutes: [
        // 动态路由如果需要生成 sitemap 可以在这里配置
      ]
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
