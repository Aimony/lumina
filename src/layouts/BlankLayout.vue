<script setup lang="ts">
// Blank layout for pages that don't need navbar or footer
</script>

<template>
  <div class="blank-layout">
    <slot />
  </div>
</template>

<style scoped>
.blank-layout {
  width: 100%;
  min-height: 100vh;
}
</style>
