# MySQL 锁机制与日志系统

深入理解 InnoDB 的并发控制与崩溃恢复机制。

## 1. 锁机制 (Locks)

MySQL 的锁是为了解决并发事务带来的数据一致性问题。

### 行级锁 (Row Locks)

- **Record Lock (记录锁)**: 锁定单条索引记录。
- **Gap Lock (间隙锁)**: 锁定索引记录之间的间隙，防止幻读。
- **Next-Key Lock (临键锁)**: 记录锁与间隙锁的组合。

### 表级锁 (Table Locks)

- **意向锁 (Intention Locks)**: 提高表锁与行锁共存时的检测效率。
- **MDL (元数据锁)**: 防止 DDL 语句导致 DML 语句失效。

## 2. 三大日志系统

- **Redo Log (重做日志)**: 物理日志，记录“在某个数据页做了什么修改”，确保持久性 (Durability)。
- **Undo Log (回滚日志)**: 逻辑日志，记录数据的反向操作，确保原子性 (Atomicity) 和支持 MVCC。
- **Binlog (归档日志)**: 服务层产生的逻辑日志，用于数据同步、备份和恢复。

## 3. 两阶段提交

为了保证 Redo Log 和 Binlog 的逻辑一致性，MySQL 采用两阶段提交机制。

1. **Prepare 阶段**: 写入 Redo Log 并标记为 prepare。
2. **Commit 阶段**: 写入 Binlog，随后将 Redo Log 标记为 commit。
