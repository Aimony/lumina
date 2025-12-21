<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const tags = computed(() => {
  return (route.meta.tags as string[]) || []
})
</script>

<template>
  <div class="article-tags" v-if="tags.length > 0">
    <div class="tags-container">
      <router-link v-for="tag in tags" :key="tag" :to="`/tags?tag=${tag}`" class="tag-item">
        #{{ tag }}
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.article-tags {
  margin-top: 32px;
  margin-bottom: 32px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  background-color: var(--vp-c-bg-alt);
  color: var(--vp-c-brand-1);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.25s;
}

.tag-item:hover {
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  transform: translateY(-1px);
}
</style>
