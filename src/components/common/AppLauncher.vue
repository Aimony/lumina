<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { apps } from '@/config/apps'

const isOpen = ref(false)
const launcherRef = ref<HTMLElement | null>(null)

const toggleLauncher = () => {
  isOpen.value = !isOpen.value
}

const closeLauncher = () => {
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (isOpen.value && launcherRef.value && !launcherRef.value.contains(event.target as Node)) {
    closeLauncher()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="app-launcher" ref="launcherRef">
    <button
      class="launcher-btn"
      :class="{ active: isOpen }"
      @click.stop="toggleLauncher"
      title="Google Apps"
    >
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
            @click="closeLauncher"
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
    transition: all 0.25s;
    color: var(--vp-c-text-1);

    &:hover,
    &.active {
      background-color: var(--vp-c-bg-soft);

      .emoji {
        transform: scale(1.1);
      }
    }

    .emoji {
      font-size: 1.25rem;
      line-height: 1;
      transition: transform 0.25s;
    }
  }

  .app-grid-container {
    position: absolute;
    top: calc(100% + 12px);
    right: -8px;
    left: auto;
    width: 360px;
    background-color: var(--vp-c-bg-elv);
    backdrop-filter: blur(20px);
    border: 1px solid var(--vp-c-divider);
    border-radius: 20px;
    padding: 16px;
    box-shadow:
      0 12px 32px rgba(0, 0, 0, 0.1),
      0 4px 8px rgba(0, 0, 0, 0.05);
    z-index: 100;
    transform-origin: top right;

    @supports not (background-color: var(--vp-c-bg-elv)) {
      background-color: var(--vp-c-bg);
    }

    .app-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      padding: 4px;

      .app-item {
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        padding: 8px;
        border-radius: 16px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        color: var(--vp-c-text-1);
        background-color: transparent;
        aspect-ratio: 1;
        /* Force square aspect ratio */
        width: 100%;

        &:hover {
          background-color: var(--vp-c-bg-soft);
          transform: translateY(-2px);

          .icon-wrapper {
            background-color: var(--vp-c-bg);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
        }

        .icon-wrapper {
          width: 44px;
          height: 44px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--vp-c-bg-alt);
          border-radius: 14px;
          transition: background-color 0.2s;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

          .app-icon {
            width: 24px;
            height: 24px;
            object-fit: contain;
          }
        }

        .app-name {
          font-size: 0.75rem;
          font-weight: 500;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          opacity: 0.9;
          line-height: 1.2;
        }
      }
    }
  }
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s cubic-bezier(0.19, 1, 0.22, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}
</style>
