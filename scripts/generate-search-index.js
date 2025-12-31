import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import matter from 'gray-matter'
import { glob } from 'glob'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')
const DOCS_DIR = path.join(ROOT_DIR, 'docs')
const OUTPUT_DIR = path.join(ROOT_DIR, 'public')

// 每个分块包含的文档数量
const CHUNK_SIZE = 50

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

      // 跳过密码保护的文档，不加入搜索索引
      if (data.password) {
        console.log(`  ⏭️ Skipping protected document: ${path.basename(file)}`)
        continue
      }

      // 生成相对路径路由
      let clientRoute = path.relative(DOCS_DIR, file).replace(/\\/g, '/').replace(/\.md$/, '')
      if (clientRoute.endsWith('index')) clientRoute = clientRoute.slice(0, -5)

      // 简易去除 Markdown 语法
      const plainText = body
        .replace(/!\[.*?\]\(.*?\)/g, '') // 图片
        .replace(/\[.*?\]\(.*?\)/g, '$1') // 链接
        .replace(/`{3}[\s\S]*?`{3}/g, '') // 代码块内容通常不索引
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

    // 生成版本哈希（基于所有文档内容）
    const contentHash = createHash('md5')
      .update(JSON.stringify(indexData))
      .digest('hex')
      .slice(0, 8)

    // 计算分块数量
    const totalChunks = Math.ceil(indexData.length / CHUNK_SIZE)

    // 写入分块文件
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, indexData.length)
      const chunk = indexData.slice(start, end)

      const chunkPath = path.join(OUTPUT_DIR, `search-index-${i}.json`)
      await fs.writeFile(chunkPath, JSON.stringify(chunk))
      console.log(`  📦 Chunk ${i}: ${chunk.length} documents`)
    }

    // 写入清单文件
    const manifest = {
      version: contentHash,
      totalDocs: indexData.length,
      chunks: totalChunks,
      chunkSize: CHUNK_SIZE,
      generatedAt: new Date().toISOString()
    }
    await fs.writeFile(
      path.join(OUTPUT_DIR, 'search-index-manifest.json'),
      JSON.stringify(manifest, null, 2)
    )

    // 同时保留完整索引文件（向后兼容）
    await fs.writeFile(
      path.join(OUTPUT_DIR, 'search-index.json'),
      JSON.stringify(indexData, null, 2)
    )

    console.log(`✅ Search index generated:`)
    console.log(`   - Version: ${contentHash}`)
    console.log(`   - Documents: ${indexData.length}`)
    console.log(`   - Chunks: ${totalChunks}`)
  } catch (error) {
    console.error('❌ Failed to generate search index:', error)
    process.exit(1)
  }
}

generateSearchIndex()
