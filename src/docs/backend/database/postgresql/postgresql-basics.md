# PostgreSQL 进阶指南

PostgreSQL 是世界上最先进的开源关系型数据库，以其强大的功能和标准兼容性著称。

## 1. 核心特性

- **复杂类型支持**: 完美支持 JSONB、数组、Hstore 等非结构化数据。
- **并发控制 (MVCC)**: 读写互不阻塞，极大地提高了并发性能。
- **扩展性**: 支持自定义函数 (PL/pgSQL, Python, Javascript) 和 插件 (PostGIS, TimescaleDB)。

## 2. 高级查询示例

### JSONB 操作

PostgreSQL 的 `jsonb` 类型支持索引，性能优于传统 JSON。

```sql
-- 查询 jsonb 字段中的特定键值
SELECT * FROM orders WHERE info @> '{"customer": "Alice"}';
```

### 窗口函数 (Window Functions)

用于处理复杂的报表统计。

```sql
SELECT
    name,
    salary,
    AVG(salary) OVER(PARTITION BY department) as dept_avg
FROM employees;
```

## 3. 性能优化技巧

- **使用 GIN 索引**: 提升全文本搜索和 JSONB 查询速度。
- **分区表**: 针对大数据量表，按时间或地域进行物理分割。
- **EXPLAIN ANALYZE**: 查看真实的执行计划和耗时。
