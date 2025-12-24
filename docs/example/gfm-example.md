---
title: GitHub Flavored Markdown 示例
date: 2024-12-22
tags: [示例, GFM, Markdown]
---

# GitHub Flavored Markdown 完整示例

本文档展示了所有支持的 GFM 扩展语法。

## 任务列表 (Task Lists)

项目进度追踪：

- [x] 安装 GFM 插件
- [x] 配置 markdown-it
- [x] 添加 CSS 样式
- [ ] 编写示例文档
- [ ] 测试所有功能

嵌套任务列表：

- [x] 前端开发
  - [x] 组件设计
  - [x] 状态管理
  - [ ] 单元测试
- [ ] 后端开发
  - [ ] API 设计
  - [ ] 数据库建模

---

## 删除线 (Strikethrough)

~~这段文字已被删除~~ 这是新的内容。

功能更新：~~旧版本不再支持~~ 请使用新版本。

---

## 表格 (Tables)

### 基础表格

| 功能     | 状态 |     说明 |
| -------- | :--: | -------: |
| 任务列表 |  ✅  |   左对齐 |
| 删除线   |  ✅  | 居中对齐 |
| 表格     |  ✅  |   右对齐 |
| 脚注     |  ✅  | 完整支持 |

### 技术栈对比

| 框架   | 语言          | 特点              | 适用场景 |
| ------ | ------------- | ----------------- | -------- |
| Vue 3  | TypeScript    | 渐进式、响应式    | SPA、SSR |
| React  | JavaScript/TS | 函数式、Hooks     | 大型应用 |
| Svelte | JavaScript    | 编译时、无虚拟DOM | 性能敏感 |

---

## 脚注 (Footnotes)

这是一段包含脚注的文本[^1]，脚注可以包含详细的解释或引用来源。

GitHub Flavored Markdown[^gfm] 是 GitHub 对标准 Markdown 的扩展。

你也可以使用内联脚注^[这是一个内联脚注，直接写在正文中]。

多个脚注可以混合使用[^2]，它们会在文档底部统一展示[^note]。

[^1]: 这是第一个脚注的内容，可以包含**粗体**和 `代码`。

[^gfm]: GitHub Flavored Markdown 规范：https://github.github.com/gfm/

[^2]: 脚注支持多行内容：

    - 第一点说明
    - 第二点说明

    以及代码块。

[^note]: 脚注标识符可以是数字或文字，会自动编号。

---

## GitHub Alerts 告警块

### NOTE - 备注信息

> [!NOTE]
> 这是一条备注信息，用于提供背景上下文或补充说明。
> 支持多行内容和 **Markdown 格式**。

### TIP - 提示建议

> [!TIP]
> 使用 `Ctrl + S` 快速保存文件。
> 这个技巧可以提升你的开发效率！

### IMPORTANT - 重要信息

> [!IMPORTANT]
> 请确保在部署前运行所有测试用例。
> 这是保证代码质量的关键步骤。

### WARNING - 警告提醒

> [!WARNING]
> 此操作将修改数据库结构，请先备份数据。
> 建议在测试环境验证后再应用到生产环境。

### CAUTION - 危险警告

> [!CAUTION]
> **此操作不可逆！**
>
> 删除账户将永久移除所有相关数据，包括：
>
> - 用户资料
> - 历史记录
> - 关联文件

---

## 引用块 (Blockquotes)

普通引用：

> 代码是写给人看的，顺便让机器执行。
> —— Donald Knuth

嵌套引用：

> 第一层引用
>
> > 第二层引用
> >
> > > 第三层引用

---

## 自动链接 (Autolinks)

直接输入网址会自动转换为链接：

- https://github.com
- https://vuejs.org
- contact@example.com

---

## 混合使用示例

> [!TIP]
> **快速上手指南**
>
> 1. 克隆仓库
> 2. 安装依赖：`npm install`
> 3. 启动开发服务器：`npm run dev`
>
> | 命令      | 说明     |
> | --------- | -------- |
> | `dev`     | 开发模式 |
> | `build`   | 生产构建 |
> | `preview` | 预览构建 |
>
> 更多信息请参考官方文档[^docs]。

[^docs]: 完整文档地址：https://lumina.dev/docs

---

## 代码块

```typescript
// TypeScript 代码示例
interface User {
  id: number
  name: string
  email: string
}

const greet = (user: User): string => {
  return `Hello, ${user.name}!`
}
```

```css
/* CSS 变量示例 */
:root {
  --primary-color: #646cff;
  --text-color: #213547;
}
```

---

_本文档涵盖了 GFM 的所有主要扩展特性。_
