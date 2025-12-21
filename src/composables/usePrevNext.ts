import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDocsTree, type DocTreeNode } from '@/composables/useDocsTree'

export interface NavLink {
  path: string
  title: string
}

export function usePrevNext() {
  const route = useRoute()
  const { docsTree } = useDocsTree()

  // 扁平化文档树，只保留文件节点
  const flattenedDocs = computed(() => {
    const pages: NavLink[] = []

    const traverse = (nodes: DocTreeNode[]) => {
      for (const node of nodes) {
        if (!node.isDirectory) {
          pages.push({
            path: node.path,
            title: node.title
          })
        }
        if (node.children) {
          traverse(node.children)
        }
      }
    }

    traverse(docsTree.value)
    return pages
  })

  const prevNext = computed(() => {
    const currentPath = route.path.replace(/\/$/, '')
    const pages = flattenedDocs.value

    // 模糊匹配: 处理 /docs/guide 和 /docs/guide/ 区别
    const index = pages.findIndex((p) => {
      const pPath = p.path.replace(/\/$/, '')
      return pPath === currentPath
    })

    if (index === -1) return { prev: null, next: null }

    return {
      prev: index > 0 ? pages[index - 1] : null,
      next: index < pages.length - 1 ? pages[index + 1] : null
    }
  })

  return prevNext
}
