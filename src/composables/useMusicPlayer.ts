import { ref, computed } from 'vue'

// Meting API 配置（从环境变量读取）
const METING_API = import.meta.env.VITE_METING_API || 'https://api.injahow.cn/meting/'
const MUSIC_SERVER = import.meta.env.VITE_MUSIC_SERVER || 'netease'
const PLAYLIST_ID = import.meta.env.VITE_PLAYLIST_ID || '3778678'

// 曲目类型定义 - 匹配 Meting API 返回的数据结构
export interface MetingTrack {
  name: string
  artist: string
  url: string
  pic: string // 注意：Meting API 返回的是 pic 不是 cover
  lrc?: string
}

// 播放列表 - 从 Meting API 动态获取
const playlist = ref<MetingTrack[]>([])
const isLoading = ref(false)
const loadError = ref<string | null>(null)

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
const currentTrack = computed(() => playlist.value[currentTrackIndex.value])
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

// 获取网易云歌单
const fetchPlaylist = async () => {
  if (isLoading.value || playlist.value.length > 0) return

  isLoading.value = true
  loadError.value = null

  try {
    const url = `${METING_API}?server=${MUSIC_SERVER}&type=playlist&id=${PLAYLIST_ID}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data: MetingTrack[] = await response.json()
    playlist.value = data
    console.log(`[MusicPlayer] 加载到 ${data.length} 首歌曲`)
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '加载歌单失败'
    console.error('[MusicPlayer] 加载歌单失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 初始化音频
const init = async () => {
  if (isInitialized.value && audio) return

  // 先加载歌单
  await fetchPlaylist()

  audio = new Audio()
  audio.volume = volume.value

  const firstTrack = playlist.value[0]
  if (firstTrack) {
    audio.src = firstTrack.url
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

  audio.addEventListener('error', (e) => {
    console.error('[MusicPlayer] 音频加载错误:', e)
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
  if (index < 0 || index >= playlist.value.length) return
  const track = playlist.value[index]
  if (!track) return

  currentTrackIndex.value = index
  if (audio) {
    audio.src = track.url
    audio.load()
    if (isPlaying.value) {
      audio.play()
    }
  }
}

// 播放/暂停
const togglePlay = async () => {
  if (!audio) {
    await init()
  }
  if (!audio) return

  if (isPlaying.value) {
    audio.pause()
  } else {
    audio.play()
  }
}

// 播放指定曲目
const playTrack = async (index: number) => {
  if (!audio) await init()

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
  if (nextIndex >= playlist.value.length) nextIndex = 0
  playTrack(nextIndex)
}

// 上一曲
const prevTrack = () => {
  let prevIndex = currentTrackIndex.value - 1
  if (prevIndex < 0) prevIndex = playlist.value.length - 1
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
    isLoading,
    loadError,
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
    setDragging,
    fetchPlaylist
  }
}
