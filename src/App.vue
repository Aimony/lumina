<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import DocLayout from '@/layouts/DocLayout.vue'
import { useThemeProvider } from '@/composables/useTheme'

const route = useRoute()
useThemeProvider()

// 根据路由 meta 选择布局
const layout = computed(() => {
  if (route.meta.layout === 'doc') return DocLayout
  if (route.meta.layout === 'default') return DefaultLayout
  return null
})
</script>

<template>
  <component :is="layout" v-if="layout">
    <RouterView />
  </component>
  <RouterView v-else />
</template>
