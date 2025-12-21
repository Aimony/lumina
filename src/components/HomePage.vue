<script setup lang="ts">
import HomeHero from '@/components/HomeHero.vue'
import HomeFeatures from '@/components/HomeFeatures.vue'
</script>

<!-- 知识库主页 -->
<template>
  <div class="home">
    <HomeHero />
    <HomeFeatures />
  </div>
</template>

<style scoped>
.home {
  padding-bottom: 96px;
  background: var(--vp-bg-image) center/cover no-repeat fixed;
  min-height: 100vh;
}
</style>
