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
import { tabsPlugin } from './src/plugins/markdown-it-tabs'
import { officePreviewPlugin } from './src/plugins/markdown-it-office-preview'
import { archivePreviewPlugin } from './src/plugins/markdown-it-archive-preview'
import { createHash } from 'crypto'
import { visualizer } from 'rollup-plugin-visualizer'

// 密码哈希函数（构建时使用）
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/], // 允许 .md 文件作为 Vue 组件
      // Vue DevTools 相关配置
      script: {
        defineModel: true,
        propsDestructure: true
      },
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('mermaid-')
        }
      }
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
        // 标签页组件支持
        md.use(tabsPlugin)
        // Office 文件预览支持
        md.use(officePreviewPlugin)
        // 压缩包文件预览支持
        md.use(archivePreviewPlugin)
      }
    }),
    Pages({
      dirs: [
        { dir: 'src/pages', baseRoute: '' },
        { dir: 'docs', baseRoute: '' }
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
              password: undefined, // 不暴露原始密码
              readingTime: stats.text,
              wordCount: stats.words,
              // 确保 tags 是数组
              tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
              // 密码保护：构建时哈希密码
              passwordHash: data.password ? hashPassword(data.password) : null
            }
          }
        }
        return route
      }
    }),
    Sitemap({
      hostname: process.env.VITE_SITE_HOSTNAME || 'https://lumina.site',
      dynamicRoutes: [
        // 动态路由如果需要生成 sitemap 可以在这里配置
      ]
    })

    // Bundle 分析工具（仅在构建时生成报告）
    // visualizer({
    //   open: true, // 构建完成后自动打开分析报告
    //   filename: 'dist/stats.html', // 输出文件路径
    //   gzipSize: true, // 显示 gzip 压缩后的大小
    //   brotliSize: true, // 显示 brotli 压缩后的大小
    //   template: 'treemap' // 可选: 'sunburst' | 'treemap' | 'network'
    // })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        // 手动分包策略
        manualChunks: {
          // 核心框架（变更频率低，适合长期缓存）
          'vendor-vue': ['vue', 'vue-router', 'pinia'],

          // 可视化库（按功能独立打包）
          'vendor-echarts': ['echarts', 'echarts-wordcloud'],
          'vendor-d3': ['d3'],
          'vendor-mermaid': ['mermaid'],

          // Office 预览组件（大型依赖，集中打包）
          'vendor-office': [
            '@vue-office/docx',
            '@vue-office/excel',
            '@vue-office/pdf',
            '@vue-office/pptx'
          ],

          // 文档处理（Markdown 相关）
          'vendor-markdown': [
            'markdown-it',
            'markdown-it-anchor',
            'markdown-it-footnote',
            'markdown-it-task-lists',
            'markdown-it-github-alerts',
            'markdown-it-mark'
          ],
          'vendor-shiki': ['shiki', '@shikijs/markdown-it'],
          'vendor-vue-reader': ['vue-reader'],

          // 工具库
          'vendor-utils': ['jszip', 'qrcode', 'flexsearch']
        },

        // 输出文件命名规则
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // 根据文件类型分类存放资源
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]

          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return 'assets/images/[name]-[hash][extname]'
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          return 'assets/[ext]/[name]-[hash][extname]'
        }
      }
    },

    // 构建优化配置
    sourcemap: false, // 生产环境禁用 sourcemap 以减小体积
    minify: 'terser', // 使用 terser 进行代码压缩
    chunkSizeWarningLimit: 1000, // 调整 chunk 大小警告阈值为 1000KB

    // Terser 压缩选项
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console 语句
        drop_debugger: true // 移除 debugger 语句
      }
    }
  }
}))
