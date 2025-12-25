<template>
  <footer class="global-footer" :class="{ transparent }">
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

  &.transparent {
    background: transparent;
    border-top: none;
  }
}

.footer-container {
  max-width: 1104px;
  margin: 0 auto;
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
}
</style>
