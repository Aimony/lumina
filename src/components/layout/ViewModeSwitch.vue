<script setup lang="ts">
import { useViewMode, viewModeOptions } from '@/composables/ui/useViewMode'

const { currentMode, setMode } = useViewMode()
</script>

<template>
  <div class="view-mode-switch">
    <button
      v-for="option in viewModeOptions"
      :key="option.id"
      class="mode-btn"
      :class="{ active: currentMode === option.id }"
      :title="option.label"
      @click="setMode(option.id)"
    >
      <span class="mode-icon">{{ option.icon }}</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.view-mode-switch {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg-soft);
}

.mode-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.6;

  &:hover {
    background: var(--vp-c-bg-elv);
    opacity: 1;
  }

  &.active {
    background: var(--vp-c-brand-soft);
    opacity: 1;
  }

  .mode-icon {
    font-size: 1.1rem;
  }
}
</style>
