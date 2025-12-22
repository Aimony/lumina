<script setup lang="ts">
import HomeHero from '@/components/home/HomeHero.vue'
import { ref } from 'vue'
import HomeFeatures from '@/components/home/HomeFeatures.vue'
import DoorAnimation from '@/components/common/DoorAnimation.vue'

const showAnimation = ref(true)
</script>

<!-- 知识库主页 -->
<template>
  <div class="home">
    <DoorAnimation v-if="showAnimation" @animation-end="showAnimation = false" />
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
