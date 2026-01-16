<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMusicPlayer } from '@/composables/useMusicPlayer'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const {
  isPlaying,
  currentTrackIndex,
  currentTime,
  duration,
  volume,
  isMuted,
  isDragging,
  currentTrack,
  progressPercent,
  playlist,
  formatTime,
  togglePlay,
  playTrack,
  nextTrack,
  prevTrack,
  seekByPercent,
  setVolume,
  toggleMute,
  setDragging
} = useMusicPlayer()

const showPlaylist = ref(false)
const progressBarRef = ref<HTMLElement | null>(null)

// 计算进度条样式
const progressParams = computed(() => ({
  width: `${progressPercent.value}%`
}))

// 关闭弹窗
const closeModal = () => {
  emit('update:modelValue', false)
}

// 进度条：计算并更新时间
const updateTimeFromPosition = (clientX: number) => {
  if (!progressBarRef.value || !duration.value) return null
  const rect = progressBarRef.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
  const percent = (x / rect.width) * 100
  return percent
}

// 进度条：点击
const handleProgressClick = (event: MouseEvent) => {
  const percent = updateTimeFromPosition(event.clientX)
  if (percent !== null) {
    seekByPercent(percent)
  }
}

// 进度条：开始拖动
const handleProgressMouseDown = (event: MouseEvent) => {
  setDragging(true)
  updateTimeFromPosition(event.clientX)
  document.addEventListener('mousemove', handleProgressMouseMove)
  document.addEventListener('mouseup', handleProgressMouseUp)
}

// 进度条：拖动中
const handleProgressMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return
  const percent = updateTimeFromPosition(event.clientX)
  if (percent !== null) {
    // 实时更新显示但不跳转
  }
}

// 进度条：结束拖动
const handleProgressMouseUp = (event: MouseEvent) => {
  if (!isDragging.value) return
  setDragging(false)
  const percent = updateTimeFromPosition(event.clientX)
  if (percent !== null) {
    seekByPercent(percent)
  }
  document.removeEventListener('mousemove', handleProgressMouseMove)
  document.removeEventListener('mouseup', handleProgressMouseUp)
}

// 音量控制
const handleVolumeChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  setVolume(parseFloat(target.value))
}

