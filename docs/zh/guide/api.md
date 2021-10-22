# API 参考

## 辅助方法

下面的方法可以全局导入 `vitepress`，通常用于自定义主题的 Vue 组件。但是，也可以在 `.md` 页面中使用，因为 Markdown 文件被编译为 Vue 单文件组件。


方法以 `use*` 开头表示它是一个 [Vue 3 Composition API](https://v3.vuejs.org/guide/composition-api-introduction.html) 函数，只能在 `setup()` 或 `<script setup>` 中使用。

### `useData`

返回页面特定的数据。返回的对象具有以下类型：

```ts
interface VitePressData {
  site: Ref<SiteData>
  page: Ref<PageData>
  theme: Ref<any> // themeConfig from .vitepress/config.js
  frontmatter: Ref<PageData['frontmatter']>
  title: Ref<string>
  description: Ref<string>
  lang: Ref<string>
  localePath: Ref<string>
}
```

**例子:**

```vue
<script setup>
import { useData } from 'vitepress'
const { theme } = useData()
</script>

<template>
  <h1>{{ theme.heroText }}</h1>
</template>
```

### `useRoute`

返回当前路由对象，具有以下类型：

```ts
interface Route {
  path: string
  data: PageData
  component: Component | null
}
```

### `useRouter`

返回 VitePress 路由实例，以便您可以编程地导航到另一个页面。

```ts
interface Router {
  route: Route
  go: (href?: string) => Promise<void>
}
```

### `withBase`

- **类型**: `(path: string) => string`

  将配置的 [`base`](/config/basics.html#base) 附加到给定的 URL 路径。同时参见 [Base URL](/guide/assets.html#base-url)。

## Global Components 全局组件

VitePress 包含一些内置组件，可以用于全局使用。您可以在 Markdown 或自定义主题配置中使用这些组件。

### `<Content/>`

`<Content/>` 组件显示渲染的 Markdown 内容。当创建自己的主题时有用。

```vue
<template>
  <h1>Custom Layout!</h1>
  <Content />
</template>
```

### `<ClientOnly/>`

`<ClientOnly/>` 组件只在客户端渲染它的插槽。

因为 VitePress 的应用程序在生成静态构建时在 Node.js 中被服务端渲染，所以任何 Vue 的使用必须遵守通用代码要求。简单地说，在 beforeMount 或 mounted 钩子中只访问 Browser / DOM 的 API。

如果您使用或演示不是 SSR 友好的组件（例如包含自定义指令），您可以在 `ClientOnly` 组件之间包装它们。

```html
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```
