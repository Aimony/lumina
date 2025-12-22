<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

// --- Constants & Types ---
const COLS = 10
const ROWS = 20
const INITIAL_SPEED = 800
const MIN_SPEED = 100
const SPEED_DECREMENT = 50

type Color = string
type Matrix = (Color | null)[][]
type PieceType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z'

interface Piece {
  type: PieceType
  matrix: number[][]
  x: number
  y: number
  color: string
}

const SHAPES: Record<PieceType, { matrix: number[][]; color: string }> = {
  I: { matrix: [[1, 1, 1, 1]], color: '#22d3ee' }, // Cyan
  J: {
    matrix: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    color: '#3b82f6'
  }, // Blue
  L: {
    matrix: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    color: '#f97316'
  }, // Orange
  O: {
    matrix: [
      [1, 1],
      [1, 1]
    ],
    color: '#eab308'
  }, // Yellow
  S: {
    matrix: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: '#22c55e'
  }, // Green
  T: {
    matrix: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    color: '#a855f7'
  }, // Purple
  Z: {
    matrix: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: '#ef4444'
  } // Red
}

// --- State ---
const board = ref<Matrix>(Array.from({ length: ROWS }, () => Array(COLS).fill(null)))
const currentPiece = ref<Piece | null>(null)
const nextPieceType = ref<PieceType | null>(null)
const score = ref(0)
const highScore = ref(0)
const level = ref(1)
const isPlaying = ref(false)
const isGameOver = ref(false)
const isPaused = ref(false)
let gameLoopId: number | null = null

// --- Computed ---
// We create a "render board" that combines the static board + the current falling piece
const renderBoard = computed(() => {
  // Deep copy the board to avoid mutation during render calculation
  const render = board.value.map((row) => [...row])

  if (currentPiece.value) {
    const { x, y, matrix, color } = currentPiece.value
    matrix.forEach((row, rIdx) => {
      row.forEach((val, cIdx) => {
        if (val) {
          const boardY = y + rIdx
          const boardX = x + cIdx
          if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS && render[boardY]) {
            render[boardY][boardX] = color
          }
        }
      })
    })
  }
  return render
})

const nextPieceShape = computed(() => {
  if (!nextPieceType.value) return null
  return SHAPES[nextPieceType.value]
})

// --- Logic ---

const createPiece = (type: PieceType): Piece => {
  const shape = SHAPES[type]
  return {
    type,
    matrix: shape.matrix,
    x: Math.floor(COLS / 2) - Math.floor((shape.matrix[0]?.length || 0) / 2),
    y: 0,
    color: shape.color
  }
}

const getRandomType = (): PieceType => {
  const types = Object.keys(SHAPES) as PieceType[]
  return types[Math.floor(Math.random() * types.length)] as PieceType
}

const spawnPiece = () => {
  if (!nextPieceType.value) nextPieceType.value = getRandomType()

  const type = nextPieceType.value
  currentPiece.value = createPiece(type)
  nextPieceType.value = getRandomType()

  // Check collision immediately (Game Over condition)
  if (collision(currentPiece.value.x, currentPiece.value.y, currentPiece.value.matrix)) {
    gameOver()
  }
}

const collision = (offsetX: number, offsetY: number, matrix: number[][]) => {
  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r]
    if (!row) continue
    for (let c = 0; c < row.length; c++) {
      if (row[c]) {
        const newX = offsetX + c
        const newY = offsetY + r

        // Wall collision
        if (newX < 0 || newX >= COLS || newY >= ROWS) return true

        // Floor/Block collision
        // Note: newY < 0 is "above board", usually allowed for rotation spawning,
        // but we check if it hits existing blocks if it's within board
        if (newY >= 0 && board.value[newY] && board.value[newY][newX]) return true
      }
    }
  }
  return false
}

const rotateMatrix = (matrix: number[][]) => {
  const N = matrix.length
  const M = matrix[0]?.length || 0
  const rotated = Array.from({ length: M }, () => Array(N).fill(0))
  for (let r = 0; r < N; r++) {
    const row = matrix[r]
    if (!row) continue
    for (let c = 0; c < M; c++) {
      rotated[c]![N - 1 - r] = row[c] || 0
    }
  }
  return rotated
}

const rotate = () => {
  if (!currentPiece.value || isPaused.value || !isPlaying.value) return

  const rotatedMatrix = rotateMatrix(currentPiece.value.matrix)
  // Wall-kick (basic): try normal, then try shifting left/right/up
  // Simplification: just check if it fits, if not, don't rotate
  if (!collision(currentPiece.value.x, currentPiece.value.y, rotatedMatrix)) {
    currentPiece.value.matrix = rotatedMatrix
    return
  }

  // Basic wall kick: try moving left or right by 1 or 2
  const kicks = [-1, 1, -2, 2]
  for (const k of kicks) {
    if (!collision(currentPiece.value.x + k, currentPiece.value.y, rotatedMatrix)) {
      currentPiece.value.x += k
      currentPiece.value.matrix = rotatedMatrix
      return
    }
  }
}

