# React 基础入门：核心概念与 JSX 深度解析

React 是当前最流行的前端 UI 库之一，其核心哲学是**声明式编程**与**组件化驱动**。本文将带你重新审视 React 的基础，理解其设计的核心思想。

## 1. React 的哲学：声明式 vs 命令式

在传统的 DOM 操作中，我们需要告诉浏览器“如何执行”：

```javascript
// 命令式
const btn = document.createElement('button')
btn.innerText = 'Click Me'
btn.onclick = () => alert('Hello')
document.body.appendChild(btn)
```

而在 React 中，我们描述“UI 应该长什么样”，由 React 负责处理底层的变更：

```jsx
// 声明式
function MyButton() {
  return <button onClick={() => alert('Hello')}>Click Me</button>
}
```

## 2. JSX 深度解析

JSX 不是 HTML，也不是字符串。它是 JavaScript 的语法扩展。

### JSX 的本质

Babel 会将 JSX 转译为 `React.createElement()` 调用：

```jsx
const element = <h1 className="title">Hello</h1>

// 转译后
const element = React.createElement('h1', { className: 'title' }, 'Hello')
```

### 为什么使用 JSX？

- **逻辑与标记耦合**：在组件化环境下，逻辑与渲染放在一起更易维护。
- **防止 XSS 攻击**：React 在渲染前会默认转义所有嵌入的值。

## 3. 组件：函数 vs 类

随着 React 16.8 Hooks 的发布，函数组件已成为主流。

- **类组件**：通过 ES6 Class 定义，拥有 lifecycle 方法，但逻辑复用困难（HOC, Render Props）。
- **函数组件**：本质是返回 React 元素的 JavaScript 函数。配合 Hooks 后，它拥有了比类组件更强大的逻辑复用能力。

## 4. Props 与 State

这是 React 中最核心的两个数据概念。

- **Props (属性)**：组件的“配置参数”。它是**只读**的，组件不能修改自己的 Props。
- **State (状态)**：组件的“私有内存”。当 State 改变时，React 会自动重新渲染组件。

> [!IMPORTANT]
> **单向数据流**：在 React 中，数据总是从父组件流向子组件。

## 总结

理解了 JSX 的本质和组件的属性/状态模型，你就掌握了 React 的地基。接下来的文章我们将深入探讨如何利用 Hooks 赋予函数组件更强大的能力。
