<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed, provide, ref, watch } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import DocLayout from '@/layouts/DocLayout.vue'

const route = useRoute()
const isDark = ref(false)

// 根据路由 meta 选择布局
const layout = computed(() => {
  return route.meta.layout === 'doc' ? DocLayout : DefaultLayout
})

// 提供主题状态给子组件
provide('isDark', isDark)
provide('toggleDark', () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
})

// 初始化主题
if (typeof window !== 'undefined') {
  isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.classList.toggle('dark', isDark.value)
}
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
</template>
