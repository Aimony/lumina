# Composition API 深度解析：setup, ref 与 reactive

Vue 3 的组合式 API (Composition API) 是一组 API，允许我们使用导入的函数而不是声明选项来编写 Vue 组件。

## 1. 为什么需要 Composition API？

- **逻辑复用**：相比 mixins，它可以更清晰地组织和重用代码。
- **类型推导**：对 TypeScript 的支持更加友好。
- **更小的生产包体积**：甚至在生产环境下通过更好的 tree-shaking 减少包大小。

## 2. ref vs reactive：响应式的两大支柱

这是最基础也最容易混淆的两个 API。

- **`ref`**：
  - 定义：创建一个响应式且可变的 `ref` 对象。
  - 用法：主要用于原始数据类型（string, number, boolean）或需要整体替换的对象。
  - 注意：在内层脚本中需要使用 `.value`，而在模板中会自动解包。

- **`reactive`**：
  - 定义：创建一个对象的响应式代理。
  - 用法：通常用于定义包含多个属性的复杂对象。
  - 注意：解构会丢失响应式。

```javascript
const count = ref(0)
const state = reactive({ count: 0 })

// count.value++
// state.count++
```

## 3. 计算属性与侦听器

- **`computed`**：基于其他响应式状态派生的状态。具有缓存性。
- **`watch`**：侦听响应式源，并在源变化时执行回调函数。适合执行异步操作或开销较大的操作。

## 4. 逻辑复用：自定义 Composables

这是 Composition API 最强大的地方。你可以将逻辑提取到外部函数中，并在多个组件间共享。

```javascript
// useMouse.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  const update = (e) => {
    x.value = e.pageX
    y.value = e.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

## 总结

Composition API 让 Vue 开发更加贴近 JavaScript 原生的编写方式。掌握了 `ref` 与 `reactive` 及其背后的 Composables 思想，你就能构建出更具弹性、更易测试的应用。
