<!-- 沉浸式知识星系视图 -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as d3 from 'd3'
import {
  useGraphData,
  type GraphNode,
  type GraphLink,
  type GraphData
} from '@/composables/article/useGraphData'

const router = useRouter()
const { data, loading, error, loadData } = useGraphData()

// Refs
const containerRef = ref<HTMLElement | null>(null)
const infoPanel = ref<GraphNode | null>(null)

// 状态
const isCruising = ref(false)
const isLoaded = ref(false)

// 分类颜色映射
const categoryColors: Record<string, string> = {
  frontend: '#61dafb',
  backend: '#68d391',
  example: '#f6ad55',
  guide: '#9f7aea',
  AIGC: '#f687b3',
  games: '#fc8181',
  docs: '#63b3ed',
  root: '#a0aec0'
}

// D3 相关
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null
let simulation: d3.Simulation<GraphNode, GraphLink> | null = null
let cruiseInterval: ReturnType<typeof setInterval> | null = null
let zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null
// 存储带有 D3 计算坐标的节点数据（用于巡航）
let simulationNodes: GraphNode[] = []

// 获取分类颜色
function getCategoryColor(category: string): string {
  return categoryColors[category] ?? categoryColors.root ?? '#a0aec0'
}

// 获取所有分类
const categories = computed(() => {
  if (!data.value) return []
  const cats = new Set<string>()
  data.value.nodes.forEach((n) => cats.add(n.category || 'root'))
  return Array.from(cats)
})

// 聚类中心点计算
function calculateClusterCenters(width: number, height: number) {
  const cats = categories.value
  const centers: Record<string, { x: number; y: number }> = {}
  const angleStep = (2 * Math.PI) / cats.length
  const radius = Math.min(width, height) * 0.3

  cats.forEach((cat, i) => {
    const angle = angleStep * i - Math.PI / 2
    centers[cat] = {
      x: width / 2 + radius * Math.cos(angle),
      y: height / 2 + radius * Math.sin(angle)
    }
  })

  return centers
}

// 渲染图形
function renderGraph() {
  if (!containerRef.value || !data.value) return

  const container = containerRef.value
  const width = container.clientWidth
  const height = container.clientHeight

  // 清除旧的 SVG
  d3.select(container).selectAll('*').remove()

  // 深拷贝数据
  const graphData: GraphData = {
    nodes: data.value.nodes.map((n) => ({ ...n })),
    links: data.value.links.map((l) => ({
      source: typeof l.source === 'string' ? l.source : l.source.id,
      target: typeof l.target === 'string' ? l.target : l.target.id
    }))
  }

  // 保存节点引用，用于巡航
  simulationNodes = graphData.nodes

  // 计算聚类中心
  const clusterCenters = calculateClusterCenters(width, height)

  // 创建 SVG
  svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])

  // 主容器
  const g = svg.append('g')

  // 缩放行为
  zoomBehavior = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 8])
    .on('zoom', (event) => {
      g.attr('transform', event.transform)
    })

  svg.call(zoomBehavior)

  // 创建力导向布局
  simulation = d3
    .forceSimulation<GraphNode>(graphData.nodes)
    .force(
      'link',
      d3
        .forceLink<GraphNode, GraphLink>(graphData.links)
        .id((d) => d.id)
        .distance(100)
        .strength(0.3)
    )
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2).strength(0.05))
    .force('collision', d3.forceCollide().radius(40))
    // 聚类力：将同类节点吸引到聚类中心
    .force(
      'clusterX',
      d3
        .forceX<GraphNode>((d) => {
          const center = clusterCenters[d.category || 'root']
          return center ? center.x : width / 2
        })
        .strength(0.15)
    )
    .force(
      'clusterY',
      d3
        .forceY<GraphNode>((d) => {
          const center = clusterCenters[d.category || 'root']
          return center ? center.y : height / 2
        })
        .strength(0.15)
    )

  // 绘制链接
  const link = g
    .append('g')
    .attr('class', 'cosmos-links')
    .selectAll('line')
    .data(graphData.links)
    .join('line')
    .attr('class', 'cosmos-link')
    .attr('stroke', 'rgba(255, 255, 255, 0.15)')
    .attr('stroke-width', 1)

  // 绘制节点
  const node = g
    .append('g')
    .attr('class', 'cosmos-nodes')
    .selectAll('g')
    .data(graphData.nodes)
    .join('g')
    .attr('class', 'cosmos-node')
    .style('cursor', 'pointer')
    .on('click', (_event, d) => {
      router.push(d.path)
    })
    .on('mouseenter', (_event, d) => {
      infoPanel.value = d
      highlightNode(d, graphData, node, link)
    })
    .on('mouseleave', () => {
      infoPanel.value = null
      resetHighlight(node, link)
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

  // 节点光晕效果
  node
    .append('circle')
    .attr('class', 'node-glow')
    .attr('r', (d) => Math.max(8, 6 + d.links * 2))
    .attr('fill', (d) => getCategoryColor(d.category || 'root'))
    .attr('opacity', 0.3)
    .attr('filter', 'blur(4px)')

  // 节点核心
  node
    .append('circle')
    .attr('class', 'node-core')
    .attr('r', (d) => Math.max(5, 4 + d.links * 1.5))
    .attr('fill', (d) => getCategoryColor(d.category || 'root'))

  // 节点标签
  node
    .append('text')
    .attr('class', 'node-label')
    .attr('dy', (d) => -Math.max(10, 8 + d.links * 1.5))
    .attr('text-anchor', 'middle')
    .attr('fill', 'rgba(255, 255, 255, 0.8)')
    .attr('font-size', '11px')
    .text((d) => (d.title.length > 15 ? d.title.slice(0, 15) + '...' : d.title))

  // 更新位置
  simulation.on('tick', () => {
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y)

    node.attr('transform', (d) => `translate(${d.x},${d.y})`)
  })

  isLoaded.value = true
}

