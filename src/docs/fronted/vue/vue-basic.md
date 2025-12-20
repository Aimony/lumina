# Vue 3 核心入门：响应式原理与模板语法

Vue 是一套用于构建用户界面的渐进式框架。Vue 3 引入了更加高效、灵活的特性，其核心思想是**数据驱动视图**与**高灵活性**。

## 1. 声明式渲染

Vue 的核心功能是声明式地渲染数据到 DOM。你只需描述数据是什么，Vue 会自动处理更新。

```vue
<script setup>
import { ref } from 'vue'
const message = ref('Hello Vue 3!')
</script>

<template>
  <h1>{{ message }}</h1>
</template>
```

## 2. 常用模板指令

Vue 提供了一系列指令（Directives）来快速处理常见的逻辑：

- **v-bind (`:`)**：响应式地更新 HTML 属性。
- **v-on (`@`)**：绑定事件监听器。
- **v-if / v-else**：条件渲染。
- **v-for**：基于源数据多次渲染元素或模板块。

```vue
<template>
  <button :disabled="isPending" @click="doSomething">
    {{ isPending ? '提交中...' : '点击我' }}
  </button>

  <ul v-if="items.length">
    <li v-for="item in items" :key="item.id">{{ item.name }}</li>
  </ul>
</template>
```

## 3. 响应式原理：Proxy

Vue 3 使用了 JavaScript 的 `Proxy` 对象来实现响应式系统。相比 Vue 2 的 `Object.defineProperty`，它能够通过底层拦截对象的所有操作（包括动态添加属性、数组索引修改等），从而提供更好的性能和更完整的功能。

## 4. 生命周期钩子

每个 Vue 组件实例在创建时都会经历一系列初始化步骤：

- `onMounted`：组件挂载到 DOM 后调用。
- `onUpdated`：组件 DOM 因为响应式数据变化而更新后调用。
- `onUnmounted`：组件卸载之前调用。

> [!TIP]
> **组合式 API 与生命周期**：在 `<script setup>` 中，可以直接调用以 `on` 开头的生命周期钩子，非常直观。

## 总结

Vue 3 的模板语法非常符合 HTML 的习惯，结合其高效的响应式系统，极大地降低了前端开发的复杂度。
