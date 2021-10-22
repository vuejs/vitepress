# 主题

## 使用自定义主题

你可以通过添加 `.vitepress/theme/index.js` 文件来启用自定义主题。

```bash
.
├─ docs
│  ├─ .vitepress
│  │  ├─ theme
│  │  │  └─ index.js
│  │  └─ config.js
│  └─ index.md
└─ package.json
```

一个 VitePress 自定义主题是一个包含三个属性的对象，它定义如下：

```ts
interface Theme {
  Layout: Component // Vue 3 component
  NotFound?: Component
  enhanceApp?: (ctx: EnhanceAppContext) => void
}

interface EnhanceAppContext {
  app: App // Vue 3 app instance
  router: Router // VitePress router instance
  siteData: Ref<SiteData>
}
```

主题入口文件应该将主题作为其默认导出：

```js
// .vitepress/theme/index.js
import Layout from './Layout.vue'

export default {
  Layout,
  NotFound: () => 'custom 404', // <- this is a Vue 3 functional component
  enhanceApp({ app, router, siteData }) {
    // app is the Vue 3 app instance from `createApp()`. router is VitePress'
    // custom router. `siteData`` is a `ref`` of current site-level metadata.
  }
}
```

...`Layout` 组件可以像这样：

```vue
<!-- .vitepress/theme/Layout.vue -->
<template>
  <h1>Custom Layout!</h1>
  <Content /><!-- this is where markdown content will be rendered -->
</template>
```

默认导出是自定义主题的唯一约定。在自定义主题中，它类似于普通的 Vite + Vue 3 应用。请注意，自定义主题也需要 [SSR-兼容](/guide/using-vue.html#browser-api-access-restrictions)。

要分发一个主题，只需要将对象从您的包入口导出。要从自定义主题入口中导入并重新导出它：

```js
// .vitepress/theme/index.js
import Theme from 'awesome-vitepress-theme'
export default Theme
```

## 扩展默认主题

如果你想扩展并且定制默认主题，你可以从 `vitepress/theme` 中导入它并在自定义主题入口中增强它。这里有一些常见的定制化的例子：

### 注册全局组件

```js
// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // register global components
    app.component('MyGlobalComponent' /* ... */)
  }
}
```

因为我们使用 Vite，所以你也可以使用 Vite 的 [glob 导入特性](https://vitejs.dev/guide/features.html#glob-import) 来自动注册一个目录下的组件。

### 自定义 CSS

默认主题 CSS 可以通过覆盖根级 CSS 变量来定制：

```js
// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default DefaultTheme
```

```css
/* .vitepress/theme/custom.css */
:root {
  --c-brand: #646cff;
  --c-brand-light: #747bff;
}
```

参考 [默认主题 CSS 变量](https://github.com/vuejs/vitepress/blob/master/src/client/theme-default/styles/vars.css) 可以被覆盖。

### 布局插槽

默认主题的 `<Layout/>` 组件有几个插槽可以用来在页面的某些位置注入组件。这里是注入一个组件到侧边栏的顶部的例子：

```js
// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'
import MyLayout from './MyLayout.vue'

export default {
  ...DefaultTheme,
  // override the Layout with a wrapper component that injects the slots
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
    <template #sidebar-top>
      My custom sidebar top content
    </template>
  </Layout>
</template>
```

默认主题布局中的所有插槽：

- `navbar-search`
- `sidebar-top`
- `sidebar-bottom`
- `page-top-ads`
- `page-top`
- `page-bottom`
- `page-bottom-ads`
- Only when `home: true` is enabled via frontmatter:
  - `home-hero`
  - `home-features`
  - `home-footer`
