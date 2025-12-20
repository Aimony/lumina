# Node.js 基础

Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时环境。

## 核心概念

### 1. 事件循环 (Event Loop)

Node.js 采用单线程非阻塞 I/O 模型，其核心就是事件循环。

- **阶段**: timers, pending callbacks, idle/prepare, poll, check, close callbacks.
- **微任务**: `process.nextTick` 和 Promise 回调。

### 2. 模块系统

- **CommonJS**: `require` / `module.exports` (同步加载)。
- **ES Modules (ESM)**: `import` / `export` (静态加载，Node.js 12+ 推荐)。

### 3. 非阻塞 I/O

通过回调函数、Promise 或 async/await 处理 I/O 操作，而不会阻塞主线程执行。

## 性能优化建议

- 避免在主线程执行耗时的同步操作。
- 合理利用 `Stream` 处理大文件，减少内存占用。
- 关键逻辑使用 C++ 插件扩展。

```javascript
const fs = require('fs')

// 流式读取示例
const reader = fs.createReadStream('large-file.txt')
reader.on('data', (chunk) => {
  console.log('读取到数据:', chunk.length)
})
```
