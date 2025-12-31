import { defineComponent, ref, computed, Transition } from 'vue'
import type { PropType } from 'vue'
import './CounterCard.scss'

/**
 * 计数器卡片组件 - TSX 教学示例
 *
 * 本组件使用 TSX 语法编写，展示了 Vue TSX 的核心特性：
 * - Props 类型定义
 * - 响应式状态
 * - 事件处理
 * - 计算属性
 * - 条件渲染
 * - 列表渲染
 * - 插槽
 * - 样式处理
 */

// 定义 Props 类型接口
interface CounterCardProps {
  /** 初始计数值 */
  initialValue?: number
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
  /** 步长 */
  step?: number
  /** 主题色 */
  themeColor?: 'primary' | 'success' | 'warning' | 'danger'
  /** 是否禁用 */
  disabled?: boolean
  /** 历史记录标签 */
  historyLabels?: string[]
}

// Emit 事件类型定义示例（此处使用 emits 数组定义，类型由 Vue 推断）
// 如需更精确的类型，可使用 defineComponent 的泛型参数

export default defineComponent({
  name: 'CounterCard',

  // ===== Props 定义 =====
  // TSX 中使用对象语法定义 props，需要显式声明类型
  props: {
    initialValue: {
      type: Number as PropType<number>,
      default: 0
    },
    min: {
      type: Number as PropType<number>,
      default: 0
    },
    max: {
      type: Number as PropType<number>,
      default: 100
    },
    step: {
      type: Number as PropType<number>,
      default: 1
    },
    themeColor: {
      type: String as PropType<CounterCardProps['themeColor']>,
      default: 'primary',
      validator: (v: string) => ['primary', 'success', 'warning', 'danger'].includes(v)
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    historyLabels: {
      type: Array as PropType<string[]>,
      default: () => ['上次', '今天', '本周']
    }
  },

  // ===== Emits 定义 =====
  emits: ['change', 'limit-reached'] as const,

  // ===== Setup 函数 =====
  // TSX 中所有逻辑都在 setup 中编写，返回 render 函数
  setup(props, { emit, slots, expose }) {
    // ----- 响应式状态 -----
    const count = ref(props.initialValue)
    const history = ref<number[]>([])
    const isAnimating = ref(false)

    // ----- 计算属性 -----
    const isAtMin = computed(() => count.value <= props.min)
    const isAtMax = computed(() => count.value >= props.max)

    const progressPercentage = computed(() => {
      const range = props.max - props.min
      return ((count.value - props.min) / range) * 100
    })

    // 默认主题色
    const defaultTheme = { bg: '#e0f2fe', text: '#0369a1', progress: '#0ea5e9' }

    const themeStyles = computed(() => {
      const colors: Record<string, { bg: string; text: string; progress: string }> = {
        primary: { bg: '#e0f2fe', text: '#0369a1', progress: '#0ea5e9' },
        success: { bg: '#dcfce7', text: '#15803d', progress: '#22c55e' },
        warning: { bg: '#fef3c7', text: '#b45309', progress: '#f59e0b' },
        danger: { bg: '#fee2e2', text: '#b91c1c', progress: '#ef4444' }
      }
      return colors[props.themeColor] ?? defaultTheme
    })

    // ----- 方法 -----
    const increment = () => {
      if (props.disabled || isAtMax.value) {
        if (isAtMax.value) emit('limit-reached', 'max')
        return
      }
      history.value.push(count.value)
      count.value = Math.min(count.value + props.step, props.max)
      triggerAnimation()
      emit('change', count.value)
    }

    const decrement = () => {
      if (props.disabled || isAtMin.value) {
        if (isAtMin.value) emit('limit-reached', 'min')
        return
      }
      history.value.push(count.value)
      count.value = Math.max(count.value - props.step, props.min)
      triggerAnimation()
      emit('change', count.value)
    }

    const reset = () => {
      history.value.push(count.value)
      count.value = props.initialValue
      triggerAnimation()
      emit('change', count.value)
    }

    const triggerAnimation = () => {
      isAnimating.value = true
      setTimeout(() => {
        isAnimating.value = false
      }, 300)
    }

    // ----- 暴露给父组件的方法 -----
    expose({
      reset,
      getCurrentValue: () => count.value
    })

    // ===== Render 函数 =====
    // TSX 核心：返回一个 render 函数，使用 JSX 语法描述 UI
    return () => (
      <div
        class={[
          'counter-card',
          {
            'counter-card--disabled': props.disabled,
            'counter-card--animating': isAnimating.value
          }
        ]}
        style={{
          backgroundColor: themeStyles.value.bg,
          borderColor: themeStyles.value.progress,
          opacity: props.disabled ? 0.6 : 1
        }}
      >
        {/* ----- 头部插槽 ----- */}
        {/* TSX 中通过 slots.xxx?.() 调用具名插槽 */}
        {slots.header ? (
          <div class="counter-card__header">{slots.header()}</div>
        ) : (
          <div class="counter-card__header">
            <h3 style={{ color: themeStyles.value.text }}>🎯 计数器</h3>
          </div>
        )}

        {/* ----- 主体内容 ----- */}
        <div class="counter-card__body">
          {/* 进度条 */}
          <div class="counter-card__progress">
            <div
              class="counter-card__progress-bar"
              style={{
                width: `${progressPercentage.value}%`,
                backgroundColor: themeStyles.value.progress
              }}
            />
          </div>

          {/* 计数显示 - TSX 中的条件渲染使用三元表达式或 && */}
          <Transition name="fade" mode="out-in">
            <div
              key={count.value}
              class="counter-card__value"
              style={{ color: themeStyles.value.text }}
            >
              {count.value}
            </div>
          </Transition>

          {/* 控制按钮 */}
          <div class="counter-card__controls">
            <button
              class="counter-card__btn counter-card__btn--decrement"
              onClick={decrement}
              disabled={props.disabled || isAtMin.value}
              style={{ borderColor: themeStyles.value.progress }}
            >
              −
            </button>
            <button
              class="counter-card__btn counter-card__btn--reset"
              onClick={reset}
              disabled={props.disabled}
              style={{
                backgroundColor: themeStyles.value.progress,
                color: '#fff'
              }}
            >
              重置
            </button>
            <button
              class="counter-card__btn counter-card__btn--increment"
              onClick={increment}
              disabled={props.disabled || isAtMax.value}
              style={{ borderColor: themeStyles.value.progress }}
            >
              +
            </button>
          </div>

          {/* 范围提示 */}
          <div class="counter-card__range">
            <span>最小: {props.min}</span>
            <span>步长: {props.step}</span>
            <span>最大: {props.max}</span>
          </div>
        </div>

        {/* ----- 历史记录 - 列表渲染 ----- */}
        {/* TSX 中使用 .map() 进行列表渲染 */}
        {history.value.length > 0 && (
          <div class="counter-card__history">
            <h4>操作历史</h4>
            <ul>
              {history.value.slice(-5).map((value, index) => (
                <li key={index}>
                  {/* 使用 props 中的标签数组 */}
                  <span class="counter-card__history-label">
                    {props.historyLabels[index] || `第${index + 1}次`}
                  </span>
                  <span class="counter-card__history-value">{value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ----- 底部插槽 ----- */}
        {slots.footer && <div class="counter-card__footer">{slots.footer()}</div>}

        {/* ----- 默认插槽 ----- */}
        {slots.default && <div class="counter-card__extra">{slots.default()}</div>}
      </div>
    )
  }
})