// 高亮节点（平滑过渡）
function highlightNode(
  target: GraphNode,
  graphData: GraphData,
  node: d3.Selection<any, GraphNode, any, any>,
  link: d3.Selection<any, GraphLink, any, any>
) {
  const connectedIds = new Set<string>()
  connectedIds.add(target.id)

  graphData.links.forEach((l) => {
    const sourceId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id
    const targetId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id
    if (sourceId === target.id) connectedIds.add(targetId)
    if (targetId === target.id) connectedIds.add(sourceId)
  })

  // 使用 transition 实现平滑过渡
  node
    .transition()
    .duration(300)
    .ease(d3.easeCubicOut)
    .style('opacity', (n: GraphNode) => (connectedIds.has(n.id) ? 1 : 0.35))

  link
    .transition()
    .duration(300)
    .ease(d3.easeCubicOut)
    .style('opacity', (l: any) => {
      const sourceId = typeof l.source === 'string' ? l.source : l.source.id
      const targetId = typeof l.target === 'string' ? l.target : l.target.id
      return sourceId === target.id || targetId === target.id ? 0.6 : 0.08
    })
}

// 重置高亮（平滑过渡）
function resetHighlight(
  node: d3.Selection<any, GraphNode, any, any>,
  link: d3.Selection<any, GraphLink, any, any>
) {
  node.transition().duration(400).ease(d3.easeCubicOut).style('opacity', 1)

  link.transition().duration(400).ease(d3.easeCubicOut).style('opacity', null)
}

// 缩放到指定节点
function zoomToNode(node: GraphNode, duration: number = 1500) {
  if (!svg || !zoomBehavior || node.x === undefined || node.y === undefined) return

  const container = containerRef.value
  if (!container) return

  const width = container.clientWidth
  const height = container.clientHeight
  const scale = 2

  const transform = d3.zoomIdentity
    .translate(width / 2 - node.x * scale, height / 2 - node.y * scale)
    .scale(scale)

  svg.transition().duration(duration).call(zoomBehavior.transform, transform)

  // 显示节点信息
  infoPanel.value = node
}

