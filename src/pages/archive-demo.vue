<script setup lang="ts">
import { ref } from 'vue'
import ArchiveViewer from '../components/common/ArchiveViewer.vue'

const selectedFile = ref<File | null>(null)

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

// 关闭预览
const closeViewer = () => {
  selectedFile.value = null
}

// 示例:创建一个测试zip文件的链接
const createTestZip = async () => {
  try {
    // 这里可以使用JSZip创建一个示例zip文件
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    // 添加一些示例文件
    zip.file('README.md', '# 测试压缩包\n\n这是一个演示用的压缩包文件。')
    zip.file('docs/guide.md', '# 使用指南\n\n这是使用指南。')
    zip.file('docs/api.md', '# API文档\n\n这是API文档。')
    zip.file('src/index.js', 'console.log("Hello World")')
    zip.file('src/utils/helper.js', 'export const helper = () => {}')

    // 生成zip文件
    const blob = await zip.generateAsync({ type: 'blob' })
    const file = new File([blob], 'test-archive.zip', { type: 'application/zip' })
    selectedFile.value = file
  } catch (error) {
    console.error('创建测试zip失败:', error)
  }
}
</script>

<template>
  <div class="archive-demo-page">
    <div class="demo-container">
      <h1 class="demo-title">压缩包预览组件演示</h1>
      <p class="demo-description">选择或创建一个ZIP文件来测试压缩包预览功能</p>

      <div class="demo-actions">
        <!-- 文件选择 -->
        <div class="file-input-wrapper">
          <input
            id="file-input"
            type="file"
            accept=".zip"
            @change="handleFileSelect"
            class="file-input"
          />
          <label for="file-input" class="file-input-label">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-width="2" />
              <polyline points="17 8 12 3 7 8" stroke-width="2" />
              <line x1="12" y1="3" x2="12" y2="15" stroke-width="2" />
            </svg>
            选择 ZIP 文件
          </label>
        </div>

        <!-- 创建测试文件 -->
        <button @click="createTestZip" class="demo-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke-width="2" />
            <polyline points="13 2 13 9 20 9" stroke-width="2" />
          </svg>
          创建测试文件
        </button>
      </div>

      <!-- 功能说明 -->
      <div class="feature-list">
        <h2>功能特性</h2>
        <ul>
          <li>✅ 树状文件列表展示</li>
          <li>✅ 文件夹展开/折叠</li>
          <li>✅ 文件大小和修改时间显示</li>
          <li>✅ 实时文件搜索/过滤</li>
          <li>✅ 单个文件下载</li>
          <li>✅ 完整压缩包下载</li>
          <li>✅ 亮色/暗色主题支持</li>
          <li>✅ 响应式移动端适配</li>
        </ul>
      </div>

      <!-- 使用说明 -->
      <div class="usage-guide">
        <h2>使用方法</h2>
        <div class="code-block">
          <pre><code>&lt;script setup&gt;
import { ref } from 'vue'
import ArchiveViewer from '@/components/common/ArchiveViewer.vue'

const archiveFile = ref(null)

const openArchive = (file) => {
  archiveFile.value = file
}
&lt;/script&gt;

&lt;template&gt;
  &lt;ArchiveViewer 
    :file="archiveFile" 
    @close="archiveFile = null" 
  /&gt;
&lt;/template&gt;</code></pre>
        </div>
      </div>
    </div>

    <!-- 压缩包预览器 -->
    <ArchiveViewer :file="selectedFile" @close="closeViewer" />
  </div>
</template>

<style scoped>
.archive-demo-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.demo-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

:global(.dark) .demo-container {
  background: #1a1a1a;
}

.demo-title {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
  text-align: center;
}

:global(.dark) .demo-title {
  color: #fff;
}

.demo-description {
  font-size: 16px;
  color: #666;
  text-align: center;
  margin-bottom: 32px;
}

:global(.dark) .demo-description {
  color: #999;
}

.demo-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.file-input-wrapper {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.file-input-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #3498db;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.file-input-label:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
}

.demo-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #9b59b6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(155, 89, 182, 0.3);
}

.demo-btn:hover {
  background: #8e44ad;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(155, 89, 182, 0.4);
}

.feature-list,
.usage-guide {
  margin-top: 32px;
}

.feature-list h2,
.usage-guide h2 {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
}

:global(.dark) .feature-list h2,
:global(.dark) .usage-guide h2 {
  color: #fff;
}

.feature-list ul {
  list-style: none;
  padding: 0;
}

.feature-list li {
  padding: 8px 0;
  color: #555;
  font-size: 15px;
}

:global(.dark) .feature-list li {
  color: #ccc;
}

.code-block {
  background: #2d2d2d;
  border-radius: 8px;
  padding: 20px;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.code-block code {
  color: #e6e6e6;
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .demo-container {
    padding: 24px;
  }

  .demo-title {
    font-size: 24px;
  }

  .demo-actions {
    flex-direction: column;
  }

  .file-input-label,
  .demo-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
