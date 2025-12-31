<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps<{
  initialVolume?: number
}>()

// Playlist based on public/music files
const playlist = [
  { name: '暗潮', file: 'ac.mp3', artist: 'Unknown' },
  { name: '暗鸥', file: 'ao.mp3', artist: 'Unknown' },
  { name: '爱情下下签', file: 'aqxx.mp3', artist: 'Unknown' },
  { name: '多远都要在一起', file: 'dydyzyq.mp3', artist: 'Unknown' },
  { name: '黄昏', file: 'hh.mp3', artist: 'Unknown' },
  { name: '江南', file: 'jn.mp3', artist: 'Unknown' },
  { name: '唯一', file: 'wy.mp3', artist: 'Unknown' }
]

const audio = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const currentTrackIndex = ref(0)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(props.initialVolume ?? 0.7)
const isMuted = ref(false)
const showPlaylist = ref(false)

// 进度条拖动状态
const isDragging = ref(false)
const progressBarRef = ref<HTMLElement | null>(null)

const currentTrack = computed(() => playlist[currentTrackIndex.value])

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const progressParams = computed(() => {
  const percent = duration.value ? (currentTime.value / duration.value) * 100 : 0
  return { width: `${percent}%` }
})

const loadTrack = (index: number) => {
  if (index < 0 || index >= playlist.length) return
  const track = playlist[index]
  if (!track) return
  currentTrackIndex.value = index
  if (audio.value) {
    audio.value.src = `/music/${track.file}`
    audio.value.load()
    if (isPlaying.value) {
      audio.value.play()
    }
  }
}

