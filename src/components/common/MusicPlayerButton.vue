<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMusicPlayer } from '@/composables/useMusicPlayer'
import VinylRecordIcon from '@/assets/StreamlineUltimateColorVinylRecord.svg'

const { isPlaying, currentTrack, togglePlay, init, volume, setVolume } = useMusicPlayer()

const showPlayerModal = ref(false)
const imageLoadError = ref(false)

// 防止单击和双击冲突
let clickTimer: ReturnType<typeof setTimeout> | null = null
const CLICK_DELAY = 250

// 计算显示的图标
const displayIcon = computed(() => {
  if (isPlaying.value && currentTrack.value?.pic && !imageLoadError.value) {
    return currentTrack.value.pic
  }
  return VinylRecordIcon
})

// 是否使用在线图片
const isOnlineImage = computed(() => {
  return isPlaying.value && currentTrack.value?.pic && !imageLoadError.value
})

// 单击：播放/暂停
const handleClick = () => {
  if (clickTimer) {
    clearTimeout(clickTimer)
    clickTimer = null
    return
  }

  clickTimer = setTimeout(() => {
    clickTimer = null
    init()
    togglePlay()
  }, CLICK_DELAY)
}

// 双击：打开播放器弹窗
const handleDblClick = () => {
  if (clickTimer) {
    clearTimeout(clickTimer)
    clickTimer = null
  }
  init()
  showPlayerModal.value = true
}

// 图片加载失败处理
const handleImageError = () => {
  imageLoadError.value = true
}

// 图片加载成功时重置错误状态
const handleImageLoad = () => {
  imageLoadError.value = false
}

// 滚轮控制音量
const showVolumeTip = ref(false)
let volumeTipTimer: ReturnType<typeof setTimeout> | null = null

const handleWheel = (event: WheelEvent) => {
  const step = 0.05
  const delta = event.deltaY < 0 ? step : -step
  const newVolume = Math.min(1, Math.max(0, volume.value + delta))
  setVolume(newVolume)

  // 显示音量提示
  showVolumeTip.value = true
  if (volumeTipTimer) clearTimeout(volumeTipTimer)
  volumeTipTimer = setTimeout(() => {
    showVolumeTip.value = false
  }, 1000)
}
</script>

<template>
  <div class="music-player-button-wrapper">
    <button
      class="music-player-btn"
      :class="{ playing: isPlaying }"
      @click="handleClick"
      @dblclick="handleDblClick"
      @wheel.prevent="handleWheel"
      title="单击播放/暂停，双击打开播放器，悬停滚轮调节音量"
    >
      <img
        v-if="isOnlineImage"
        :src="displayIcon"
        alt="Music"
        class="btn-icon online-cover"
        @error="handleImageError"
        @load="handleImageLoad"
      />
      <img v-else :src="VinylRecordIcon" alt="Music" class="btn-icon vinyl-icon" />
    </button>

    <!-- 全局播放器弹窗 -->
    <MusicPlayerModal v-model="showPlayerModal" />

    <!-- 音量提示 -->
    <Transition name="fade">
      <span v-if="showVolumeTip" class="volume-tip">{{ Math.round(volume * 100) }}%</span>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.music-player-button-wrapper {
  position: relative;
  display: flex;
  align-items: center;

  .volume-tip {
    position: absolute;
    bottom: -24px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--vp-c-bg-inverse);
    color: var(--vp-c-text-inverse-1);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    white-space: nowrap;
    pointer-events: none;
    z-index: 100;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.music-player-btn {
  margin-right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 2px;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.25s ease;
  overflow: hidden;

  &:hover {
    background: var(--vp-c-bg-soft);
    transform: scale(1.1);
  }

  .btn-icon {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    transition: transform 0.3s ease;

    &.online-cover {
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    }
  }

  /* 播放时旋转动画 */
  &.playing {
    .btn-icon {
      animation: spin 3s linear infinite;
    }

    &:hover .btn-icon {
      animation-play-state: running;
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
