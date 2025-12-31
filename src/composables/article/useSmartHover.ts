import { ref, reactive, watch } from 'vue'
import { getArticleByPath, type SearchResult } from '@/composables/core/useSearch'
import { useRouter } from 'vue-router'

// Constants
const HOVER_CARD_WIDTH = 320
const HOVER_CARD_HEIGHT = 180
const HOVER_CARD_GAP = 12
const HOVER_CARD_MARGIN_SCREEN_EDGE = 16

const HOVER_SHOW_DELAY = 500
const HOVER_HIDE_DELAY = 100

// Global state to ensure singleton behavior
const visible = ref(false)
const isHoveringCard = ref(false)
const position = reactive({ x: 0, y: 0 })
const content = ref<SearchResult | null>(null)
const loading = ref(false)
const currentPath = ref('')

let hoverTimeout: any
let leaveTimeout: any

export function useSmartHover() {
  const router = useRouter()

  const show = async (path: string, rect: DOMRect) => {
    clearTimeout(leaveTimeout)

    // Normalize path (remove hash, etc)
    const cleanPath = path ? path.split('#')[0] : ''

    if (!cleanPath) return

    // If already showing this path
    if (visible.value && currentPath.value === cleanPath) {
      return
    }

    currentPath.value = cleanPath

    loading.value = true
    content.value = null
    visible.value = true

    // --- Smart Positioning ---
    const cardWidth = HOVER_CARD_WIDTH
    const cardHeight = HOVER_CARD_HEIGHT
    const gap = HOVER_CARD_GAP
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // X Axis: Center horizontally relative to link
    let left = rect.left + rect.width / 2 - cardWidth / 2

    // Boundary check X
    if (left < HOVER_CARD_MARGIN_SCREEN_EDGE) left = HOVER_CARD_MARGIN_SCREEN_EDGE
    if (left + cardWidth > viewportWidth - HOVER_CARD_MARGIN_SCREEN_EDGE)
      left = viewportWidth - cardWidth - HOVER_CARD_MARGIN_SCREEN_EDGE

    // Y Axis: Default bottom
    let top = rect.bottom + gap

    // If not enough space below, try above
    if (top + cardHeight > viewportHeight) {
      const spaceAbove = rect.top - gap
      if (spaceAbove > cardHeight) {
        top = rect.top - cardHeight - gap
      } else {
        // Not enough space above or below?
        // fallback to bottom, but careful.
        // Or flip to side? For now keep it simple.
        // Adjust top to fit if needed
        if (top + cardHeight > viewportHeight) {
          top = viewportHeight - cardHeight - 10
        }
      }
    }

    position.x = left
    position.y = top

    // --- Fetch Data ---
    try {
      const data = await getArticleByPath(cleanPath)
      if (cleanPath === currentPath.value) {
        if (data) {
          content.value = data
        } else {
          // If no data found, maybe hide or show empty?
          // For now, if no data, we might want to hide the card because an empty card is annoying.
          // But "Loading" was shown.
          // Let's keep it visible but empty state says "No preview"
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      if (cleanPath === currentPath.value) {
        loading.value = false
        // If loaded and no content, maybe hide after a brief moment?
        if (!content.value) {
          // Optional: visible.value = false
        }
      }
    }
  }

  const hide = (delay = HOVER_HIDE_DELAY) => {
    clearTimeout(leaveTimeout)
    leaveTimeout = setTimeout(() => {
      if (!isHoveringCard.value) {
        visible.value = false
        currentPath.value = ''
      }
    }, delay)
  }

  // Attach listeners to a container's links
  const attachToContent = (container: HTMLElement) => {
    if (!container) return

    // Find all internal links
    const links = container.querySelectorAll('a')
    links.forEach((link) => {
      const href = link.getAttribute('href')
      if (!href) return

      // Filter external links
      if (href.startsWith('http') || href.startsWith('mailto:')) return

      // Add hover listeners
      link.addEventListener('mouseenter', () => {
        clearTimeout(leaveTimeout)
        hoverTimeout = setTimeout(() => {
          show(href, link.getBoundingClientRect())
        }, HOVER_SHOW_DELAY) // delay to prevent accidental triggers
      })

      link.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout)
        hide()
      })

      // Add click listener for smart navigation
      link.addEventListener('click', async (e) => {
        e.preventDefault()

        // 1. Try to use currently loaded content if it matches
        // (Fastest path: user hovered then clicked)
        const cleanPath = href ? href.split('#')[0] : ''
        if (!cleanPath) return

        if (content.value && currentPath.value === cleanPath && content.value.id) {
          router.push('/' + content.value.id)
          return
        }

        // 2. Resolve manually
        try {
          const article = await getArticleByPath(href)
          if (article && article.id) {
            router.push('/' + article.id)
          } else {
            // Fallback: 尝试 slugify 后的绝对路径
            const slug = cleanPath.toLowerCase().replace(/\s+/g, '-')
            router.push(`/${slug}`)
          }
        } catch (err) {
          const slug = cleanPath.toLowerCase().replace(/\s+/g, '-')
          router.push(`/${slug}`)
        }
      })
    })
  }

  watch(isHoveringCard, (val) => {
    if (!val) {
      hide()
    } else {
      clearTimeout(leaveTimeout)
    }
  })

  // 监听路由变化，确保在页面跳转后销毁卡片
  watch(
    () => router.currentRoute.value.path,
    () => {
      visible.value = false
      currentPath.value = ''
      isHoveringCard.value = false
    }
  )

  return {
    visible,
    position,
    content,
    loading,
    isHoveringCard,
    show,
    hide,
    attachToContent
  }
}
