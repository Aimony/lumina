/**
 * 生成 Graph View 所需的链接数据
 * 扫描所有 markdown 文件，提取 wikilinks 并生成节点和边
 */

import fs from 'fs'
import path from 'path'
import { glob } from 'glob'
import matter from 'gray-matter'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// Wikilink 正则表达式: [[link]] 或 [[link|text]]
const WIKILINK_REGEX = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g

/**
 * 将 wikilink target 解析为路由路径
 * 例如: "obsidian-features" -> "/example/obsidian-features"
 */
function resolveWikilinkPath(target, currentFilePath, allPaths) {
  // 移除可能的 # 锚点
  const cleanTarget = target.split('#')[0].trim()

  if (!cleanTarget) return null

  // 如果已经是绝对路径形式
  if (cleanTarget.startsWith('/')) {
    return cleanTarget
  }

  // 尝试在所有路径中查找匹配
  // 策略1: 完全匹配文件名（不含扩展名）
  const targetLower = cleanTarget.toLowerCase()

  for (const p of allPaths) {
    const basename = path.basename(p.filePath, '.md').toLowerCase()
    if (basename === targetLower) {
      return p.routePath
    }
  }

  // 策略2: 尝试相对于当前文件目录解析
  const currentDir = path.dirname(currentFilePath)
  const possiblePath = path.join(currentDir, cleanTarget).replace(/\\/g, '/')

  for (const p of allPaths) {
    if (p.filePath.includes(possiblePath)) {
      return p.routePath
    }
  }

  return null
}

/**
 * 从文件路径生成路由路径
 */
function filePathToRoutePath(filePath, baseDir) {
  let routePath = filePath
    .replace(baseDir, '')
    .replace(/\\/g, '/')
    .replace(/\.md$/, '')
    .replace(/\/index$/, '')

  if (!routePath.startsWith('/')) {
    routePath = '/' + routePath
  }

  return routePath
}

async function generateGraphData() {
  console.log('📊 Generating graph data...')

  const docsDir = path.join(rootDir, 'docs')
  const pagesDir = path.join(rootDir, 'src/pages')

  // 查找所有 markdown 文件
  const docFiles = await glob('**/*.md', { cwd: docsDir })
  const pageFiles = await glob('**/*.md', { cwd: pagesDir })

  // 构建所有文件路径映射
  const allPaths = []

  for (const file of docFiles) {
    const filePath = path.join(docsDir, file)
    const routePath = filePathToRoutePath(file, '')
    allPaths.push({ filePath, routePath, baseDir: docsDir })
  }

  for (const file of pageFiles) {
    const filePath = path.join(pagesDir, file)
    const routePath = filePathToRoutePath(file, '')
    allPaths.push({ filePath, routePath, baseDir: pagesDir })
  }

  const nodes = []
  const links = []
  const nodeSet = new Set()

  // 处理每个文件
  for (const { filePath, routePath } of allPaths) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const { data, content: markdownBody } = matter(content)

      const title = data.title || path.basename(filePath, '.md')

      // 添加节点
      if (!nodeSet.has(routePath)) {
        nodeSet.add(routePath)
        // 从路径提取分类（第一段路径）
        const pathParts = routePath.split('/').filter(Boolean)
        const category = pathParts[0] || 'root'

        nodes.push({
          id: routePath,
          title: title,
          path: routePath,
          category: category,
          tags: data.tags || []
        })
      }

      // 提取 wikilinks
      let match
      while ((match = WIKILINK_REGEX.exec(markdownBody)) !== null) {
        const target = match[1].trim()
        const targetPath = resolveWikilinkPath(target, filePath, allPaths)

        if (targetPath && targetPath !== routePath) {
          // 确保目标节点存在
          if (!nodeSet.has(targetPath)) {
            // 尝试获取目标文件的标题和元数据
            const targetInfo = allPaths.find((p) => p.routePath === targetPath)
            let targetTitle = path.basename(targetPath)
            let targetTags = []

            if (targetInfo) {
              try {
                const targetContent = fs.readFileSync(targetInfo.filePath, 'utf-8')
                const { data: targetData } = matter(targetContent)
                targetTitle = targetData.title || targetTitle
                targetTags = targetData.tags || []
              } catch (e) {
                // 忽略读取错误
              }
            }

            // 从路径提取分类
            const targetPathParts = targetPath.split('/').filter(Boolean)
            const targetCategory = targetPathParts[0] || 'root'

            nodeSet.add(targetPath)
            nodes.push({
              id: targetPath,
              title: targetTitle,
              path: targetPath,
              category: targetCategory,
              tags: targetTags
            })
          }

          // 添加链接（避免重复）
          const linkKey = `${routePath}->${targetPath}`
          const existingLink = links.find((l) => l.source === routePath && l.target === targetPath)

          if (!existingLink) {
            links.push({
              source: routePath,
              target: targetPath
            })
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to process ${filePath}:`, error.message)
    }
  }

  // 计算每个节点的链接数
  const linkCounts = {}
  for (const link of links) {
    linkCounts[link.source] = (linkCounts[link.source] || 0) + 1
    linkCounts[link.target] = (linkCounts[link.target] || 0) + 1
  }

  // 添加链接数到节点
  for (const node of nodes) {
    node.links = linkCounts[node.id] || 0
  }

  const graphData = { nodes, links }

  // 写入 public 目录
  const publicDir = path.join(rootDir, 'public')
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  const outputPath = path.join(publicDir, 'graph-data.json')
  fs.writeFileSync(outputPath, JSON.stringify(graphData, null, 2))

  console.log(`✅ Graph data generated: ${nodes.length} nodes, ${links.length} links`)
  console.log(`   Output: ${outputPath}`)
}

generateGraphData().catch(console.error)
