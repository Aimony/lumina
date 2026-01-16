import type { Command, CommandContext, FileNode } from './types'
import { useRouter } from 'vue-router'
import { useVirtualFileSystem } from './useVirtualFileSystem'

const { resolvePath, findNode, listDirectory, getFileRoute } = useVirtualFileSystem()

// ASCII Art Logo
const LOGO_ASCII = `
██╗     ██╗   ██╗███╗   ███╗██╗███╗   ██╗ █████╗ 
██║     ██║   ██║████╗ ████║██║████╗  ██║██╔══██╗
██║     ██║   ██║██╔████╔██║██║██╔██╗ ██║███████║
██║     ██║   ██║██║╚██╔╝██║██║██║╚██╗██║██╔══██║
███████╗╚██████╔╝██║ ╚═╝ ██║██║██║ ╚████║██║  ██║
╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝
`

// help 命令
const helpCommand: Command = {
  name: 'help',
  description: '显示可用命令列表',
  execute: (args, ctx) => {
    const commands = Object.values(commandRegistry)

    ctx.output.value.push({
      type: 'info',
      content: '📋 可用命令列表:',
      timestamp: Date.now()
    })

    for (const cmd of commands) {
      ctx.output.value.push({
        type: 'output',
        content: `  ${cmd.name.padEnd(12)} - ${cmd.description}`,
        timestamp: Date.now()
      })
    }

    ctx.output.value.push({
      type: 'info',
      content: '\n💡 提示: 使用 Tab 键自动补全，↑/↓ 浏览历史命令',
      timestamp: Date.now()
    })
  }
}

// ls 命令
const lsCommand: Command = {
  name: 'ls',
  description: '列出目录内容',
  usage: 'ls [目录路径]',
  execute: (args, ctx) => {
    const targetPath = args[0] ? resolvePath(ctx.currentPath.value, args[0]) : ctx.currentPath.value

    const entries = listDirectory(targetPath)

    if (!entries) {
      ctx.output.value.push({
        type: 'error',
        content: `ls: 无法访问 '${args[0] || targetPath}': 目录不存在`,
        timestamp: Date.now()
      })
      return
    }

    if (entries.length === 0) {
      ctx.output.value.push({
        type: 'output',
        content: '(空目录)',
        timestamp: Date.now()
      })
      return
    }

    // 按类型排序：目录在前，文件在后
    const sorted = [...entries].sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })

    // 格式化输出
    const output = sorted
      .map((entry) => {
        const icon = entry.type === 'directory' ? '📁' : '📄'
        const name = entry.type === 'directory' ? `${entry.name}/` : entry.name
        const title = entry.title ? ` (${entry.title})` : ''
        return `${icon} ${name}${title}`
      })
      .join('\n')

    ctx.output.value.push({
      type: 'output',
      content: output,
      timestamp: Date.now()
    })
  }
}

// cd 命令
const cdCommand: Command = {
  name: 'cd',
  description: '切换目录',
  usage: 'cd <目录路径>',
  execute: (args, ctx) => {
    if (!args[0]) {
      ctx.currentPath.value = '/'
      return
    }

    const targetPath = resolvePath(ctx.currentPath.value, args[0])
    const node = findNode(targetPath)

    if (!node) {
      ctx.output.value.push({
        type: 'error',
        content: `cd: 目录 '${args[0]}' 不存在`,
        timestamp: Date.now()
      })
      return
    }

    if (node.type !== 'directory') {
      ctx.output.value.push({
        type: 'error',
        content: `cd: '${args[0]}' 不是目录`,
        timestamp: Date.now()
      })
      return
    }

    ctx.currentPath.value = targetPath
  }
}

// pwd 命令
const pwdCommand: Command = {
  name: 'pwd',
  description: '显示当前路径',
  execute: (_args, ctx) => {
    ctx.output.value.push({
      type: 'output',
      content: ctx.currentPath.value,
      timestamp: Date.now()
    })
  }
}

// cat 命令
const catCommand: Command = {
  name: 'cat',
  description: '查看文件内容',
  usage: 'cat <文件路径>',
  execute: (args, ctx) => {
    if (!args[0]) {
      ctx.output.value.push({
        type: 'error',
        content: 'cat: 缺少文件参数',
        timestamp: Date.now()
      })
      return
    }

    const targetPath = resolvePath(ctx.currentPath.value, args[0])
    const node = findNode(targetPath)

    if (!node) {
      ctx.output.value.push({
        type: 'error',
        content: `cat: 文件 '${args[0]}' 不存在`,
        timestamp: Date.now()
      })
      return
    }

    if (node.type !== 'file') {
      ctx.output.value.push({
        type: 'error',
        content: `cat: '${args[0]}' 是目录，请使用 ls 命令查看`,
        timestamp: Date.now()
      })
      return
    }

    // 显示文件信息
    ctx.output.value.push({
      type: 'info',
      content: `📄 文件: ${node.name}`,
      timestamp: Date.now()
    })

    if (node.title) {
      ctx.output.value.push({
        type: 'output',
        content: `📌 标题: ${node.title}`,
        timestamp: Date.now()
      })
    }

    ctx.output.value.push({
      type: 'info',
      content: `\n💡 使用 'open ${args[0]}' 在浏览器中查看完整内容`,
      timestamp: Date.now()
    })
  }
}

