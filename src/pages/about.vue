<script setup lang="ts">
defineOptions({
  layout: 'default'
})

const siteName = 'Lumina'
const siteDescription = '一个优雅的技术知识库'

const features = [
  {
    icon: '📚',
    title: '丰富的知识库',
    description: '涵盖前端、后端、DevOps 等多个技术领域的深度文章'
  },
  {
    icon: '🎨',
    title: '优雅的阅读体验',
    description: '精心设计的界面，支持暗色模式，让阅读更加舒适'
  },
  {
    icon: '🔍',
    title: '强大的搜索功能',
    description: '快速定位所需内容，支持全文检索和标签筛选'
  },
  {
    icon: '🚀',
    title: '持续更新',
    description: '定期更新内容，紧跟技术发展趋势'
  }
]

const techStack = [
  { name: 'Vue 3', description: '渐进式 JavaScript 框架' },
  { name: 'TypeScript', description: '类型安全的 JavaScript 超集' },
  { name: 'Vite', description: '下一代前端构建工具' },
  { name: 'SCSS', description: 'CSS 预处理器' }
]
</script>

<route lang="yaml">
meta:
  layout: default
</route>

<template>
  <div class="about-page">
    <div class="about-container">
      <!-- Hero Section -->
      <section class="hero-section">
        <h1 class="hero-title">关于我们</h1>
        <p class="hero-subtitle">{{ siteName }} —— {{ siteDescription }}</p>
      </section>

      <!-- Mission Section -->
      <section class="content-section">
        <h2 class="section-title">我们的愿景</h2>
        <div class="mission-card">
          <p>
            我们致力于打造一个高质量的技术知识分享平台，帮助开发者更高效地学习和成长。
            无论你是刚入门的新手，还是经验丰富的老手，都能在这里找到有价值的内容。
          </p>
          <p>
            我们相信，知识应该是开放和共享的。通过系统化的知识整理和优质的内容创作，
            我们希望能够降低学习的门槛，让更多人能够享受技术带来的乐趣。
          </p>
        </div>
      </section>

      <!-- Features Section -->
      <section class="content-section">
        <h2 class="section-title">特色功能</h2>
        <div class="features-grid">
          <div v-for="feature in features" :key="feature.title" class="feature-card">
            <span class="feature-icon">{{ feature.icon }}</span>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.description }}</p>
          </div>
        </div>
      </section>

      <!-- Tech Stack Section -->
      <section class="content-section">
        <h2 class="section-title">技术栈</h2>
        <div class="tech-grid">
          <div v-for="tech in techStack" :key="tech.name" class="tech-card">
            <h3 class="tech-name">{{ tech.name }}</h3>
            <p class="tech-desc">{{ tech.description }}</p>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section class="content-section">
        <h2 class="section-title">联系我们</h2>
        <div class="contact-card">
          <p>如果您有任何问题、建议或合作意向，欢迎通过以下方式与我们联系：</p>
          <ul class="contact-list">
            <li>
              <span class="contact-icon">📧</span>
              <span>邮箱：contact@example.com</span>
            </li>
            <li>
              <span class="contact-icon">🐙</span>
              <span
                >GitHub：<a href="https://github.com" target="_blank" rel="noopener"
                  >github.com/lumina</a
                ></span
              >
            </li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.about-page {
  min-height: calc(100vh - var(--vp-nav-height) - 100px);
  padding: 48px 24px;
  background: var(--vp-c-bg);
}

.about-container {
  max-width: 900px;
  margin: 0 auto;
}

// Hero Section
.hero-section {
  text-align: center;
  margin-bottom: 64px;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--vp-c-text-2);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

// Content Sections
.content-section {
  margin-bottom: 56px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;

  &::before {
    content: '';
    width: 4px;
    height: 24px;
    background: linear-gradient(180deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
    border-radius: 2px;
  }
}

// Mission Card
.mission-card {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 32px;
  border: 1px solid var(--vp-c-divider);

  p {
    font-size: 1rem;
    line-height: 1.8;
    color: var(--vp-c-text-2);
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

// Features Grid
.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.feature-card {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--vp-c-divider);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--vp-c-brand-1);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
}

.feature-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 12px;
}

.feature-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}

.feature-desc {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

// Tech Grid
.tech-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.tech-card {
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  border: 1px solid var(--vp-c-divider);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--vp-c-brand-1);
  }
}

.tech-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  margin-bottom: 6px;
}

.tech-desc {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}

// Contact Card
.contact-card {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 32px;
  border: 1px solid var(--vp-c-divider);

  > p {
    font-size: 1rem;
    color: var(--vp-c-text-2);
    margin-bottom: 20px;
  }
}

.contact-list {
  list-style: none;
  padding: 0;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--vp-c-divider);
    color: var(--vp-c-text-2);

    &:last-child {
      border-bottom: none;
    }

    a {
      color: var(--vp-c-brand-1);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.contact-icon {
  font-size: 1.25rem;
}

// Responsive
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.25rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .tech-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .about-page {
    padding: 32px 16px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .mission-card,
  .contact-card {
    padding: 20px;
  }
}
</style>
