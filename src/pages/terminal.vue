<script setup lang="ts">
import TerminalEmulator from '@/components/terminal/TerminalEmulator.vue'

defineOptions({
  layout: 'default'
})
</script>

<route lang="yaml">
meta:
  layout: default
</route>

<template>
  <div class="terminal-page">
    <TerminalEmulator />
  </div>
</template>

<style lang="scss" scoped>
.terminal-page {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  background: #0a0a0a;
  overflow: hidden;
}
</style>