const move = (dir: -1 | 1) => {
  if (!currentPiece.value || isPaused.value || !isPlaying.value) return
  if (!collision(currentPiece.value.x + dir, currentPiece.value.y, currentPiece.value.matrix)) {
    currentPiece.value.x += dir
  }
}

const drop = () => {
  if (!currentPiece.value || isPaused.value || !isPlaying.value) return

  if (!collision(currentPiece.value.x, currentPiece.value.y + 1, currentPiece.value.matrix)) {
    currentPiece.value.y++
  } else {
    // Lock piece
    lockPiece()
  }
}

const quickDrop = () => {
  if (!currentPiece.value || isPaused.value || !isPlaying.value) return
  while (!collision(currentPiece.value.x, currentPiece.value.y + 1, currentPiece.value.matrix)) {
    currentPiece.value.y++
  }
  lockPiece()
}

const lockPiece = () => {
  if (!currentPiece.value) return

  const { x, y, matrix, color } = currentPiece.value
  matrix.forEach((row, rIdx) => {
    row.forEach((val, cIdx) => {
      if (val) {
        if (y + rIdx >= 0 && board.value[y + rIdx]) {
          board.value[y + rIdx]![x + cIdx] = color
        }
      }
    })
  })

  currentPiece.value = null
  checkLines()
  spawnPiece()
}

const checkLines = () => {
  let linesCleared = 0

  // Filter out full rows
  const newBoard = board.value.filter((row) => row.some((cell) => cell === null))
  linesCleared = ROWS - newBoard.length

  // Add new empty rows at top
  const emptyRows = Array.from({ length: linesCleared }, () => Array(COLS).fill(null))
  board.value = [...emptyRows, ...newBoard]

  if (linesCleared > 0) {
    // Scoring: 100, 300, 500, 800
    const points = [0, 100, 300, 500, 800]
    const baseScore = points[linesCleared] ?? 0
    score.value += baseScore * level.value
    level.value = Math.floor(score.value / 1000) + 1

    // Update High Score
    if (score.value > highScore.value) {
      highScore.value = score.value
      localStorage.setItem('tetris-highscore', highScore.value.toString())
    }
  }
}

const gameTick = () => {
  drop()
  // speed based on level
  const speed = Math.max(MIN_SPEED, INITIAL_SPEED - (level.value - 1) * SPEED_DECREMENT)
  gameLoopId = window.setTimeout(gameTick, speed)
}

// --- Control ---
const handleKeydown = (e: KeyboardEvent) => {
  if (isGameOver.value && e.key === ' ') {
    startGame()
    return
  }
  if (!isPlaying.value && e.key === ' ') {
    startGame()
    return
  }

  if (!isPlaying.value || isPaused.value) return

  switch (e.key) {
    case 'ArrowLeft':
    case 'a':
      move(-1)
      break
    case 'ArrowRight':
    case 'd':
      move(1)
      break
    case 'ArrowDown':
    case 's':
      drop()
      break
    case 'ArrowUp':
    case 'w':
      rotate()
      break
    case ' ':
      quickDrop()
      break
    case 'p':
      togglePause()
      break
  }
}

const startGame = () => {
  isGameOver.value = false
  isPlaying.value = true
  isPaused.value = false
  score.value = 0
  level.value = 1
  board.value = Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  nextPieceType.value = null
  spawnPiece()

  if (gameLoopId) clearTimeout(gameLoopId)
  gameTick()
}

const togglePause = () => {
  if (isGameOver.value) return
  isPaused.value = !isPaused.value
  if (!isPaused.value) {
    gameTick()
  } else if (gameLoopId) {
    clearTimeout(gameLoopId)
  }
}

const gameOver = () => {
  isGameOver.value = true
  isPlaying.value = false
  if (gameLoopId) clearTimeout(gameLoopId)
}

// --- Lifecycle ---
onMounted(() => {
  const saved = localStorage.getItem('tetris-highscore')
  if (saved) highScore.value = parseInt(saved)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (gameLoopId) clearTimeout(gameLoopId)
})
</script>

