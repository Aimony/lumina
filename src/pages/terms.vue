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
      <h1 class="legal-title">使用条款</h1>
      <p class="legal-updated">最后更新：2024年12月</p>

      <section class="legal-section">
        <h2>1. 服务说明</h2>
        <p>
          欢迎使用本知识库。本站是一个面向开发者和学习者的技术知识分享平台，旨在提供高质量的学习资源和技术文档。
        </p>
      </section>

      <section class="legal-section">
        <h2>2. 知识产权</h2>
        <p>
          本站所有原创内容（包括但不限于文章、图片、代码示例）均受版权保护。除非另有说明，所有内容的版权归本站所有。
        </p>
        <ul>
          <li>您可以自由阅读和学习本站内容</li>
          <li>转载或引用时请注明出处并提供原文链接</li>
          <li>禁止将内容用于商业目的而未获得授权</li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>3. 用户行为规范</h2>
        <p>使用本站服务时，您同意：</p>
        <ul>
          <li>遵守中华人民共和国相关法律法规</li>
          <li>不进行任何可能损害本站正常运行的行为</li>
          <li>不使用自动化工具大量抓取本站内容</li>
          <li>尊重其他用户的合法权益</li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>4. 内容准确性</h2>
        <p>
          我们努力确保本站内容的准确性和时效性，但不对内容的完整性、准确性或适用性作任何明示或暗示的保证。技术内容可能会随时间推移而过时，请结合实际情况参考使用。
        </p>
      </section>

      <section class="legal-section">
        <h2>5. 免责声明</h2>
        <p>
          本站内容仅供学习和参考之用。因使用本站内容而产生的任何直接或间接损失，本站不承担任何责任。在做出重要决策前，请咨询相关专业人士。
        </p>
      </section>

      <section class="legal-section">
        <h2>6. 外部链接</h2>
        <p>
          本站可能包含指向第三方网站的链接。这些链接仅为方便用户而提供，我们不对这些外部网站的内容负责，也不意味着我们认可其内容。
        </p>
      </section>

      <section class="legal-section">
        <h2>7. 条款修改</h2>
        <p>
          我们保留随时修改本使用条款的权利。修改后的条款将在本页面发布后立即生效。继续使用本站即表示您接受修改后的条款。
        </p>
      </section>

      <section class="legal-section">
        <h2>8. 适用法律</h2>
        <p>
          本条款的解释和执行均适用中华人民共和国法律。如发生争议，双方应友好协商解决；协商不成的，应提交有管辖权的人民法院诉讼解决。
        </p>
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
