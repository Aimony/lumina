<script setup lang="ts">
import { useBacklinks } from '@/composables/article/useBacklinks'
import { useRouter } from 'vue-router'

const { backlinks } = useBacklinks()
const router = useRouter()

const navigateTo = (id: string, e: Event) => {
  // Prevent default to avoid full reload if it was an anchor, though here it's a div/card
  e.preventDefault()
  // Ensure absolute path
  const path = id.startsWith('/') ? id : '/' + id
  router.push(path)
}
</script>

<template>
  <div class="backlinks-section" v-if="backlinks.length > 0">
    <div class="divider">
      <span class="divider-text">Mentions</span>
    </div>

    <div class="backlinks-grid">
      <div
        v-for="link in backlinks"
        :key="link.sourceId"
        class="backlink-card"
        @click="(e) => navigateTo(link.sourceId, e)"
      >
        <div class="backlink-header">
          <span class="backlink-title">{{ link.sourceTitle }}</span>
          <!-- <span class="backlink-path">{{ link.sourceId }}</span> -->
        </div>
        <div class="backlink-snippet">
          {{ link.snippet }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backlinks-section {
  margin-top: 64px;
  margin-bottom: 32px;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 8px;
}

.divider-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.backlinks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.backlink-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
  background-color: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.2s ease;
}

.backlink-card:hover {
  border-color: var(--vp-c-brand-1);
  background-color: var(--vp-c-bg-soft-up);
  transform: translateY(-2px);
}

.backlink-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}

.backlink-title {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.backlink-path {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.backlink-snippet {
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-style: italic;
}
</style>
