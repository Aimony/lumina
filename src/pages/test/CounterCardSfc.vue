<script setup lang="ts">
/**
 * 计数器卡片组件 - SFC 教学示例
 *
 * 本组件使用 Vue 传统单文件组件 (SFC) 语法编写
 * 用于与 CounterCard.tsx 进行对比学习
 */
import { ref, computed } from 'vue'

// ===== Props 定义 =====
// SFC 中使用 defineProps + TypeScript 接口定义
interface Props {
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

const props = withDefaults(defineProps<Props>(), {
  initialValue: 0,
  min: 0,
  max: 100,
  step: 1,
  themeColor: 'primary',
  disabled: false,
  historyLabels: () => ['上次', '今天', '本周']
})

// ===== Emits 定义 =====
// SFC 中使用 defineEmits
const emit = defineEmits<{
  change: [value: number]
  'limit-reached': [type: 'min' | 'max']
}>()

// ===== 响应式状态 =====
const count = ref(props.initialValue)
const history = ref<number[]>([])
const isAnimating = ref(false)

// ===== 计算属性 =====
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

// ===== 方法 =====
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

// ===== 暴露给父组件的方法 =====
defineExpose({
  reset,
  getCurrentValue: () => count.value
})
</script>

<template>
  <div
    class="counter-card"
    :class="{
      'counter-card--disabled': disabled,
      'counter-card--animating': isAnimating
    }"
    :style="{
      backgroundColor: themeStyles.bg,
      borderColor: themeStyles.progress,
      opacity: disabled ? 0.6 : 1
    }"
  >
    <!-- 头部插槽 -->
    <!-- SFC 中使用 <slot> 标签定义插槽 -->
    <div class="counter-card__header">
      <slot name="header">
        <h3 :style="{ color: themeStyles.text }">🎯 计数器</h3>
      </slot>
    </div>

    <!-- 主体内容 -->
    <div class="counter-card__body">
      <!-- 进度条 -->
      <div class="counter-card__progress">
        <div
          class="counter-card__progress-bar"
          :style="{
            width: `${progressPercentage}%`,
            backgroundColor: themeStyles.progress
          }"
        />
      </div>

      <!-- 计数显示 - SFC 中的 Transition -->
      <Transition name="fade" mode="out-in">
        <div :key="count" class="counter-card__value" :style="{ color: themeStyles.text }">
          {{ count }}
        </div>
      </Transition>

      <!-- 控制按钮 -->
      <div class="counter-card__controls">
        <button
          class="counter-card__btn counter-card__btn--decrement"
          @click="decrement"
          :disabled="disabled || isAtMin"
          :style="{ borderColor: themeStyles.progress }"
        >
          −
        </button>
        <button
          class="counter-card__btn counter-card__btn--reset"
          @click="reset"
          :disabled="disabled"
          :style="{
            backgroundColor: themeStyles.progress,
            color: '#fff'
          }"
        >
          重置
        </button>
        <button
          class="counter-card__btn counter-card__btn--increment"
          @click="increment"
          :disabled="disabled || isAtMax"
          :style="{ borderColor: themeStyles.progress }"
        >
          +
        </button>
      </div>

      <!-- 范围提示 -->
      <div class="counter-card__range">
        <span>最小: {{ min }}</span>
        <span>步长: {{ step }}</span>
        <span>最大: {{ max }}</span>
      </div>
    </div>

    <!-- 历史记录 - 列表渲染 -->
    <!-- SFC 中使用 v-for 指令 -->
    <div v-if="history.length > 0" class="counter-card__history">
      <h4>操作历史</h4>
      <ul>
        <li v-for="(value, index) in history.slice(-5)" :key="index">
          <span class="counter-card__history-label">
            {{ historyLabels[index] || `第${index + 1}次` }}
          </span>
          <span class="counter-card__history-value">{{ value }}</span>
        </li>
      </ul>
    </div>

    <!-- 底部插槽 -->
    <div v-if="$slots.footer" class="counter-card__footer">
      <slot name="footer" />
    </div>

    <!-- 默认插槽 -->
    <div v-if="$slots.default" class="counter-card__extra">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './CounterCard.scss';
</style>
