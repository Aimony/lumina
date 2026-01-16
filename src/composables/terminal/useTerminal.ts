import { ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import type { OutputLine, HistoryEntry, CommandContext } from './types'
import { parseCommandLine, getCommand, getWelcomeMessage, getAllCommands } from './terminalCommands'
import { useVirtualFileSystem } from './useVirtualFileSystem'

export function useTerminal() {
  const router = useRouter()
  const { fileSystem, listDirectory } = useVirtualFileSystem()

  // 状态
  const currentPath = ref('/')
  const commandHistory = ref<HistoryEntry[]>([])
  const historyIndex = ref(-1)
  const output = ref<OutputLine[]>(getWelcomeMessage())
  const currentInput = ref('')

  // 创建命令上下文
  const createContext = (): CommandContext => ({
    currentPath,
    output,
    fileSystem,
    navigateTo: (path: string) => {
      router.push(path)
    }
  })

  // 执行命令
  const executeCommand = async (input: string) => {
    const trimmedInput = input.trim()

    // 添加命令到输出
    output.value.push({
      type: 'command',
      content: `${getPrompt()} ${trimmedInput}`,
      timestamp: Date.now()
    })

    if (!trimmedInput) {
      return
    }

    // 添加到历史
    commandHistory.value.push({
      command: trimmedInput,
      timestamp: Date.now()
    })
    historyIndex.value = commandHistory.value.length

    // 解析并执行
    const { command, args } = parseCommandLine(trimmedInput)
    const cmd = getCommand(command)

    if (!cmd) {
      output.value.push({
        type: 'error',
        content: `命令未找到: ${command}。输入 'help' 查看可用命令。`,
        timestamp: Date.now()
      })
      return
    }

    try {
      await cmd.execute(args, createContext())
    } catch (error) {
      output.value.push({
        type: 'error',
        content: `执行错误: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now()
      })
    }
  }

  // 获取命令提示符
  const getPrompt = () => {
    const path = currentPath.value
    return `lumina:${path}$`
  }

  // 历史导航
  const navigateHistory = (direction: 'up' | 'down') => {
    if (commandHistory.value.length === 0) return ''

    if (direction === 'up') {
      if (historyIndex.value > 0) {
        historyIndex.value--
      }
    } else {
      if (historyIndex.value < commandHistory.value.length - 1) {
        historyIndex.value++
      } else {
        historyIndex.value = commandHistory.value.length
        return ''
      }
    }

    return commandHistory.value[historyIndex.value]?.command || ''
  }

  // 自动补全
  const getCompletions = (input: string): string[] => {
    const { command, args } = parseCommandLine(input)
    const completions: string[] = []

    // 如果还在输入命令名
    if (args.length === 0 && !input.endsWith(' ')) {
      const commands = getAllCommands()
      completions.push(...commands.filter((c) => c.startsWith(command)))
    }
    // 补全文件/目录名
    else {
      const partial = args[args.length - 1] || ''
      const entries = listDirectory(currentPath.value) || []

      completions.push(
        ...entries
          .filter((e) => e.name.startsWith(partial))
          .map((e) => (e.type === 'directory' ? `${e.name}/` : e.name))
      )
    }

    return completions
  }

  // 清空终端
  const clearTerminal = () => {
    output.value = []
  }

  return {
    currentPath,
    commandHistory,
    output,
    currentInput,
    executeCommand,
    getPrompt,
    navigateHistory,
    getCompletions,
    clearTerminal
  }
}
