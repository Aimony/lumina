<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { usePasswordProtect } from '@/composables/article/usePasswordProtect'

const { error, verifyPassword } = usePasswordProtect()

const emit = defineEmits<{
  unlock: []
}>()

const password = ref('')
const isLoading = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const isShaking = ref(false)

async function handleSubmit() {
  if (!password.value.trim() || isLoading.value) return

  isLoading.value = true

  try {
    const success = await verifyPassword(password.value)
    if (success) {
      emit('unlock')
    } else {
      // 错误时触发抖动动画
      isShaking.value = true
      setTimeout(() => {
        isShaking.value = false
      }, 500)
      password.value = ''
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  nextTick(() => {
    inputRef.value?.focus()
  })
})
</script>

<template>
  <div class="password-protect">
    <div class="password-protect__overlay"></div>
    <div class="password-protect__container" :class="{ 'is-shaking': isShaking }">
      <div class="password-protect__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>

      <h2 class="password-protect__title">此文档受密码保护</h2>
      <p class="password-protect__subtitle">请输入密码以查看内容</p>

      <form @submit.prevent="handleSubmit" class="password-protect__form">
        <div class="password-protect__input-wrapper">
          <input
            ref="inputRef"
            v-model="password"
            type="password"
            placeholder="输入密码"
            class="password-protect__input"
            :disabled="isLoading"
            autocomplete="current-password"
          />
        </div>

        <p v-if="error" class="password-protect__error">{{ error }}</p>

        <button
          type="submit"
          class="password-protect__button"
          :disabled="isLoading || !password.trim()"
        >
          <span v-if="isLoading" class="password-protect__spinner"></span>
          <span v-else>解锁</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.password-protect {
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;

  &__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--vp-c-bg) 0%, var(--vp-c-bg-soft) 100%);
    backdrop-filter: blur(8px);
  }

  &__container {
    position: relative;
    z-index: 1;
    max-width: 360px;
    width: 100%;
    padding: 48px 32px;
    text-align: center;
    background: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

    &.is-shaking {
      animation: shake 0.5s ease-in-out;
    }
  }

  &__icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 24px;
    padding: 16px;
    background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
    border-radius: 50%;
    color: white;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  &__title {
    margin: 0 0 8px;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--vp-c-text-1);
  }

  &__subtitle {
    margin: 0 0 24px;
    font-size: 0.875rem;
    color: var(--vp-c-text-2);
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__input-wrapper {
    position: relative;
  }

  &__input {
    width: 100%;
    padding: 12px 16px;
    font-size: 1rem;
    color: var(--vp-c-text-1);
    background: var(--vp-c-bg);
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    outline: none;
    transition:
      border-color 0.2s,
      box-shadow 0.2s;

    &:focus {
      border-color: var(--vp-c-brand-1);
      box-shadow: 0 0 0 3px rgba(var(--vp-c-brand-1-rgb, 100, 108, 255), 0.15);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &::placeholder {
      color: var(--vp-c-text-3);
    }
  }

  &__error {
    margin: 0;
    font-size: 0.875rem;
    color: var(--vp-c-danger-1);
  }

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 500;
    color: white;
    background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition:
      transform 0.2s,
      box-shadow 0.2s,
      opacity 0.2s;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(var(--vp-c-brand-1-rgb, 100, 108, 255), 0.3);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }

  20% {
    transform: translateX(-10px);
  }

  40% {
    transform: translateX(10px);
  }

  60% {
    transform: translateX(-10px);
  }

  80% {
    transform: translateX(10px);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
