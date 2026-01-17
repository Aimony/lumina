<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import DocLayout from '@/layouts/DocLayout.vue'
import BlankLayout from '@/layouts/BlankLayout.vue'
import { useThemeStore } from '@/stores/theme'
import { useCodeCopy } from '@/composables/ui/useCodeCopy'
import { useCodeFold } from '@/composables/ui/useCodeFold'
import { useCodeResize } from '@/composables/ui/useCodeResize'
import { useGlobalContextMenu } from '@/composables/ui/useContextMenu'
import SearchModal from '@/components/common/SearchModal.vue'
import ContextMenu from '@/components/common/ContextMenu.vue'
import CursorEffect from '@/components/common/CursorEffect.vue'
import EasterEgg from '@/components/common/EasterEgg.vue'

const route = useRoute()
const themeStore = useThemeStore()
themeStore.init()
useCodeCopy()
useCodeFold()
useCodeResize()
useGlobalContextMenu()

// 根据路由 meta 选择布局
const layout = computed(() => {
  if (route.meta.layout === 'doc') return DocLayout
  if (route.meta.layout === 'blank') return BlankLayout
  if (route.meta.layout === 'none') return null // 不使用任何布局
  // 默认为 DefaultLayout，除非明确指定其他
  return DefaultLayout
})
</script>

<template>
  <component :is="layout" v-if="layout">
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </component>
  <RouterView v-else v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
  <SearchModal />
  <ContextMenu />
  <CursorEffect />
  <EasterEgg />
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