// clear 命令
const clearCommand: Command = {
  name: 'clear',
  description: '清空终端',
  execute: (_args, ctx) => {
    ctx.output.value = []
  }
}

// tree 命令
const treeCommand: Command = {
  name: 'tree',
  description: '显示目录树结构',
  usage: 'tree [目录路径]',
  execute: (args, ctx) => {
    const targetPath = args[0] ? resolvePath(ctx.currentPath.value, args[0]) : ctx.currentPath.value

    const node = findNode(targetPath)

    if (!node) {
      ctx.output.value.push({
        type: 'error',
        content: `tree: 目录 '${args[0] || targetPath}' 不存在`,
        timestamp: Date.now()
      })
      return
    }

    if (node.type !== 'directory') {
      ctx.output.value.push({
        type: 'error',
        content: `tree: '${args[0]}' 不是目录`,
        timestamp: Date.now()
      })
      return
    }

    function buildTree(node: FileNode, prefix: string = ''): string[] {
      const lines: string[] = []
      const children = node.children || []

      children.forEach((child, index) => {
        const isLast = index === children.length - 1
        const connector = isLast ? '└── ' : '├── '
        const icon = child.type === 'directory' ? '📁' : '📄'

        lines.push(`${prefix}${connector}${icon} ${child.name}`)

        if (child.type === 'directory' && child.children) {
          const newPrefix = prefix + (isLast ? '    ' : '│   ')
          lines.push(...buildTree(child, newPrefix))
        }
      })

      return lines
    }

    const treeLines = buildTree(node)
    ctx.output.value.push({
      type: 'output',
      content: `📁 ${node.name === 'root' ? '/' : node.name}\n${treeLines.join('\n')}`,
      timestamp: Date.now()
    })
  }
}

// open 命令 - 在浏览器中打开文章
const openCommand: Command = {
  name: 'open',
  description: '在博客中打开文章',
  usage: 'open <文件路径>',
  execute: (args, ctx) => {
    if (!args[0]) {
      ctx.output.value.push({
        type: 'error',
        content: 'open: 缺少文件参数',
        timestamp: Date.now()
      })
      return
    }

    const targetPath = resolvePath(ctx.currentPath.value, args[0])
    const node = findNode(targetPath)

    if (!node) {
      ctx.output.value.push({
        type: 'error',
        content: `open: 文件 '${args[0]}' 不存在`,
        timestamp: Date.now()
      })
      return
    }

    if (node.type !== 'file') {
      ctx.output.value.push({
        type: 'error',
        content: `open: '${args[0]}' 是目录，请指定文件`,
        timestamp: Date.now()
      })
      return
    }

    const route = getFileRoute(targetPath)
    ctx.output.value.push({
      type: 'info',
      content: `🚀 正在打开: ${node.title || node.name}...`,
      timestamp: Date.now()
    })

    // 使用路由导航
    ctx.navigateTo(route)
  }
}

// neofetch 命令 - 显示博客信息
const neofetchCommand: Command = {
  name: 'neofetch',
  description: '显示博客系统信息',
  execute: (_args, ctx) => {
    const info = [
      '',
      `       ╭────────────────────────╮`,
      `       │   🌟 Lumina Blog 🌟   │`,
      `       ╰────────────────────────╯`,
      '',
      `  💻 技术栈    Vue 3 + TypeScript + Vite`,
      `  📝 文档格式   Markdown + Frontmatter`,
      `  🎨 主题      Dark / Light`,
      `  📁 文章目录   /docs`,
      `  🔗 终端模式   /terminal`,
      '',
      `  📊 统计信息`,
      `     ├── 分类: AIGC, Frontend, Backend`,
      `     ├── 功能: 代码高亮, LaTeX, Mermaid`,
      `     └── 特性: PWA, SEO, 响应式`,
      ''
    ]

    ctx.output.value.push({
      type: 'ascii',
      content: LOGO_ASCII,
      timestamp: Date.now()
    })

    ctx.output.value.push({
      type: 'output',
      content: info.join('\n'),
      timestamp: Date.now()
    })
  }
}

// 命令注册表
const commandRegistry: Record<string, Command> = {
  help: helpCommand,
  ls: lsCommand,
  cd: cdCommand,
  pwd: pwdCommand,
  cat: catCommand,
  clear: clearCommand,
  tree: treeCommand,
  open: openCommand,
  neofetch: neofetchCommand
}

// 解析命令行
export function parseCommandLine(input: string): { command: string; args: string[] } {
  const trimmed = input.trim()
  const parts = trimmed.split(/\s+/)
  const command = parts[0] || ''
  const args = parts.slice(1)
  return { command, args }
}

// 获取命令
export function getCommand(name: string): Command | null {
  return commandRegistry[name] || null
}

// 获取所有命令（用于自动补全）
export function getAllCommands(): string[] {
  return Object.keys(commandRegistry)
}

// 获取欢迎消息
export function getWelcomeMessage() {
  return [
    {
      type: 'ascii' as const,
      content: LOGO_ASCII,
      timestamp: Date.now()
    },
    {
      type: 'info' as const,
      content: '欢迎来到 Lumina 终端模式! 🖥️',
      timestamp: Date.now()
    },
    {
      type: 'output' as const,
      content: '输入 "help" 查看可用命令，或输入 "ls" 浏览博客目录。',
      timestamp: Date.now()
    },
    {
      type: 'output' as const,
      content: '',
      timestamp: Date.now()
    }
  ]
}