// 音量滚轮调节
const adjustVolume = (event: WheelEvent) => {
  const step = 0.05
  let newVolume = volume.value
  if (event.deltaY < 0) {
    newVolume = Math.min(1, newVolume + step)
  } else {
    newVolume = Math.max(0, newVolume - step)
  }
  setVolume(newVolume)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="music-player-modal-overlay" @click.self="closeModal">
        <div class="music-player-card">
          <div class="player-content">
            <!-- 顶部控制栏 -->
            <div class="top-bar">
              <h3 class="app-title">Lumina Music</h3>
              <button
                class="icon-btn playlist-toggle"
                @click="showPlaylist = !showPlaylist"
                :class="{ active: showPlaylist }"
                title="播放列表"
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

            <!-- 唱片封面区域 -->
            <div class="album-section">
              <div class="vinyl-record" :class="{ spinning: isPlaying }">
                <div class="disk-cover">
                  <img src="/img/avatar.png" alt="Album Art" />
                </div>
                <div class="disk-center"></div>
                <div class="disk-sheen"></div>
              </div>
            </div>

            <!-- 歌曲信息 -->
            <div class="track-info">
              <h2 class="track-name">{{ currentTrack?.name ?? '未选择曲目' }}</h2>
              <p class="artist-name">{{ currentTrack?.artist ?? 'Unknown Artist' }}</p>
            </div>

            <!-- 进度条 -->
            <div class="progress-section">
              <span class="time current">{{ formatTime(currentTime) }}</span>
              <div
                ref="progressBarRef"
                class="progress-bar-wrapper"
                :class="{ dragging: isDragging }"
                @click="handleProgressClick"
                @mousedown="handleProgressMouseDown"
              >
                <div class="progress-track">
                  <div class="progress-fill" :style="progressParams"></div>
                  <div class="progress-thumb" :style="{ left: progressParams.width }"></div>
                </div>
              </div>
              <span class="time total">{{ formatTime(duration) }}</span>
            </div>

            <!-- 播放控制按钮 -->
            <div class="controls-row">
              <button @click="prevTrack" class="control-btn secondary" title="上一曲">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="28"
                  height="28"
                >
                  <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
                </svg>
              </button>
              <button
                @click="togglePlay"
                class="control-btn primary"
                :title="isPlaying ? '暂停' : '播放'"
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
              <button @click="nextTrack" class="control-btn secondary" title="下一曲">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="28"
                  height="28"
                >
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>

            <!-- 底部辅助控制: 音量 -->
            <div class="bottom-controls">
              <div class="volume-control" @wheel.prevent="adjustVolume">
                <button @click="toggleMute" class="icon-btn mute-btn">
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
                  @input="handleVolumeChange"
                  class="volume-slider"
                  :style="{ backgroundSize: (isMuted ? 0 : volume) * 100 + '% 100%' }"
                />
              </div>
            </div>

            <!-- 播放列表抽屉 -->
            <div class="playlist-drawer" :class="{ open: showPlaylist }">
              <div class="playlist-header">
                <h4>播放列表</h4>
                <span class="count">{{ playlist.length }} 首歌曲</span>
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
                  <span class="track-number" v-if="currentTrackIndex !== index || !isPlaying">{{
                    index + 1
                  }}</span>
                  <span class="track-number playing-icon" v-else> <i></i><i></i><i></i> </span>
                  <div class="track-meta">
                    <span class="t-name">{{ track.name }}</span>
                    <span class="t-artist">{{ track.artist }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
// 变量映射到 VitePress CSS 变量
.music-player-modal-overlay {
  --player-bg: var(--vp-c-bg);
  --player-text: var(--vp-c-text-1);
  --player-text-secondary: var(--vp-c-text-2);
  --player-accent: var(--vp-c-brand-1);
  --player-accent-hover: var(--vp-c-brand-2);
  --player-border: var(--vp-c-divider);

  position: fixed;
  inset: 0;
  z-index: 200; // 高越过 navbar
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4); // 遮罩层背景
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.music-player-card {
  position: relative;
  width: 380px;
  height: 640px;
  max-height: 90vh;
  background: var(--vp-c-bg);
  /* Fallback */
  background: rgba(255, 255, 255, 0.7); // 浅色模式默认
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid var(--player-border);
  box-shadow: var(--vp-shadow-3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

// 适配深色模式
:root.dark .music-player-card {
  background: rgba(30, 30, 30, 0.7);
}

.player-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 32px;
  position: relative;
  overflow: hidden;
  justify-content: space-between;
}

/* 顶部栏 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  z-index: 2;

  .app-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--player-text-secondary);
    letter-spacing: 1px;
    text-transform: uppercase;
  }
}

.icon-btn {
  background: transparent;
  border: none;
  color: var(--player-text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover,
  &.active {
    color: var(--player-accent);
    background: var(--vp-c-bg-soft);
  }
}

/* 唱片区域 */
.album-section {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
  z-index: 1;
}

.vinyl-record {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &.spinning {
    animation: rotate 8s linear infinite;
  }

  .disk-cover {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    overflow: hidden;
    background: #000; // 唱片底色

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.8;
      transform: scale(1.02);
    }
  }

  // 黑胶纹理
  .disk-cover::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: repeating-radial-gradient(#000 0, #000 2px, transparent 3px, transparent 4px);
    opacity: 0.1;
  }

  // 中心孔
  .disk-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 48px;
    height: 48px;
    background: var(--vp-c-bg);
    border-radius: 50%;
    border: 1px solid var(--player-border);
    z-index: 2;

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 8px;
      height: 8px;
      background: #000;
      border-radius: 50%;
      opacity: 0.2;
    }
  }

  // 光泽
  .disk-sheen {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 40%,
      transparent 60%,
      rgba(255, 255, 255, 0.1) 100%
    );
    pointer-events: none;
    z-index: 3;
  }
}

/* 歌曲信息 */
.track-info {
  text-align: center;
  margin: 0 0 24px;
  z-index: 2;

  .track-name {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--player-text);
    margin: 0 0 8px;
    line-height: 1.2;
  }

  .artist-name {
    font-size: 1rem;
    color: var(--player-text-secondary);
    margin: 0;
  }
}

