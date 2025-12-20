# FastAPI 指南 (Python)

FastAPI 是一个现代、快速（高性能）的 Web 框架，用于基于标准 Python 3.6+ 类型提示构建 API。

## 主要优点

- **速度快**: 与 NodeJS 和 Go 并肩（由于 Starlette 和 Pydantic）。
- **减少人为错误**: 减少约 40% 的开发错误。
- **自动文档**: 基于 OpenAPI 和 JSON Schema 自动生成交互式文档 (Swagger UI)。

## 核心用法

### 1. 定义路由

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def read_root():
    return {"Hello": "World"}
```

### 2. 数据验证 (Pydantic)

```python
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    price: float
    is_offer: bool = None

@app.post("/items/")
def create_item(item: Item):
    return item
```

## 异步编程

FastAPI 原生支持 `async` 和 `await`，非常适合 I/O 密集型应用。
