<script setup lang="ts">
import { inject } from 'vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const isDark = inject<{ value: boolean }>('isDark')
const toggleDark = inject<() => void>('toggleDark')
</script>

<template>
  <div class="min-h-screen bg-[var(--color-bg)]">
    <!-- Header -->
    <header class="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2 text-xl font-bold text-[var(--color-text)]">
          <span class="text-2xl">📚</span>
          <span>KB-Vue</span>
        </router-link>

        <nav class="flex items-center gap-6">
          <router-link to="/guide"
            class="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
            指南
          </router-link>
          <router-link to="/games/snake"
            class="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors flex items-center gap-1">
            <span>🎮</span>
            <span>贪吃蛇</span>
          </router-link>
          <ThemeToggle />
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main>
      <slot />
    </main>
  </div>
</template>
