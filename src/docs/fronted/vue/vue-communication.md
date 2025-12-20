# Vue 组件通信与 Pinia 状态管理

在 Vue 应用中，组件之间的数据交互是构建复杂系统的基石。根据组件之间的关系，我们可以选择不同的通信策略。

## 1. 父子组件通信：Props 与 Emits

这是 Vue 中最基本、最符合单向数据流原则的通信方式。

- **`defineProps`**：子组件声明接收父组件的数据。
- **`defineEmits`**：子组件向父组件发送自定义事件以传递数据。

```vue
<!-- 子组件 Child.vue -->
<script setup>
const props = defineProps(['title'])
const emit = defineEmits(['change'])
const handleClick = () => emit('change', '来自子的问候')
</script>

<template>
  <h3>{{ title }}</h3>
  <button @click="handleClick">通知父组件</button>
</template>
```

## 2. 跨组件通信：Provide / Inject

当组件嵌套太深，或者需要跨越多个层级传递数据时，`provide` 与 `inject` 提供了便捷的方案。

- **`provide`**：在父级组件提供数据。
- **`inject`**：在任意深度的子组件中接收数据。

> [!CAUTION]
> 尽量不要滥用 Provide/Inject 来替代 Props，因为它会让组件的依赖变得不透明。

## 3. 全局状态管理：Pinia

Pinia 是 Vue 官方推荐的 Store 库。它具有类型安全、极简 API、支持热模块替换等特点。

### 创建 Store

```javascript
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++
    }
  }
})
```

### 在组件中使用

```vue
<script setup>
import { useCounterStore } from './stores/counter'
const counter = useCounterStore()
</script>

<template>
  <p>Count: {{ counter.count }}</p>
  <button @click="counter.increment">Increment</button>
</template>
```

## 结论

- **父传子**：通过 Props。
- **子传父**：通过 Emits。
- **跨层级**：通过 Provide/Inject。
- **多组件共享复杂逻辑/状态**：使用 Pinia。

掌握这些通信机制，不仅能让你的应用代码更加健壮，也能在团队协作中极大提升开发效率。
