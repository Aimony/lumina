import { ref, watch } from 'vue'
import { getAllArticles } from '@/composables/core/useSearch'
import { useRoute } from 'vue-router'

export interface Backlink {
  sourceId: string
  sourceTitle: string
  snippet: string
  tags: string[]
}

export function useBacklinks() {
  const route = useRoute()
  const backlinks = ref<Backlink[]>([])
  const loading = ref(false)

  // Regex to match [[Target]] or [[Target|Label]]
  // Capturing group 1 is the target
  const WIKILINK_REGEX = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g

  const findBacklinks = async () => {
    loading.value = true
    try {
      const allDocs = await getAllArticles()
      const currentPath = route.path
      const currentId = currentPath.replace(/^\//, '') // Remove leading slash

      const found: Backlink[] = []

      for (const doc of allDocs) {
        // Skip self
        if (doc.id === currentId) continue

        const content = doc.content
        let match

        // Reset regex index
        WIKILINK_REGEX.lastIndex = 0

        while ((match = WIKILINK_REGEX.exec(content)) !== null) {
          if (!match[1]) continue
          const rawTarget = match[1].trim()

          // Logic to check if rawTarget points to currentId
          // 1. Exact match
          // 2. Slug match (e.g. "Digital Garden" matches "example/digital-garden" if id ends with it)
          const targetSlug = rawTarget.toLowerCase().replace(/\s+/g, '-')

          const isMatch =
            rawTarget === currentId ||
            currentId.endsWith('/' + targetSlug) ||
            currentId === targetSlug

          if (isMatch) {
            // Extract snippet
            const matchIndex = match.index
            const snippetStart = Math.max(0, matchIndex - 60)
            const snippetEnd = Math.min(content.length, matchIndex + match[0].length + 60)

            let snippet = content.slice(snippetStart, snippetEnd)

            // Add ellipsis if truncated
            if (snippetStart > 0) snippet = '...' + snippet
            if (snippetEnd < content.length) snippet = snippet + '...'

            // Highlight the link in the snippet (optional, maybe UI handles it)
            // For now just clean data

            found.push({
              sourceId: doc.id,
              sourceTitle: doc.title,
              snippet: snippet,
              tags: doc.tags || []
            })

            // Break after finding one link in this doc to avoid duplicates from same doc?
            // Or show multiple? Let's show one per doc for now to keep it clean.
            break
          }
        }
      }

      backlinks.value = found
    } catch (e) {
      console.error('Failed to fetch backlinks', e)
    } finally {
      loading.value = false
    }
  }

  // Watch route changes to re-fetch
  watch(
    () => route.path,
    () => {
      findBacklinks()
    },
    { immediate: true }
  )

  return {
    backlinks,
    loading
  }
}
