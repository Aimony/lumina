<!-- 灵感来自 Quartz 4 -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
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
const modalContainerRef = ref<HTMLElement | null>(null)
const isGlobalView = ref(props.global ?? false)
const isModalOpen = ref(false)

// 当前路径
const currentPath = computed(() => route.path.replace(/\/$/, '') || '/')

// 邻居节点集合
const neighbors = computed(() => {
  if (!data.value) return new Set<string>()
  return getNeighbors(currentPath.value)
})

let simulation: d3.Simulation<GraphNode, GraphLink> | null = null
let modalSimulation: d3.Simulation<GraphNode, GraphLink> | null = null
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null

/**
 * 渲染图形到指定容器
 */
function renderGraphToContainer(
  container: HTMLElement,
  useGlobalView: boolean,
  isModal: boolean = false
): d3.Simulation<GraphNode, GraphLink> | null {
  if (!data.value) return null

  // 清除旧的 SVG
  d3.select(container).selectAll('*').remove()

  const width = container.clientWidth
  const height = container.clientHeight || 200

  // 获取要渲染的数据
  let graphData: GraphData
  if (useGlobalView) {
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

  if (graphData.nodes.length === 0) return null

  // 创建 SVG
  const newSvg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])

  // 添加缩放和平移功能
  const g = newSvg.append('g')

  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform)
    })

  newSvg.call(zoom)

  // 模态框使用更强的力参数
  const chargeStrength = isModal ? -200 : -150
  const linkDistance = isModal ? 80 : 60

  // 创建力导向布局
  const sim = d3
    .forceSimulation<GraphNode>(graphData.nodes)
    .force(
      'link',
      d3
        .forceLink<GraphNode, GraphLink>(graphData.links)
        .id((d) => d.id)
        .distance(linkDistance)
    )
    .force('charge', d3.forceManyBody().strength(chargeStrength))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(isModal ? 25 : 20))

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
      if (isModal) {
        closeModal()
      }
    })
    .on('mouseenter', (_event, d) => {
      // 获取与当前节点相连的节点 ID
      const connectedIds = new Set<string>()
      connectedIds.add(d.id)

      graphData.links.forEach((l) => {
        const sourceId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id
        const targetId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id
        if (sourceId === d.id) connectedIds.add(targetId)
        if (targetId === d.id) connectedIds.add(sourceId)
      })

      // 高亮相关连线
      link
        .classed('highlighted', (l: any) => {
          const sourceId = typeof l.source === 'string' ? l.source : l.source.id
          const targetId = typeof l.target === 'string' ? l.target : l.target.id
          return sourceId === d.id || targetId === d.id
        })
        .classed('dimmed', (l: any) => {
          const sourceId = typeof l.source === 'string' ? l.source : l.source.id
          const targetId = typeof l.target === 'string' ? l.target : l.target.id
          return sourceId !== d.id && targetId !== d.id
        })

      // 高亮相关节点，降低其他节点透明度
      node
        .classed('highlighted', (n) => connectedIds.has(n.id))
        .classed('dimmed', (n) => !connectedIds.has(n.id))
    })
    .on('mouseleave', () => {
      // 恢复所有元素状态
      link.classed('highlighted', false).classed('dimmed', false)
      node.classed('highlighted', false).classed('dimmed', false)
    })
    .call(
      d3
        .drag<SVGGElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) sim?.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) sim?.alphaTarget(0)
          d.fx = null
          d.fy = null
        }) as any
    )

  // 节点圆形 - 模态框中更大
  const nodeRadius = isModal ? 1.8 : 1.5
  node.append('circle').attr('r', (d) => {
    return Math.max(
      isModal ? 5 : 4,
      Math.min(isModal ? 16 : 12, (isModal ? 5 : 4) + d.links * nodeRadius)
    )
  })

  // 节点标签 - 模态框中始终显示
  node
    .append('text')
    .attr('class', isModal ? 'node-label modal-label' : 'node-label')
    .attr('dy', isModal ? -14 : -10)
    .attr('text-anchor', 'middle')
    .text((d) => {
      const maxLen = isModal ? 20 : 12
      return d.title.length > maxLen ? d.title.slice(0, maxLen) + '...' : d.title
    })

  // 更新位置
  sim.on('tick', () => {
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y)

    node.attr('transform', (d) => `translate(${d.x},${d.y})`)
  })

  if (!isModal) {
    svg = newSvg
  }

  return sim
}

