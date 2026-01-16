import { ref, computed } from 'vue'

// 播放列表 - 基于 public/music 目录下的文件
const playlist = [
  { name: '艾搓', file: 'ac.mp3', artist: 'Unknown' },
  { name: 'ong 来', file: 'ao.mp3', artist: 'Unknown' },
  { name: '艾青勋熙', file: 'aqxx.mp3', artist: 'Unknown' },
  { name: '朵原豆瑶再伊琪', file: 'dydyzyq.mp3', artist: 'Unknown' },
  { name: '霍画', file: 'hh.mp3', artist: 'Unknown' },
  { name: '姜楠', file: 'jn.mp3', artist: 'Unknown' },
  { name: '位移', file: 'wy.mp3', artist: 'Unknown' }
]

// 全局共享状态 - 确保所有组件使用同一个 audio 实例
let audio: HTMLAudioElement | null = null
const isPlaying = ref(false)
const currentTrackIndex = ref(0)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.2)
const isMuted = ref(false)
const isInitialized = ref(false)

// 进度条拖动状态
const isDragging = ref(false)

// 计算属性
const currentTrack = computed(() => playlist[currentTrackIndex.value])
const progressPercent = computed(() => {
  return duration.value ? (currentTime.value / duration.value) * 100 : 0
})

// 格式化时间
const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 初始化音频
const init = () => {
  if (isInitialized.value && audio) return

  audio = new Audio()
  audio.volume = volume.value

  const firstTrack = playlist[0]
  if (firstTrack) {
    audio.src = `/music/${firstTrack.file}`
  }

  // 事件监听
  audio.addEventListener('timeupdate', () => {
    if (audio && !isDragging.value) {
      currentTime.value = audio.currentTime
    }
  })

  audio.addEventListener('loadedmetadata', () => {
    if (audio) duration.value = audio.duration
  })

  audio.addEventListener('ended', () => {
    nextTrack()
  })

  audio.addEventListener('play', () => {
    isPlaying.value = true
  })

  audio.addEventListener('pause', () => {
    isPlaying.value = false
  })

  isInitialized.value = true
}

// 销毁音频
const destroy = () => {
  if (audio) {
    audio.pause()
    audio.src = ''
    audio = null
  }
  isInitialized.value = false
  isPlaying.value = false
}

// 加载曲目
const loadTrack = (index: number) => {
  if (index < 0 || index >= playlist.length) return
  const track = playlist[index]
  if (!track) return

  currentTrackIndex.value = index
  if (audio) {
    audio.src = `/music/${track.file}`
    audio.load()
    if (isPlaying.value) {
      audio.play()
    }
  }
}

// 播放/暂停
const togglePlay = () => {
  if (!audio) {
    init()
  }
  if (!audio) return

  if (isPlaying.value) {
    audio.pause()
  } else {
    audio.play()
  }
}

// 播放指定曲目
const playTrack = (index: number) => {
  if (!audio) init()

  if (index === currentTrackIndex.value) {
    togglePlay()
  } else {
    loadTrack(index)
    isPlaying.value = true
    audio?.play()
  }
}

// 下一曲
const nextTrack = () => {
  let nextIndex = currentTrackIndex.value + 1
  if (nextIndex >= playlist.length) nextIndex = 0
  playTrack(nextIndex)
}

// 上一曲
const prevTrack = () => {
  let prevIndex = currentTrackIndex.value - 1
  if (prevIndex < 0) prevIndex = playlist.length - 1
  playTrack(prevIndex)
}

// 跳转到指定时间
const seek = (time: number) => {
  if (audio && !isNaN(time)) {
    audio.currentTime = time
    currentTime.value = time
  }
}

// 根据进度百分比跳转
const seekByPercent = (percent: number) => {
  if (duration.value) {
    const time = (percent / 100) * duration.value
    seek(time)
  }
}

// 设置音量
const setVolume = (val: number) => {
  volume.value = val
  if (audio) audio.volume = val
  isMuted.value = val === 0
}

// 静音切换
const toggleMute = () => {
  if (!audio) return
  if (isMuted.value) {
    audio.muted = false
    audio.volume = volume.value || 0.5
    isMuted.value = false
  } else {
    audio.muted = true
    isMuted.value = true
  }
}

// 设置拖动状态
const setDragging = (dragging: boolean) => {
  isDragging.value = dragging
}

export function useMusicPlayer() {
  return {
    // 状态
    isPlaying,
    currentTrackIndex,
    currentTime,
    duration,
    volume,
    isMuted,
    isInitialized,
    isDragging,
    // 计算属性
    currentTrack,
    progressPercent,
    playlist,
    // 方法
    formatTime,
    init,
    destroy,
    loadTrack,
    togglePlay,
    playTrack,
    nextTrack,
    prevTrack,
    seek,
    seekByPercent,
    setVolume,
    toggleMute,
    setDragging
  }
}
