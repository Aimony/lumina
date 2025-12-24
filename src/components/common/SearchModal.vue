<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSearch, type SearchResult } from '@/composables/core/useSearch'
import { useSearchHistory } from '@/composables/ui/useSearchHistory'
import SearchPreviewCard from './SearchPreviewCard.vue'

const router = useRouter()
const { query, results, isModalOpen, closeModal, performSearch, loading } = useSearch()
const { recentQueries, recentDocs, addSearchQuery, addRecentDoc, clearHistory } = useSearchHistory()

const inputRef = ref<HTMLInputElement | null>(null)
const selectedIndex = ref(0)

// 当前选中的项目（用于预览）
const selectedItem = computed<SearchResult | null>(() => {
  if (results.value.length > 0 && selectedIndex.value < results.value.length) {
    return results.value[selectedIndex.value] ?? null
  }
  return null
})

// 判断是否显示历史面板
const showHistory = computed(() => {
  return !query.value.trim() && (recentQueries.value.length > 0 || recentDocs.value.length > 0)
})

// 自动聚焦
watch(isModalOpen, async (val) => {
  if (val) {
    await nextTick()
    inputRef.value?.focus()
    performSearch(query.value)
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
    if (results.value.length > 0) {
      selectedIndex.value = (selectedIndex.value + 1) % results.value.length
      scrollToSelected()
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (results.value.length > 0) {
      selectedIndex.value = (selectedIndex.value - 1 + results.value.length) % results.value.length
      scrollToSelected()
    }
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const item = results.value[selectedIndex.value]
    if (item) {
      navigateTo(item)
    }
  }
}

const scrollToSelected = () => {
  const item = document.getElementById(`search-item-${selectedIndex.value}`)
  item?.scrollIntoView({ block: 'nearest' })
}

const navigateTo = (item: SearchResult) => {
  // 记录搜索词和访问的文档
  if (query.value.trim()) {
    addSearchQuery(query.value)
  }
  addRecentDoc(item)

  // 确保路由路径是绝对路径（以 / 开头）
  const path = item.id.startsWith('/') ? item.id : `/${item.id}`
  router.push(path)
  closeModal()
}

// 点击历史搜索词
const searchFromHistory = (q: string) => {
  query.value = q
  performSearch(q)
}

// 点击最近文档
const goToRecentDoc = (doc: SearchResult) => {
  addRecentDoc(doc) // 更新顺序
  // 确保路由路径是绝对路径（以 / 开头）
  const path = doc.id.startsWith('/') ? doc.id : `/${doc.id}`
  router.push(path)
  closeModal()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="search-fade">
      <div v-if="isModalOpen" class="search-overlay" @click="closeModal">
        <div class="search-container" @click.stop>
          <!-- 搜索头部 -->
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
              placeholder="搜索文档..."
              @keydown="handleKeydown"
            />
            <button class="search-esc" @click="closeModal">ESC</button>
          </div>

          <!-- 主体区域（双栏布局） -->
          <div class="search-main">
            <!-- 左侧：结果列表/历史面板 -->
            <div class="search-body">
              <!-- 加载状态 -->
              <div v-if="loading" class="search-message">正在初始化索引...</div>

              <!-- 历史面板 -->
              <div v-else-if="showHistory" class="history-panel">
                <!-- 最近搜索 -->
                <div v-if="recentQueries.length > 0" class="history-section">
                  <div class="history-header">
                    <span class="history-title">最近搜索</span>
                  </div>
                  <div class="history-queries">
                    <button
                      v-for="q in recentQueries"
                      :key="q"
                      class="history-query"
                      @click="searchFromHistory(q)"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      {{ q }}
                    </button>
                  </div>
                </div>

                <!-- 最近访问 -->
                <div v-if="recentDocs.length > 0" class="history-section">
                  <div class="history-header">
                    <span class="history-title">最近访问</span>
                  </div>
                  <ul class="search-list">
                    <li
                      v-for="doc in recentDocs"
                      :key="doc.id"
                      class="search-item"
                      @click="goToRecentDoc(doc)"
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
                          <path
                            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                          ></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                      </div>
                      <div class="search-item-content">
                        <div class="search-item-title">{{ doc.title }}</div>
                      </div>
                    </li>
                  </ul>
                </div>

                <!-- 清除历史按钮 -->
                <button class="clear-history" @click="clearHistory">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    ></path>
                  </svg>
                  清除历史
                </button>
              </div>

              <!-- 空状态 -->
              <div v-else-if="!query" class="search-message empty">输入关键词开始搜索</div>

              <!-- 无结果 -->
              <div v-else-if="results.length === 0" class="search-message no-results">
                未找到 "<span class="text-contrast">{{ query }}</span
                >" 的相关结果
              </div>

              <!-- 结果列表 -->
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

            <!-- 右侧：预览卡片 -->
            <SearchPreviewCard
              v-if="results.length > 0"
              :item="selectedItem"
              class="search-preview"
            />
          </div>

          <!-- 底部提示 -->
          <div class="search-footer">
            <span class="footer-item"><kbd>⇅</kbd> 导航</span>
            <span class="footer-item"><kbd>↵</kbd> 选择</span>
            <span class="footer-item"><kbd>esc</kbd> 关闭</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
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
  max-width: 900px;
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

  &::placeholder {
    color: var(--vp-c-text-3);
  }
}

.search-esc {
  padding: 4px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background-color: var(--vp-c-bg-alt);
  font-size: 12px;
  color: var(--vp-c-text-2);
  cursor: pointer;

  &:hover {
    background-color: var(--vp-c-bg-elv);
  }
}

// 主体双栏布局
.search-main {
  display: flex;
  min-height: 300px;
}

.search-body {
  flex: 1;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;
}

.search-preview {
  flex-shrink: 0;
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

// 历史面板样式
.history-panel {
  padding: 12px 16px;
}

.history-section {
  margin-bottom: 20px;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.history-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.history-queries {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-query {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background-color: var(--vp-c-bg);
  font-size: 13px;
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background-color: var(--vp-c-bg-alt);
    border-color: var(--vp-c-brand-1);
  }

  svg {
    color: var(--vp-c-text-3);
  }
}

.clear-history {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background-color: transparent;
  font-size: 12px;
  color: var(--vp-c-text-3);
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background-color: var(--vp-c-bg-alt);
    color: var(--vp-c-text-2);
  }
}

// 搜索列表样式
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

  &.active {
    background-color: var(--vp-c-bg-alt);
    border-left-color: var(--vp-c-brand-1);
  }

  &:hover:not(.active) {
    background-color: var(--vp-c-bg-soft);
  }
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

// 过渡动画
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