/* 进度条 */
.progress-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  z-index: 2;

  .time {
    font-size: 0.75rem;
    color: var(--player-text-secondary);
    font-variant-numeric: tabular-nums;
    min-width: 32px;

    &.current {
      text-align: right;
    }
  }

  .progress-bar-wrapper {
    flex: 1;
    height: 20px;
    display: flex;
    align-items: center;
    cursor: pointer;

    &:hover .progress-track {
      height: 6px;
    }

    &:hover .progress-thumb {
      transform: scale(1);
    }
  }

  .progress-track {
    width: 100%;
    height: 4px;
    background: var(--vp-c-bg-soft);
    border-radius: 2px;
    position: relative;
    transition: height 0.2s;
  }

  .progress-fill {
    height: 100%;
    background: var(--player-accent);
    border-radius: 2px;
    position: absolute;
    top: 0;
    left: 0;
    transition: width 0.1s linear;
  }

  .progress-thumb {
    width: 12px;
    height: 12px;
    background: #fff;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    margin-top: -6px;
    margin-left: -6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    transform: scale(0);
    transition: transform 0.2s;
    pointer-events: none;
  }

  // 拖动状态
  .progress-bar-wrapper:active .progress-thumb,
  .progress-bar-wrapper.dragging .progress-thumb {
    transform: scale(1.2) !important;
  }
}

/* 控制按钮 */
.controls-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  margin-bottom: 24px;
  z-index: 2;

  .control-btn {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &.secondary {
      color: var(--player-text-secondary);

      &:hover {
        color: var(--player-text);
        transform: scale(1.1);
      }
    }

    &.primary {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--player-accent);
      color: #fff;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);

      &:hover {
        background: var(--player-accent-hover);
        transform: scale(1.05);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }
}

/* 底部辅助控制 */
.bottom-controls {
  z-index: 2;
  display: flex;
  justify-content: center;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0;
  width: 200px;
  background: transparent;

  .mute-btn {
    padding: 4px;
    color: var(--player-text-secondary);
    opacity: 0.8;

    &:hover {
      opacity: 1;
      color: var(--player-text);
      background: none;
    }
  }

  .volume-slider {
    flex: 1;
    height: 4px;
    appearance: none;
    background-color: var(--vp-c-bg-soft);
    background-image: linear-gradient(var(--player-accent), var(--player-accent));
    background-repeat: no-repeat;
    border-radius: 2px;
    outline: none;
    cursor: pointer;

    &::-webkit-slider-thumb {
      appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      transition: transform 0.1s;
    }

    &:hover::-webkit-slider-thumb {
      transform: scale(1.2);
      background: var(--player-text);
    }
  }
}

/* 播放列表抽屉 */
.playlist-drawer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60%;
  background: var(--vp-c-bg);
  /* Use base bg so it's readable */
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 10;
  display: flex;
  flex-direction: column;

  &.open {
    transform: translateY(0);
  }
}

.playlist-header {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--player-border);

  h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--player-text);
  }

  .count {
    font-size: 0.8rem;
    color: var(--player-text-secondary);
  }
}

.playlist-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--vp-c-divider);
    border-radius: 2px;
  }
}

.playlist-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--vp-c-bg-soft);
  }

  &.active {
    background-color: var(--vp-c-bg-soft);

    .track-number,
    .t-name {
      color: var(--player-accent);
      font-weight: 600;
    }

    .playing-icon i {
      background-color: var(--player-accent);
    }
  }

  .track-number {
    width: 24px;
    font-size: 0.85rem;
    color: var(--player-text-secondary);
    font-variant-numeric: tabular-nums;
    text-align: center;
    margin-right: 12px;

    &.playing-icon {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 2px;
      height: 12px;
      padding-bottom: 2px;

      i {
        width: 2px;
        background-color: var(--player-accent);
        animation: bounce 1s infinite ease-in-out;
        border-radius: 1px;

        &:nth-child(1) {
          animation-delay: 0s;
          height: 40%;
        }

        &:nth-child(2) {
          animation-delay: 0.2s;
          height: 100%;
        }

        &:nth-child(3) {
          animation-delay: 0.4s;
          height: 60%;
        }
      }
    }
  }

  .track-meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .t-name {
      font-size: 0.95rem;
      color: var(--player-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .t-artist {
      font-size: 0.75rem;
      color: var(--player-text-secondary);
      margin-top: 2px;
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes bounce {
  0%,
  100% {
    height: 30%;
  }

  50% {
    height: 100%;
  }
}

// 弹窗过渡动画
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;

  .music-player-card {
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;

  .music-player-card {
    transform: scale(0.9) translateY(20px);
  }
}
</style>
