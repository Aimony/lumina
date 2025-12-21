import { ref, onMounted } from 'vue'

export interface DocTreeNode {
  path: string
  title: string
  isDirectory: boolean
  children?: DocTreeNode[]
}

// 全局缓存，避免重复构建
let cachedTree: DocTreeNode[] | null = null
let buildPromise: Promise<DocTreeNode[]> | null = null

/**
 * 递归构建树形结构
 */
function buildTree(paths: string[]): DocTreeNode[] {
  const root: DocTreeNode[] = []
  const nodeMap = new Map<string, DocTreeNode>()

  for (const filePath of paths) {
    const parts = filePath.split('/').filter(Boolean)
    let currentPath = ''

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const parentPath = currentPath
      if (!part) continue
      currentPath += '/' + part

      if (!nodeMap.has(currentPath)) {
        const isLastPart = i === parts.length - 1
        const newNode: DocTreeNode = {
          path: currentPath,
          title: part,
          isDirectory: !isLastPart,
          children: []
        }
        nodeMap.set(currentPath, newNode)

        if (parentPath === '') {
          root.push(newNode)
        } else {
          const parentNode = nodeMap.get(parentPath)
          if (parentNode) {
            parentNode.children = parentNode.children || []
            parentNode.children.push(newNode)
          }
        }
      } else {
        const existingNode = nodeMap.get(currentPath)!
        if (i < parts.length - 1) {
          existingNode.isDirectory = true
        }
      }
    }
  }

  // 递归排序：文件夹优先，同类型按字母排序
  const sortNodes = (nodes: DocTreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) {
        return a.isDirectory ? -1 : 1
      }
      return a.title.localeCompare(b.title)
    })
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        sortNodes(node.children)
      }
    }
  }
  sortNodes(root)

  return root
}

/**
 * 扫描文档目录并构建树形结构
 */
async function scanAndBuildTree(): Promise<DocTreeNode[]> {
  if (cachedTree) return cachedTree
  if (buildPromise) return buildPromise

  buildPromise = (async () => {
    const pages = import.meta.glob('/src/docs/**/*.{md,vue}')
    const filePaths: string[] = []

    for (const path of Object.keys(pages)) {
      let routePath =
        path
          .replace('/src/docs', '')
          .replace(/\.(md|vue)$/, '')
          .replace(/\/index$/, '') || '/'

      if (routePath === '/') continue
      filePaths.push(routePath)
    }

    cachedTree = buildTree(filePaths)
    return cachedTree
  })()

  return buildPromise
}

/**
 * 根据路径查找节点
 */
export function findNodeByPath(nodes: DocTreeNode[], targetPath: string): DocTreeNode | null {
  for (const node of nodes) {
    if (node.path === targetPath) return node
    if (node.children) {
      const found = findNodeByPath(node.children, targetPath)
      if (found) return found
    }
  }
  return null
}

/**
 * 共享的文档树 composable
 */
export function useDocsTree() {
  const docsTree = ref<DocTreeNode[]>([])
  const isLoading = ref(true)

  onMounted(async () => {
    docsTree.value = await scanAndBuildTree()
    isLoading.value = false
  })

  return {
    docsTree,
    isLoading,
    findNodeByPath: (path: string) => findNodeByPath(docsTree.value, path)
  }
}