<template>
  <div class="tetris-game-container">
    <div class="game-layout">
      <!-- Left Stats -->
      <div class="side-panel left">
        <div class="stat-card">
          <span class="label">SCORE</span>
          <span class="value">{{ score }}</span>
        </div>
        <div class="stat-card">
          <span class="label">LEVEL</span>
          <span class="value">{{ level }}</span>
        </div>
        <div class="stat-card">
          <span class="label">BEST</span>
          <span class="value">{{ highScore }}</span>
        </div>
      </div>

      <!-- Game Board -->
      <div class="game-board-wrapper">
        <div class="grid-bg"></div>

        <div class="game-grid">
          <div v-for="(row, r) in renderBoard" :key="r" class="row">
            <div v-for="(cell, c) in row" :key="c" class="cell" :class="{ filled: cell !== null }">
              <div
                v-if="cell"
                class="block-inner"
                :style="{ '--block-color': cell, boxShadow: `0 0 10px ${cell}` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Overlays -->
        <div v-if="!isPlaying || isGameOver || isPaused" class="overlay">
          <div v-if="isGameOver" class="game-over-text">GAME OVER</div>
          <div v-else-if="isPaused" class="paused-text">PAUSED</div>

          <button @click="startGame" class="play-btn">
            {{ isGameOver ? 'RESTART' : isPaused ? 'RESUME' : 'PLAY' }}
          </button>
          <p v-if="!isGameOver && !isPaused" class="hint">Press SPACE to Start</p>
        </div>
      </div>

      <!-- Right Panel: Next Piece -->
      <div class="side-panel right">
        <div class="next-piece-box">
          <span class="label">NEXT</span>
          <div class="next-grid" v-if="nextPieceShape">
            <div v-for="(row, r) in nextPieceShape.matrix" :key="r" class="row">
              <div v-for="(val, c) in row" :key="c" class="cell small">
                <div
                  v-if="val"
                  class="block-inner"
                  :style="{ '--block-color': nextPieceShape.color }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Controls Help (Desktop) -->
        <div class="desktop-controls-help">
          <div class="key-row"><kbd>←</kbd><kbd>→</kbd> Move</div>
          <div class="key-row"><kbd>↑</kbd> Rotate</div>
          <div class="key-row"><kbd>↓</kbd> Soft Drop</div>
          <div class="key-row"><kbd>Space</kbd> Hard Drop</div>
          <div class="key-row"><kbd>P</kbd> Pause</div>
        </div>
      </div>
    </div>

    <!-- Mobile Controls -->
    <div class="mobile-controls">
      <div class="d-pad">
        <button class="ctrl-btn up" @click="rotate">↻</button>
        <button class="ctrl-btn left" @click="move(-1)">←</button>
        <button class="ctrl-btn right" @click="move(1)">→</button>
        <button class="ctrl-btn down" @mousedown="drop" @touchstart.passive="drop">↓</button>
      </div>
      <button class="ctrl-btn drop-btn" @click="quickDrop">DROP</button>
    </div>
  </div>
</template>

<style scoped>
.tetris-game-container {
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
  user-select: none;
}

.game-layout {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 100px;
}

.game-board-wrapper {
  position: relative;
  background: #0f172a;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 4px solid #1e293b;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
  width: 300px;
  height: 600px;
}

.game-grid {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.row {
  display: flex;
  flex: 1;
}

.cell {
  flex: 1;
  border: 1px solid rgba(255, 255, 255, 0.03);
  position: relative;
}

.grid-bg {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, #334155 1px, transparent 1px);
  background-size: 30px 30px;
  /* Match effective cell size: 300/10 = 30 */
  opacity: 0.2;
  pointer-events: none;
}

.block-inner {
  width: 100%;
  height: 100%;
  background: var(--block-color);
  border-radius: 2px;
  border-top: 2px solid rgba(255, 255, 255, 0.4);
  border-left: 2px solid rgba(255, 255, 255, 0.2);
  border-right: 2px solid rgba(0, 0, 0, 0.2);
  border-bottom: 2px solid rgba(0, 0, 0, 0.4);
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-card .label {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.stat-card .value {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--color-text);
  font-family: 'Inter', monospace;
}

.next-piece-box {
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100px;
  min-width: 100px;
}

.next-grid {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
}

.cell.small {
  width: 20px;
  height: 20px;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.game-over-text {
  font-size: 2.5rem;
  font-weight: 900;
  color: #f43f5e;
  margin-bottom: 2rem;
  text-shadow: 0 0 20px rgba(244, 63, 94, 0.5);
  text-align: center;
}

.paused-text {
  font-size: 2.5rem;
  font-weight: 900;
  color: #38bdf8;
  margin-bottom: 2rem;
}

.play-btn {
  padding: 1rem 2.5rem;
  font-size: 1.25rem;
  font-weight: 800;
  background: white;
  color: #0f172a;
  border-radius: 1rem;
  transition: all 0.2s;
  cursor: pointer;
}

.play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.4);
}

.hint {
  margin-top: 1.5rem;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

.desktop-controls-help {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.key-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

kbd {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
  font-weight: bold;
  color: white;
}

/* Mobile Controls */
.mobile-controls {
  display: none;
  width: 100%;
  gap: 1rem;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .game-layout {
    flex-direction: column;
    align-items: center;
  }

  .side-panel {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
  }

  .desktop-controls-help {
    display: none;
  }

  .mobile-controls {
    display: flex;
  }

  .d-pad {
    display: grid;
    grid-template-areas:
      '. up .'
      'left down right';
    gap: 0.5rem;
  }

  .ctrl-btn {
    width: 50px;
    height: 50px;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: white;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ctrl-btn:active {
    background: rgba(255, 255, 255, 0.3);
  }

  .ctrl-btn.up {
    grid-area: up;
  }

  .ctrl-btn.left {
    grid-area: left;
  }

  .ctrl-btn.right {
    grid-area: right;
  }

  .ctrl-btn.down {
    grid-area: down;
  }

  .drop-btn {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(244, 63, 94, 0.2);
    border: 1px solid rgba(244, 63, 94, 0.4);
    font-weight: bold;
    font-size: 0.9rem;
  }

  .drop-btn:active {
    background: rgba(244, 63, 94, 0.4);
  }
}
</style>
