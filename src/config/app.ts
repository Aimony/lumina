/**
 * 应用配置管理
 * 从环境变量中读取配置，提供类型安全的访问接口
 */

// ============================================
// 开屏动画配置
// ============================================
export const splashConfig = {
  /**
   * 动画持续时间（毫秒）
   * - 开发环境：1000ms（更快，便于调试）
   * - 生产环境：2000ms（更慢，效果更好）
   */
  animationDuration: Number(import.meta.env.VITE_SPLASH_ANIMATION_DURATION) || 1000,

  /**
   * 动画结束后的缓冲时间（毫秒）
   * 确保动画完全结束后再清理组件
   */
  animationBuffer: Number(import.meta.env.VITE_SPLASH_ANIMATION_BUFFER) || 500
}

// ============================================
// 应用基础配置
// ============================================
export const appConfig = {
  name: import.meta.env.VITE_APP_NAME || 'Lumina',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  env: import.meta.env.VITE_ENV || 'development',
  isDevelopment: import.meta.env.VITE_ENV === 'development',
  isProduction: import.meta.env.VITE_ENV === 'production'
}

// ============================================
// API 配置
// ============================================
export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  siteHostname: import.meta.env.VITE_SITE_HOSTNAME || 'http://localhost:5173'
}

// ============================================
// 开发工具配置
// ============================================
export const devConfig = {
  enableDevtools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
  enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true'
}
