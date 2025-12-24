# Go 语言基础与并发

深入理解 Go 语言的核心语法与其引以为傲的并发模型。

## 1. 核心语法要点

- **变量与类型**: 强类型，支持类型推断。
- **结构体 (Structs)**: Go 没用类，通过结构体和方法接收者实现面向对象特性。
- **接口 (Interfaces)**: 非侵入式接口（Duck Typing），极大地增强了代码解耦。
- **错误处理**: 显式返回 `error`，崇尚“失败即数据”的理念。

## 2. 并发模型：CSP

Go 实现了 Communicating Sequential Processes (CSP) 模型。

### Goroutine (协程)

轻量级的用户态线程，启动成本极低。

```go
go func() {
    fmt.Println("Hello from Goroutine")
}()
```

### Channel (通道)

不要通过共享内存来通信，而要通过通信来共享内存。

```go
ch := make(chan int)
go func() {
    ch <- 42 // 发送数据
}()
val := <-ch // 接收数据
```

## 3. 标准库亮点

- `net/http`: 构建高性能 Web 服务。
- `encoding/json`: 极致简洁的序列化。
- `context`: 优雅地控制请求生命周期与超时。