/**
 * 初始化或更新图形
 */
function renderGraph() {
  if (!containerRef.value || !data.value) return
  simulation = renderGraphToContainer(containerRef.value, isGlobalView.value, false)
}

/**
 * 渲染模态框中的图形
 */
function renderModalGraph() {
  if (!modalContainerRef.value || !data.value) return
  modalSimulation = renderGraphToContainer(modalContainerRef.value, true, true)
}

/**
 * 切换全局/局部视图
 */
function toggleView() {
  isGlobalView.value = !isGlobalView.value
  renderGraph()
}

/**
 * 打开全屏模态框
 */
function openModal() {
  isModalOpen.value = true
  nextTick(() => {
    renderModalGraph()
  })
}

/**
 * 关闭模态框
 */
function closeModal() {
  isModalOpen.value = false
  modalSimulation?.stop()
  modalSimulation = null
}

/**
 * 处理 ESC 键关闭模态框
 */
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isModalOpen.value) {
    closeModal()
  }
}

onMounted(async () => {
  try {
    await loadData()
    renderGraph()
  } catch (e) {
    console.error('Failed to load graph data:', e)
  }
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  simulation?.stop()
  modalSimulation?.stop()
  window.removeEventListener('keydown', handleKeydown)
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
      <div class="header-actions">
        <button
          class="action-btn"
          @click="toggleView"
          :title="isGlobalView ? 'Local View' : 'Global View'"
        >
          <svg
            v-if="!isGlobalView"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
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
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
        <button class="action-btn" @click="openModal" title="Expand">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </button>
      </div>
    </div>

    <div v-if="loading" class="graph-loading">Loading...</div>

    <div v-else-if="error" class="graph-error">
      {{ error }}
    </div>

    <div v-else ref="containerRef" class="graph-container"></div>
  </div>

  <!-- 全屏模态框 -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isModalOpen" class="graph-modal-overlay" @click.self="closeModal">
        <div class="graph-modal">
          <div class="modal-header">
            <span class="modal-title">Graph View</span>
            <button class="modal-close" @click="closeModal" title="Close (ESC)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div ref="modalContainerRef" class="modal-graph-container"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.graph-view {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background-color: var(--vp-c-bg-alt);
  overflow: hidden;
  margin-bottom: 20px;
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

.header-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
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

.action-btn:hover {
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

/* 模态框样式 */
.graph-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.graph-modal {
  width: 90vw;
  height: 80vh;
  max-width: 1200px;
  background-color: var(--vp-c-bg);
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: var(--vp-c-text-2);
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover {
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.modal-graph-container {
  flex: 1;
  width: 100%;
  background-color: var(--vp-c-bg-alt);
}

/* 模态框动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .graph-modal,
.modal-leave-to .graph-modal {
  transform: scale(0.9);
}

/* D3 样式 */
:deep(.graph-link) {
  stroke: var(--vp-c-divider);
  stroke-opacity: 0.6;
  stroke-width: 1px;
  transition: all 0.25s ease;
}

:deep(.graph-link.highlighted) {
  stroke: var(--vp-c-brand-1);
  stroke-opacity: 1;
  stroke-width: 2px;
}

:deep(.graph-link.dimmed) {
  stroke-opacity: 0.15;
}

:deep(.graph-node circle) {
  fill: var(--vp-c-text-3);
  stroke: var(--vp-c-bg);
  stroke-width: 1.5px;
  transition: all 0.25s ease;
}

:deep(.graph-node:hover circle),
:deep(.graph-node.highlighted circle) {
  fill: var(--vp-c-brand-1);
  transform: scale(1.2);
}

:deep(.graph-node.dimmed circle) {
  opacity: 0.3;
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
  transition: opacity 0.25s ease;
}

:deep(.node-label.modal-label) {
  font-size: 11px;
  opacity: 0.8;
}

:deep(.graph-node:hover .node-label),
:deep(.graph-node.current .node-label),
:deep(.graph-node.highlighted .node-label) {
  opacity: 1;
}

:deep(.graph-node.dimmed .node-label) {
  opacity: 0;
}
</style>
