import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

export interface Heading {
    id: string
    text: string
    level: number
}

export function useTOC() {
    const headings = ref<Heading[]>([])
    const route = useRoute()

    const extractHeadings = () => {
        // Determine the selector based on the environment (e.g., if using a specific class for markdown content)
        // Here assuming '.markdown-body' as per existing code
        const selector = '.markdown-body h2, .markdown-body h3'

        // Use a small delay to ensure DOM is ready (simplest approach for now, 
        // ideally should hook into markdown rendering lifecycle if possible)
        setTimeout(() => {
            const elements = document.querySelectorAll(selector)
            headings.value = Array.from(elements).map((el) => {
                const id = el.id || el.textContent?.toLowerCase().replace(/\s+/g, '-') || ''
                // Ensure element has an ID for linking
                if (!el.id) {
                    el.id = id
                }
                return {
                    id,
                    text: el.textContent || '',
                    level: el.tagName === 'H2' ? 2 : 3,
                }
            })
        }, 100)
    }

    onMounted(() => {
        extractHeadings()
    })

    watch(() => route.path, () => {
        extractHeadings()
    })

    return {
        headings
    }
}