const togglePlay = () => {
  if (!audio.value) return
  if (isPlaying.value) {
    audio.value.pause()
  } else {
    audio.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const playTrack = (index: number) => {
  if (index === currentTrackIndex.value) {
    togglePlay()
  } else {
    loadTrack(index)
    isPlaying.value = true
    audio.value?.play()
  }
}

const nextTrack = () => {
  let nextIndex = currentTrackIndex.value + 1
  if (nextIndex >= playlist.length) nextIndex = 0
  playTrack(nextIndex)
}

const prevTrack = () => {
  let prevIndex = currentTrackIndex.value - 1
  if (prevIndex < 0) prevIndex = playlist.length - 1
  playTrack(prevIndex)
}

// 进度条：计算并更新时间
const updateTimeFromPosition = (clientX: number) => {
  if (!progressBarRef.value || !audio.value || !duration.value) return
  const rect = progressBarRef.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
  const percent = x / rect.width
  const newTime = percent * duration.value
  currentTime.value = newTime
  return newTime
}

// 进度条：点击
const handleProgressClick = (event: MouseEvent) => {
  const newTime = updateTimeFromPosition(event.clientX)
  if (audio.value && newTime !== undefined) {
    audio.value.currentTime = newTime
  }
}

// 进度条：开始拖动
const handleProgressMouseDown = (event: MouseEvent) => {
  isDragging.value = true
  updateTimeFromPosition(event.clientX)
  document.addEventListener('mousemove', handleProgressMouseMove)
  document.addEventListener('mouseup', handleProgressMouseUp)
}

// 进度条：拖动中
const handleProgressMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return
  updateTimeFromPosition(event.clientX)
}

// 进度条：结束拖动
const handleProgressMouseUp = (event: MouseEvent) => {
  if (!isDragging.value) return
  isDragging.value = false
  const newTime = updateTimeFromPosition(event.clientX)
  if (audio.value && newTime !== undefined) {
    audio.value.currentTime = newTime
  }
  document.removeEventListener('mousemove', handleProgressMouseMove)
  document.removeEventListener('mouseup', handleProgressMouseUp)
}

const setVolume = (event: Event) => {
  const target = event.target as HTMLInputElement
  const val = parseFloat(target.value)
  volume.value = val
  if (audio.value) audio.value.volume = val
  isMuted.value = val === 0
}

const adjustVolume = (event: WheelEvent) => {
  const step = 0.05
  let newVolume = volume.value
  if (event.deltaY < 0) {
    newVolume = Math.min(1, newVolume + step)
  } else {
    newVolume = Math.max(0, newVolume - step)
  }
  volume.value = newVolume
  if (audio.value) audio.value.volume = newVolume
  isMuted.value = newVolume === 0
}

const toggleMute = () => {
  if (!audio.value) return
  if (isMuted.value) {
    audio.value.muted = false
    audio.value.volume = volume.value || 0.5
    isMuted.value = false
  } else {
    audio.value.muted = true
    isMuted.value = true
  }
}

// 点击遮罩层关闭播放列表
const closePlaylist = () => {
  showPlaylist.value = false
}

onMounted(() => {
  audio.value = new Audio()
  audio.value.volume = volume.value
  const firstTrack = playlist[0]
  if (firstTrack) {
    audio.value.src = `/music/${firstTrack.file}`
  }

  audio.value.addEventListener('timeupdate', () => {
    // 拖动时不更新，避免冲突
    if (audio.value && !isDragging.value) {
      currentTime.value = audio.value.currentTime
    }
  })

  audio.value.addEventListener('loadedmetadata', () => {
    if (audio.value) duration.value = audio.value.duration
  })

  audio.value.addEventListener('ended', () => {
    nextTrack()
  })
})

onUnmounted(() => {
  // 清理拖动事件
  document.removeEventListener('mousemove', handleProgressMouseMove)
  document.removeEventListener('mouseup', handleProgressMouseUp)

  if (audio.value) {
    audio.value.pause()
    audio.value.src = ''
    audio.value = null
  }
})
</script>

<template>
  <div class="music-player-page">
    <div class="music-player-content">
      <h1 class="music-player-title">Music Player</h1>
      <div class="music-player">
        <div class="player-main">
          <!-- 遮罩层：点击关闭播放列表，只覆盖主区域 -->
          <transition name="fade">
            <div v-if="showPlaylist" class="playlist-overlay" @click="closePlaylist"></div>
          </transition>
          <div class="track-info">
            <h3>{{ currentTrack?.name ?? '未选择' }}</h3>
            <p>{{ currentTrack?.artist ?? '-' }}</p>
          </div>

          <div class="controls-container">
            <div
              ref="progressBarRef"
              class="progress-bar-wrapper"
              :class="{ dragging: isDragging }"
              @click="handleProgressClick"
              @mousedown="handleProgressMouseDown"
            >
              <div class="progress-bg">
                <div class="progress-fill" :style="progressParams"></div>
                <div class="progress-handle" :style="{ left: progressParams.width }"></div>
              </div>
              <div class="time-info">
                <span>{{ formatTime(currentTime) }}</span>
                <span>{{ formatTime(duration) }}</span>
              </div>
            </div>

            <div class="controls-row">
              <div class="controls-left">
                <div class="volume-control" @wheel.prevent="adjustVolume">
                  <button @click="toggleMute" class="mute-btn">
                    <svg
                      v-if="isMuted || volume === 0"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="20"
                      height="20"
                    >
                      <path
                        d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"
                      />
                    </svg>
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="20"
                      height="20"
                    >
                      <path
                        d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                      />
                    </svg>
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    :value="isMuted ? 0 : volume"
                    @input="setVolume"
                    class="volume-slider"
                  />
                  <span class="volume-text">{{ Math.round(volume * 100) }}%</span>
                </div>
              </div>

              <div class="controls-center">
                <div class="buttons">
                  <button @click="prevTrack" class="control-btn secondary" title="Previous">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="24"
                      height="24"
                    >
                      <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
                    </svg>
                  </button>
                  <button
                    @click="togglePlay"
                    class="control-btn primary"
                    :title="isPlaying ? 'Pause' : 'Play'"
                  >
                    <svg
                      v-if="isPlaying"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="32"
                      height="32"
                    >
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="32"
                      height="32"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  <button @click="nextTrack" class="control-btn secondary" title="Next">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="24"
                      height="24"
                    >
                      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="controls-right">
                <button
                  class="playlist-toggle-btn"
                  @click="showPlaylist = !showPlaylist"
                  :class="{ active: showPlaylist }"
                  title="Playlist"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="24"
                    height="24"
                  >
                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <transition name="slide-fade">
            <div class="playlist" v-show="showPlaylist" @click.stop>
              <div class="playlist-header">
                <h4>播放列表</h4>
                <button class="close-btn" @click="closePlaylist">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="20"
                    height="20"
                  >
                    <path
                      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    />
                  </svg>
                </button>
              </div>
              <div class="playlist-scroll-area">
                <div
                  v-for="(track, index) in playlist"
                  :key="track.name"
                  class="playlist-item"
                  :class="{
                    active: currentTrackIndex === index,
                    playing: currentTrackIndex === index && isPlaying
                  }"
                  @click="playTrack(index)"
                >
                  <span class="track-number">{{ index + 1 }}</span>
                  <div class="track-meta">
                    <span class="track-name">{{ track.name }}</span>
                    <span class="track-artist">{{ track.artist }}</span>
                  </div>
                  <div class="playing-indicator" v-if="currentTrackIndex === index && isPlaying">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// 页面容器样式（整合自 music-demo）
.music-player-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #1a1a2e, #16213e, #0f3460);
  color: #fff;

  // 主题变量
  --color-primary: #00d4ff;
  --color-primary-rgb: 0, 212, 255;
  --color-primary-dark: #00a2cc;
  --color-text: #ffffff;
  --color-text-rgb: 255, 255, 255;
  --color-heading: #ffffff;
  --color-bg: #1a1a2e;
}

.music-player-content {
  width: 100%;
  max-width: 900px;
  padding: 2rem;
}

.music-player-title {
  text-align: center;
  margin-bottom: 2rem;
  font-family: sans-serif;
  opacity: 0.8;
  font-size: 1.5rem;
  font-weight: 600;
}

.music-player {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  color: var(--color-text);
  position: relative;
  height: 480px;

  @media (max-width: 768px) {
    height: auto;
    min-height: 500px;
  }
}

// 遮罩层：点击时关闭播放列表，只覆盖主区域
.playlist-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 2;
  cursor: pointer;
  border-radius: inherit;
}

