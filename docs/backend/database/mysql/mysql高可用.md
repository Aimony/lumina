# MySQL 高可用架构与集群

在生产环境中，单节点的数据库无法满足可用性和扩展性要求。

## 1. 主从复制 (Master-Slave)

- **异步复制**: 性能最高，但在宕机时可能丢失数据。
- **半同步复制 (Semi-Sync)**: 至少一个从库收到数据并写入 Relay Log 后返回成功。
- **并行复制**: 提高从库回放能力，减轻延迟。

## 2. 高可用方案

- **MHA (Master High Availability)**: 自动主库故障转移，相对成熟。
- **MGR (MySQL Group Replication)**: 官方基于 Paxos 协议提供的强一致性插件，支持多主模式。
- **Keepalived + VIP**: 通过虚拟 IP 漂移实现简单的故障切换。

## 3. 读写分离与负载均衡

- **Mycat / ShardingSphere**: 代理层实现，透明度高。
- **ProxySQL**: 专门针对 MySQL 的高性能协议级代理，支持查询缓存优化。
