<script setup lang="ts">
import { usePrevNext } from '@/composables/usePrevNext'

const prevNext = usePrevNext()
</script>

<template>
  <div class="prev-next-nav" v-if="prevNext.prev || prevNext.next">
    <div class="nav-group prev">
      <router-link v-if="prevNext.prev" :to="prevNext.prev.path" class="nav-link">
        <span class="label">Previous</span>
        <span class="title">{{ prevNext.prev.title }}</span>
      </router-link>
    </div>
    <div class="nav-group next">
      <router-link v-if="prevNext.next" :to="prevNext.next.path" class="nav-link">
        <span class="label">Next</span>
        <span class="title">{{ prevNext.next.title }}</span>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.prev-next-nav {
  display: flex;
  gap: 24px;
  margin-top: 64px;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
}

.nav-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.nav-group.prev {
  align-items: flex-start;
}

.nav-group.next {
  align-items: flex-end;
  text-align: right;
}

.nav-link {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background-color: var(--vp-c-bg-alt);
  text-decoration: none;
  width: 100%;
  transition: all 0.25s;
}

.nav-link:hover {
  border-color: var(--vp-c-brand-1);
  background-color: var(--vp-c-bg-soft);
  transform: translateY(-2px);
}

.label {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-bottom: 4px;
}

.title {
  font-size: 16px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
}

.nav-link:hover .title {
  color: var(--vp-c-brand-2);
}

@media (max-width: 640px) {
  .prev-next-nav {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
