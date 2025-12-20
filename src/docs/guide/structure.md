# 项目结构

本文档详细介绍了 `kb-vue` 项目的源代码结构和关键组件。

## 目录结构概览

```
src/
├── assets/             # 静态资源（图片、字体等）
├── components/         # 全局公共组件
├── layouts/            # 布局组件，定义页面的基本外壳
│   ├── DefaultLayout.vue # 默认布局（如首页）
│   └── DocLayout.vue     # 文档布局（包含侧边栏和目录）
├── pages/              # 页面内容目录
│   ├── index.vue       # 网站首页（精美设计版）
│   ├── index.md        # 欢迎/介绍文档（备用或重命名）
│   ├── guide/          # 指南文档
│   │   ├── intro.md    # 入门指南
│   │   └── config.md   # 配置说明
│   └── fronted/        # 前端相关文档
├── App.vue             # 根组件，负责布局切换和全局状态管理
├── main.ts             # 项目入口文件，初始化 Vue 和路由
└── style.css           # 全局样式文件，包含 Tailwind CSS 配置
```

## 核心目录说明

### `pages/`
这是知识库的核心。基于 `vite-plugin-pages` 和 `unplugin-vue-markdown`，该目录下的每个 `.md` 或 `.vue` 文件都会自动转换为对应的路由。

- **Markdown 支持**：可以直接编写 Markdown 文件，它们会被渲染为 Vue 组件。
- **动态路由**：目录结构即路由结构。例如 `pages/guide/intro.md` 对应的 URL 是 `/guide/intro`。

### `layouts/`
项目采用多布局架构：
- **DefaultLayout**：用于简洁的页面，如首页。
- **DocLayout**：专为文档设计，集成了左侧导航、右侧目录（TOC）以及深色模式切换等功能。

布局的选择在 `App.vue` 中根据路由的 `meta.layout` 属性动态决定。

### `components/`
存放可复用的 Vue 组件。你可以在 Markdown 文件中直接引用这些组件，增强文档的交互性。

## 关键文件

- **`main.ts`**：配置了 `vue-router`，并导入了自动生成的路由表 `~pages`。
- **`App.vue`**：处理全局布局切换逻辑，并提供深色模式的主题状态。
- **`style.css`**：利用 Tailwind CSS 进行全局样式定义。

## 技术栈

- **Vue 3**：核心框架，使用 Composition API。
- **Vite**：高性能的前端构建工具。
- **Tailwind CSS**：原子化 CSS 框架，负责整站样式。
- **FlexSearch**：高性能全身搜索库（计划中）。
- **Shiki**：用于代码块的精确语法高亮。
