# NestJS 框架

NestJS 是一个用于构建高效、可扩展的 Node.js 服务器端应用程序的框架。

## 核心特性

NestJS 使用 TypeScript 开发，深受 Angular 启发，采用依赖注入和模块化架构。

### 1. 模块 (Modules)

每个应用至少有一个根模块，用于组织代码结构。

```typescript
@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
```

### 2. 控制器 (Controllers)

负责处理传入的请求并向客户端返回响应。

```typescript
@Controller('users')
export class UsersController {
  @Get()
  findAll(): string {
    return '返回所有用户'
  }
}
```

### 3. 提供者 (Providers)

几乎所有的基础类（Service, Repository等）都可以被视为 Provider，通过依赖注入进行解耦。

## 为什么选择 NestJS？

- **企业级架构**: 强制要求代码组织，减少混乱。
- **生态系统**: 完美支持 TypeORM, Mongoose, GraphQL 等。
- **易于测试**: 依赖注入使单元测试非常简单。
