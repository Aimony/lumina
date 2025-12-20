<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue'

// const isDark = inject<{ value: boolean }>('isDark')
// const toggleDark = inject<() => void>('toggleDark')
</script>

<template>
  <div class="layout-container">
    <!-- Header -->
    <header class="navbar">
      <div class="navbar-wrapper">
        <div class="navbar-container">
          <div class="navbar-title">
            <router-link to="/" class="title-link">
              <span class="logo">📚</span>
              <span class="text">Lumina</span>
            </router-link>
          </div>

          <div class="navbar-content">
            <nav class="navbar-menu">
              <router-link to="/guide/intro" class="menu-link" active-class="active">
                指南
              </router-link>
              <router-link to="/games/snake" class="menu-link" active-class="active">
                贪吃蛇
              </router-link>
            </nav>
            <div class="navbar-actions">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>

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

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  height: var(--vp-nav-height);
  background-color: rgba(255, 255, 255, 0.82);
  /* Use hardcoded white for light, overrides in dark */
  backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--vp-c-divider);
  transition: background-color 0.25s, border-color 0.25s;
}

:global(.dark) .navbar {
  background-color: rgba(27, 27, 31, 0.82);
  /* Dark mode background */
}

.navbar-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 24px;
}

.navbar-title {
  display: flex;
  align-items: center;
}

.title-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.title-link:hover {
  opacity: 0.8;
  color: var(--vp-c-text-1);
  /* Keep title color consistent on hover */
}

.text {
  /* Ensure text doesn't change color on link hover if we don't want it to */
}

.navbar-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.navbar-menu {
  display: flex;
  gap: 24px;
}

.menu-link {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.menu-link:hover,
.menu-link.active {
  color: var(--vp-c-brand-1);
}

.navbar-actions {
  display: flex;
  align-items: center;
  padding-left: 16px;
  border-left: 1px solid var(--vp-c-divider);
}

.main-content {
  padding-top: var(--vp-nav-height);
  min-height: 100vh;
}
</style>
