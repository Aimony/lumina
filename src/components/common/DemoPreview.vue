<script setup lang="ts">
import { ref, computed, shallowRef, watch, nextTick, onUnmounted } from 'vue'

const props = defineProps<{
  path: string
  source: string
  title?: string
  description?: string
  type?: 'vue' | 'react' | 'html'
  highlightedCode?: string
}>()

const copied = ref(false)
const showCode = ref(false)

// 动态导入所有 demos 目录下的组件
const vueModules = import.meta.glob('/src/demos/**/*.vue')

const component = shallowRef<any>(null)
const error = ref<string | null>(null)
const htmlContainer = ref<HTMLElement | null>(null)
let reactRoot: any = null // Store React root

const normalizedPath = computed(() => props.path)

watch(() => props.path, loadDemo, { immediate: true })

async function loadDemo() {
  error.value = null
  component.value = null

  if (props.type === 'vue') {
    await loadVueComponent()
  } else if (props.type === 'react') {
    await loadReactComponent()
  } else if (props.type === 'html') {
    await renderHtml(decodeURIComponent(props.source))
  } else {
    // Default to Vue if type is missing or unknown, but try to infer from extension if possible
    if (props.path.endsWith('.tsx') || props.path.endsWith('.jsx')) {
      await loadReactComponent()
    } else if (props.path.endsWith('.html')) {
      await renderHtml(decodeURIComponent(props.source))
    } else {
      await loadVueComponent()
    }
  }
}

async function loadVueComponent() {
  const path = normalizedPath.value
  const loader = vueModules[path]
  if (!loader) {
    error.value = `Vue Component not found: ${path}`
    return
  }
  try {
    const mod: any = await loader()
    component.value = mod.default
  } catch (e: any) {
    error.value = `Failed to load Vue component: ${e.message}`
  }
}

async function loadReactComponent() {
  // 仅显示代码，不尝试加载 React 组件
  // error.value = null // 不设置 error，让模板有机会渲染“非错误”状态（如果需要）
  // 但我们的模板逻辑是 v-if="!error && type === 'react'"
  // 我们不需要做任何事，只需让组件保持 null，并在模板中处理 type === 'react' 的情况
}

async function renderHtml(htmlContent: string) {
  nextTick(() => {
    if (htmlContainer.value) {
      // 使用 Shadow DOM 隔离样式
      if (!htmlContainer.value.shadowRoot) {
        htmlContainer.value.attachShadow({ mode: 'open' })
      }
      if (htmlContainer.value.shadowRoot) {
        htmlContainer.value.shadowRoot.innerHTML = htmlContent
      }
    }
  })
}

onUnmounted(() => {
  if (reactRoot) {
    reactRoot.unmount()
  }
})

