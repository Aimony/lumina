<template>
  <footer class="global-footer" :class="{ transparent }">
    <!-- 波浪背景 -->
    <div class="waves-container">
      <svg
        class="waves"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 24 150 28"
        preserveAspectRatio="none"
        shape-rendering="auto"
      >
        <defs>
          <path
            id="gentle-wave"
            d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
          />
        </defs>
        <g class="parallax">
          <use xlink:href="#gentle-wave" x="48" y="0" fill="var(--vp-c-brand-1)" opacity="0.3" />
          <use xlink:href="#gentle-wave" x="48" y="3" fill="var(--vp-c-brand-1)" opacity="0.5" />
          <use xlink:href="#gentle-wave" x="48" y="5" fill="var(--vp-c-brand-1)" opacity="0.2" />
          <use xlink:href="#gentle-wave" x="48" y="7" fill="var(--vp-c-brand-1)" opacity="0.1" />
        </g>
      </svg>
    </div>

    <div class="footer-container">
      <!-- 版权 + 链接 + 备案 单行布局 -->
      <div class="footer-row">
        <!-- 版权信息 -->
        <span class="copyright">
          © {{ copyrightYear }}
          <a
            v-if="config.copyright.authorUrl"
            :href="config.copyright.authorUrl"
            class="author-link"
            target="_blank"
            rel="noopener noreferrer"
            >{{ config.copyright.author }}</a
          >
          <span v-else>{{ config.copyright.author }}</span>
        </span>

        <span class="divider">|</span>

        <!-- 底部链接 -->
        <template v-for="(link, index) in config.links" :key="link.text">
          <a
            v-if="link.external"
            :href="link.url"
            class="footer-link"
            target="_blank"
            rel="noopener noreferrer"
            >{{ link.text }}</a
          >
          <router-link v-else :to="link.url" class="footer-link">
            {{ link.text }}
          </router-link>
          <span v-if="index < config.links.length - 1" class="link-sep">·</span>
        </template>

        <span class="divider" v-if="config.icp || config.police">|</span>

        <!-- 备案信息 -->
        <a
          v-if="config.icp"
          :href="config.icp.url"
          class="icp-link"
          target="_blank"
          rel="noopener noreferrer"
          >{{ config.icp.number }}</a
        >

        <a
          v-if="config.police"
          :href="config.police.url"
          class="icp-link"
          target="_blank"
          rel="noopener noreferrer"
          >{{ config.police.number }}</a
        >
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { footerConfig } from '@/config/footer'

defineProps<{
  transparent?: boolean
}>()

const config = footerConfig

const copyrightYear = computed(() => {
  const currentYear = new Date().getFullYear()
  const startYear = config.copyright.startYear
  return startYear === currentYear ? currentYear.toString() : `${startYear}-${currentYear}`
})
</script>

<style scoped lang="scss">
.global-footer {
  width: 100%;
  padding: 16px 24px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  position: relative;
  overflow: hidden;

  &.transparent {
    background: transparent;
    border-top: none;
  }
}

.waves-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  display: flex;
  align-items: flex-end;
}

.waves {
  position: relative;
  width: 100%;
  height: 60px;
  margin-bottom: -7px;
  /* Fix for gap at bottom */
  min-height: 60px;
  max-height: 150px;
}

.parallax > use {
  animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
}

.parallax > use:nth-child(1) {
  animation-delay: -2s;
  animation-duration: 7s;
}

.parallax > use:nth-child(2) {
  animation-delay: -3s;
  animation-duration: 10s;
}

.parallax > use:nth-child(3) {
  animation-delay: -4s;
  animation-duration: 13s;
}

.parallax > use:nth-child(4) {
  animation-delay: -5s;
  animation-duration: 20s;
}

@keyframes move-forever {
  0% {
    transform: translate3d(-90px, 0, 0);
  }

  100% {
    transform: translate3d(85px, 0, 0);
  }
}

.footer-container {
  max-width: 1104px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.footer-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.copyright {
  display: inline-flex;
  gap: 4px;
}

.author-link {
  color: var(--vp-c-text-2);
  transition: color 0.2s;

  &:hover {
    color: var(--vp-c-brand-1);
  }
}

.divider {
  color: var(--vp-c-divider);
}

.footer-link {
  color: var(--vp-c-text-3);
  transition: color 0.2s;

  &:hover {
    color: var(--vp-c-brand-1);
  }
}

.link-sep {
  color: var(--vp-c-text-3);
  opacity: 0.5;
}

.icp-link {
  color: var(--vp-c-text-3);
  transition: color 0.2s;

  &:hover {
    color: var(--vp-c-text-2);
  }
}

@media (max-width: 640px) {
  .global-footer {
    padding: 12px 16px;
  }

  .footer-row {
    font-size: 12px;
    gap: 6px;
  }

  .waves {
    height: 40px;
    min-height: 40px;
  }
}
</style>
