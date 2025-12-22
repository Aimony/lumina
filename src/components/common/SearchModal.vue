<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useSearch } from '@/composables/core/useSearch'

const router = useRouter()
const { query, results, isModalOpen, closeModal, performSearch, loading } = useSearch()
const inputRef = ref<HTMLInputElement | null>(null)
const selectedIndex = ref(0)

// 自动聚焦
watch(isModalOpen, async (val) => {
  if (val) {
    await nextTick()
    inputRef.value?.focus()
    performSearch(query.value) // 重新执行上次的搜索，或者清空？通常不清空保留状态，或者可以在 openModal 里清空
  }
})

// 监听输入
watch(query, (val) => {
  performSearch(val)
  selectedIndex.value = 0
})

// 导航
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = (selectedIndex.value + 1) % results.value.length
    scrollToSelected()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = (selectedIndex.value - 1 + results.value.length) % results.value.length
    scrollToSelected()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (results.value.length > 0) {
      navigateTo(results.value[selectedIndex.value])
    }
  }
}

const scrollToSelected = () => {
  // 简单滚动逻辑，可优化
  const item = document.getElementById(`search-item-${selectedIndex.value}`)
  item?.scrollIntoView({ block: 'nearest' })
}

const navigateTo = (item: any) => {
  router.push(item.id)
  closeModal()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="search-fade">
      <div v-if="isModalOpen" class="search-overlay" @click="closeModal">
        <div class="search-container" @click.stop>
          <div class="search-header">
            <div class="search-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 19l-4.35-4.35M17 9A8 8 0 111 9a8 8 0 0116 0z"
                />
              </svg>
            </div>
            <input
              ref="inputRef"
              v-model="query"
              class="search-input"
              placeholder="Search documentation..."
              @keydown="handleKeydown"
            />
            <button class="search-esc" @click="closeModal">ESC</button>
          </div>

          <div class="search-body" ref="searchContainer">
            <div v-if="loading" class="search-message">Initializing index...</div>
            <div v-else-if="!query" class="search-message empty">Type to start searching</div>
            <div v-else-if="results.length === 0" class="search-message no-results">
              No results for "<span class="text-contrast">{{ query }}</span
              >"
            </div>
            <ul v-else class="search-list">
              <li
                v-for="(item, index) in results"
                :key="item.id"
                :id="`search-item-${index}`"
                class="search-item"
                :class="{ active: index === selectedIndex }"
                @mouseenter="selectedIndex = index"
                @click="navigateTo(item)"
              >
                <div class="search-item-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div class="search-item-content">
                  <div class="search-item-title">{{ item.title }}</div>
                  <div class="search-item-snippet" v-if="item.content">
                    {{ item.content.slice(0, 60) }}...
                  </div>
                </div>
                <div class="search-item-action">
                  <svg
                    class="enter-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <polyline points="9 10 4 15 9 20"></polyline>
                    <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
                  </svg>
                </div>
              </li>
            </ul>
          </div>

          <div class="search-footer">
            <span class="footer-item"><kbd>⇅</kbd> to navigate</span>
            <span class="footer-item"><kbd>↵</kbd> to select</span>
            <span class="footer-item"><kbd>esc</kbd> to close</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 10vh;
}

.search-container {
  width: 100%;
  max-width: 600px;
  background-color: var(--vp-c-bg);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
}

.search-header {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.search-icon {
  color: var(--vp-c-text-2);
  margin-right: 12px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 18px;
  color: var(--vp-c-text-1);
  outline: none;
}

.search-esc {
  padding: 4px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background-color: var(--vp-c-bg-alt);
  font-size: 12px;
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.search-body {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;
}

.search-message {
  padding: 32px;
  text-align: center;
  color: var(--vp-c-text-2);
}

.text-contrast {
  color: var(--vp-c-brand-1);
  font-weight: 500;
}

.search-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.search-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: background-color 0.1s;
}

.search-item.active {
  background-color: var(--vp-c-bg-alt);
  border-left-color: var(--vp-c-brand-1);
}

.search-item-icon {
  color: var(--vp-c-text-2);
  margin-right: 12px;
  opacity: 0.6;
}

.search-item-content {
  flex: 1;
  min-width: 0;
}

.search-item-title {
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.search-item-snippet {
  font-size: 13px;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.search-item-action {
  opacity: 0;
  transform: translateX(-5px);
  transition: all 0.2s;
  color: var(--vp-c-text-2);
}

.search-item.active .search-item-action {
  opacity: 1;
  transform: translateX(0);
}

.search-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--vp-c-divider);
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-bg-alt);
}

kbd {
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 2px 4px;
  font-family: inherit;
  font-size: 10px;
}

/* Transitions */
.search-fade-enter-active,
.search-fade-leave-active {
  transition: opacity 0.2s ease;
}

.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
}

.search-fade-enter-active .search-container {
  transition: transform 0.2s ease;
}

.search-fade-enter-from .search-container {
  transform: scale(0.95);
}
</style>
