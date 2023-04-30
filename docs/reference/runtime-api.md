# Runtime API

VitePress offers several built-in APIs to let you access app data. VitePress also comes with a few built-in components that can be used globally.

The helper methods are globally importable from `vitepress` and are typically used in custom theme Vue components. However, they are also usable inside `.md` pages because markdown files are compiled into Vue [Single-File Components](https://vuejs.org/guide/scaling-up/sfc.html).

Methods that start with `use*` indicates that it is a [Vue 3 Composition API](https://vuejs.org/guide/introduction.html#composition-api) function ("Composable") that can only be used inside `setup()` or `<script setup>`.

## `useData` <Badge type="info" text="composable" />

Returns page-specific data. The returned object has the following type:

```ts
interface VitePressData<T = any> {
  /**
   * Site-level metadata
   */
  site: Ref<SiteData<T>>
  /**
   * themeConfig from .vitepress/config.js
   */
  theme: Ref<T>
  /**
   * Page-level metadata
   */
  page: Ref<PageData>
  /**
   * Page frontmatter
   */
  frontmatter: Ref<PageData['frontmatter']>
  /**
   * Dynamic route params
   */
  params: Ref<PageData['params']>
  title: Ref<string>
  description: Ref<string>
  lang: Ref<string>
  isDark: Ref<boolean>
  dir: Ref<string>
  localeIndex: Ref<string>
}

interface PageData {
  title: string
  titleTemplate?: string | boolean
  description: string
  relativePath: string
  filePath: string,
  headers: Header[]
  frontmatter: Record<string, any>
  params?: Record<string, any>
  isNotFound?: boolean
  lastUpdated?: number
}
```

**Example:**

```vue
<script setup>
import { useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <h1>{{ theme.footer.copyright }}</h1>
</template>
```

## `useRoute` <Badge type="info" text="composable" />

Returns the current route object with the following type:

```ts
interface Route {
  path: string
  data: PageData
  component: Component | null
}
```

## `useRouter` <Badge type="info" text="composable" />

Returns the VitePress router instance so you can programmatically navigate to another page.

```ts
interface Router {
  route: Route
  go: (href?: string) => Promise<void>
}
```

## `withBase` <Badge type="info" text="helper" />

- **Type**: `(path: string) => string`

Appends the configured [`base`](./site-config#base) to a given URL path. Also see [Base URL](../guide/asset-handling#base-url).

## `<Content />` <Badge type="info" text="component" />

The `<Content />` component displays the rendered markdown contents. Useful [when creating your own theme](../guide/custom-theme).

```vue
<template>
  <h1>Custom Layout!</h1>
  <Content />
</template>
```

## `<ClientOnly />` <Badge type="info" text="component" />

The `<ClientOnly />` component renders its slot only at client side.

Because VitePress applications are server-rendered in Node.js when generating static builds, any Vue usage must conform to the universal code requirements. In short, make sure to only access Browser / DOM APIs in beforeMount or mounted hooks.

If you are using or demoing components that are not SSR-friendly (for example, contain custom directives), you can wrap them inside the `ClientOnly` component.

```vue-html
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```

- Related: [SSR Compatibility](/guide/ssr-compat)

## `$frontmatter` <Badge type="info" text="template global" />

Directly access current page's [frontmatter](../guide/frontmatter) data in Vue expressions.

```md
---
title: Hello
---

# {{ $frontmatter.title }}
```

## `$params` <Badge type="info" text="template global" />

Directly access current page's [dynamic route params](../guide/routing#dynamic-routes) in Vue expressions.

```md
- package name: {{ $params.pkg }}
- version: {{ $params.version }}
```
