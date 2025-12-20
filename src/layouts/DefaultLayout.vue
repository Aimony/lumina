<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
</script>

<template>
  <div class="layout-container">
    <!-- Header -->
    <Navbar />

    <!-- Main Content -->
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.layout-container {
  min-height: 100vh;
  background-color: var(--vp-c-bg);
  transition: background-color 0.25s;
}

.main-content {
  padding-top: var(--vp-nav-height);
  min-height: 100vh;
}
</style>
