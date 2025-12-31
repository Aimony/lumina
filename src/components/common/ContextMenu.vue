<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useContextMenu, type MenuItem } from '@/composables/ui/useContextMenu'

const { isVisible, position, menuItems, hide, executeAction } = useContextMenu()

const menuRef = ref<HTMLElement | null>(null)

// 点击外部关闭菜单
const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    hide()
  }
}

// ESC 键关闭菜单
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    hide()
  }
}

// 调整菜单位置避免超出视口
const adjustPosition = async () => {
  await nextTick()
  if (!menuRef.value || !isVisible.value) return

  const rect = menuRef.value.getBoundingClientRect()
  const padding = 16

  let { x, y } = position.value

  // 右边界检测
  if (x + rect.width > window.innerWidth - padding) {
    x = window.innerWidth - rect.width - padding
  }

  // 下边界检测
  if (y + rect.height > window.innerHeight - padding) {
    y = window.innerHeight - rect.height - padding
  }

  // 更新位置
  if (menuRef.value) {
    menuRef.value.style.left = `${x}px`
    menuRef.value.style.top = `${y}px`
  }
}

watch(isVisible, (visible) => {
  if (visible) {
    adjustPosition()
    document.addEventListener('click', handleClickOutside, true)
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('contextmenu', handleClickOutside, true)
  } else {
    document.removeEventListener('click', handleClickOutside, true)
    document.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('contextmenu', handleClickOutside, true)
  }
})

onMounted(() => {
  if (isVisible.value) {
    document.addEventListener('click', handleClickOutside, true)
    document.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('contextmenu', handleClickOutside, true)
})

// 获取图标 SVG
const getIcon = (iconName: string | undefined) => {
  if (!iconName) return null
  return iconName
}

// 点击菜单项
const handleItemClick = (item: unknown) => {
  const menuItem = item as MenuItem
  if (!menuItem.disabled) {
    executeAction(menuItem)
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="context-menu">
      <div
        v-if="isVisible"
        ref="menuRef"
        class="context-menu"
        :style="{ left: position.x + 'px', top: position.y + 'px' }"
        @contextmenu.prevent
      >
        <div class="context-menu-content">
          <template v-for="(item, index) in menuItems" :key="item.id">
            <button
              class="context-menu-item"
              :class="{
                disabled: item.disabled,
                danger: item.danger
              }"
              :disabled="item.disabled"
              @click="handleItemClick(item)"
            >
              <!-- 图标 -->
              <span class="item-icon">
                <!-- 外部链接 -->
                <svg v-if="getIcon(item.icon) === 'external-link'" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <polyline
                    points="15 3 21 3 21 9"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <line
                    x1="10"
                    y1="14"
                    x2="21"
                    y2="3"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>

                <!-- 链接 -->
                <svg v-else-if="getIcon(item.icon) === 'link'" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>

                <!-- 文本 -->
                <svg v-else-if="getIcon(item.icon) === 'text'" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 7V4h16v3"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M9 20h6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M12 4v16"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>

                <!-- 文件夹/路径 -->
                <svg v-else-if="getIcon(item.icon) === 'folder'" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>

                <!-- 分享 -->
                <svg v-else-if="getIcon(item.icon) === 'share'" viewBox="0 0 24 24" fill="none">
                  <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2" />
                  <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                  <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2" />
                  <line
                    x1="8.59"
                    y1="13.51"
                    x2="15.42"
                    y2="17.49"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <line
                    x1="15.41"
                    y1="6.51"
                    x2="8.59"
                    y2="10.49"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                </svg>

                <!-- 展开 -->
                <svg v-else-if="getIcon(item.icon) === 'expand'" viewBox="0 0 24 24" fill="none">
                  <polyline
                    points="15 3 21 3 21 9"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <polyline
                    points="9 21 3 21 3 15"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <line
                    x1="21"
                    y1="3"
                    x2="14"
                    y2="10"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <line
                    x1="3"
                    y1="21"
                    x2="10"
                    y2="14"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>

                <!-- 折叠 -->
                <svg v-else-if="getIcon(item.icon) === 'collapse'" viewBox="0 0 24 24" fill="none">
                  <polyline
                    points="4 14 10 14 10 20"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <polyline
                    points="20 10 14 10 14 4"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <line
                    x1="14"
                    y1="10"
                    x2="21"
                    y2="3"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <line
                    x1="3"
                    y1="21"
                    x2="10"
                    y2="14"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>

                <!-- 默认占位 -->
                <span v-else class="icon-placeholder"></span>
              </span>

              <!-- 标签 -->
              <span class="item-label">{{ item.label }}</span>

              <!-- 快捷键 -->
              <span v-if="item.shortcut" class="item-shortcut">{{ item.shortcut }}</span>
            </button>

            <!-- 分隔线 -->
            <div
              v-if="item.divider && index < menuItems.length - 1"
              class="context-menu-divider"
            ></div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.context-menu {
  position: fixed;
  z-index: 10000;
  min-width: 180px;
  max-width: 280px;
  padding: 6px;
  background: var(--vp-nav-dropdown-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  box-shadow: var(--vp-shadow-3);
  transform-origin: top left;
}

.context-menu-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  text-align: left;
  transition: all 0.15s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(var(--vp-c-brand-1-rgb, 66, 184, 131), 0.1) 0%,
      rgba(var(--vp-c-brand-1-rgb, 66, 184, 131), 0.05) 100%
    );
    opacity: 0;
    transition: opacity 0.15s ease;
    border-radius: 8px;
  }

  &:hover:not(.disabled) {
    color: var(--vp-c-brand-1);

    &::before {
      opacity: 1;
    }

    .item-icon {
      color: var(--vp-c-brand-1);
    }
  }

  &:active:not(.disabled) {
    transform: scale(0.98);
  }

  &.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &.danger {
    color: #ef4444;

    &:hover:not(.disabled) {
      background: rgba(239, 68, 68, 0.1);
    }
  }
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--vp-c-text-2);
  transition: color 0.15s ease;

  svg {
    width: 16px;
    height: 16px;
  }
}

.icon-placeholder {
  width: 16px;
  height: 16px;
}

.item-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-shortcut {
  font-size: 11px;
  color: var(--vp-c-text-3);
  padding: 2px 6px;
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
  font-family: var(--vp-font-family-mono);
}

.context-menu-divider {
  height: 1px;
  margin: 4px 8px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--vp-c-divider) 20%,
    var(--vp-c-divider) 80%,
    transparent
  );
}

/* 动画 */
.context-menu-enter-active {
  animation: contextMenuIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.context-menu-leave-active {
  animation: contextMenuOut 0.15s ease-in forwards;
}

@keyframes contextMenuIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-8px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes contextMenuOut {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }

  to {
    opacity: 0;
    transform: scale(0.95) translateY(-4px);
  }
}

/* 暗色模式 */
:global(.dark) {
  .item-shortcut {
    background: rgba(255, 255, 255, 0.08);
  }
}

/* 响应式 - 触摸设备 */
@media (hover: none) {
  .context-menu-item {
    padding: 12px 14px;

    &:active:not(.disabled) {
      background: var(--vp-c-brand-soft);
    }
  }
}
</style>
