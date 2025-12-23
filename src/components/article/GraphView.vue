<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as d3 from 'd3'
import {
  useGraphData,
  type GraphNode,
  type GraphLink,
  type GraphData
} from '@/composables/article/useGraphData'

const props = defineProps<{
  /** 是否显示全局视图 */
  global?: boolean
}>()

const route = useRoute()
const router = useRouter()
const { data, loading, error, loadData, getLocalGraph, getNeighbors } = useGraphData()

const containerRef = ref<HTMLElement | null>(null)
const isGlobalView = ref(props.global ?? false)

// 当前路径
const currentPath = computed(() => route.path.replace(/\/$/, '') || '/')

// 邻居节点集合
const neighbors = computed(() => {
  if (!data.value) return new Set<string>()
  return getNeighbors(currentPath.value)
})

let simulation: d3.Simulation<GraphNode, GraphLink> | null = null
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null

/**
 * 初始化或更新图形
 */
function renderGraph() {
  if (!containerRef.value || !data.value) return

  // 清除旧的 SVG
  d3.select(containerRef.value).selectAll('*').remove()

  const container = containerRef.value
  const width = container.clientWidth
  const height = container.clientHeight || 200

  // 获取要渲染的数据
  let graphData: GraphData
  if (isGlobalView.value) {
    // 全局视图：深拷贝所有数据
    graphData = {
      nodes: data.value.nodes.map((n) => ({ ...n })),
      links: data.value.links.map((l) => ({
        source: typeof l.source === 'string' ? l.source : l.source.id,
        target: typeof l.target === 'string' ? l.target : l.target.id
      }))
    }
  } else {
    // 局部视图
    const local = getLocalGraph(currentPath.value)
    if (!local || local.nodes.length === 0) {
      // 如果没有关联节点，显示当前节点
      const currentNode = data.value.nodes.find((n) => n.id === currentPath.value)
      graphData = {
        nodes: currentNode ? [{ ...currentNode }] : [],
        links: []
      }
    } else {
      graphData = {
        nodes: local.nodes.map((n) => ({ ...n })),
        links: local.links.map((l) => ({
          source: typeof l.source === 'string' ? l.source : l.source.id,
          target: typeof l.target === 'string' ? l.target : l.target.id
        }))
      }
    }
  }

  if (graphData.nodes.length === 0) return

  // 创建 SVG
  svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])

  // 添加缩放和平移功能
  const g = svg.append('g')

  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform)
    })

  svg.call(zoom)

  // 创建力导向布局
  simulation = d3
    .forceSimulation<GraphNode>(graphData.nodes)
    .force(
      'link',
      d3
        .forceLink<GraphNode, GraphLink>(graphData.links)
        .id((d) => d.id)
        .distance(60)
    )
    .force('charge', d3.forceManyBody().strength(-150))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(20))

  // 绘制链接
  const link = g
    .append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(graphData.links)
    .join('line')
    .attr('class', 'graph-link')

  // 绘制节点
  const node = g
    .append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(graphData.nodes)
    .join('g')
    .attr('class', (d) => {
      const classes = ['graph-node']
      if (d.id === currentPath.value) classes.push('current')
      else if (neighbors.value.has(d.id)) classes.push('neighbor')
      return classes.join(' ')
    })
    .style('cursor', 'pointer')
    .on('click', (_event, d) => {
      router.push(d.path)
    })
    .call(
      d3
        .drag<SVGGElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation?.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) simulation?.alphaTarget(0)
          d.fx = null
          d.fy = null
        }) as any
    )

  // 节点圆形
  node.append('circle').attr('r', (d) => {
    // 节点大小与链接数相关
    return Math.max(4, Math.min(12, 4 + d.links * 1.5))
  })

  // 节点标签
  node
    .append('text')
    .attr('class', 'node-label')
    .attr('dy', -10)
    .attr('text-anchor', 'middle')
    .text((d) => {
      // 截断过长的标题
      return d.title.length > 12 ? d.title.slice(0, 12) + '...' : d.title
    })

  // 更新位置
  simulation.on('tick', () => {
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y)

    node.attr('transform', (d) => `translate(${d.x},${d.y})`)
  })
}

/**
 * 切换全局/局部视图
 */
function toggleView() {
  isGlobalView.value = !isGlobalView.value
  renderGraph()
}

onMounted(async () => {
  try {
    await loadData()
    renderGraph()
  } catch (e) {
    console.error('Failed to load graph data:', e)
  }
})

onUnmounted(() => {
  simulation?.stop()
})

// 路由变化时重新渲染
watch(currentPath, () => {
  if (!isGlobalView.value) {
    renderGraph()
  }
})

// 窗口大小变化时重新渲染
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      renderGraph()
    })
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})
</script>

<template>
  <div class="graph-view">
    <div class="graph-header">
      <span class="graph-title">Graph View</span>
      <button
        class="toggle-btn"
        @click="toggleView"
        :title="isGlobalView ? 'Local View' : 'Global View'"
      >
        <svg
          v-if="!isGlobalView"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path
            d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
          ></path>
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>
    </div>

    <div v-if="loading" class="graph-loading">Loading...</div>

    <div v-else-if="error" class="graph-error">
      {{ error }}
    </div>

    <div v-else ref="containerRef" class="graph-container"></div>
  </div>
</template>

<style scoped>
.graph-view {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background-color: var(--vp-c-bg-alt);
  overflow: hidden;
}

.graph-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.graph-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  color: var(--vp-c-text-3);
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.graph-container {
  width: 100%;
  height: 200px;
}

.graph-loading,
.graph-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.graph-error {
  color: var(--vp-c-danger-1);
}

/* D3 样式 */
:deep(.graph-link) {
  stroke: var(--vp-c-divider);
  stroke-opacity: 0.6;
  stroke-width: 1px;
}

:deep(.graph-node circle) {
  fill: var(--vp-c-text-3);
  stroke: var(--vp-c-bg);
  stroke-width: 1.5px;
  transition: all 0.2s;
}

:deep(.graph-node:hover circle) {
  fill: var(--vp-c-brand-1);
}

:deep(.graph-node.current circle) {
  fill: var(--vp-c-brand-1);
  stroke-width: 2px;
}

:deep(.graph-node.neighbor circle) {
  fill: var(--vp-c-brand-2);
}

:deep(.node-label) {
  font-size: 8px;
  fill: var(--vp-c-text-2);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}

:deep(.graph-node:hover .node-label),
:deep(.graph-node.current .node-label) {
  opacity: 1;
}
</style>
