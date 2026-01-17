import { ref, nextTick } from 'vue'

export type MessageType = 'success' | 'info' | 'warning' | 'error'

export interface MessageOptions {
  content: string
  type?: MessageType
  duration?: number
  closable?: boolean
}

interface MessageInstance {
  id: number
  el: HTMLElement
  timer: ReturnType<typeof setTimeout> | null
}

// 消息队列
const messages = ref<MessageInstance[]>([])
let messageId = 0

// 消息容器
let containerEl: HTMLElement | null = null

// 图标 SVG
const icons: Record<MessageType, string> = {
  success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
}

/**
 * 确保消息容器存在
 */
function ensureContainer(): HTMLElement {
  if (!containerEl) {
    containerEl = document.createElement('div')
    containerEl.className = 'message-container'
    document.body.appendChild(containerEl)
  }
  return containerEl
}

/**
 * 更新所有消息的位置
 */
function updatePositions() {
  const container = ensureContainer()
  const children = container.children
  let offset = 0

  for (let i = 0; i < children.length; i++) {
    const el = children[i] as HTMLElement
    el.style.transform = `translateX(-50%) translateY(${offset}px)`
    offset += el.offsetHeight + 12 // 12px 间距
  }
}

/**
 * 关闭指定消息
 */
function closeMessage(id: number) {
  const index = messages.value.findIndex((m) => m.id === id)
  if (index === -1) return

  const msg = messages.value[index]
  if (!msg) return

  // 清除定时器
  if (msg.timer) {
    clearTimeout(msg.timer)
  }

  // 添加离场动画
  msg.el.classList.add('message-leave')

  // 动画结束后移除元素
  setTimeout(() => {
    msg.el.remove()
    messages.value.splice(index, 1)
    updatePositions()
  }, 300)
}

/**
 * 显示消息
 */
function showMessage(options: MessageOptions | string, type: MessageType = 'info') {
  const opts: MessageOptions =
    typeof options === 'string'
      ? { content: options, type }
      : { ...options, type: options.type || type }

  const { content, duration = 2000, closable = false } = opts
  const msgType = opts.type || 'info'

  const container = ensureContainer()
  const id = ++messageId

  // 创建消息元素
  const el = document.createElement('div')
  el.className = `message message-${msgType}`
  el.innerHTML = `
    <span class="message-icon">${icons[msgType]}</span>
    <span class="message-content">${content}</span>
    ${closable ? '<button class="message-close" aria-label="关闭">×</button>' : ''}
  `

  // 绑定关闭按钮事件
  if (closable) {
    const closeBtn = el.querySelector('.message-close')
    closeBtn?.addEventListener('click', () => closeMessage(id))
  }

  // 添加到容器
  container.appendChild(el)

  // 设置自动关闭定时器
  const timer = duration > 0 ? setTimeout(() => closeMessage(id), duration) : null

  // 记录消息实例
  const instance: MessageInstance = { id, el, timer }
  messages.value.push(instance)

  // 等待下一帧后更新位置并触发入场动画
  nextTick(() => {
    updatePositions()
    // 触发入场动画
    requestAnimationFrame(() => {
      el.classList.add('message-enter')
    })
  })

  return id
}

/**
 * 消息提示 API
 */
export const message = {
  success: (options: MessageOptions | string) => showMessage(options, 'success'),
  info: (options: MessageOptions | string) => showMessage(options, 'info'),
  warning: (options: MessageOptions | string) => showMessage(options, 'warning'),
  error: (options: MessageOptions | string) => showMessage(options, 'error'),
  close: closeMessage,
  closeAll: () => {
    messages.value.forEach((m) => closeMessage(m.id))
  }
}

export function useMessage() {
  return message
}
