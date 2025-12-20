<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

interface NavItem {
  path: string
  title: string
  children?: NavItem[]
}

const route = useRoute()
const navItems = ref<NavItem[]>([])

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

    // 处理目录结构
    if (parts.length === 1) {
      // 顶级页面
      const item: NavItem = { path: routePath, title }
      items.push(item)
      pathMap.set(routePath, item)
    } else {
      // 嵌套页面
      const parentPath = '/' + parts.slice(0, -1).join('/')
      let parent = pathMap.get(parentPath)

      if (!parent) {
        const parentName = parts[parts.length - 2]
        const parentTitle = parentName
          ? parentName.charAt(0).toUpperCase() + parentName.slice(1)
          : ''
        parent = {
          path: parentPath,
          title: parentTitle,
          children: []
        }
        items.push(parent)
        pathMap.set(parentPath, parent)
      }

      if (!parent.children) parent.children = []
      parent.children.push({ path: routePath, title })
    }
  }

  navItems.value = items.sort((a, b) => a.path.localeCompare(b.path))
})

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<template>
  <nav class="group">
    <div class="group-title" v-if="false">
      <!-- Optional top level title if needed -->
      Navigation
    </div>

    <ul class="nav-items">
      <li v-for="item in navItems" :key="item.path">
        <!-- Group with Children -->
        <div v-if="item.children?.length" class="nav-group">
          <div class="nav-group-title">
            {{ item.title }}
          </div>
          <ul class="nav-group-items">
            <li v-for="child in item.children" :key="child.path">
              <router-link
                :to="child.path"
                class="nav-link"
                :class="{ active: isActive(child.path) }"
              >
                {{ child.title }}
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Individual Page -->
        <router-link
          v-else
          :to="item.path"
          class="nav-link top-level"
          :class="{ active: isActive(item.path) }"
        >
          {{ item.title }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.group {
  padding: 24px 0;
}

.nav-items {
  /* space-y-1 equivalent */
  display: flex;
  flex-direction: column;
}

.nav-group-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
  padding: 0 12px;
  line-height: 24px;
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
</style>
