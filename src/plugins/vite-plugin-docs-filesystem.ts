/**
 * Vite 插件：自动生成 docs 目录的虚拟文件系统 JSON
 * 在开发和构建时扫描 docs 目录，生成 docsFileSystem.json
 */

import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

interface FileNode {
  name: string
  type: 'file' | 'directory'
  path: string
  children?: FileNode[]
  title?: string
}

// 需要忽略的文件/目录
const IGNORE_PATTERNS = [
  /^\./, // 隐藏文件
  /^images?$/i, // 图片目录
  /^assets?$/i, // 资源目录
  /\.(png|jpg|jpeg|gif|svg|webp|ico|mp4|mp3|pdf|zip|rar)$/i // 非文档文件
]

function shouldIgnore(name: string): boolean {
  return IGNORE_PATTERNS.some((pattern) => pattern.test(name))
}

function scanDirectory(dirPath: string, basePath: string = '/'): FileNode {
  const name = path.basename(dirPath)
  const relativePath = basePath === '/' ? '/' : basePath

  const node: FileNode = {
    name: name === 'docs' ? 'root' : name,
    type: 'directory',
    path: relativePath,
    children: []
  }

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })

    // 排序：目录在前，文件在后，按名称排序
    const sorted = entries.sort((a, b) => {
      if (a.isDirectory() !== b.isDirectory()) {
        return a.isDirectory() ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })

    for (const entry of sorted) {
      if (shouldIgnore(entry.name)) continue

      const fullPath = path.join(dirPath, entry.name)
      const childPath = basePath === '/' ? `/${entry.name}` : `${basePath}/${entry.name}`

      if (entry.isDirectory()) {
        const childNode = scanDirectory(fullPath, childPath)
        // 只添加非空目录
        if (childNode.children && childNode.children.length > 0) {
          node.children!.push(childNode)
        }
      } else if (entry.name.endsWith('.md')) {
        // 读取 frontmatter 获取标题
        let title: string | undefined
        try {
          const content = fs.readFileSync(fullPath, 'utf-8')
          const { data } = matter(content)
          title = data.title
        } catch {
          // 忽略读取错误
        }

        node.children!.push({
          name: entry.name,
          type: 'file',
          path: childPath,
          title
        })
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error)
  }

  return node
}

export function docsFileSystemPlugin(): Plugin {
  const virtualModuleId = 'virtual:docs-filesystem'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  let fileSystemData: FileNode | null = null

  function generateFileSystem(root: string) {
    const docsPath = path.resolve(root, 'docs')
    if (fs.existsSync(docsPath)) {
      fileSystemData = scanDirectory(docsPath, '/')
      console.log('📁 Generated docs file system structure')
    } else {
      console.warn('⚠️ docs directory not found')
      fileSystemData = {
        name: 'root',
        type: 'directory',
        path: '/',
        children: []
      }
    }
    return fileSystemData
  }

  return {
    name: 'vite-plugin-docs-filesystem',

    configResolved(config) {
      generateFileSystem(config.root)
    },

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },

    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify(fileSystemData, null, 2)}`
      }
    },

    // 开发模式下监听 docs 目录变化
    configureServer(server) {
      const docsPath = path.resolve(server.config.root, 'docs')

      // 监听文件变化
      server.watcher.add(docsPath)

      server.watcher.on('all', (event, filePath) => {
        if (
          filePath.startsWith(docsPath) &&
          (event === 'add' || event === 'unlink' || event === 'addDir' || event === 'unlinkDir')
        ) {
          // 重新生成文件系统
          generateFileSystem(server.config.root)

          // 使虚拟模块失效，触发热更新
          const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId)
          if (mod) {
            server.moduleGraph.invalidateModule(mod)
            server.ws.send({
              type: 'full-reload'
            })
          }
        }
      })
    }
  }
}
