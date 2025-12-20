<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

interface NavItem {
  path: string
  title: string
  children?: NavItem[]
}

const route = useRoute()
const navItems = ref<NavItem[]>([])

// 追踪展开状态的分组
const expandedGroups = ref<Set<string>>(new Set())

// 切换分组的展开/折叠状态
const toggleGroup = (path: string) => {
  if (expandedGroups.value.has(path)) {
    expandedGroups.value.delete(path)
  } else {
    expandedGroups.value.add(path)
  }
  // 触发响应式更新
  expandedGroups.value = new Set(expandedGroups.value)
}

// 检查分组是否展开
const isExpanded = (path: string) => expandedGroups.value.has(path)

// 计算当前路由的知识库基础路径（第一级）
// 例如：/fronted/react/react-basic -> /fronted
const currentKnowledgeBasePath = computed(() => {
  const parts = route.path.split('/').filter(Boolean)
  if (parts.length >= 1) {
    return '/' + parts[0]
  }
  return null
})

// 过滤后的导航项 - 显示当前知识库下的所有分类
const filteredNavItems = computed(() => {
  if (!currentKnowledgeBasePath.value) return []

  // 过滤出属于当前知识库的所有分类
  return navItems.value.filter((item) => item.path.startsWith(currentKnowledgeBasePath.value!))
})

// 自动展开当前路由所在的分组
const expandCurrentGroup = () => {
  const parts = route.path.split('/').filter(Boolean)
  if (parts.length >= 2) {
    const categoryPath = '/' + parts.slice(0, 2).join('/')
    expandedGroups.value.add(categoryPath)
    expandedGroups.value = new Set(expandedGroups.value)
  }
}

// 监听路由变化，自动展开当前分组
watch(() => route.path, expandCurrentGroup)

onMounted(async () => {
  // 使用 import.meta.glob 自动扫描 docs 目录
  const pages = import.meta.glob('/src/docs/**/*.{md,vue}')

  const items: NavItem[] = []
  const pathMap = new Map<string, NavItem>()

  for (const path of Object.keys(pages)) {
    // 转换路径：/src/docs/guide/intro.md -> /guide/intro
    const routePath =
      path
        .replace('/src/docs', '')
        .replace(/\.(md|vue)$/, '')
        .replace(/\/index$/, '') || '/'

    // 提取标题（简化处理，使用文件名）
    const parts = routePath.split('/').filter(Boolean)
    const fileName = parts[parts.length - 1] || 'index'
    const title = fileName.charAt(0).toUpperCase() + fileName.slice(1)

    // 跳过首页
    if (routePath === '/') continue

    // 跳过分类的 index 文件（如 /fronted/react/index）
    if (fileName === 'index') continue

    // 处理目录结构
    if (parts.length === 1) {
      // 顶级页面
      const item: NavItem = { path: routePath, title }
      items.push(item)
      pathMap.set(routePath, item)
    } else {
      // 嵌套页面 - 使用前两级作为分类键
      const categoryPath = '/' + parts.slice(0, 2).join('/')
      let category = pathMap.get(categoryPath)

      if (!category) {
        // 分类标题使用第二级目录名（如 react）
        const categoryName = parts[1] || parts[0]
        const categoryTitle = categoryName
          ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1)
          : ''
        category = {
          path: categoryPath,
          title: categoryTitle,
          children: []
        }
        items.push(category)
        pathMap.set(categoryPath, category)
      }

      if (!category.children) category.children = []
      category.children.push({ path: routePath, title })
    }
  }

  navItems.value = items.sort((a, b) => a.path.localeCompare(b.path))

  // 自动展开当前路由所在的分组
  expandCurrentGroup()
})

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<template>
  <nav class="sidebar-nav">
    <!-- 遍历所有分类 -->
    <div v-for="category in filteredNavItems" :key="category.path" class="nav-group">
      <!-- 分类标题 - 可点击折叠 -->
      <div
        class="nav-group-title"
        :class="{ expanded: isExpanded(category.path), collapsible: category.children?.length }"
        @click="category.children?.length && toggleGroup(category.path)"
      >
        <span class="nav-group-title-text">{{ category.title }}</span>
        <svg
          v-if="category.children?.length"
          class="collapse-icon"
          :class="{ rotated: isExpanded(category.path) }"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M4.5 2.5L8 6L4.5 9.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <!-- 该分类下的文章列表 -->
      <Transition name="collapse">
        <ul
          class="nav-group-items"
          v-show="isExpanded(category.path)"
          v-if="category.children?.length"
        >
          <li v-for="item in category.children" :key="item.path">
            <router-link :to="item.path" class="nav-link" :class="{ active: isActive(item.path) }">
              {{ item.title }}
            </router-link>
          </li>
        </ul>
      </Transition>
    </div>
  </nav>
</template>

<style scoped>
.sidebar-nav {
  padding: 24px 0;
}

.nav-group {
  margin-bottom: 24px;
}

.nav-group:last-child {
  margin-bottom: 0;
}

.nav-group-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
  padding: 4px 12px;
  line-height: 24px;
  border-radius: 6px;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.nav-group-title.collapsible {
  cursor: pointer;
  user-select: none;
}

.nav-group-title.collapsible:hover {
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
}

.nav-group-title-text {
  flex: 1;
}

.collapse-icon {
  color: var(--vp-c-text-3);
  transition:
    transform 0.25s ease,
    color 0.2s;
  flex-shrink: 0;
}

.collapse-icon.rotated {
  transform: rotate(90deg);
}

.nav-group-title.collapsible:hover .collapse-icon {
  color: var(--vp-c-brand-1);
}

.nav-group-items {
  border-left: 1px solid var(--vp-c-border);
  padding-left: 14px;
  margin-left: 12px;
}

.nav-link {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  padding: 4px 12px;
  line-height: 24px;
  transition: color 0.25s;
  border-left: 2px solid transparent;
  margin-left: -16px;
  /* Offset for border */
  padding-left: 16px;
}

.nav-group-items .nav-link {
  margin-left: -15px;
  /* Adjust for nested border */
  padding-left: 14px;
  border-left: none;
  /* Borders handled by group line mostly, but VP uses text color change */
}

/* Hover State */
.nav-link:hover {
  color: var(--vp-c-brand-1);
}

/* Active State */
.nav-link.active {
  color: var(--vp-c-brand-1);
}

.nav-link.top-level {
  font-weight: 600;
}

/* 折叠展开动画 */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}
</style>
