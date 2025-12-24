import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

// 存储已解锁文档的 key 前缀
const STORAGE_KEY_PREFIX = 'lumina_unlocked_'

// 模块级共享状态（确保所有组件使用同一份状态）
const error = ref('')
const isUnlocked = ref(false)

/**
 * 密码保护功能 Composable
 * 用于管理文档的密码保护状态和验证逻辑
 */
export function usePasswordProtect() {
  const route = useRoute()

  // 当前文档的密码哈希（从路由 meta 获取）
  const passwordHash = computed(() => route.meta.passwordHash as string | null)

  // 当前文档是否受密码保护
  const isProtected = computed(() => !!passwordHash.value)

  // 当前文档的唯一标识（用于 sessionStorage）
  const documentKey = computed(() => `${STORAGE_KEY_PREFIX}${route.path}`)

  /**
   * SHA-256 哈希函数
   */
  async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * 验证密码
   */
  async function verifyPassword(password: string): Promise<boolean> {
    if (!passwordHash.value) return true

    const inputHash = await hashPassword(password)
    const isValid = inputHash === passwordHash.value

    if (isValid) {
      isUnlocked.value = true
      error.value = ''
      // 保存解锁状态到 sessionStorage
      try {
        sessionStorage.setItem(documentKey.value, 'true')
      } catch {
        // sessionStorage 不可用时静默失败
      }
    } else {
      error.value = '密码错误，请重试'
    }

    return isValid
  }

  /**
   * 检查是否已解锁（从 sessionStorage 恢复状态）
   */
  function checkUnlocked(): boolean {
    if (!isProtected.value) {
      isUnlocked.value = true
      return true
    }

    try {
      const stored = sessionStorage.getItem(documentKey.value)
      isUnlocked.value = stored === 'true'
    } catch {
      isUnlocked.value = false
    }

    return isUnlocked.value
  }

  /**
   * 重置状态（用于锁定文档，便于测试）
   */
  function lock() {
    isUnlocked.value = false
    error.value = ''
    try {
      sessionStorage.removeItem(documentKey.value)
    } catch {
      // 静默失败
    }
  }

  // 监听路由变化，重新检查解锁状态
  watch(
    () => route.path,
    () => {
      error.value = ''
      checkUnlocked()
    },
    { immediate: true }
  )

  return {
    isProtected,
    isUnlocked,
    error,
    verifyPassword,
    checkUnlocked,
    lock,
    hashPassword
  }
}
