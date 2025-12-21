<script setup lang="ts">
import { ref, computed } from 'vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import YearProgress from '@/components/YearProgress.vue'
import { navItems } from '@/config/nav'
import { useDocsTree, type DocTreeNode } from '@/composables/useDocsTree'

const { docsTree } = useDocsTree()

// 当前悬停的菜单项
const activeDropdown = ref<string | null>(null)

// 递归查找目录下第一个有效的非目录路径
const getValidPath = (node: DocTreeNode): string => {
  if (!node.isDirectory) return node.path
  if (node.children && node.children.length > 0) {
    // 优先找非目录的子节点
    const file = node.children.find((c) => !c.isDirectory)
    if (file) return file.path
    // 否则递归查找第一个目录的子路径
    const firstChild = node.children[0]
    if (firstChild) return getValidPath(firstChild)
  }
  return node.path
}

// 获取子菜单项
const getChildren = (basePath: string): DocTreeNode[] => {
  const node = docsTree.value.find((n) => n.path === basePath)
  // 返回所有子节点（无论是目录还是文件）
  return node?.children || []
}

// 处理后的导航项，包含动态生成的 children
const processedNavItems = computed(() => {
  return navItems.map((item) => {
    if (item.basePath) {
      return {
        ...item,
        children: getChildren(item.basePath)
      }
    }
    return item
  })
})

const showDropdown = (text: string) => {
  activeDropdown.value = text
}

const hideDropdown = () => {
  activeDropdown.value = null
}
</script>

<template>
  <header class="navbar">
    <YearProgress />
    <div class="navbar-wrapper">
      <div class="navbar-container">
        <!-- Left: Slot for Toggle & Logo -->
        <div class="navbar-title">
          <slot name="toggle-bar" />

          <router-link to="/" class="title-link">
            <span class="logo">📚</span>
            <span class="text">Lumina</span>
          </router-link>
        </div>

        <!-- Right: Nav & Actions -->
        <div class="navbar-content">
          <nav class="navbar-menu hidden md:flex">
            <template v-for="item in processedNavItems" :key="item.text">
              <!-- 有子菜单的项 -->
              <div
                v-if="item.children && item.children.length > 0"
                class="menu-item-with-dropdown"
                @mouseenter="showDropdown(item.text)"
                @mouseleave="hideDropdown"
              >
                <router-link
                  v-if="item.basePath"
                  :to="item.basePath"
                  class="menu-link has-dropdown"
                  active-class="active"
                >
                  {{ item.text }}
                  <svg class="dropdown-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 4.5L6 8L9.5 4.5"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </router-link>

                <!-- 下拉菜单 -->
                <Transition name="dropdown">
                  <div v-show="activeDropdown === item.text" class="dropdown-menu">
                    <router-link
                      v-for="child in item.children"
                      :key="child.path"
                      :to="getValidPath(child)"
                      class="dropdown-item"
                      @click="hideDropdown"
                    >
                      {{ child.title }}
                    </router-link>
                  </div>
                </Transition>
              </div>

              <!-- 无子菜单的普通链接 -->
              <router-link
                v-else-if="item.to"
                :to="item.to"
                class="menu-link"
                active-class="active"
              >
                {{ item.text }}
              </router-link>
            </template>
          </nav>
          <div class="navbar-actions">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Navbar */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  height: var(--vp-nav-height);
  background-color: var(--vp-nav-bg);
  backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--vp-c-divider);
  transition:
    background-color 0.25s,
    border-color 0.25s;
}

.navbar-wrapper {
  margin: 0 auto;
  height: 100%;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 24px;
  padding-right: 65px;
}

.navbar-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.title-link:hover {
  opacity: 0.8;
}

.navbar-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.navbar-menu {
  display: flex;
  gap: 24px;
}

.menu-link {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.menu-link:hover,
.menu-link.active {
  color: var(--vp-c-brand-1);
}

.menu-link.has-dropdown {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dropdown-icon {
  transition: transform 0.2s;
}

.menu-item-with-dropdown:hover .dropdown-icon {
  transform: rotate(180deg);
}

/* Dropdown Menu */
.menu-item-with-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 12px;
  min-width: 160px;
  padding: 8px 0;
  background: var(--vp-nav-dropdown-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  box-shadow: var(--vp-shadow-3);
  backdrop-filter: blur(12px);
}

.dropdown-item {
  display: block;
  padding: 8px 16px;
  font-size: 0.875rem;
  color: var(--vp-c-text-1);
  transition:
    background-color 0.15s,
    color 0.15s;
}

.dropdown-item:hover {
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
}

/* Dropdown Animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.navbar-actions {
  display: flex;
  align-items: center;
  padding-left: 16px;
  border-left: 1px solid var(--vp-c-divider);
}
</style>
