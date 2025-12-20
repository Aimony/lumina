# API 设计规范

一份规范的 API 文档能显著降低前后端沟通成本。

## RESTful 原则

### 1. 资源路径 (URIs)

使用名词，避免动词。使用层级结构。

- 正确: `GET /v1/users`
- 错误: `GET /v1/getUsers`

### 2. HTTP 方法

- `GET`: 获取资源
- `POST`: 创建资源
- `PUT`: 替换资源
- `PATCH`: 部分更新
- `DELETE`: 删除资源

### 3. 状态码 (Status Codes)

- `200 OK`: 请求成功。
- `201 Created`: 资源创建成功。
- `400 Bad Request`: 请求参数错误。
- `401 Unauthorized`: 未授权。
- `403 Forbidden`: 已授权但无权限。
- `404 Not Found`: 资源不存在。
- `500 Internal Server Error`: 服务器内部错误。

## 安全性建议

- **HTTPS**: 必须全程加密。
- **认证**: 使用 JWT 或 OAuth2.0。
- **过滤**: 严格校验输入，防止 SQL 注入和 XSS。
- **限流**: 防止恶意暴力请求。
