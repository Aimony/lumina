<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useMusicPlayer } from '@/composables/useMusicPlayer'
import MusicPlayerModal from '@/components/home/MusicPlayerModal.vue'

interface TechItem {
  name: string
  icon: string
}

const techStack: TechItem[] = [
  {
    name: 'JavaScript',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg'
  },
  {
    name: 'TypeScript',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg'
  },
  {
    name: 'Vue.js',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg'
  },
  {
    name: 'Java',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg'
  },
  {
    name: 'Spring',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg'
  },
  {
    name: 'MySQL',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg'
  },
  {
    name: 'Redis',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg'
  },
  {
    name: 'Docker',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg'
  },
  { name: 'Git', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
  {
    name: 'Linux',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg'
  },
  {
    name: 'Nginx',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg'
  },
  {
    name: 'Maven',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/maven/maven-original.svg'
  },
  {
    name: 'Ubuntu',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ubuntu/ubuntu-original-wordmark.svg'
  },
  {
    name: 'IEDA',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/intellij/intellij-original.svg'
  },
  { name: 'Vite', icon: 'https://vitejs.dev/logo.svg' }
]

// 音乐播放器
const { isPlaying, togglePlay, init } = useMusicPlayer()
const showPlayerModal = ref(false)

// 防止单击和双击冲突
let clickTimer: ReturnType<typeof setTimeout> | null = null
const CLICK_DELAY = 250

// 单击：播放/暂停
const handleAvatarClick = () => {
  if (clickTimer) {
    // 如果已有定时器，说明是双击，取消单击操作
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
const handleAvatarDblClick = () => {
  if (clickTimer) {
    clearTimeout(clickTimer)
    clickTimer = null
  }
  init()
  showPlayerModal.value = true
}
</script>

<template>
  <div class="hero-section">
    <div class="container">
      <div class="main">
        <h1 class="name">
          <span class="clip">Lumina</span>
        </h1>
        <p class="text">Personal Knowledge Base System</p>
        <p class="tagline">好记性不如烂笔头，构建个人的技术护城河</p>

        <div class="actions">
          <div class="action">
            <RouterLink to="/guide/intro" class="VPButton brand"> 快速开始 </RouterLink>
          </div>
          <div class="action">
            <a href="https://github.com" target="_blank" rel="noreferrer" class="VPButton alt">
              View on GitHub
            </a>
          </div>
        </div>
      </div>
      <div class="image-bg">
        <div class="image-container">
          <div
            class="avatar-circle"
            :class="{ 'vinyl-spinning': isPlaying }"
            @click="handleAvatarClick"
            @dblclick="handleAvatarDblClick"
            title="单击播放/暂停，双击打开播放器"
          >
            <!-- 黑胶唱片纹理 -->
            <div class="vinyl-groove"></div>
            <img src="/img/avatar.png" alt="Avatar" class="avatar-img" />
            <!-- 播放状态指示器 -->
            <div class="play-indicator" v-if="!isPlaying">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="32"
                height="32"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <!-- 环绕技术栈图标 -->
            <div class="tech-icons">
              <div
                v-for="(tech, index) in techStack"
                :key="tech.name"
                class="tech-icon-wrapper"
                :style="{
                  '--index': index,
                  '--total': techStack.length
                }"
              >
                <div class="tech-icon-card">
                  <img :src="tech.icon" :alt="tech.name" class="tech-icon-img" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 音乐播放器弹窗 -->
    <MusicPlayerModal v-model="showPlayerModal" />
  </div>
</template>

<style scoped>
/* Hero Section */
.hero-section {
  padding: calc(var(--vp-nav-height) + 48px) 24px 48px;
  overflow: hidden;
  /* 防止旋转图标溢出 */
}

@media (min-width: 640px) {
  .hero-section {
    padding: calc(var(--vp-nav-height) + 80px) 48px 64px;
  }
}

@media (min-width: 960px) {
  .hero-section {
    padding: calc(var(--vp-nav-height) + 80px) 64px 64px;
  }
}

.container {
  max-width: 1152px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

@media (min-width: 960px) {
  .container {
    flex-direction: row;
    align-items: center;
  }
}

.main {
  position: relative;
  z-index: 10;
  order: 2;
  text-align: center;
}

@media (min-width: 960px) {
  .main {
    order: 1;
    width: calc(100% - 360px);
    text-align: left;
  }
}

.name {
  line-height: 1;
  font-family: 'Righteous', cursive;
  font-size: 32px;
  font-weight: 400;
  white-space: pre-wrap;
}

.clip {
  background: -webkit-linear-gradient(315deg, var(--vp-c-brand-1) 25%, var(--vp-c-brand-2));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

@media (min-width: 640px) {
  .name {
    font-size: 48px;
  }
}

@media (min-width: 960px) {
  .name {
    font-size: 56px;
  }
}

.text {
  padding-top: 8px;
  line-height: 1.5;
  font-family: 'Righteous', cursive;
  font-size: 32px;
  font-weight: 400;
  color: var(--vp-c-text-1);
}

@media (min-width: 640px) {
  .text {
    font-size: 48px;
  }
}

@media (min-width: 960px) {
  .text {
    font-size: 56px;
  }
}

.tagline {
  padding-top: 24px;
  line-height: 1.6;
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 24px;
  color: var(--vp-c-text-2);
}

@media (min-width: 640px) {
  .tagline {
    font-size: 20px;
    font-weight: 500;
  }
}

@media (min-width: 960px) {
  .tagline {
    font-size: 24px;
  }
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: -6px;
  padding-top: 32px;
}

@media (min-width: 960px) {
  .actions {
    justify-content: flex-start;
  }
}

.action {
  padding: 6px;
}

.VPButton {
  display: inline-block;
  border: 1px solid transparent;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
  transition:
    color 0.25s,
    border-color 0.25s,
    background-color 0.25s;
  border-radius: 20px;
  padding: 0 20px;
  line-height: 38px;
  font-size: 14px;
}

.VPButton.brand {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-bg);
  background-color: var(--vp-c-brand-1);
}

.VPButton.brand:hover {
  border-color: var(--vp-c-brand-2);
  background-color: var(--vp-c-brand-2);
}

.VPButton.alt {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-alt);
}

.VPButton.alt:hover {
  border-color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg);
}

.image-bg {
  order: 1;
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

@media (min-width: 960px) {
  .image-bg {
    order: 2;
    margin-bottom: 0;
    width: 360px;
    height: 360px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.avatar-circle {
  width: 192px;
  height: 192px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  font-weight: bold;
  position: relative;
  z-index: 10;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-circle::after {
  content: '';
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  background: var(--vp-c-brand-1);
  opacity: 0.15;
  filter: blur(40px);
  z-index: -1;
  border-radius: 50%;
}

/* 技术栈图标环绕样式 */
.tech-icons {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  animation: rotate-orbit 30s linear infinite;
  pointer-events: none;
}

.tech-icon-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 36px;
  height: 36px;
  margin-top: -18px;
  margin-left: -18px;
  transform: rotate(calc(var(--index) * (360deg / var(--total)))) translate(130px)
    rotate(calc(var(--index) * (-360deg / var(--total))));
}

.tech-icon-card {
  width: 100%;
  height: 100%;
  background: var(--vp-c-bg);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  box-shadow: var(--vp-shadow-2);
  border: 1px solid var(--vp-c-divider);
  transition: transform 0.3s ease;
  animation: rotate-counter 30s linear infinite;
  pointer-events: auto;
}

.tech-icon-card:hover {
  transform: scale(1.2);
  border-color: var(--vp-c-brand-1);
}

.tech-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

@keyframes rotate-orbit {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }

  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes rotate-counter {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(-360deg);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .tech-icon-wrapper {
    transform: rotate(calc(var(--index) * (360deg / var(--total)))) translate(100px)
      rotate(calc(var(--index) * (-360deg / var(--total))));
  }

  .tech-icon-card {
    width: 28px;
    height: 28px;
    padding: 3px;
  }
}

/* ========== 黑胶唱片播放动画 ========== */

/* 头像可点击提示 */
.avatar-circle {
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.avatar-circle:hover {
  transform: scale(1.02);
  box-shadow: 0 0 40px rgba(var(--vp-c-brand-1-rgb, 100, 108, 255), 0.4);
}

.avatar-circle:active {
  transform: scale(0.98);
}

/* 黑胶旋转动画 */
.avatar-circle.vinyl-spinning {
  animation: vinyl-rotate 3s linear infinite;
}

.avatar-circle.vinyl-spinning:hover {
  animation-play-state: running;
  /* 悬停时继续旋转 */
}

@keyframes vinyl-rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 黑胶纹理效果 */
.vinyl-groove {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle at center,
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, 0.03) 2px,
    rgba(0, 0, 0, 0.03) 4px
  );
  pointer-events: none;
  z-index: 1;
}

/* 播放/暂停指示器 */
.play-indicator {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  color: white;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 2;
  pointer-events: none;
}

.avatar-circle:hover .play-indicator {
  opacity: 1;
}

/* 播放中时隐藏播放按钮提示 */
.avatar-circle.vinyl-spinning .play-indicator {
  display: none;
}

/* 头像图片层级调整 */
.avatar-img {
  position: relative;
  z-index: 0;
}
</style>
