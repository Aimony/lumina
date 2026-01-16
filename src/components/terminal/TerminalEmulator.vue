<script setup lang="ts">
import { ref, nextTick, onMounted, watch, computed } from 'vue'
import { useTerminal } from '@/composables/terminal/useTerminal'
import type { OutputLine } from '@/composables/terminal/types'

const {
  output,
  currentPath,
  executeCommand,
  getPrompt,
  navigateHistory,
  getCompletions,
  clearTerminal
} = useTerminal()

const inputRef = ref<HTMLInputElement | null>(null)
const terminalRef = ref<HTMLElement | null>(null)
const currentInput = ref('')
const completionIndex = ref(-1)
const completions = ref<string[]>([])

// 当前提示符
const prompt = computed(() => getPrompt())

// 处理输入
const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  currentInput.value = target.value
  completionIndex.value = -1
}

// 处理回车
const handleSubmit = async () => {
  await executeCommand(currentInput.value)
  currentInput.value = ''
  completionIndex.value = -1
  completions.value = []
  await nextTick()
  scrollToBottom()
}

// 处理键盘事件
const handleKeyDown = async (e: KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault()
      const prevCmd = navigateHistory('up')
      if (prevCmd) currentInput.value = prevCmd
      break

    case 'ArrowDown':
      e.preventDefault()
      const nextCmd = navigateHistory('down')
      currentInput.value = nextCmd
      break

    case 'Tab':
      e.preventDefault()
      handleTabCompletion()
      break

    case 'l':
      if (e.ctrlKey) {
        e.preventDefault()
        clearTerminal()
      }
      break

    case 'c':
      if (e.ctrlKey) {
        e.preventDefault()
        output.value.push({
          type: 'command',
          content: `${prompt.value} ${currentInput.value}^C`,
          timestamp: Date.now()
        })
        currentInput.value = ''
      }
      break
  }
}

// Tab 补全
const handleTabCompletion = () => {
  const available = getCompletions(currentInput.value)

  if (available.length === 0) return

  if (available.length === 1) {
    // 单一匹配，直接补全
    const parts = currentInput.value.split(' ')
    parts[parts.length - 1] = available[0]
    currentInput.value = parts.join(' ')
  } else {
    // 多个匹配，显示选项
    completions.value = available
    output.value.push({
      type: 'info',
      content: available.join('  '),
      timestamp: Date.now()
    })
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (terminalRef.value) {
    terminalRef.value.scrollTop = terminalRef.value.scrollHeight
  }
}

// 聚焦输入框
const focusInput = () => {
  inputRef.value?.focus()
}

// 获取输出行的 CSS 类
const getOutputClass = (line: OutputLine): string => {
  const classes: Record<string, string> = {
    command: 'output-command',
    output: 'output-text',
    error: 'output-error',
    info: 'output-info',
    ascii: 'output-ascii'
  }
  return classes[line.type] || 'output-text'
}

// 监听输出变化，自动滚动
watch(
  () => output.value.length,
  () => {
    nextTick(scrollToBottom)
  }
)

// 挂载时聚焦
onMounted(() => {
  focusInput()
})
</script>

<template>
  <div class="terminal-emulator" @click="focusInput" ref="terminalRef">
    <!-- 终端头部 -->
    <div class="terminal-header">
      <div class="terminal-buttons">
        <span class="btn-close"></span>
        <span class="btn-minimize"></span>
        <span class="btn-maximize"></span>
      </div>
      <div class="terminal-title">lumina@blog: {{ currentPath }}</div>
    </div>

    <!-- 输出区域 -->
    <div class="terminal-body">
      <div class="terminal-output">
        <div
          v-for="(line, index) in output"
          :key="index"
          :class="['output-line', getOutputClass(line)]"
        >
          <pre v-if="line.type === 'ascii'" class="ascii-art">{{ line.content }}</pre>
          <span v-else>{{ line.content }}</span>
        </div>
      </div>

      <!-- 输入行 -->
      <div class="terminal-input-line">
        <span class="prompt">{{ prompt }}</span>
        <input
          ref="inputRef"
          type="text"
          class="terminal-input"
          v-model="currentInput"
          @input="handleInput"
          @keydown="handleKeyDown"
          @keydown.enter="handleSubmit"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
        />
        <span class="cursor"></span>
      </div>
    </div>

    <!-- 扫描线效果 -->
    <div class="scanlines"></div>
  </div>
</template>

<style lang="scss" scoped>
// 终端颜色变量
$terminal-bg: #0a0a0a;
$terminal-fg: #00ff00;
$terminal-dim: #00aa00;
$terminal-error: #ff4444;
$terminal-info: #44aaff;
$terminal-header-bg: #1a1a1a;
$terminal-glow: 0 0 10px rgba(0, 255, 0, 0.3);

.terminal-emulator {
  width: 100%;
  height: 100%;
  background: $terminal-bg;
  color: $terminal-fg;
  font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-y: auto;
  position: relative;
  cursor: text;

  // CRT 效果
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
    pointer-events: none;
    z-index: 10;
  }
}

// 扫描线
.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15) 0px,
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 11;
  animation: scanline 8s linear infinite;
}

@keyframes scanline {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 0 100vh;
  }
}

// 终端头部
.terminal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: $terminal-header-bg;
  border-bottom: 1px solid #333;
  position: sticky;
  top: 0;
  z-index: 5;
}

.terminal-buttons {
  display: flex;
  gap: 6px;

  span {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .btn-close {
    background: #ff5f56;
  }

  .btn-minimize {
    background: #ffbd2e;
  }

  .btn-maximize {
    background: #27c93f;
  }
}

.terminal-title {
  flex: 1;
  text-align: center;
  color: #888;
  font-size: 12px;
}

// 终端主体
.terminal-body {
  padding: 16px;
  min-height: calc(100% - 40px);
}

// 输出区域
.terminal-output {
  .output-line {
    white-space: pre-wrap;
    word-break: break-all;
    margin-bottom: 2px;
  }
}

.output-command {
  color: $terminal-dim;
}

.output-text {
  color: $terminal-fg;
  text-shadow: $terminal-glow;
}

.output-error {
  color: $terminal-error;
}

.output-info {
  color: $terminal-info;
}

.output-ascii {
  .ascii-art {
    font-size: 10px;
    line-height: 1.2;
    color: $terminal-fg;
    text-shadow: $terminal-glow;
    margin: 0;

    @media (max-width: 640px) {
      font-size: 6px;
      line-height: 1.1;
    }
  }
}

// 输入行
.terminal-input-line {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.prompt {
  color: $terminal-info;
  margin-right: 8px;
  user-select: none;
}

.terminal-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: $terminal-fg;
  font-family: inherit;
  font-size: inherit;
  caret-color: $terminal-fg;
  text-shadow: $terminal-glow;

  &::selection {
    background: rgba(0, 255, 0, 0.3);
  }
}

// 光标闪烁
.cursor {
  display: inline-block;
  width: 8px;
  height: 1.2em;
  background: $terminal-fg;
  animation: blink 1s step-end infinite;
  margin-left: 2px;
  vertical-align: middle;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

// 响应式
@media (max-width: 640px) {
  .terminal-emulator {
    font-size: 12px;
  }

  .terminal-body {
    padding: 12px;
  }
}

// 滚动条样式
.terminal-emulator::-webkit-scrollbar {
  width: 8px;
}

.terminal-emulator::-webkit-scrollbar-track {
  background: #111;
}

.terminal-emulator::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;

  &:hover {
    background: #444;
  }
}
</style>
