<script setup lang="ts">
interface Feature {
  icon: string
  title: string
  details: string
}

const features: Feature[] = [
  {
    icon: '☕',
    title: 'Java',
    details: 'JavaSE、JavaEE、JUC 并发编程核心知识体系'
  },
  {
    icon: '🍃',
    title: 'Spring Ecosystem',
    details: 'Spring、SpringBoot、MyBatis 及云原生微服务架构'
  },
  {
    icon: '🗄️',
    title: 'Database',
    details: 'MySQL 深度调优、分库分表及 NoSQL Redis 缓存策略'
  },
  {
    icon: '☁️',
    title: 'Cloud Native',
    details: 'Spring Cloud Alibaba 网关、注册中心、熔断降级实战'
  },
  {
    icon: '🐧',
    title: 'Linux & DevOps',
    details: 'Ubuntu/CentOS 系统管理、Shell 脚本与运维自动化'
  },
  {
    icon: '🐳',
    title: 'Containers',
    details: 'Docker 容器化部署与 Docker-Compose 编排管理'
  }
]
</script>

<template>
  <div class="features-section">
    <div class="container">
      <div class="items">
        <div v-for="feature in features" :key="feature.title" class="item">
          <div class="VPFeature">
            <div class="icon">{{ feature.icon }}</div>
            <h2 class="title">{{ feature.title }}</h2>
            <p class="details">{{ feature.details }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Features Section */
.features-section {
  padding: 0 24px;
  overflow: hidden;
  /* 防止负边距引起的溢出 */
}

@media (min-width: 640px) {
  .features-section {
    padding: 0 48px;
  }
}

@media (min-width: 960px) {
  .features-section {
    padding: 0 64px;
  }
}

.container {
  max-width: 1152px;
  margin: 0 auto;
}

.items {
  display: flex;
  flex-wrap: wrap;
  margin: -8px;
}

.item {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  /* 确保 padding 不增加宽度 */
}

@media (min-width: 640px) {
  .item {
    width: 50%;
  }
}

@media (min-width: 768px) {
  .item {
    width: 50%;
  }
}

@media (min-width: 960px) {
  .item {
    width: 33.33%;
  }
}

.VPFeature {
  display: block;
  border: 1px solid var(--vp-c-bg-alt);
  border-radius: 12px;
  height: 100%;
  background-color: var(--vp-c-bg-alt);
  padding: 24px;
  transition:
    border-color 0.25s,
    background-color 0.25s;
}

.VPFeature:hover {
  border-color: var(--vp-c-brand-1);
}

.icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  border-radius: 6px;
  background-color: var(--vp-c-bg);
  width: 48px;
  height: 48px;
  font-size: 24px;
  box-shadow: var(--vp-shadow-1);
}

.title {
  line-height: 24px;
  font-size: 16px;
  font-weight: 600;
}

.details {
  padding-top: 8px;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}
</style>
