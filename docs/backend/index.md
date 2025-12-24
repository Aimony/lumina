# 后端技术文档

欢迎来到后端技术知识库。这里记录了关于服务器端开发、数据库管理、架构设计及 API 规范的相关内容。

## 技术栈概览

### 1. 运行时与框架

- **Node.js**: 基于 Chrome V8 引擎的 JavaScript 运行时。
  - [基础知识](./node/node-basic.md) | [NestJS 框架](./node/nestjs.md)
- **Python**: 简洁强大的通用编程语言。
  - [FastAPI 高性能框架](./python/fastapi.md)
- **Go**: 极简且高效的并发语言。
  - [Go 语言首页](./lang/go/index.md) | [基础与并发](./lang/go/go-base.md)
- **Rust**: 极致性能与内存安全。
  - [Rust 语言指南](./lang/rust/index.md)

### 2. 数据库

- **MySQL 深度解析**:
  - [优化指南](./database/mysql-optimization.md) | [锁与日志系统](./database/mysql-locks-logs.md)
  - [高可用架构 (HA)](./database/mysql-ha.md)
- **PostgreSQL 进阶**:
  - [基础指南](./database/postgresql-basics.md) | [全文搜索与编程](./database/postgresql-search-pl.md)
  - [高可用方案](./database/postgresql-ha.md)
- **NoSQL / Cache**:
  - [Redis 应用实践](./database/redis-guide.md)
  - [MongoDB 开发指南](./database/mongodb-guide.md)
- **核心理论**:
  - [数据库事务专题](./database/database-transactions.md)

### 3. 工程化与设计

- [RESTful API 设计规范](./api-design.md)
- [安全与认证 (即将推出)](#)

---

> [!TIP]
> 建议从基础开始，逐步深入到具体框架和数据库优化。
