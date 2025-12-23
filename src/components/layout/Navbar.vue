<script setup lang="ts">
import { ref, computed } from 'vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import YearProgress from '@/components/home/YearProgress.vue'
import { navItems } from '@/config/nav'
import { useDocsTree, type DocTreeNode } from '@/composables/article/useDocsTree'
import { useSearch } from '@/composables/core/useSearch'

const { openModal } = useSearch()

const { docsTree } = useDocsTree()

// 当前悬停的菜单项
const activeDropdown = ref<string | null>(null)
// Mobile menu state
const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

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
          <slot name="toggle-bar">
            <!-- Default mobile menu toggle if not provided by slot -->
            <button
              class="hamburger-btn md:hidden"
              @click="toggleMobileMenu"
              aria-label="Toggle Menu"
            >
              <svg
                v-if="!isMobileMenuOpen"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <svg
                v-else
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </slot>

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
          <div class="search-trigger" @click="openModal">
            <span class="search-key-hint">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span class="key-combo hidden lg:flex">
                <span class="key">Ctrl</span><span class="key">K</span>
              </span>
            </span>
          </div>
          <div class="navbar-actions">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isMobileMenuOpen" class="mobile-menu-backdrop" @click="closeMobileMenu"></div>
      </Transition>
      <Transition name="mobile-menu">
        <div v-if="isMobileMenuOpen" class="navbar-mobile-menu md:hidden">
          <div class="mobile-nav-items">
            <template v-for="item in processedNavItems" :key="item.text">
              <router-link
                :to="item.basePath || item.to || '#'"
                class="mobile-nav-link"
                @click="closeMobileMenu"
                active-class="active"
              >
                {{ item.text }}
              </router-link>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>
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

.search-trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 12px;
  color: var(--vp-c-text-2);
  transition: color 0.25s;
}

.search-trigger:hover {
  color: var(--vp-c-text-1);
}

.search-key-hint {
  display: flex;
  align-items: center;
  gap: 8px;
}

.key-combo {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-3);
  padding: 2px 4px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background-color: var(--vp-c-bg-alt);
}

/* Mobile Menu */
.navbar-mobile-menu {
  position: fixed;
  top: var(--vp-nav-height);
  left: 0;
  right: 0;
  height: 50vh;
  z-index: 45;
  background-color: var(--vp-c-bg);
  padding: 24px;
  overflow-y: auto;
  border-top: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
  box-shadow: var(--vp-shadow-3);
}

.mobile-nav-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-nav-link {
  display: block;
  font-size: 1rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  padding: 8px 0;
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  color: var(--vp-c-brand-1);
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.mobile-menu-enter-to,
.mobile-menu-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.hamburger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--vp-c-text-1);
  background: transparent;
  border: none;
  cursor: pointer;
  margin-left: -8px;
}

.mobile-menu-backdrop {
  position: fixed;
  top: var(--vp-nav-height);
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}
</style>