// 遮罩层淡入淡出动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.player-main {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%);
  position: relative;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle at center,
      rgba(var(--color-primary-rgb), 0.1) 0%,
      transparent 50%
    );
    pointer-events: none;
  }
}

.track-info {
  text-align: center;
  margin-bottom: 2rem;
  z-index: 1;

  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    color: var(--color-heading);
    letter-spacing: -0.5px;
  }

  p {
    font-size: 0.9rem;
    opacity: 0.7;
    margin: 0;
  }
}

.controls-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 1;
}

.progress-bar-wrapper {
  cursor: pointer;
  padding: 10px 0;
  user-select: none;

  .progress-bg {
    height: 4px;
    background: rgba(var(--color-text-rgb), 0.1);
    border-radius: 2px;
    position: relative;
    overflow: visible;
  }

  .progress-fill {
    height: 100%;
    background: var(--color-primary);
    border-radius: 2px;
    position: absolute;
    top: 0;
    left: 0;
    transition: width 0.1s linear;
  }

  .progress-handle {
    width: 12px;
    height: 12px;
    background: #fff;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    margin-top: -6px;
    margin-left: -6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transform: scale(0);
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    pointer-events: none;
  }

  &:hover .progress-handle {
    transform: scale(1);
  }

  // 拖动状态：禁用过渡动画，确保即时响应
  &.dragging {
    .progress-fill {
      transition: none;
    }

    .progress-handle {
      transform: scale(1.2);
      transition: none;
    }
  }

  .time-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    margin-top: 0.5rem;
    opacity: 0.6;
    font-feature-settings: 'tnum';
  }
}

.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 0.5rem;
}

.controls-left,
.controls-right {
  flex: 1;
  display: flex;
  align-items: center;
}

.controls-left {
  justify-content: flex-start;
}

.controls-right {
  justify-content: flex-end;
}

.controls-center {
  flex: 2;
  display: flex;
  justify-content: center;
}

.buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.control-btn {
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.2s ease,
    color 0.2s ease;

  &:hover {
    color: var(--color-primary);
    transform: scale(1.1);
  }

  &.primary {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--color-primary);
    color: #fff;
    box-shadow: 0 8px 16px rgba(var(--color-primary-rgb), 0.3);

    &:hover {
      transform: scale(1.05);
      background: var(--color-primary-dark);
      color: #fff;
    }
  }

  &.secondary {
    opacity: 0.7;

    &:hover {
      opacity: 1;
    }
  }
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.7;
  transition: opacity 0.2s;
  width: 100%;
  max-width: 200px;

  &:hover {
    opacity: 1;
  }

  .mute-btn {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 2px;
    display: flex;
    flex-shrink: 0;
  }

  .volume-slider {
    flex: 1;
    height: 4px;
    appearance: none;
    background: rgba(var(--color-text-rgb), 0.2);
    border-radius: 2px;
    outline: none;
    min-width: 60px;
    cursor: pointer;

    &::-webkit-slider-thumb {
      appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--color-text);
      cursor: pointer;
      border: 2px solid var(--color-bg);
      transition: transform 0.1s;
    }

    &:hover::-webkit-slider-thumb {
      transform: scale(1.2);
    }
  }

  .volume-text {
    font-size: 0.75rem;
    width: 2.5rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
    opacity: 0.8;
  }
}

.playlist-toggle-btn {
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s;
  padding: 8px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover,
  &.active {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }
}

.playlist {
  width: 320px;
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 10;
  background: rgba(22, 33, 62, 0.95);
  /* Use a darker solid BG for better readability or keep glassmorphism with strong blur */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 100%;
  }
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-heading);
  }

  .close-btn {
    background: none;
    border: none;
    color: var(--color-text);
    cursor: pointer;
    opacity: 0.6;
    padding: 4px;
    border-radius: 50%;
    transition: all 0.2s;

    &:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.playlist-scroll-area {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.playlist-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    padding-left: 1.75rem;
  }

  &.active {
    background: rgba(var(--color-primary-rgb), 0.08);

    .track-number,
    .track-name {
      color: var(--color-primary);
      font-weight: 600;
    }
  }

  .track-number {
    width: 2rem;
    font-size: 0.8rem;
    opacity: 0.5;
    font-feature-settings: 'tnum';
  }

  .track-meta {
    flex: 1;
    display: flex;
    flex-direction: column;

    .track-name {
      font-size: 0.95rem;
    }

    .track-artist {
      font-size: 0.75rem;
      opacity: 0.6;
      margin-top: 2px;
    }
  }
}

.playing-indicator {
  display: flex;
  align-items: flex-end;
  height: 12px;
  gap: 2px;

  span {
    width: 3px;
    background: var(--color-primary);
    animation: bounce 1s infinite ease-in-out;
    border-radius: 1px;

    &:nth-child(1) {
      height: 40%;
      animation-delay: 0s;
    }

    &:nth-child(2) {
      height: 100%;
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      height: 60%;
      animation-delay: 0.4s;
    }
  }
}

@keyframes bounce {
  0%,
  100% {
    height: 20%;
    opacity: 0.5;
  }

  50% {
    height: 100%;
    opacity: 1;
  }
}
</style>
