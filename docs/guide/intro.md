# 入门指南

欢迎阅读 Lumina 入门指南！本文将帮助你快速上手这个知识库系统。

## 什么是 Lumina？

Lumina 是一个现代化的个人知识库系统，它让你能够：

- 使用 **Markdown** 编写文档
- 在 Markdown 中嵌入 **Vue 组件**
- 享受 **实时热更新** 的开发体验
- 自动生成 **侧边栏** 和 **目录**

## 项目结构

```
src/
├── pages/          # 页面目录（.md 或 .vue）
│   ├── index.md    # 首页
│   └── guide/      # 指南目录
│       └── intro.md
├── components/     # Vue 组件
├── layouts/        # 布局组件
└── assets/         # 静态资源
```

## 创建新页面

在 `src/pages` 目录下创建 `.md` 文件即可：

```markdown
# 我的新页面

这是页面内容...
```

文件路径会自动映射为路由：

- `src/pages/index.md` → `/`
- `src/pages/guide/intro.md` → `/guide/intro`
- `src/pages/blog/post.md` → `/blog/post`

## 在 Markdown 中使用 Vue

你可以直接在 Markdown 中编写 Vue 代码：

```vue
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<button @click="count++">
  点击次数: {{ count }}
</button>
```

## 代码高亮

支持多种编程语言的语法高亮：

### JavaScript

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`)
}

greet('World')
```

### TypeScript

```typescript
interface User {
  name: string
  age: number
}

const user: User = {
  name: 'Alice',
  age: 25
}
```

### Python

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))
```

## 下一步

- 查看 [配置说明](/guide/config)
- 探索 [组件库](/components)
- 阅读 [进阶指南](/guide/advanced)
