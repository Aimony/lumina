# React 生态下的样式解决方案

在 React 中写样式有很多种选择，从全局 CSS 到 CSS-in-JS。每种方案都有其优缺点，选择适合团队和项目的方案至关重要。

## 1. CSS Modules：经典之选

通过在文件名后缀添加 `.module.css`，构建工具会自动为类名添加哈希，解决全局命名冲突问题。

```jsx
import styles from './Button.module.css'

function Button() {
  return <button className={styles.error}>Delete</button>
}
```

- **优点**：原生 CSS 语法，学习成本低，性能好（零运行开销）。

## 2. Styled Components：CSS-in-JS

在 JavaScript 中写样式，利用模板字符串提供强大的样式逻辑处理能力。

```jsx
const Button = styled.button`
  background: ${(props) => (props.primary ? 'blue' : 'gray')};
  color: white;
  padding: 10px;
`
```

- **优点**：样式与逻辑紧密耦合，支持 Props 动态修改样式。
- **缺点**： runtime 开销大，增加了包体积。

## 3. Tailwind CSS：当前的潮流

实用优先（Utility-first）的 CSS 框架。通过在 HTML 中组合预定义的类来快速构建 UI。

```jsx
function Card() {
  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">
      <div className="text-xl font-medium text-black">ChitChat</div>
    </div>
  )
}
```

- **优点**：开发效率极高，包体积最小化（PurgeCSS），无需为起类名而烦恼。

## 总结：如何选型？

> [!IMPORTANT]
>
> - **希望极致性能且语法传统**：选 CSS Modules。
> - **追求开发灵活性与样式复用**：选 Tailwind CSS。
> - **需要高度动态化、逻辑驱动的样式**：选 Styled Components。

无论选哪种，核心目标都是为了实现**样式的封装性**和**可维护性**。