async function copyCode() {
  try {
    const code = decodeURIComponent(props.source)
    await navigator.clipboard.writeText(code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy', err)
  }
}

const decodedSource = computed(() => {
  try {
    return decodeURIComponent(props.source)
  } catch (e) {
    return props.source
  }
})

const decodedTitle = computed(() => (props.title ? decodeURIComponent(props.title) : ''))
const decodedDesc = computed(() => (props.description ? decodeURIComponent(props.description) : ''))

const decodedHighlightedCode = computed(() => {
  if (!props.highlightedCode) return ''
  try {
    return decodeURIComponent(props.highlightedCode)
  } catch (e) {
    return props.highlightedCode
  }
})

// StackBlitz Integration
function openStackBlitz() {
  const code = decodedSource.value
  const title = decodedTitle.value || 'Demo'

  // Determine template based on type
  let template = 'node' // default
  let files: Record<string, string> = {}

  if (props.type === 'vue' || (!props.type && props.path.endsWith('.vue'))) {
    template = 'node' // Using node template with vite for better compatibility
    files = {
      'src/App.vue': code,
      'src/main.js': `import { createApp } from 'vue'; import App from './App.vue'; createApp(App).mount('#app');`,
      'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + Vue</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"><\/script>
  </body>
</html>`,
      'package.json': JSON.stringify(
        {
          name: 'vite-vue-starter',
          private: true,
          version: '0.0.0',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview'
          },
          dependencies: {
            vue: '^3.2.45'
          },
          devDependencies: {
            '@vitejs/plugin-vue': '^4.0.0',
            vite: '^4.0.0'
          }
        },
        null,
        2
      ),
      'vite.config.js': `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
})`
    }
  } else if (props.type === 'react' || props.path.endsWith('.tsx')) {
    template = 'create-react-app'
    files = {
      'src/App.tsx': code,
      'src/index.tsx': `import React from 'react'; import ReactDOM from 'react-dom/client'; import App from './App'; const root = ReactDOM.createRoot(document.getElementById('root')); root.render(<App />);`,
      'public/index.html': `<div id="root"></div>`,
      'package.json': JSON.stringify({
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0',
          'react-scripts': '5.0.1'
        },
        scripts: { start: 'react-scripts start', build: 'react-scripts build' },
        main: 'src/index.tsx'
      })
    }
  } else {
    // HTML
    template = 'javascript' // Simple static/js
    files = {
      'index.html': code,
      'index.js': ''
    }
  }

  // Construct form for POST request
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = 'https://stackblitz.com/run'
  form.target = '_blank'

  const inputTemplate = document.createElement('input')
  inputTemplate.type = 'hidden'
  inputTemplate.name = 'project[template]'
  inputTemplate.value = template
  form.appendChild(inputTemplate)

  const inputTitle = document.createElement('input')
  inputTitle.type = 'hidden'
  inputTitle.name = 'project[title]'
  inputTitle.value = title
  form.appendChild(inputTitle)

  Object.entries(files).forEach(([filename, content]) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = `project[files][${filename}]`
    input.value = content
    form.appendChild(input)
  })

  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
}

// CodeSandbox Integration
async function openCodeSandbox() {
  const code = decodedSource.value
  const title = decodedTitle.value || 'Demo'

  let files: Record<string, { content: string }> = {}

  if (props.type === 'vue' || (!props.type && props.path.endsWith('.vue'))) {
    files = {
      'src/App.vue': { content: code },
      'src/main.js': {
        content: `import { createApp } from 'vue';
import App from './App.vue';
import './style.css'; 

createApp(App).mount('#app');`
      },
      'src/style.css': {
        content: `
body { font-family: sans-serif; }
#app { padding: 20px; }
`
      },
      'index.html': {
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + Vue</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"><\/script>
  </body>
</html>`
      },
      'package.json': {
        content: JSON.stringify(
          {
            name: 'vue-demo',
            version: '0.0.0',
            scripts: {
              dev: 'vite',
              build: 'vite build',
              preview: 'vite preview'
            },
            dependencies: {
              vue: '^3.3.4'
            },
            devDependencies: {
              '@vitejs/plugin-vue': '^4.2.3',
              vite: '^4.4.5'
            }
          },
          null,
          2
        )
      },
      'vite.config.js': {
        content: `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})`
      }
    }
  } else if (props.type === 'react' || props.path.endsWith('.tsx')) {
    files = {
      'src/App.tsx': { content: code },
      'src/index.tsx': {
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
      },
      'src/styles.css': {
        content: `body { font-family: sans-serif; padding: 2rem; }`
      },
      'public/index.html': {
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`
      },
      'package.json': {
        content: JSON.stringify(
          {
            name: 'react-demo',
            main: '/src/index.tsx',
            dependencies: {
              react: '^18.2.0',
              'react-dom': '^18.2.0',
              'react-scripts': '5.0.1'
            },
            scripts: {
              start: 'react-scripts start',
              build: 'react-scripts build',
              test: 'react-scripts test',
              eject: 'react-scripts eject'
            },
            browserslist: {
              production: ['>0.2%', 'not dead', 'not op_mini all'],
              development: [
                'last 1 chrome version',
                'last 1 firefox version',
                'last 1 safari version'
              ]
            }
          },
          null,
          2
        )
      }
    }
  } else {
    // HTML
    files = {
      'index.html': { content: code },
      'package.json': {
        content: JSON.stringify(
          {
            name: 'static-demo',
            main: 'index.html'
          },
          null,
          2
        )
      }
    }
  }

  try {
    const response = await fetch('https://codesandbox.io/api/v1/sandboxes/define?json=1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ files })
    })

    const data = await response.json()
    if (data.sandbox_id) {
      window.open(`https://codesandbox.io/s/${data.sandbox_id}`, '_blank')
    } else {
      console.error('Failed to create CodeSandbox', data)
      alert('Failed to open CodeSandbox. Please try again.')
    }
  } catch (e) {
    console.error('Error opening CodeSandbox:', e)
    alert('Error opening CodeSandbox. Check console for details.')
  }
}

// Animation hooks
const onEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = '0'
  // Force reflow
  // eslint-disable-next-line no-unused-expressions
  element.offsetHeight
  element.style.height = `${element.scrollHeight}px`
}

const onAfterEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = 'auto'
}

const onLeave = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = `${element.scrollHeight}px`
  // Force reflow
  // eslint-disable-next-line no-unused-expressions
  element.offsetHeight
  element.style.height = '0'
}
</script>

