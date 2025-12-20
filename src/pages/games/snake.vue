<script setup lang="ts">
import SnakeGame from '@/pages/games/components/SnakeGame.vue'
</script>

<template>
  <div class="game-page">
    <div class="page-header">
      <h1 class="title">Retro Snake</h1>
      <p class="subtitle">Use WASD or Arrow keys to move. Press Space to play.</p>
    </div>

    <div class="game-viewport">
      <SnakeGame />
    </div>

    <div class="page-footer">
      <router-link to="/" class="back-link">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.game-page {
  min-height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: radial-gradient(circle at top, #1e293b 0%, #0f172a 100%);
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.title {
  font-size: 4rem;
  font-weight: 900;
  background: linear-gradient(135deg, #38bdf8, #818cf8, #f43f5e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #94a3b8;
  font-size: 1.1rem;
}

.game-viewport {
  margin-bottom: 3rem;
}

.page-footer {
  margin-top: 1rem;
}

.back-link {
  display: flex;
  items-center: center;
  gap: 0.5rem;
  color: #94a3b8;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.back-link:hover {
  color: white;
}

@media (max-width: 640px) {
  .title {
    font-size: 2.5rem;
  }
}
</style>
