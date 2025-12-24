import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { glob } from 'glob'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')
const DOCS_DIR = path.join(ROOT_DIR, 'docs')
const OUTPUT_FILE = path.join(ROOT_DIR, 'public/search-index.json')

async function generateSearchIndex() {
  console.log('🔍 Generating search index...')

  try {
    // 查找所有 markdown 文件
    // windows 路径兼容性处理
    const pattern = `${DOCS_DIR.replace(/\\/g, '/')}/**/*.md`
    const files = await glob(pattern)

    const indexData = []

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8')
      const { data, content: body } = matter(content)

      // 生成相对路径路由
      let route = path.relative(DOCS_DIR, file)
      route = route.replace(/\\/g, '/') // Windows fix
      route = route.replace(/\.md$/, '')
      if (route.endsWith('/index')) {
        route = route.replace(/\/index$/, '')
      }
      route = '/docs/' + route // 假设 docs 都在 /docs/ 路由下，需根据 Pages 配置调整
      // 实际上 vite-plugin-pages 的默认行为是文件路径即路由
      // 如果 src/docs 是 pages 的dirs之一，那么 route 就是 relative path
      // 修正: vite.config.ts 中 baseRoute: '' for src/docs
      // 所以 src/docs/guide/index.md -> /guide/

      let clientRoute = path.relative(DOCS_DIR, file).replace(/\\/g, '/').replace(/\.md$/, '')
      if (clientRoute.endsWith('index')) clientRoute = clientRoute.slice(0, -5)
      if (clientRoute.length > 0 && !clientRoute.endsWith('/')) clientRoute
      // 保持简单，不用太纠结末尾斜杠，Vue Router 会处理

      // 简易去除 Markdown 语法
      const plainText = body
        .replace(/!\[.*?\]\(.*?\)/g, '') // 图片
        .replace(/\[.*?\]\(.*?\)/g, '$1') // 链接
        .replace(/`{3}[\s\S]*?`{3}/g, '') // 代码块内容通常不索引，或者只索引部分？保留代码块内容可能干扰搜索
        .replace(/`(.+?)`/g, '$1') // 行内代码
        .replace(/#+\s/g, '') // 标题
        .replace(/>\s/g, '') // 引用
        .replace(/\*\*/g, '') // 粗体
        .replace(/\*/g, '') // 斜体
        .replace(/\n+/g, ' ') // 换行变空格
        .trim()
        .slice(0, 5000) // 限制长度

      indexData.push({
        id: clientRoute,
        title: data.title || path.basename(file, '.md'),
        content: plainText,
        tags: data.tags || []
      })
    }

    await fs.writeFile(OUTPUT_FILE, JSON.stringify(indexData, null, 2))
    console.log(`✅ Search index generated with ${indexData.length} documents.`)
  } catch (error) {
    console.error('❌ Failed to generate search index:', error)
    process.exit(1)
  }
}

generateSearchIndex()
