# PostgreSQL 高可用与扩展性

PostgreSQL 提供了多种机制来确保服务的持续可用性。

## 1. 复制机制

- **流复制 (Streaming Replication)**: 物理级别复制，延迟低，分为同步和异步。
- **逻辑复制 (Logical Replication)**: 支持跨大版本、跨库复制，灵活性更高。

## 2. 自动故障转移工具

- **Patroni**: 目前最主流的云原生解决方案，配合 Etcd/Consul 实现选举。
- **Repmgr**: 传统的轻量级命令行工具。

## 3. 连接池转发

- **PgBouncer**: 轻量级、极低开销，有效解决 Postgres 进程创建成本高的问题。

## 4. 读写分离实践

通过应用层切换或使用 HAProxy 配合监控健康检查，实现请求的精准分发。