<template>
  <div class="demo-preview">
    <div class="demo-header" v-if="decodedTitle">
      <h3 class="demo-title">{{ decodedTitle }}</h3>
      <p class="demo-desc" v-if="decodedDesc">{{ decodedDesc }}</p>
    </div>

    <div class="preview-container">
      <div v-if="error" class="error-msg">{{ error }}</div>

      <!-- Vue Component -->
      <component :is="component" v-if="!error && (type === 'vue' || !type)" />

      <!-- React Placeholder removed as requested -->

      <!-- HTML Container -->
      <div v-if="!error && type === 'html'" ref="htmlContainer"></div>

      <div v-if="!component && !error && type === 'vue'" class="loading">Loading...</div>
    </div>

    <div class="demo-actions">
      <div class="action-buttons">
        <button class="action-btn" title="Copy Code" @click="copyCode">
          <svg
            v-if="copied"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="icon-success"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <button
          class="action-btn"
          title="View Source"
          @click="showCode = !showCode"
          :class="{ active: showCode }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        </button>
        <button class="action-btn" title="Edit in StackBlitz" @click="openStackBlitz">
          <svg
            viewBox="64 64 896 896"
            focusable="false"
            data-icon="thunderbolt"
            width="16"
            height="16"
            fill="currentColor"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M848 359.3H627.7L825.8 109c4.1-5.3.4-13-6.3-13H436c-2.8 0-5.5 1.5-6.9 4L170 547.5c-3.1 5.3.7 12 6.9 12h174.4l-89.4 357.6c-1.9 7.8 7.5 13.3 13.3 7.7L853.5 373c5.2-4.9 1.7-13.7-5.5-13.7zM378.2 732.5l60.3-241H281.1l189.6-327.4h224.6L487 427.4h211L378.2 732.5z"
            ></path>
          </svg>
        </button>
        <button class="action-btn" title="Edit in CodeSandbox" @click="openCodeSandbox">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-codesandbox"
          >
            <path
              d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
            />
            <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
            <polyline points="7.5 19.79 7.5 14.6 3 12" />
            <polyline points="21 12 16.5 14.6 16.5 19.79" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" x2="12" y1="22.08" y2="12" />
          </svg>
        </button>
      </div>
    </div>

    <Transition name="expand" @enter="onEnter" @after-enter="onAfterEnter" @leave="onLeave">
      <div v-show="showCode" class="source-container">
        <div
          class="code-content-wrapper"
          v-if="decodedHighlightedCode"
          v-html="decodedHighlightedCode"
        ></div>
        <div class="code-content-wrapper" v-else>
          <pre class="code-block"><code>{{ decodedSource }}</code></pre>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.demo-preview {
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  margin: 1.5rem 0;
  overflow: hidden;
  background-color: var(--bg-card, #ffffff);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.demo-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  background-color: var(--bg-secondary, #f8fafc);
}

.demo-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary, #1e293b);
}

.demo-desc {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: var(--text-secondary, #64748b);
  line-height: 1.5;
}

.preview-container {
  padding: 2rem;
  background-color: var(--bg-card, #ffffff);
  min-height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  position: relative;
}

.demo-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem 1rem;
  background-color: var(--bg-card, #ffffff);
  border-bottom: 1px solid transparent;
}

/* Fallback for when source is visible */
/* Logic handled via JS or structure mostly */

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-secondary, #64748b);
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: var(--bg-hover, #f1f5f9);
  color: var(--primary-color, #3b82f6);
}

.action-btn.active {
  background-color: var(--bg-active, #e2e8f0);
  color: var(--primary-color, #3b82f6);
}

.icon-success {
  color: #10b981;
}

.source-container {
  margin: 0;
  transition: all 0.3s ease;
  border-top: 1px solid var(--border-color, #e2e8f0);
  background-color: var(--code-bg, #f6f8fa);
}

.code-content-wrapper {
  padding: 1rem;
  overflow-x: auto;
}

/* Ensure pre tags inside don't add extra margin */
.code-content-wrapper :deep(pre) {
  margin: 0;
  padding: 0;
  background-color: transparent !important;
}

.code-block {
  margin: 0;
  padding: 1.5rem;
  overflow-x: auto;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  color: #abb2bf;
  line-height: 1.6;
}

.error-msg {
  color: #ef4444;
}

.loading {
  color: var(--text-secondary, #94a3b8);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .demo-preview {
    border-color: #334155;
    background-color: #1e293b;
  }

  .demo-header {
    border-color: #334155;
    background-color: #0f172a;
  }

  .demo-title {
    color: #f1f5f9;
  }

  .demo-desc {
    color: #94a3b8;
  }

  .preview-container {
    background-color: #1e293b;
    border-color: #334155;
  }

  .demo-actions {
    border-color: #334155;
    background-color: #1e293b;
  }

  .action-btn {
    color: #94a3b8;
  }

  .action-btn:hover {
    background-color: #334155;
  }

  .action-btn.active {
    background-color: #475569;
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  height: 0;
}

.react-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  color: var(--text-secondary, #64748b);
}

.placeholder-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  opacity: 0.8;
}

.react-logo {
  animation: spin 10s linear infinite;
  width: 100%;
  height: 100%;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.action-btn-primary {
  margin-top: 16px;
  padding: 8px 16px;
  background-color: var(--primary-color, #3b82f6);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn-primary:hover {
  background-color: #2563eb;
}

@media (prefers-color-scheme: dark) {
  .source-container {
    border-top-color: #334155;
    background-color: #1e293b;
  }
}
</style>
