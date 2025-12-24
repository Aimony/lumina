<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

// 导入社交图标
import WechatIcon from '@/assets/social-icons/wechat-logo-svgrepo-com.svg'
import WeiboIcon from '@/assets/social-icons/sina-weibo-1-logo-svgrepo-com.svg'
import XIcon from '@/assets/social-icons/X_icon.svg'
import FacebookIcon from '@/assets/social-icons/facebook-3-logo-svgrepo-com.svg'
import TelegramIcon from '@/assets/social-icons/telegram-svgrepo-com.svg'
import LinkIcon from '@/assets/social-icons/link-svgrepo-com.svg'

const route = useRoute()

// 获取当前文章标题和URL
const articleTitle = computed(
  () => (route.meta.title as string) || document.title || 'Lumina 知识库'
)
const articleUrl = computed(() => window.location.href)

// 生成分享文本
const shareText = computed(() => `📄 ${articleTitle.value} - Lumina 知识库\n${articleUrl.value}`)

// 复制状态
const copied = ref(false)

// 复制到剪贴板
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareText.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 分享平台
const platforms = computed(() => {
  const url = encodeURIComponent(articleUrl.value)
  const summary = encodeURIComponent(`📄 ${articleTitle.value} - Lumina 知识库`)

  return [
    {
      name: '微信',
      icon: WechatIcon,
      color: '#07C160',
      action: copyLink
    },
    {
      name: '微博',
      icon: WeiboIcon,
      color: '#E6162D',
      action: () =>
        window.open(
          `https://service.weibo.com/share/share.php?url=${url}&title=${summary}`,
          '_blank'
        )
    },
    {
      name: 'Twitter',
      icon: XIcon,
      color: '#000000',
      action: () =>
        window.open(`https://twitter.com/intent/tweet?text=${summary}&url=${url}`, '_blank')
    },
    {
      name: 'Facebook',
      icon: FacebookIcon,
      color: '#1877F2',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
    },
    {
      name: 'Telegram',
      icon: TelegramIcon,
      color: '#26A5E4',
      action: () => window.open(`https://t.me/share/url?url=${url}&text=${summary}`, '_blank')
    }
  ]
})
</script>

<template>
  <div class="share-bar">
    <div class="share-label">分享至</div>
    <div class="share-buttons">
      <button
        v-for="platform in platforms"
        :key="platform.name"
        class="share-btn"
        :style="{ '--btn-color': platform.color }"
        :title="platform.name"
        @click.stop="platform.action"
      >
        <img :src="platform.icon" :alt="platform.name" class="icon" data-no-zoom />
      </button>
      <!-- 复制链接按钮 -->
      <button
        class="share-btn copy-btn"
        :class="{ copied }"
        title="复制链接"
        @click.stop="copyLink"
      >
        <img :src="LinkIcon" alt="复制链接" class="icon" data-no-zoom />
      </button>
    </div>

    <!-- 复制成功提示 -->
    <Transition name="fade">
      <span v-if="copied" class="copied-tip">已复制到剪贴板</span>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.share-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 48px;
  padding: 16px 0;
  border-top: 1px solid var(--vp-c-divider);
}

.share-label {
  font-size: 13px;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

.share-buttons {
  display: flex;
  gap: 12px;
}

.share-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  padding: 8px;

  .icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
    opacity: 0.7;
    transition: opacity 0.25s ease;
  }

  &:hover {
    border-color: var(--btn-color, var(--vp-c-brand-1));
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    .icon {
      opacity: 1;
    }
  }
}

.copy-btn {
  --btn-color: var(--vp-c-brand-1);

  &.copied {
    border-color: #10b981;
    background: #10b981;

    .icon {
      opacity: 1;
      filter: brightness(0) invert(1);
    }
  }
}

.copied-tip {
  font-size: 12px;
  color: #10b981;
  margin-left: 8px;
  white-space: nowrap;
}

// 动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 响应式
@media (max-width: 640px) {
  .share-bar {
    flex-wrap: wrap;
  }

  .share-btn {
    width: 32px;
    height: 32px;
    padding: 6px;
  }

  .share-buttons {
    gap: 8px;
  }
}
</style>
