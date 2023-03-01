# 主题介绍 {#theme-introduction}

VitePress 带有默认主题，并提供许多开箱即用的功能。通过下面列出的导航来了解有关每个功能的更多信息。

- [导航](./theme-nav)
- [侧边栏](./theme-sidebar)
- [上一页/下一页链接](./theme-prev-next-link)
- [编辑链接](./theme-edit-link)
- [最后更新](./theme-last-updated)
- [布局](./theme-layout)
- [主页](./theme-home-page)
- [团队页面](./theme-team-page)
- [页脚](./theme-footer)
- [搜索](./theme-search)
- [Carbon Ads](./theme-carbon-ads)

如果你没有找到所需的功能，或者你想创建自己的主题，你可以自定义 VitePress 以满足你的要求。在下面，我们将介绍自定义 VitePress 主题的方式。

## 使用自定义主题 {#using-a-custom-theme}

你可以通过添加 `.vitepress/theme/index.js` 或 `.vitepress/theme/index.ts` 文件 (“主题入口文件”) 来启用自定义主题。

```
.
├─ docs
│  ├─ .vitepress
│  │  ├─ theme
│  │  │  └─ index.js
│  │  └─ config.js
│  └─ index.md
└─ package.json
```

VitePress 自定义主题是一个只包含四个属性的对象，定义如下：

```ts
interface Theme {
  Layout: Component // Vue 3 component
  NotFound?: Component
  enhanceApp?: (ctx: EnhanceAppContext) => void
  setup?: () => void
}

interface EnhanceAppContext {
  app: App // Vue 3 app instance
  router: Router // VitePress router instance
  siteData: Ref<SiteData>
}
```

主题入口文件应将主题作为其默认导出：

```js
// .vitepress/theme/index.js
import Layout from './Layout.vue'

export default {
  // root component to wrap each page
  Layout,

  // this is a Vue 3 functional component
  NotFound: () => 'custom 404',

  enhanceApp({ app, router, siteData }) {
    // app is the Vue 3 app instance from `createApp()`.
    // router is VitePress' custom router. `siteData` is
    // a `ref` of current site-level metadata.
  }

  setup() {
    // this function will be executed inside VitePressApp's
    // setup hook. all composition APIs are available here.
  }
}
```

... `Layout` 组件会如下所示：

```vue
<!-- .vitepress/theme/Layout.vue -->
<template>
  <h1>Custom Layout!</h1>

  <!-- this is where markdown content will be rendered -->
  <Content />
</template>
```

默认导出是自定义主题的唯一方式。 在自定义主题中，它就像普通的 Vite + Vue 3 应用程序一样工作。 注意，主题还需要[兼容 SSR](./using-vue#browser-api-access-restrictions)。

要分发主题，只需在包入口里导出对象。要使用外部主题，请从自定义主题入口导入并重新导出：

```js
// .vitepress/theme/index.js
import Theme from 'awesome-vitepress-theme'

export default Theme
```

## 扩展默认主题 {#extending-the-default-theme}

如果你想扩展和自定义默认主题，你可以从 `vitepress/theme` 导入它并在导出自定义主题中对其进行扩展。以下是一些常见自定义的示例：

### 注册全局组件 {#registering-global-components}

```js
// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // 注册一个全局组件
    app.component('MyGlobalComponent', /* ... */)
  }
}
```

由于我们使用 Vite，你还可以利用 Vite 的[全局导入特性](https://vitejs.dev/guide/features.html#glob-import)自动注册组件目录。

### 自定义 CSS {#customizing-css}

默认主题 CSS 可通过覆盖根元素的 CSS 变量进行自定义：

```js
// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default DefaultTheme
```

```css
/* .vitepress/theme/custom.css */
:root {
  --vp-c-brand: #646cff;
  --vp-c-brand-light: #747bff;
}
```

请参阅可以被覆盖的[默认的主题 CSS 变量](https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/styles/vars.css)。

### Layout 组件插槽 {#layout-slots}

默认主题 `<Layout/>` 组件有一些插槽，可用于在页面的某些位置注入内容。 这是一个将组件注入到之前的大纲中的示例：

```js
// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'
import MyLayout from './MyLayout.vue'

export default {
  ...DefaultTheme,
  // override the Layout with a wrapper component that
  // injects the slots
  Layout: MyLayout
}
```

```vue
<!--.vitepress/theme/MyLayout.vue-->
<script setup>
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #aside-outline-before>
      My custom sidebar top content
    </template>
  </Layout>
</template>
```

或者你也可以使用渲染函数。

```js
// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'
import MyComponent from './MyComponent.vue'

export default {
  ...DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'aside-outline-before': () => h(MyComponent)
    })
  }
}
```

默认主题布局中可用插槽的完整列表：

- 当通过 frontmatter 开启 `layout: 'doc'` (default):
  - `doc-footer-before`
  - `doc-before`
  - `doc-after`
  - `aside-top`
  - `aside-bottom`
  - `aside-outline-before`
  - `aside-outline-after`
  - `aside-ads-before`
  - `aside-ads-after`
- 当通过 frontmatter 开启  `layout: 'home'`:
  - `home-hero-before`
  - `home-hero-info`
  - `home-hero-after`
  - `home-features-before`
  - `home-features-after`
- 一定有的:
  - `layout-top`
  - `layout-bottom`
  - `nav-bar-title-before`
  - `nav-bar-title-after`
  - `nav-bar-content-before`
  - `nav-bar-content-after`
  - `nav-screen-content-before`
  - `nav-screen-content-after`
