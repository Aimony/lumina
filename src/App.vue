<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import DocLayout from '@/layouts/DocLayout.vue'
import { useThemeProvider } from '@/composables/core/useTheme'
import { useCodeCopy } from '@/composables/ui/useCodeCopy'
import { useCodeFold } from '@/composables/ui/useCodeFold'
import SearchModal from '@/components/common/SearchModal.vue'

const route = useRoute()
useThemeProvider()
useCodeCopy()
useCodeFold()

// 根据路由 meta 选择布局
const layout = computed(() => {
  if (route.meta.layout === 'doc') return DocLayout
  if (route.meta.layout === 'default') return DefaultLayout
  return null
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
  <SearchModal />
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
