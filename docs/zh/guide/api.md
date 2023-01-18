# API 参考 {#api-reference}

VitePress 提供了几个内置 API 来获取数据。VitePress 还提供了一些可以全局使用的内置组件。

可以从 `vitepress` 全局引入辅助函数，通常用于自定义主题 Vue 组件。当然，它们也可以在 .md 页面中使用，因为 Markdown 文件会被编译成 Vue 单文件组件。

以 `use*` 开头的方法表示它是一个 [Vue 3 组合式 API](https://cn.vuejs.org/guide/introduction.html#composition-api) 函数，只能在 `setup()` 内部使用或者使用 `<script setup>`。

## `useData`

返回页面的属性数据，返回的对象具有以下类型：

```ts
interface VitePressData<T = any> {
  site: Ref<SiteData<T>>
  page: Ref<PageData>
  theme: Ref<T> // themeConfig from .vitepress/config.js
  frontmatter: Ref<PageData['frontmatter']>
  title: Ref<string>
  description: Ref<string>
  lang: Ref<string>
  isDark: Ref<boolean>
  dir: Ref<string>
  localeIndex: Ref<string>
}
```

**例子：**

```vue
<script setup>
import { useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <h1>{{ theme.footer.copyright }}</h1>
</template>
```

## `useRoute`

返回具有以下类型的当前路由对象：

```ts
interface Route {
  path: string
  data: PageData
  component: Component | null
}
```

## `useRouter`

返回 VitePress 路由实例，用来以编程方式导航到另一个页面。

```ts
interface Router {
  route: Route
  go: (href?: string) => Promise<void>
}
```

## `withBase`

- **Type**: `(path: string) => string`

将配置的 [`base`](../config/app-configs#base) 添加到给定的 URL 路径。另请参阅 [Base URL](./asset-handling#base-url)。

## `<Content />`

`<Content />` 组件显示渲染的 markdown 内容。这在[创建你自己的主题时](./theme-introduction)很有用。

```vue
<template>
  <h1>Custom Layout!</h1>
  <Content />
</template>
```

## `<ClientOnly />`

`<ClientOnly />` 组件只在客户端渲染它的插槽。

由于 VitePress 应用在生成静态文件之后会在 Node.js 中进行服务端渲染，因此任何 Vue 的使用都必须符合通用代码的要求。简而言之，确保只在 beforeMount 或 mounted 钩子中访问浏览器以及 DOM API。

如果你正在使用不支持 SSR 的组件 (例如，包含自定义指令)，你可以将它们包装在 `ClientOnly` 组件中。

```vue-html
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```
