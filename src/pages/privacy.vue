<script setup lang="ts">
defineOptions({
  layout: 'default'
})
</script>

<route lang="yaml">
meta:
  layout: default
</route>

<template>
  <div class="legal-page">
    <div class="legal-container">
      <h1 class="legal-title">隐私政策</h1>
      <p class="legal-updated">最后更新：2024年12月</p>

      <section class="legal-section">
        <h2>1. 信息收集</h2>
        <p>我们重视您的隐私。本知识库在您访问时可能会收集以下类型的信息：</p>
        <ul>
          <li><strong>访问日志</strong>：包括您的 IP 地址、浏览器类型、访问时间等基本信息</li>
          <li><strong>Cookie</strong>：用于记住您的偏好设置（如主题模式、阅读进度等）</li>
          <li><strong>本地存储</strong>：用于保存您的个性化设置</li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>2. 信息使用</h2>
        <p>收集的信息仅用于以下目的：</p>
        <ul>
          <li>改善网站性能和用户体验</li>
          <li>分析访问统计数据</li>
          <li>保障网站安全</li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>3. 信息保护</h2>
        <p>
          我们采取合理的技术和管理措施来保护您的个人信息安全。我们不会将您的个人信息出售、交换或以其他方式转让给第三方。
        </p>
      </section>

      <section class="legal-section">
        <h2>4. Cookie 使用</h2>
        <p>
          本站使用 Cookie 来增强您的浏览体验。您可以通过浏览器设置来管理或禁用
          Cookie，但这可能会影响某些功能的正常使用。
        </p>
      </section>

      <section class="legal-section">
        <h2>5. 第三方服务</h2>
        <p>
          本站可能使用第三方分析工具（如 Google
          Analytics）来帮助我们了解网站的使用情况。这些服务可能会收集您的匿名使用数据。
        </p>
      </section>

      <section class="legal-section">
        <h2>6. 政策更新</h2>
        <p>我们可能会不时更新本隐私政策。任何更改都将在此页面上发布，并更新"最后更新"日期。</p>
      </section>

      <section class="legal-section">
        <h2>7. 联系我们</h2>
        <p>如果您对本隐私政策有任何疑问，请通过页面底部的联系方式与我们取得联系。</p>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.legal-page {
  min-height: calc(100vh - var(--vp-nav-height) - 100px);
  padding: 48px 24px;
  background: var(--vp-c-bg);
}

.legal-container {
  max-width: 800px;
  margin: 0 auto;
}

.legal-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.legal-updated {
  font-size: 0.9rem;
  color: var(--vp-c-text-3);
  margin-bottom: 48px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.legal-section {
  margin-bottom: 32px;

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--vp-c-text-1);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;

    &::before {
      content: '';
      width: 4px;
      height: 20px;
      background: var(--vp-c-brand-1);
      border-radius: 2px;
    }
  }

  p {
    font-size: 1rem;
    line-height: 1.8;
    color: var(--vp-c-text-2);
    margin-bottom: 12px;
  }

  ul {
    padding-left: 24px;
    margin-top: 12px;

    li {
      font-size: 1rem;
      line-height: 1.8;
      color: var(--vp-c-text-2);
      margin-bottom: 8px;
      position: relative;

      &::marker {
        color: var(--vp-c-brand-1);
      }

      strong {
        color: var(--vp-c-text-1);
      }
    }
  }
}

@media (max-width: 640px) {
  .legal-page {
    padding: 32px 16px;
  }

  .legal-title {
    font-size: 2rem;
  }

  .legal-section h2 {
    font-size: 1.1rem;
  }
}
</style>
