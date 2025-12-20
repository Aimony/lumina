# React 组件通信与全局状态管理方案

在构建大型 React 应用时，如何高效地在组件之间传递和共享数据是架构设计的重点。本文将由浅入深介绍几种常见的通信模式。

## 1. 父子组件通信

这是最基本、最常用的通信方式。

- **父传子**：通过 `props` 直接传递。
- **子传父**：父组件向子组件传递一个回调函数，子组件调用该函数将数据传回。

```jsx
// 父组件
function Parent() {
  const handleData = (data) => console.log('来自子的数据:', data);
  return <Child onSendData={handleData} title="Hello Son" />;
}
```

## 2. 跨层级通信：Context API

当组件嵌套过深时，Props Drilling（属性钻取）会变得非常痛苦。React 提供的 Context API 可以实现“跨级”传输。

### 使用步骤：
1. `React.createContext()` 创建 Context。
2. 在顶层组件使用 `<Provider value={...}>` 包裹。
3. 在需要数据的子组件使用 `useContext(MyContext)`。

## 3. 兄弟组件通信：状态提升

React 本身没有直接的兄弟通信机制。通常的做法是将共享状态“提升”到它们最近的共同父组件中，然后通过 props 下发。

## 4. 全局状态管理方案

当应用规模增长到一定程度，状态提升和 Context 可能会导致性能瓶颈或代码杂乱。此时可以考虑第三方状态管理库：

### Zustand (推荐)
Zustand 是目前 React 社区最受推崇的轻量级状态管理方案，它的 API 极其简洁。
```javascript
import { create } from 'zustand'

const useStore = create((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}))
```

### Redux Toolkit
企业级应用的首选方案，虽然样板代码较多，但在复杂事务和中间件处理上有天然优势。

## 5. 总结：如何选择？

- **少量层级传递**：直接用 Props。
- **全局配置/主题/用户身份**：优先使用 Context API。
- **复杂的业务逻辑状态**：选择 Zustand (轻量) 或 Redux Toolkit (重型)。

> [!TIP]
> 永远记住：**尽量保持状态的局部性**。不要为了用状态管理而用状态管理。
