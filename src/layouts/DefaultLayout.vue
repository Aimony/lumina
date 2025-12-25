<script setup lang="ts">
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
</script>

<template>
  <div class="layout-container">
    <!-- Header -->
    <Navbar />

    <!-- Main Content -->
    <main class="main-content">
      <slot />
    </main>

    <!-- Footer -->
    <Footer transparent />
  </div>
</template>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--vp-c-bg);
  transition: background-color 0.25s;
}

.main-content {
  padding-top: var(--vp-nav-height);
  flex: 1;
}
</style>
