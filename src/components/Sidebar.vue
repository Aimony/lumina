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
  // 使用 import.meta.glob 自动扫描 pages 目录
  const pages = import.meta.glob('/src/pages/**/*.{md,vue}')
  
  const items: NavItem[] = []
  const pathMap = new Map<string, NavItem>()
  
  for (const path of Object.keys(pages)) {
    // 转换路径：/src/pages/guide/intro.md -> /guide/intro
    const routePath = path
      .replace('/src/pages', '')
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
        parent = { 
          path: parentPath, 
          title: parts[parts.length - 2]?.charAt(0).toUpperCase() + parts[parts.length - 2]?.slice(1) || '',
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
  <nav class="p-4">
    <div class="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
      导航
    </div>
    
    <ul class="space-y-1">
      <li v-for="item in navItems" :key="item.path">
        <!-- 有子项的分组 -->
        <div v-if="item.children?.length">
          <div class="px-3 py-2 text-sm font-medium text-[var(--color-text)]">
            {{ item.title }}
          </div>
          <ul class="ml-3 space-y-1 border-l border-[var(--color-border)]">
            <li v-for="child in item.children" :key="child.path">
              <router-link
                :to="child.path"
                :class="[
                  'block px-3 py-1.5 text-sm rounded-r-lg transition-colors',
                  isActive(child.path)
                    ? 'bg-[var(--color-link)]/10 text-[var(--color-link)] border-l-2 border-[var(--color-link)] -ml-px'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]'
                ]"
              >
                {{ child.title }}
              </router-link>
            </li>
          </ul>
        </div>
        
        <!-- 单个页面 -->
        <router-link
          v-else
          :to="item.path"
          :class="[
            'block px-3 py-2 text-sm rounded-lg transition-colors',
            isActive(item.path)
              ? 'bg-[var(--color-link)]/10 text-[var(--color-link)]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]'
          ]"
        >
          {{ item.title }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>