// 开始自动巡航
function startCruise() {
  if (simulationNodes.length === 0 || isCruising.value) return

  isCruising.value = true

  const cruise = () => {
    if (simulationNodes.length === 0 || !isCruising.value) return

    // 使用带有 D3 计算坐标的节点
    const randomNode = simulationNodes[Math.floor(Math.random() * simulationNodes.length)]
    if (randomNode && randomNode.x !== undefined && randomNode.y !== undefined) {
      zoomToNode(randomNode, 2000)
    }
  }

  // 稍微延迟执行，确保布局稳定
  setTimeout(cruise, 500)

  // 每5秒换一个节点
  cruiseInterval = setInterval(cruise, 5000)
}

// 停止巡航
function stopCruise() {
  isCruising.value = false
  if (cruiseInterval) {
    clearInterval(cruiseInterval)
    cruiseInterval = null
  }
  infoPanel.value = null

  // 重置视图
  if (svg && zoomBehavior && containerRef.value) {
    const transform = d3.zoomIdentity.translate(0, 0).scale(1)
    svg.transition().duration(1000).call(zoomBehavior.transform, transform)
  }
}

// 切换巡航
function toggleCruise() {
  if (isCruising.value) {
    stopCruise()
  } else {
    startCruise()
  }
}

// 返回
function goBack() {
  stopCruise()
  router.back()
}

// 生命周期
onMounted(async () => {
  try {
    await loadData()
    await nextTick()
    renderGraph()
  } catch (e) {
    console.error('Failed to load cosmos data:', e)
  }

  // 添加键盘事件
  window.addEventListener('keydown', handleKeydown)

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  stopCruise()
  simulation?.stop()
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleResize)
})

// 键盘事件
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (isCruising.value) {
      stopCruise()
    } else {
      goBack()
    }
  }
  if (e.key === ' ' || e.code === 'Space') {
    e.preventDefault()
    toggleCruise()
  }
}

// 窗口大小变化
let resizeTimeout: ReturnType<typeof setTimeout> | null = null
function handleResize() {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    renderGraph()
  }, 300)
}
</script>

<template>
  <div class="cosmos-container">
    <!-- 背景星空 -->
    <div class="cosmos-bg">
      <div class="stars"></div>
      <div class="stars2"></div>
      <div class="stars3"></div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="cosmos-loading">
      <div class="loading-spinner"></div>
      <span>正在加载知识星系...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="cosmos-error">
      <span>{{ error }}</span>
      <button @click="goBack">返回</button>
    </div>

    <!-- 图形容器 -->
    <div v-else ref="containerRef" class="cosmos-graph"></div>

    <!-- 控制面板 -->
    <div class="cosmos-controls">
      <button class="control-btn back-btn" @click="goBack" title="返回 (ESC)">
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
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>
      <button
        class="control-btn cruise-btn"
        :class="{ active: isCruising }"
        @click="toggleCruise"
        :title="isCruising ? '停止巡航 (空格)' : '开始巡航 (空格)'"
      >
        <svg
          v-if="!isCruising"
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
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <svg
          v-else
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
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      </button>
    </div>

    <!-- 分类图例 -->
    <div class="cosmos-legend">
      <div v-for="cat in categories" :key="cat" class="legend-item">
        <span class="legend-dot" :style="{ backgroundColor: getCategoryColor(cat) }"></span>
        <span class="legend-label">{{ cat }}</span>
      </div>
    </div>

    <!-- 信息面板 -->
    <Transition name="panel">
      <div v-if="infoPanel" class="cosmos-info-panel">
        <h3 class="info-title">{{ infoPanel.title }}</h3>
        <p class="info-path">{{ infoPanel.path }}</p>
        <div v-if="infoPanel.tags && infoPanel.tags.length" class="info-tags">
          <span v-for="tag in infoPanel.tags" :key="tag" class="info-tag">
            {{ tag }}
          </span>
        </div>
        <p class="info-hint">点击节点可跳转到文章</p>
      </div>
    </Transition>

    <!-- 快捷键提示 -->
    <div class="cosmos-hints">
      <span>ESC 退出</span>
      <span>空格 巡航</span>
      <span>滚轮 缩放</span>
      <span>拖拽 移动</span>
    </div>
  </div>
