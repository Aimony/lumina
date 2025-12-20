# React 表单处理：从受控组件到 React Hook Form

在 React 中处理表单可能非常繁琐，特别是当你需要实时验证、处理数十个字段或关联验证时。

## 1. 受控组件 (Controlled Components)

这是 React 官方推荐的模式。表单数据由 React 组件的 state 处理。

```jsx
function ControlledForm() {
  const [value, setValue] = useState('')

  return <input value={value} onChange={(e) => setValue(e.target.value)} />
}
```

- **优点**：可以随时修改、验证值。
- **缺点**：字段多了之后，State 数量激增，每次按键都会导致组件重绘。

## 2. 非受控组件 (Uncontrolled Components)

数据存储在 DOM 节点中，而不是组件内部。使用 `useRef` 来从 DOM 节点中获取表单数据。

```jsx
function UncontrolledForm() {
  const inputRef = useRef(null)
  const handleSubmit = () => console.log(inputRef.current.value)

  return <input ref={inputRef} />
}
```

## 3. 实战推荐：React Hook Form

当你的表单变得复杂时，手动管理 state 会让你感到崩溃。`React Hook Form` 通过“非受控”底层实现和“受控”逻辑封装，提供了极简的 API 和高性能体验。

```jsx
import { useForm } from 'react-hook-form'

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()
  const onSubmit = (data) => console.log(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: true })} />
      {errors.email && <span>必须填写邮箱</span>}
      <input type="submit" />
    </form>
  )
}
```

## 4. 模式选型建议

> [!TIP]
>
> - **简单搜索框/登录框**：使用受控组件。
> - **对性能要求极高的庞大表单**：使用非受控组件。
> - **中大型项目/复杂表单**：**直接上 React Hook Form**，这是目前行业的最优解。

## 总结

选择正确的表单模式能大幅减少你的样板代码，并提升用户的交互体验。
