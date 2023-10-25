# 运行时 API {#runtime-api}

VitePress 提供了几个内置的 API 来让你访问应用程序数据。VitePress 还附带了一些可以在全局范围内使用的内置组件。

辅助函数可从 `vitepress` 全局导入，通常用于自定义主题 Vue 组件。但是，它们也可以在 `.md` 页面内使用，因为 markdown 文件被编译成 Vue [单文件组件](https://vuejs.org/guide/scaling-up/sfc.html)。

以 `use*` 开头的方法表示它是一个 [Vue 3 Composition API](https://vuejs.org/guide/introduction.html#composition-api) 函数（“Composable(可组合)”），只能在 `setup()` 或 `<script setup>` 中使用。

## `useData` <Badge type="info" text="composable" />

返回特定页面的数据。返回的对象具有以下类型：

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
  filePath: string
  headers: Header[]
  frontmatter: Record<string, any>
  params?: Record<string, any>
  isNotFound?: boolean
  lastUpdated?: number
}
```

**示例：**

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

返回具有以下类型的当前路由对象：

```ts
interface Route {
  path: string
  data: PageData
  component: Component | null
}
```

## `useRouter` <Badge type="info" text="composable" />

返回 VitePress 路由实例，以便你可以以编程方式导航到另一个页面。

```ts
interface Router {
  /**
   * Current route.
   */
  route: Route
  /**
   * Navigate to a new URL.
   */
  go: (to?: string) => Promise<void>
  /**
   * Called before the route changes. Return `false` to cancel the navigation.
   */
  onBeforeRouteChange?: (to: string) => Awaitable<void | boolean>
  /**
   * Called before the page component is loaded (after the history state is
   * updated). Return `false` to cancel the navigation.
   */
  onBeforePageLoad?: (to: string) => Awaitable<void | boolean>
  /**
   * Called after the route changes.
   */
  onAfterRouteChanged?: (to: string) => Awaitable<void>
}
```

## `withBase` <Badge type="info" text="helper" />

- **Type**: `(path: string) => string`

将配置的 [`base`](./site-config#base) 追加到给定的 URL 路径。另请参阅 [Base URL](../guide/asset-handling#base-url)。

## `<Content />` <Badge type="info" text="component" />

`<Content />` 组件显示渲染的 markdown 内容。在[创建自己的主题时](../guide/custom-theme)很有用。

```vue
<template>
  <h1>Custom Layout!</h1>
  <Content />
</template>
```

## `<ClientOnly />` <Badge type="info" text="component" />

`<ClientOnly />` 组件仅在客户端渲染其插槽。

由于 VitePress 应用程序在生成静态构建时是在 Node.js 中服务器渲染的，因此任何 Vue 使用都必须符合通用代码要求。简而言之，确保仅在 beforeMount 或 mounted 钩子中访问 Browser/DOM API。

::: details 如果你正在使用或演示对 SSR 不友好的组件（例如，包含自定义指令），你可以将它们包装在 `ClientOnly` 组件中。
If you are using or demoing components that are not SSR-friendly (for example, contain custom directives), you can wrap them inside the `ClientOnly` component.
:::

```vue-html
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```

- 相关文档：[SSR 兼容性](../guide/ssr-compat)

## `$frontmatter` <Badge type="info" text="template global" />

在 Vue 表达式中直接访问当前页面的 [frontmatter](../guide/frontmatter) 数据。

```md
---
title: Hello
---

# {{ $frontmatter.title }}
```

## `$params` <Badge type="info" text="template global" />

在 Vue 表达式中直接访问当前页面的[动态路由参数](../guide/routing#dynamic-routes)。

```md
- package name: {{ $params.pkg }}
- version: {{ $params.version }}
```
