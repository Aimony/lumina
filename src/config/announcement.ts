/**
 * 单条公告配置
 */
export interface AnnouncementItem {
  text: string
  link?: string
}

/**
 * 公告条配置
 */
export interface AnnouncementConfig {
  /** 是否启用公告 */
  enabled: boolean
  /** 公告唯一标识（用于 localStorage 存储关闭状态） */
  id: string
  /** 公告列表。如果存在，将忽略根级别的 text 和 link */
  items: AnnouncementItem[]
  /** 兼容旧配置：公告文本内容（当 items 为空时使用） */
  text?: string
  /** 兼容旧配置：点击跳转链接 */
  link?: string
  /** 背景颜色（如果不指定，将使用默认主题色） */
  bgColor?: string
  /** 文字颜色 */
  textColor?: string
}

export const announcement: AnnouncementConfig = {
  enabled: true,
  id: 'announcement-2024-12-25',
  items: [
    { text: '🎄 圣诞快乐！欢迎来到 Lumina 知识库，探索更多精彩内容！', link: '/guide/intro' },
    { text: '✨ 新版本 v1.0.0 已发布，新增时间线和归档功能！', link: '/timeline' },
    { text: '🚀 关注我们的 Github 仓库获取最新动态', link: 'https://github.com/lumina' }
  ],
  // 保持向后兼容的字段（可选）
  text: '🎄 圣诞快乐！欢迎来到 Lumina 知识库，探索更多精彩内容！',
  link: '/guide/intro'
}
