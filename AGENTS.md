# Agent Coding Guidelines for Lumina

This document provides essential conventions for AI agents working on the Lumina codebase.

---

## Build / Lint / Test Commands

```bash
# Development
npm run dev              # Start dev server with auto-build
npm run build            # Production build

# Code Quality
npm run lint             # Run ESLint (auto-fixes most issues)
npm run tsc              # TypeScript type checking
npm run format           # Run Prettier on src/

# Data Generation (pre-build)
npm run data             # Generate search index and graph data
```

**Running single tests**: This project does not currently have a test suite. Focus on manual testing and lint/type checking.

---

## Code Style Guidelines

### Imports

Order imports consistently:

```typescript
// 1. Vue ecosystem
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// 2. External libraries
import mermaid from 'mermaid'

// 3. Project internal (use @/ alias)
import { useDocsTree } from '@/composables/article/useDocsTree'
import { type DocTreeNode } from '@/composables/article/useDocsTree'

// 4. Components (only in .vue files)
import Navbar from '@/components/layout/Navbar.vue'

// 5. Config/Types
import { navItems } from '@/config/nav'
```

### Naming Conventions

- **Composables**: `useXxx` - e.g., `useTheme()`, `useSearch()`
- **Components**: PascalCase - e.g., `Navbar`, `ThemeToggle`
- **Interfaces/Types**: PascalCase - e.g., `DocTreeNode`, `SearchResult`
- **Constants**: UPPER_SNAKE_CASE or camelCase - e.g., `STORAGE_KEY`, `isDark`
- **Functions/Variables**: camelCase - e.g., `getValidPath()`, `isMobileMenuOpen`

### Formatting (Prettier)

- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: No semicolons
- **Line width**: 100 characters
- **Trailing commas**: None

```typescript
// Correct
const isActive = (path: string) => route.path === path

const handleClick = () => {
  console.log('clicked')
}

// Incorrect
const isActive = (path: string) => {
  return route.path === path
}
```

### TypeScript Rules

- **Strict mode**: Enabled in tsconfig
- **No any types**: Avoid `any` - use proper types or `unknown`
- **Define types**: Export types used across modules
- **Unused variables**: Configured to error - remove or prefix with `_`

```typescript
// Good
export interface Heading {
  id: string
  text: string
  level: number
}

// Bad
const data: any = fetchSomething()
```

### Vue Components

- Use `<script setup lang="ts">` syntax
- Define props with TypeScript syntax
- Use `defineProps` and `defineEmits`
- Keep styles scoped, use scss
- Prefer composition API over Options API

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DocTreeNode } from '@/types'

interface Props {
  node: DocTreeNode
}

const props = defineProps<Props>()
const isExpanded = ref(false)
</script>

<template>
  <div class="node" @click="toggle">
    {{ node.title }}
  </div>
</template>

<style scoped lang="scss">
.node {
  cursor: pointer;
}
</style>
```

### Error Handling

- Use try-catch for async operations
- Provide fallback values for non-critical features
- Log errors with context
- Use JSDoc comments for public functions

```typescript
async function loadData() {
  try {
    const response = await fetch('/api/data')
    return await response.json()
  } catch (error) {
    console.error('Failed to load data:', error)
    return null
  }
}
```

### File Structure

```
src/
├── components/      # Reusable UI components
│   ├── common/      # Generic components (Button, Modal)
│   ├── layout/      # Layout components (Navbar, Sidebar)
│   └── article/     # Article-specific components (TOC, Backlinks)
├── composables/     # Reusable composition functions
│   ├── core/        # Core functionality (theme, search)
│   ├── ui/          # UI logic (context menu, code copy)
│   └── article/     # Article logic (TOC, tags)
├── stores/          # Pinia stores
├── pages/           # Route pages
├── layouts/         # Page layouts
├── config/          # Configuration files
├── types/           # TypeScript type definitions
└── styles/          # Global styles
```

### Component Size Guidelines

- Prefer smaller, focused components (< 300 lines)
- Extract complex logic into composables
- Break down large components using sub-components
- Use composition API for shared logic

### CSS/Styles

- Use CSS custom properties (variables) for theming
- Scoped styles in Vue components
- Tailwind CSS for utility classes
- Maintain theme consistency with `--vp-c-*` variables

```css
.component {
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}
```

### Git Conventions

- Use commitizen: `npm run commit`
- Follow conventional commits (feat, fix, docs, etc.)
- Run `npm run lint` and `npm run tsc` before committing

### Additional Notes

- Use `@/` alias for all internal imports
- Password hashing uses SHA-256 (client-side only)
- Markdown files can contain Vue components directly
- Office files use dedicated preview components
- Search uses Web Workers for performance