</template>

<style scoped>
.cosmos-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: #000;
}

/* 星空背景 */
.cosmos-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, #0a0a1f 0%, #000008 100%);
  z-index: 0;
}

.stars,
.stars2,
.stars3 {
  position: absolute;
  inset: 0;
  background-repeat: repeat;
}

.stars {
  background-image:
    radial-gradient(1px 1px at 10% 10%, rgba(255, 255, 255, 0.8), transparent),
    radial-gradient(1px 1px at 30% 40%, rgba(255, 255, 255, 0.6), transparent),
    radial-gradient(1px 1px at 50% 20%, rgba(255, 255, 255, 0.9), transparent),
    radial-gradient(1px 1px at 70% 60%, rgba(255, 255, 255, 0.7), transparent),
    radial-gradient(1px 1px at 90% 30%, rgba(255, 255, 255, 0.5), transparent),
    radial-gradient(1.5px 1.5px at 20% 70%, rgba(255, 255, 255, 0.9), transparent),
    radial-gradient(1.5px 1.5px at 40% 90%, rgba(255, 255, 255, 0.6), transparent),
    radial-gradient(1.5px 1.5px at 60% 50%, rgba(255, 255, 255, 0.8), transparent),
    radial-gradient(1.5px 1.5px at 80% 10%, rgba(255, 255, 255, 0.7), transparent);
  background-size: 200px 200px;
  animation: twinkle 4s ease-in-out infinite;
}

.stars2 {
  background-image:
    radial-gradient(1px 1px at 15% 25%, rgba(255, 255, 255, 0.7), transparent),
    radial-gradient(1px 1px at 35% 55%, rgba(255, 255, 255, 0.5), transparent),
    radial-gradient(1px 1px at 55% 35%, rgba(255, 255, 255, 0.8), transparent),
    radial-gradient(1px 1px at 75% 75%, rgba(255, 255, 255, 0.6), transparent),
    radial-gradient(1px 1px at 95% 45%, rgba(255, 255, 255, 0.9), transparent);
  background-size: 300px 300px;
  animation: twinkle 5s ease-in-out infinite 1s;
}

.stars3 {
  background-image:
    radial-gradient(2px 2px at 25% 15%, rgba(255, 255, 255, 0.6), transparent),
    radial-gradient(2px 2px at 45% 65%, rgba(255, 255, 255, 0.8), transparent),
    radial-gradient(2px 2px at 65% 85%, rgba(255, 255, 255, 0.5), transparent),
    radial-gradient(2px 2px at 85% 25%, rgba(255, 255, 255, 0.7), transparent);
  background-size: 400px 400px;
  animation: twinkle 6s ease-in-out infinite 2s;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.8;
  }

  50% {
    opacity: 0.4;
  }
}

/* 图形容器 */
.cosmos-graph {
  position: absolute;
  inset: 0;
  z-index: 1;
}

/* 加载状态 */
.cosmos-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #61dafb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 错误状态 */
.cosmos-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #fc8181;
  z-index: 10;
}

.cosmos-error button {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.cosmos-error button:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 控制面板 */
.cosmos-controls {
  position: absolute;
  top: 24px;
  left: 24px;
  display: flex;
  gap: 12px;
  z-index: 100;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
}

.cruise-btn.active {
  background: rgba(97, 218, 251, 0.2);
  border-color: #61dafb;
  color: #61dafb;
}

/* 分类图例 */
.cosmos-legend {
  position: absolute;
  top: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  z-index: 100;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

/* 信息面板 */
.cosmos-info-panel {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 280px;
  max-width: 400px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  backdrop-filter: blur(16px);
  z-index: 100;
  text-align: center;
}

.info-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.info-path {
  margin: 0 0 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.info-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin-bottom: 12px;
}

.info-tag {
  padding: 2px 8px;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.7);
}

.info-hint {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

/* 面板动画 */
.panel-enter-active,
.panel-leave-active {
  transition: all 0.3s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* 快捷键提示 */
.cosmos-hints {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 24px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  z-index: 100;
}
</style>
