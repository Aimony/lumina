# React 性能优化实战：渲染控制与代码分割

React 的渲染速度很快，但在处理复杂 UI 或大量数据时，不必要的重复渲染（Re-render）会成为性能瓶颈。本文将探讨如何让你的 React 应用跑得更快。

## 1. 理解 React 渲染机制

在 React 中，当组件的 props 或 state 发生改变时，组件会重新渲染。
- **Reconciliation (调和)**：React 通过 Diff 算法比较新旧虚拟 DOM。
- **Rerender ≠ DOM Update**：渲染是生成虚拟 DOM 的过程，如果虚拟 DOM 没变，React 不会触碰真实的 DOM。但渲染过程本身也是有开销的。

## 2. 避免不必要的渲染

### 使用 React.memo
对于纯展示组件，可以使用 `React.memo` 包裹。它会执行浅比较，只有当 props 改变时才重绘组件。
```jsx
const MyComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});
```

### 稳定的引用：useCallback 与 useMemo
传递给子组件的函数或对象，在父组件重新渲染时会生成新的引用，导致 `React.memo` 失效。
```jsx
const handleClick = useCallback(() => {
  console.log('Clicked');
}, []); // 引用在重新渲染间保持不变

const complexValue = useMemo(() => expensiveCompute(data), [data]);
```

## 3. 代码分割与懒加载

不要让用户在首次进入页面时就下载整个应用的代码包。

### React.lazy & Suspense
```jsx
import React, { Suspense, lazy } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function MyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## 4. 列表优化

> [!IMPORTANT]
> **始终提供唯一的 Key**：不要使用 `index` 作为 key，除非列表永远不会被重新排序或过滤。错误的 key 会导致大量的 DOM 销毁与重建。

对于超长列表，推荐使用 **虚拟滚动 (Windowing)** 技术，如 `react-window`。

## 结论
性能优化不是“越早越好”，而应该“按需优化”。优先处理最明显的性能瓶颈，保持代码的简洁性通常比微小的性能提升更重要。
