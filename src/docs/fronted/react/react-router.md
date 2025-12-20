# React Router 路由管理：构建 SPA 的核心

React Router 是 React 生态中构建单页应用（SPA）的事实标准。它允许我们将 URL 与特定的组件关联起来。

## 1. 基础配置

在现代项目中，我们通常使用 `BrowserRouter` 来包裹整个应用。

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## 2. 动态路由与参数获取

通过在路径中使用 `:` 来定义动态部分，并使用 `useParams` 获取。

```jsx
// 路由定义：<Route path="/user/:id" element={<UserProfile />} />

import { useParams } from "react-router-dom";

function UserProfile() {
  let { id } = useParams();
  return <div>当前用户 ID: {id}</div>;
}
```

## 3. 编程式导航

除了使用 `<Link>` 组件，我们还可以通过 `useNavigate` 钩子在代码中跳转。

```jsx
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const handleSubmit = () => {
    // 登录完成后跳转到首页
    navigate("/");
  };
  return <button onClick={handleSubmit}>登录</button>;
}
```

## 4. 路由守卫与私有路由

> [!TIP]
> **保护你的路由**：不要手动在每个页面写判断，而是利用组件复合来实现通用拦截。

```jsx
function PrivateRoute({ children }) {
  const auth = useAuth(); // 假设的 Auth Hook
  return auth.isLoggedIn ? children : <Navigate to="/login" replace />;
}

// 使用：
// <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
```

## 总结
React Router 不仅仅是地址栏的映射，它提供的嵌套路由（Outlet）、数据加载器（Loaders）等特性可以让你的应用结构不仅清晰，而且加载性能更佳。
