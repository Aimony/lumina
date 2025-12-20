<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface TechCard {
  icon: string
  name: string
  desc: string
  tags: string[]
}

const techStacks: TechCard[] = [
  {
    icon: '☕',
    name: 'Java',
    desc: 'JavaSE、JavaEE、JUC',
    tags: ['JavaSE', 'JavaEE', 'JUC']
  },
  {
    icon: '🍃',
    name: 'Spring全家桶',
    desc: 'Spring、SpringBoot、MyBatis',
    tags: ['Spring', 'SpringBoot', 'MyBatis']
  },
  {
    icon: '🗄️',
    name: '数据库',
    desc: 'MySQL、声明式开发、分库分表',
    tags: ['MySQL', '声明式开发', '分库分表']
  },
  {
    icon: '☁️',
    name: 'Spring Cloud Alibaba',
    desc: '注册中心、网关、配置中心、熔断、限流、降级',
    tags: ['注册中心', '网关', '配置中心']
  },
  {
    icon: '📦',
    name: 'Redis',
    desc: '数据类型、缓存失效、缓存淘汰、缓存击穿',
    tags: ['数据类型', '缓存', '高并发']
  },
  {
    icon: '🐧',
    name: 'Linux',
    desc: 'Linux、Ubuntu、CentOS',
    tags: ['Linux', 'Ubuntu', 'CentOS']
  },
  {
    icon: '🐳',
    name: '容器',
    desc: 'Docker、Docker-Compose',
    tags: ['Docker', 'Docker-Compose']
  },
  {
    icon: '🌐',
    name: 'Nginx',
    desc: 'Nginx、OpenResty',
    tags: ['Nginx', 'OpenResty']
  }
]
</script>

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-container">
        <!-- Left: Title and CTA -->
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="title-line">Aimony's Knowledge</span>
          </h1>
          <p class="hero-subtitle">好记性不如笔头</p>
          
          <div class="hero-actions">
            <RouterLink to="/guide/intro" class="btn-primary">
              为什么会有这个知识库?
            </RouterLink>
            <RouterLink to="/guide" class="btn-secondary">
              关于
            </RouterLink>
          </div>
        </div>
        
        <!-- Right: Avatar Card -->
        <div class="avatar-card">
          <div class="avatar-wrapper">
            <img src="/avatar.png" alt="Aimony Avatar" class="avatar-image" />
          </div>
        </div>
      </div>
    </section>

    <!-- Tech Stack Grid -->
    <section class="tech-section">
      <div class="tech-grid">
        <div 
          v-for="tech in techStacks" 
          :key="tech.name"
          class="tech-card"
        >
          <div class="tech-icon">{{ tech.icon }}</div>
          <h3 class="tech-name">{{ tech.name }}</h3>
          <p class="tech-desc">{{ tech.desc }}</p>
          <div class="tech-tags">
            <span 
              v-for="tag in tech.tags" 
              :key="tag"
              class="tech-tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, 
    hsl(210, 100%, 97%) 0%, 
    hsl(330, 100%, 97%) 50%, 
    hsl(210, 100%, 97%) 100%
  );
  padding: 2rem 1rem;
}

.dark .home-page {
  background: linear-gradient(135deg, 
    hsl(220, 40%, 8%) 0%, 
    hsl(280, 30%, 12%) 50%, 
    hsl(220, 40%, 8%) 100%
  );
}

/* Hero Section */
.hero-section {
  max-width: 1200px;
  margin: 0 auto 4rem;
  padding: 4rem 2rem;
}

.hero-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
  background: linear-gradient(120deg, #0ea5e9, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 6s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.hero-subtitle {
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  font-weight: 400;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 0.875rem 2rem;
  border-radius: 2rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-block;
  font-size: 0.95rem;
}

.btn-primary {
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
  color: white;
  border: 2px solid transparent;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(14, 165, 233, 0.3);
}

.btn-secondary {
  background: transparent;
  color: var(--color-text);
  border: 2px solid var(--color-border);
}

.btn-secondary:hover {
  border-color: #8b5cf6;
  color: #8b5cf6;
  transform: translateY(-2px);
}

/* Avatar Card */
.avatar-card {
  position: relative;
  perspective: 1000px;
}

.avatar-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  transition: all 0.4s ease;
}

.dark .avatar-wrapper {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.avatar-wrapper:hover {
  transform: translateY(-8px) rotateY(5deg);
  box-shadow: 0 30px 80px rgba(139, 92, 246, 0.2);
}

.avatar-image {
  width: 100%;
  height: auto;
  border-radius: 1.5rem;
  display: block;
}

/* Tech Section */
.tech-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.tech-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 1.5rem;
  padding: 2rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.dark .tech-card {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tech-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.3);
}

.tech-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.tech-card:nth-child(2n) .tech-icon {
  animation-delay: 0.5s;
}

.tech-card:nth-child(3n) .tech-icon {
  animation-delay: 1s;
}

.tech-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.tech-desc {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-tag {
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 1rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.tech-tag:hover {
  background: rgba(139, 92, 246, 0.2);
  color: var(--color-text);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.25rem;
  }
  
  .avatar-wrapper {
    max-width: 300px;
  }
  
  .tech-grid {
    grid-template-columns: 1fr;
  }
}
</style>
