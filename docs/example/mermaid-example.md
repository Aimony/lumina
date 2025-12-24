---
title: Mermaid 图表示例
date: 2024-12-22
tags:
  - 示例
  - Mermaid
---

# Mermaid 图表示例

本文演示了如何在 Markdown 文章中使用 Mermaid 图表。只需使用 ` ```mermaid ` 代码块即可。

---

## 1. 流程图 (Flowchart)

```mermaid
graph TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作 A]
    B -->|否| D[执行操作 B]
    C --> E[结束]
    D --> E
```

---

## 2. 序列图 (Sequence Diagram)

```mermaid
sequenceDiagram
    participant 用户
    participant 前端
    participant 后端
    participant 数据库

    用户->>前端: 发起请求
    前端->>后端: 转发请求
    后端->>数据库: 查询数据
    数据库-->>后端: 返回结果
    后端-->>前端: 响应数据
    前端-->>用户: 展示结果
```

---

## 3. 类图 (Class Diagram)

```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    class Cat {
        +String color
        +meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat
```

---

## 4. 状态图 (State Diagram)

```mermaid
stateDiagram-v2
    [*] --> 待处理
    待处理 --> 处理中: 开始处理
    处理中 --> 已完成: 处理成功
    处理中 --> 失败: 处理失败
    失败 --> 处理中: 重试
    已完成 --> [*]
```

---

## 5. 甘特图 (Gantt Chart)

```mermaid
gantt
    title 项目开发计划
    dateFormat  YYYY-MM-DD
    section 规划
    需求分析     :a1, 2024-01-01, 7d
    系统设计     :a2, after a1, 5d
    section 开发
    前端开发     :b1, after a2, 14d
    后端开发     :b2, after a2, 14d
    section 测试
    单元测试     :c1, after b1, 7d
    集成测试     :c2, after c1, 5d
```

---

## 使用说明

在 Markdown 文件中，使用以下语法即可插入 Mermaid 图表：

````markdown
```mermaid
graph TD
    A --> B
```
````

支持的图表类型包括：

- **流程图** (`graph` / `flowchart`)
- **序列图** (`sequenceDiagram`)
- **类图** (`classDiagram`)
- **状态图** (`stateDiagram`)
- **甘特图** (`gantt`)
- **饼图** (`pie`)
- **用户旅程图** (`journey`)
- **思维导图** (`mindmap`)

更多语法请参考 [Mermaid 官方文档](https://mermaid.js.org/intro/)。
