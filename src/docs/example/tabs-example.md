---
title: 标签页组件示例
date: 2024-12-23
tags: [示例, Tabs, 组件]
---

# 标签页组件示例

本文档展示了如何使用 `:::tabs` 语法创建标签页组件，方便在文档中展示多语言代码示例或分组内容。

---

## 基本用法

使用 `:::tabs` 包裹内容，用 `@tab TabName` 定义每个标签页：

:::tabs
@tab JavaScript

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`)
}

greet('World')
```

@tab TypeScript

```typescript
function greet(name: string): void {
  console.log(`Hello, ${name}!`)
}

greet('World')
```

@tab Python

```python
def greet(name):
    print(f"Hello, {name}!")

greet("World")
```

:::

---

## 安装指南示例

:::tabs
@tab npm

```bash
npm install lumina
```

@tab yarn

```bash
yarn add lumina
```

@tab pnpm

```bash
pnpm add lumina
```

:::

---

## 配置文件示例

:::tabs
@tab JSON

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "vue": "^3.4.0"
  }
}
```

@tab YAML

```yaml
name: my-project
version: 1.0.0
dependencies:
  vue: ^3.4.0
```

@tab TOML

```toml
[package]
name = "my-project"
version = "1.0.0"

[dependencies]
vue = "^3.4.0"
```

:::

---

## 框架对比

:::tabs
@tab Vue 3
**Vue 3** 是一个渐进式 JavaScript 框架，特点包括：

- 组合式 API (Composition API)
- 更好的 TypeScript 支持
- 更小的打包体积
- Teleport、Suspense 等新特性

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button @click="count++">Count: {{ count }}</button>
</template>
```

@tab React
**React** 是一个用于构建用户界面的 JavaScript 库，特点包括：

- 函数式组件和 Hooks
- 虚拟 DOM
- 单向数据流
- 庞大的生态系统

```jsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>
}
```

@tab Svelte
**Svelte** 是一个编译时框架，特点包括：

- 无虚拟 DOM
- 更少的样板代码
- 内置状态管理
- 编译时优化

```svelte
<script>
  let count = 0
</script>

<button on:click={() => count++}>
  Count: {count}
</button>
```

:::

---

## 语法说明

在 Markdown 文件中，使用以下语法创建标签页：

```markdown
:::tabs
@tab 标签名1
这里是第一个标签的内容...

@tab 标签名2
这里是第二个标签的内容...

@tab 标签名3
这里是第三个标签的内容...
:::
```

### 注意事项

1. `:::tabs` 和 `:::` 必须单独成行
2. `@tab` 后面需要跟随标签名称
3. 每个标签页内容可以包含任意 Markdown 语法
4. 标签页会自动添加交互功能和滑块动画
