# PostgreSQL 全文搜索与 PL/pgSQL

Postgres 不仅仅是一个关系型数据库，它的编程能力非常强大。

## 1. 原生全文搜索 (Full Text Search)

无需依赖 ElasticSearch，Postgres 内置了强大的分词与匹配功能。

- **TSVector**: 存储分词后的词袋。
- **TSQuery**: 定义查询逻辑。

```sql
SELECT title
FROM articles
WHERE to_tsvector('english', body) @@ to_tsquery('english', 'database & acid');
```

## 2. PL/pgSQL 存储过程

支持复杂的业务逻辑在数据库内部执行。

```sql
CREATE OR REPLACE FUNCTION audit_user_change() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log(user_id, action, time)
    VALUES (NEW.id, 'UPDATE', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 3. 触发器 (Triggers)

自动在 INSERT、UPDATE 或 DELETE 发生前/后执行特定逻辑，确保持久性的业务规则。

## 4. 索引优化进阶

- **Partial Indexes (部分索引)**: 只对满足条件的子集建立索引，减小开销。
- **Expression Indexes (表达式索引)**: 对函数计算后的结果建立索引。
