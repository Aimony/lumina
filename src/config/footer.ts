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
  /** 底部链接 */
  links: FooterLink[]
}

export const footerConfig: FooterConfig = {
  copyright: {
    startYear: 2024,
    author: 'Lumina',
    authorUrl: 'https://github.com/lumina'
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
  ]
}
