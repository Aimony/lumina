# React Hooks 深度进阶：从入门到实战

React 16.8 引入的 Hooks 标志着 React 开发范式的巨大转型。它允许你在不编写类的情况下使用 state 以及其他的 React 特性。

## 1. 为什么需要 Hooks？

在 Hooks 出现之前，React 开发者面临三大痛点：

1. **组件间逻辑复用困难**：必须依赖 HOC (高阶组件) 或 Render Props，这会导致“嵌套地狱”。
2. **复杂组件难以理解**：生命周期方法（如 `componentDidMount`）中往往充斥着互不相关的逻辑。
3. **难以理解的 Class**：`this` 的指向问题、繁琐的样板代码使得学习曲线陡峭。

## 2. 常用 Hooks 详解

### useState: 状态驱动

用于在函数组件中声明状态变量。

```jsx
const [count, setCount] = useState(0)
```

### useEffect: 处理副作用

它是 `componentDidMount`, `componentDidUpdate` 和 `componentWillUnmount` 的合体。

```jsx
useEffect(() => {
  const timer = setInterval(() => {
    console.log('Tick')
  }, 1000)

  // 清除副作用
  return () => clearInterval(timer)
}, []) // 空数组表示仅在挂载和卸载时执行
```

### useContext: 跨层级数据共享

轻松读取 context 的值，避免层层传递 props。

### useMemo & useCallback: 性能优化

- `useMemo`：缓存计算结果。
- `useCallback`：缓存函数定义。

## 3. Hooks 的使用规则

> [!CAUTION]
> 必须遵守以下两条核心规则：
>
> 1. **只在最顶层使用 Hooks**：不要在循环、条件或嵌套函数中调用 Hooks。
> 2. **只在 React 函数中调用 Hooks**：在函数组件或自定义 Hooks 中调用。

## 4. 实战：编写自定义 Hook

自定义 Hook 是逻辑复用的高级手段。它允许我们将组件逻辑提取到可重用的函数中。

```jsx
// useWindowSize.js
function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}
```

## 结论

Hooks 让 React 组件变得更加函数化和模块化。掌握了自定义 Hook，你就掌握了 React 逻辑复用的精髓。
