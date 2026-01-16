/// <reference types="vite/client" />
/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any */

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.md' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '~pages' {
  import type { RouteRecordRaw } from 'vue-router'
  const routes: RouteRecordRaw[]
  export default routes
}

declare module 'markdown-it-task-lists'
declare module 'markdown-it-footnote'
declare module 'markdown-it-github-alerts'

// Vite Worker import syntax
declare module '*?worker' {
  const workerConstructor: new () => Worker
  export default workerConstructor
}

// 终端模式虚拟文件系统模块
declare module 'virtual:docs-filesystem' {
  interface FileNode {
    name: string
    type: 'file' | 'directory'
    path: string
    children?: FileNode[]
    title?: string
  }
  const fileSystem: FileNode
  export default fileSystem
}
