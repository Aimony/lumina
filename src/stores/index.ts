import { createPinia } from 'pinia'

export const pinia = createPinia()

// 统一导出所有 stores
export * from './theme'
export * from './immersiveMode'
export * from './search'
export * from './searchHistory'
export * from './viewMode'
export * from './filePreview'
