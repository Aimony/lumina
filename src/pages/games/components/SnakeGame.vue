<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const GRID_SIZE = 20
const INITIAL_SPEED = 150
const MIN_SPEED = 60

type Point = { x: number; y: number }
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

const snake = ref<Point[]>([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }])
const food = ref<Point>({ x: 5, y: 5 })
const direction = ref<Direction>('UP')
const nextDirection = ref<Direction>('UP')
const score = ref(0)
const highScore = ref(0)
const isPlaying = ref(false)
const isGameOver = ref(false)
const gameLoop = ref<number | null>(null)

const boardWidth = 400
const boardHeight = 400
const cellSize = boardWidth / GRID_SIZE

const containerStyle = computed(() => ({
  width: `${boardWidth}px`,
  height: `${boardHeight}px`,
}))

const getRandomPoint = (): Point => ({
  x: Math.floor(Math.random() * GRID_SIZE),
  y: Math.floor(Math.random() * GRID_SIZE),
})

const spawnFood = () => {
  let newFood = getRandomPoint()
  while (snake.value.some(p => p.x === newFood.x && p.y === newFood.y)) {
    newFood = getRandomPoint()
  }
  food.value = newFood
}

const move = () => {
  direction.value = nextDirection.value
  const headPoint = snake.value[0]
  if (!headPoint) return

  const head = { ...headPoint }

  switch (direction.value) {
    case 'UP': head.y -= 1; break
    case 'DOWN': head.y += 1; break
    case 'LEFT': head.x -= 1; break
    case 'RIGHT': head.x += 1; break
  }

  // Collision detection
  if (
    head.x < 0 || head.x >= GRID_SIZE ||
    head.y < 0 || head.y >= GRID_SIZE ||
    snake.value.some(p => p.x === head.x && p.y === head.y)
  ) {
    gameOver()
    return
  }

  snake.value.unshift(head)

  if (head.x === food.value.x && head.y === food.value.y) {
    score.value += 10
    if (score.value > highScore.value) highScore.value = score.value
    spawnFood()
  } else {
    snake.value.pop()
  }
}

const startGame = () => {
  if (isGameOver.value) {
    resetGame()
  }
  if (!isPlaying.value) {
    isPlaying.value = true
    isGameOver.value = false
    runLoop()
  }
}

const pauseGame = () => {
  isPlaying.value = false
  if (gameLoop.value) {
    clearTimeout(gameLoop.value)
    gameLoop.value = null
  }
}

const resetGame = () => {
  snake.value = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]
  direction.value = 'UP'
  nextDirection.value = 'UP'
  score.value = 0
  isGameOver.value = false
  spawnFood()
}

const gameOver = () => {
  isGameOver.value = true
  pauseGame()
}

const runLoop = () => {
  if (!isPlaying.value) return
  move()
  const speed = Math.max(MIN_SPEED, INITIAL_SPEED - Math.floor(score.value / 50) * 10)
  gameLoop.value = window.setTimeout(runLoop, speed)
}

const handleKeydown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowUp': case 'w': if (direction.value !== 'DOWN') nextDirection.value = 'UP'; break
    case 'ArrowDown': case 's': if (direction.value !== 'UP') nextDirection.value = 'DOWN'; break
    case 'ArrowLeft': case 'a': if (direction.value !== 'RIGHT') nextDirection.value = 'LEFT'; break
    case 'ArrowRight': case 'd': if (direction.value !== 'LEFT') nextDirection.value = 'RIGHT'; break
    case ' ': startGame(); break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('snake-highscore')
    if (saved) highScore.value = parseInt(saved)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  pauseGame()
  localStorage.setItem('snake-highscore', highScore.value.toString())
})
</script>

<template>
  <div class="snake-game-container">
    <div class="game-header">
      <div class="stat-card">
        <span class="label">SCORE</span>
        <span class="value">{{ score }}</span>
      </div>
      <div class="stat-card">
        <span class="label">BEST</span>
        <span class="value">{{ highScore }}</span>
      </div>
    </div>

    <div class="game-board-wrapper" :style="containerStyle">
      <!-- Grid Background -->
      <div class="grid-bg"></div>

      <!-- Snake -->
      <div v-for="(segment, index) in snake" :key="index" class="snake-segment" :class="{ 'snake-head': index === 0 }"
        :style="{
          left: `${segment.x * cellSize}px`,
          top: `${segment.y * cellSize}px`,
          width: `${cellSize}px`,
          height: `${cellSize}px`
        }">
        <div class="segment-inner"></div>
      </div>

      <!-- Food -->
      <div class="food" :style="{
        left: `${food.x * cellSize}px`,
        top: `${food.y * cellSize}px`,
        width: `${cellSize}px`,
        height: `${cellSize}px`
      }">
        <div class="food-inner"></div>
      </div>

      <!-- Overlays -->
      <div v-if="!isPlaying || isGameOver" class="overlay">
        <div v-if="isGameOver" class="game-over-text">GAME OVER</div>
        <button @click="startGame" class="play-btn">
          {{ isGameOver ? 'RESTART' : 'PLAY' }}
        </button>
        <p v-if="!isGameOver" class="hint">Press SPACE to Start</p>
      </div>
    </div>

    <div class="game-controls">
      <div class="control-row">
        <button class="ctrl-btn" @mousedown="nextDirection = 'UP'">▲</button>
      </div>
      <div class="control-row">
        <button class="ctrl-btn" @mousedown="nextDirection = 'LEFT'">◀</button>
        <button class="ctrl-btn" @mousedown="nextDirection = 'DOWN'">▼</button>
        <button class="ctrl-btn" @mousedown="nextDirection = 'RIGHT'">▶</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.snake-game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.game-header {
  display: flex;
  gap: 3rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-card .label {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--color-text-secondary);
}

.stat-card .value {
  font-size: 2rem;
  font-weight: 900;
  color: var(--color-text);
  font-family: 'Inter', system-ui, sans-serif;
}

.game-board-wrapper {
  position: relative;
  background: #0f172a;
  border-radius: 1rem;
  overflow: hidden;
  border: 4px solid #1e293b;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
}

.grid-bg {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, #334155 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.3;
}

.snake-segment {
  position: absolute;
  padding: 2px;
  transition: all 0.1s linear;
  z-index: 10;
}

.segment-inner {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
}

.snake-head .segment-inner {
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  border-radius: 6px;
  box-shadow: 0 0 15px rgba(14, 165, 233, 0.6);
}

.food {
  position: absolute;
  padding: 4px;
  z-index: 5;
}

.food-inner {
  width: 100%;
  height: 100%;
  background: #f43f5e;
  border-radius: 50%;
  box-shadow: 0 0 15px #f43f5e;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(0.8);
    opacity: 0.8;
  }

  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.game-over-text {
  font-size: 3rem;
  font-weight: 900;
  color: #f43f5e;
  margin-bottom: 2rem;
  text-shadow: 0 0 20px rgba(244, 63, 94, 0.5);
}

.play-btn {
  padding: 1rem 3rem;
  font-size: 1.25rem;
  font-weight: 800;
  background: white;
  color: #0f172a;
  border-radius: 1rem;
  transition: all 0.2s;
}

.play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.4);
}

.hint {
  margin-top: 1.5rem;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.game-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-row {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.ctrl-btn {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  font-size: 1.5rem;
  color: white;
  transition: all 0.2s;
}

.ctrl-btn:active {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(2px);
}

@media (min-width: 1024px) {
  .game-controls {
    display: none;
  }
}
</style>
