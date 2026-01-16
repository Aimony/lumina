import type { Ref } from 'vue'

// 文件系统节点类型
export interface FileNode {
  name: string
  type: 'file' | 'directory'
  path: string
  children?: FileNode[]
  title?: string
  description?: string
}

// 命令执行上下文
export interface CommandContext {
  currentPath: Ref<string>
  output: Ref<OutputLine[]>
  fileSystem: FileNode
  navigateTo: (path: string) => void
}

// 命令接口
export interface Command {
  name: string
  description: string
  usage?: string
  execute: (args: string[], ctx: CommandContext) => void | Promise<void>
}

// 输出行类型
export interface OutputLine {
  type: 'command' | 'output' | 'error' | 'info' | 'ascii'
  content: string
  timestamp?: number
}

// 命令历史条目
export interface HistoryEntry {
  command: string
  timestamp: number
}
