# MongoDB 文档数据库指南

MongoDB 是一个基于分布式文件存储的开源数据库系统，是 NoSQL 数据库的代表。

## 1. 核心概念

- **Document (文档)**: 对应关系型数据库的 Row，使用 BSON 格式。
- **Collection (集合)**: 对应关系型数据库的 Table。
- **Schema-less (无模式)**: 允许在同一个集合中存储不同结构的文档。

## 2. 数据建模建议

- **冗余 (Denormalization) vs 引用 (Reference)**:
  - 频繁读取、数据量小 -> 嵌套在同一个文档中。
  - 数据量大、更新频繁 -> 使用 `_id` 引用并分表存储。
- **上限集合 (Capped Collections)**: 适用于固定大小的日志存储。

## 3. 常用操作

```javascript
// 插入并添加索引
db.users.insertOne({ name: 'Bob', age: 25 })
db.users.createIndex({ name: 1 })

// 聚合框架 (Aggregation Framework)
db.orders.aggregate([
  { $match: { status: 'A' } },
  { $group: { _id: '$cust_id', total: { $sum: '$amount' } } }
])
```

## 4. 适用场景

- 内容管理系统 (CMS)。
- 实时分析平台。
- 元数据存储。
