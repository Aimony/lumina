<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { apps } from '@/config/apps'

const isOpen = ref(false)
const launcherRef = ref<HTMLElement | null>(null)
let closeTimer: number | null = null

const openLauncher = () => {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  isOpen.value = true
}

const closeLauncher = () => {
  // Add a small delay to prevent flickering when moving passing gaps
  closeTimer = window.setTimeout(() => {
    isOpen.value = false
  }, 100)
}

const handleClickOutside = (event: MouseEvent) => {
  if (isOpen.value && launcherRef.value && !launcherRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (closeTimer) clearTimeout(closeTimer)
})
</script>

<template>
  <div
    class="app-launcher"
    ref="launcherRef"
    @mouseenter="openLauncher"
    @mouseleave="closeLauncher"
  >
    <button class="launcher-btn" :class="{ active: isOpen }" aria-label="App Launcher">
      <span class="emoji">🤓</span>
    </button>

    <Transition name="fade">
      <div v-if="isOpen" class="app-grid-container">
        <div class="app-grid">
          <router-link
            v-for="app in apps"
            :key="app.id"
            :to="app.path"
            class="app-item"
            @click="isOpen = false"
          >
            <div class="icon-wrapper">
              <img :src="app.icon" :alt="app.name" class="app-icon" />
            </div>
            <span class="app-name">{{ app.name }}</span>
          </router-link>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.app-launcher {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  /* Ensure full height for better hover target */

  .launcher-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: var(--vp-c-text-1);
    position: relative;
    z-index: 101;
    /* Ensure button stays above if needed */

    &:hover,
    &.active {
      background-color: var(--vp-c-bg-soft);
      transform: scale(1.05);

      .emoji {
        transform: scale(1.1) rotate(5deg);
      }
    }

    .emoji {
      font-size: 1.25rem;
      line-height: 1;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  }

  .app-grid-container {
    position: absolute;
    top: calc(100% + 16px);
    right: -12px;
    left: auto;
    width: 360px;
    max-width: 90vw;
    /* Adaptive width */
    max-height: 80vh;
    /* Prevent overflow on small screens */
    overflow-y: auto;
    /* Allow scrolling if content is too long */
    background-color: var(--vp-c-bg-elv);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--vp-c-divider);
    border-radius: 24px;
    padding: 20px;
    box-shadow:
      0 16px 48px -8px rgba(0, 0, 0, 0.12),
      0 8px 16px -4px rgba(0, 0, 0, 0.04);
    z-index: 100;

    transform-origin: top right;

    /* Hide Scrollbar */
    scrollbar-width: none;
    /* Firefox */
    -ms-overflow-style: none;
    /* IE/Edge */

    &::-webkit-scrollbar {
      display: none;
    }

    /* Invisible bridge to prevent closing when moving from button to menu */
    &::before {
      content: '';
      position: absolute;
      top: -20px;
      right: 0;
      width: 100%;
      height: 20px;
      z-index: 1;
    }

    @supports not (background-color: var(--vp-c-bg-elv)) {
      background-color: var(--vp-c-bg);
    }

    .app-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      /* Slightly tighter gap */

      .app-item {
        position: relative;
        overflow: hidden;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        padding: 12px;
        border-radius: 16px;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        color: var(--vp-c-text-1);
        background-color: transparent;
        aspect-ratio: 1;
        width: 100%;
        border: 1px solid transparent;
        /* Prepare for border transition */

        &:hover {
          transform: translateY(-2px);
          background-color: rgba(var(--vp-c-brand-rgb, 100, 108, 255), 0.08);
          /* Brand tint */
          border-color: rgba(var(--vp-c-brand-rgb, 100, 108, 255), 0.2);

          .icon-wrapper {
            background-color: var(--vp-c-bg);
            box-shadow: 0 4px 12px rgba(var(--vp-c-brand-rgb, 100, 108, 255), 0.15);
            transform: scale(1.1);
          }

          .app-name {
            color: var(--vp-c-brand-1, #646cff);
          }
        }

        .icon-wrapper {
          width: 48px;
          height: 48px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--vp-c-bg-alt);
          border-radius: 14px;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);

          .app-icon {
            width: 28px;
            height: 28px;
            object-fit: contain;
            transition: transform 0.3s ease;
          }
        }

        .app-name {
          font-size: 0.8rem;
          font-weight: 500;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          opacity: 0.8;
          transition: color 0.3s ease;
        }
      }
    }
  }
}

/* Updated Animations for "Bubble Squeeze" Effect */
.fade-enter-active {
  transition:
    opacity 0.4s ease,
    transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  /* Elastic / Spring out */
}

.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* Smooth in */
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.1) translate(20px, -20px);
  /* Start small from top-right */
  filter: blur(8px);
}
</style>
