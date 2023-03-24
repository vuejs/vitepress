# 扩展默认主题 {#extending-the-default-theme}

VitePress 默认的主题已经针对文档进行了优化，并且可以进行定制。请参考 [默认主题配置概览](../reference/default-theme-config) 获取完整的选项列表。

但是有一些情况仅靠配置是不够的。例如：

1. 你需要调整 CSS 样式；
2. 你需要修改 Vue 应用实例，例如注册全局组件；
3. 你需要通过 layout 插槽将自定义内容注入到主题中；

这些高级自定义配置将需要使用自定义主题来“拓展”默认主题。

:::tip
在继续之前，请确保首先阅读[自定义主题](./custom-theme)以了解其工作原理。
:::

## 自定义 CSS {#customizing-css}

可以通过覆盖根级别的 CSS 变量来自定义默认主题的 CSS：

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

查看[默认主题 CSS 变量]来获取可以被覆盖的变量。

## 使用自定义字体 {#using-different-fonts}

VitePress uses [Inter](https://rsms.me/inter/) as the default font, and will include the fonts in the build output. The font is also auto preloaded in production. However, this may not be desirable if you want to use a different main font.

To avoid including Inter in the build output, import the theme from `vitepress/theme-without-fonts` instead:

```js
// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme-without-fonts'
import './my-fonts.css'

export default DefaultTheme
```

```css
/* .vitepress/theme/custom.css */
:root {
  --vp-font-family-base: /* normal text font */
  --vp-font-family-mono: /* code font */
}
```

:::warning
If you are using optional components like the [Team Page](/reference/default-theme-team-page) components, make sure to also import them from `vitepress/theme-without-fonts`!
:::

If your font is a local file referenced via `@font-face`, it will be processed as an asset and included under `.vitepress/dist/assets` with hashed filename. To preload this file, use the [transformHead](/reference/site-config#transformhead) build hook:

```js
// .vitepress/config.js
export default {
  transformHead({ assets }) {
    // adjust the regex accordingly to match your font
    const myFontFile = assets.find(file => /font-name\.\w+\.woff2/)
    if (myFontFile) {
      return [
        [
          'link',
          {
            rel: 'preload',
            href: myFontFile,
            as: 'font',
            type: 'font/woff2',
            crossorigin: ''
          }
        ]
      ]
    }
  }
}
```

## 注册全局组件 {#registering-global-components}

```js
// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    // register your custom global components
    ctx.app.component('MyGlobalComponent' /* ... */)
  }
}
```

Since we are using Vite, you can also leverage Vite's [glob import feature](https://vitejs.dev/guide/features.html#glob-import) to auto register a directory of components.

## 布局插槽 {#layout-slots}

The default theme's `<Layout/>` component has a few slots that can be used to inject content at certain locations of the page. Here's an example of injecting a component into the before outline:

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

Or you could use render function as well.

```js
// .vitepress/theme/index.js
import { h } from 'vue'
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

Full list of slots available in the default theme layout:

- When `layout: 'doc'` (default) is enabled via frontmatter:
  - `doc-footer-before`
  - `doc-before`
  - `doc-after`
  - `sidebar-nav-before`
  - `sidebar-nav-after`
  - `aside-top`
  - `aside-bottom`
  - `aside-outline-before`
  - `aside-outline-after`
  - `aside-ads-before`
  - `aside-ads-after`
- When `layout: 'home'` is enabled via frontmatter:
  - `home-hero-before`
  - `home-hero-info`
  - `home-hero-image`
  - `home-hero-after`
  - `home-features-before`
  - `home-features-after`
- On not found (404) page:
  - `not-found`
- Always:
  - `layout-top`
  - `layout-bottom`
  - `nav-bar-title-before`
  - `nav-bar-title-after`
  - `nav-bar-content-before`
  - `nav-bar-content-after`
  - `nav-screen-content-before`
  - `nav-screen-content-after`

## 重写内部组件 {#overriding-internal-components}

You can use Vite's [aliases](https://vitejs.dev/config/shared-options.html#resolve-alias) to replace default theme components with your custom ones:

```ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

export default defineConfig({
  vite: {
    resolve: {
      alias: [
        {
          find: /^.*\/VPNavBar\.vue$/,
          replacement: fileURLToPath(
            new URL('./components/CustomNavBar.vue', import.meta.url)
          )
        }
      ]
    }
  }
})
```

To know the exact name of the component refer [our source code](https://github.com/vuejs/vitepress/tree/main/src/client/theme-default/components). Since the components are internal, there is a slight chance their name is updated between minor releases.
