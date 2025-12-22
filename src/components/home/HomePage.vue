<script setup lang="ts">
import HomeHero from '@/components/home/HomeHero.vue'
import HomeFeatures from '@/components/home/HomeFeatures.vue'
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
