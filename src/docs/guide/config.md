# 配置说明

本文介绍 Lumina 的配置选项。

## Vite 配置

主要配置位于 `vite.config.ts`：

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Markdown from 'unplugin-vue-markdown/vite'
import Pages from 'vite-plugin-pages'

export default defineConfig({
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    Markdown({
      headEnabled: true,
    }),
    Pages({
      dirs: 'src/pages',
      extensions: ['vue', 'md'],
    }),
  ],
})
```

## Tailwind 配置

样式配置位于 `tailwind.config.js`：

```javascript
export default {
  content: ['./src/**/*.{vue,js,ts,md}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#0ea5e9',
          // ...
        },
      },
    },
  },
}
```

## 主题定制

### CSS 变量

你可以通过修改 `src/style.css` 中的 CSS 变量来自定义主题：

```css
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a2e;
  --color-link: #0ea5e9;
}

.dark {
  --color-bg: #0f172a;
  --color-text: #f1f5f9;
  --color-link: #38bdf8;
}
```

## 路由配置

路由由 `vite-plugin-pages` 自动生成，你也可以通过 `extendRoute` 自定义：

```typescript
Pages({
  extendRoute(route) {
    if (route.component.endsWith('.md')) {
      return {
        ...route,
        meta: { layout: 'doc' },
      }
    }
    return route
  },
})
```
