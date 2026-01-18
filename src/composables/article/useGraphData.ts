import { ref } from 'vue'

export interface GraphNode {
  id: string
  title: string
  path: string
  links: number
  category?: string
  tags?: string[]
  // D3 会添加这些属性
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

export interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

// 缓存数据
let cachedData: GraphData | null = null
let loadingPromise: Promise<GraphData> | null = null

/**
 * 管理 Graph View 数据的 composable
 */
export function useGraphData() {
  const data = ref<GraphData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 加载图形数据
   */
  const loadData = async (): Promise<GraphData> => {
    // 如果已有缓存，直接返回
    if (cachedData) {
      data.value = cachedData
      return cachedData
    }

    // 如果正在加载，等待现有请求完成
    if (loadingPromise) {
      return loadingPromise
    }

    loading.value = true
    error.value = null

    // 使用 BASE_URL 确保在 GitHub Pages 等子路径部署时也能正确加载
    const baseUrl = import.meta.env.BASE_URL || '/'
    loadingPromise = fetch(`${baseUrl}graph-data.json`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load graph data')
        }
        return res.json()
      })
      .then((json: GraphData) => {
        cachedData = json
        data.value = json
        return json
      })
      .catch((err) => {
        error.value = err.message
        throw err
      })
      .finally(() => {
        loading.value = false
        loadingPromise = null
      })

    return loadingPromise
  }

  /**
   * 获取与指定节点相邻的节点（一跳距离）
   */
  const getNeighbors = (nodeId: string): Set<string> => {
    if (!data.value) return new Set()

    const neighbors = new Set<string>()

    for (const link of data.value.links) {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id
      const targetId = typeof link.target === 'string' ? link.target : link.target.id

      if (sourceId === nodeId) {
        neighbors.add(targetId)
      }
      if (targetId === nodeId) {
        neighbors.add(sourceId)
      }
    }

    return neighbors
  }

  /**
   * 获取局部图数据（当前节点及其邻居）
   */
  const getLocalGraph = (nodeId: string): GraphData | null => {
    if (!data.value) return null

    const neighbors = getNeighbors(nodeId)
    neighbors.add(nodeId) // 包含当前节点

    const localNodes = data.value.nodes.filter((n) => neighbors.has(n.id))
    const localLinks = data.value.links.filter((l) => {
      const sourceId = typeof l.source === 'string' ? l.source : l.source.id
      const targetId = typeof l.target === 'string' ? l.target : l.target.id
      return neighbors.has(sourceId) && neighbors.has(targetId)
    })

    return {
      nodes: localNodes,
      links: localLinks
    }
  }

  return {
    data,
    loading,
    error,
    loadData,
    getNeighbors,
    getLocalGraph
  }
}
