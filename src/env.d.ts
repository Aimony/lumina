/// <reference types="vite/client" />

/**
 * 环境变量类型定义
 * 确保在代码中使用 import.meta.env 时有类型提示
 */
interface ImportMetaEnv {
  /** 应用名称 */
  readonly VITE_APP_NAME: string
  /** 应用版本 */
  readonly VITE_APP_VERSION: string
  /** 环境标识 (development | production | staging) */
  readonly VITE_ENV: 'development' | 'production' | 'staging'
  /** API 基础路径 */
  readonly VITE_API_BASE_URL: string
  /** 站点域名 */
  readonly VITE_SITE_HOSTNAME: string
  /** 是否启用开发工具 */
  readonly VITE_ENABLE_DEVTOOLS: string
  /** 是否启用 Mock 数据 */
  readonly VITE_ENABLE_MOCK: string
  /** Umami 网站 ID */
  readonly VITE_UMAMI_WEBSITE_ID: string
  /** Umami 脚本地址 */
  readonly VITE_UMAMI_SCRIPT_URL: string
  /** 是否启用 Umami 分析 */
  readonly VITE_UMAMI_ENABLED: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
