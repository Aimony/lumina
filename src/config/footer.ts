/**
 * Footer 配置
 */

export interface FooterLink {
  /** 显示文本 */
  text: string
  /** 链接地址 */
  url: string
  /** 是否在新窗口打开 */
  external?: boolean
}

export interface FooterConfig {
  /** 版权信息 */
  copyright: {
    /** 开始年份 */
    startYear: number
    /** 作者/组织名称 */
    author: string
    /** 作者链接 */
    authorUrl?: string
  }
  /** ICP 备案信息 */
  icp?: {
    /** 备案号 */
    number: string
    /** 备案链接 */
    url?: string
  }
  /** 公安备案信息 */
  police?: {
    /** 备案号 */
    number: string
    /** 备案链接 */
    url?: string
  }
  /** 许可协议信息 */
  license?: {
    /** 协议名称 */
    text: string
    /** 协议链接 */
    url: string
  }
  /** 底部链接 */
  links: FooterLink[]
  /** 统计信息配置 */
  stats?: {
    /** 是否显示统计信息 */
    enabled: boolean
    /** 显示的统计项 */
    items: ('pageviews' | 'visitors' | 'currentPage')[]
    /** 数据刷新间隔(毫秒) */
    refreshInterval?: number
  }
}

export const footerConfig: FooterConfig = {
  copyright: {
    startYear: 2024,
    author: 'Lumina',
    authorUrl: 'https://github.com/lumina'
  },
  license: {
    text: 'CC BY-NC-SA 4.0 国际许可协议',
    url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
  },
  icp: {
    number: '京ICP备XXXXXXXX号',
    url: 'https://beian.miit.gov.cn/'
  },
  police: {
    number: '京公网安备XXXXXXXXXX号',
    url: 'http://www.beian.gov.cn/'
  },
  links: [
    { text: '隐私政策', url: '/privacy', external: false },
    { text: '使用条款', url: '/terms', external: false },
    { text: '关于我', url: '/about', external: false }
  ],
  stats: {
    enabled: true,
    items: ['pageviews', 'visitors', 'currentPage'],
    refreshInterval: 1 * 60 * 1000 // 1分钟
  }
}
