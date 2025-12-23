import type { DocTreeNode } from '@/composables/article/useDocsTree'

/**
 * 导航栏菜单配置
 */
export interface NavItemConfig {
  /** 显示文本 */
  text: string
  /** 路由路径（直接链接） */
  to?: string
  /** 知识库根路径（自动生成子菜单） */
  basePath?: string
  /** 子菜单项（运行时动态填充） */
  children?: DocTreeNode[]
}

export const navItems: NavItemConfig[] = [
  { text: '指南', to: '/guide/intro' },
  { text: '贪吃蛇', to: '/games/snake' },
  { text: '前端', basePath: '/frontend' },
  { text: '后端', basePath: '/backend' },
  { text: 'AIGC', basePath: '/AIGC' },
  { text: '示例', basePath: '/example' },
  { text: '标签', to: '/tags' }
]
