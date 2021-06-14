# Theming

## Using a Custom Theme

You can enable a custom theme by adding the `.vitepress/theme/index.js` file (the "theme entry file").

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

A VitePress custom theme is simply an object containing three properties and is defined as follows:

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

The theme entry file shoud export the theme as its default export:

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

...where the `Layout` component could like this:

```vue
<!-- .vitepress/theme/Layout.vue -->
<template>
  <h1>Custom Layout!</h1>
  <Content /><!-- this is where markdown content will be rendered -->
</template>
```

The default export is the only contract for a custom theme. Inside your custom theme, it works just like a normal Vite + Vue 3 application. Do note the theme also needs to be [SSR-compatible](/guide/using-vue.html#browser-api-access-restrictions).

To distribute a theme, simply export the object in your package entry. To consume an external theme, import and re-export it from the custom theme entry:

```js
// .vitepress/theme/index.js
import Theme from 'awesome-vitepress-theme'
export default Theme
```

## Extending the Default Theme

If you want to extend and customize the default theme, you can import it from `vitepress/theme` and augment it in a custom theme entry. Here are some examples of common customizations:

### Registering Global Components

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

Since we are using Vite, you can also leverage Vite's [glob import feature](https://vitejs.dev/guide/features.html#glob-import) to auto register a directory of components.

### Customizing CSS

The default theme CSS is customizable by overriding root level CSS variables:

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

See [default theme CSS variables](https://github.com/vuejs/vitepress/blob/master/src/client/theme-default/styles/vars.css) that can be overridden.

### Layout Slots

The default theme's `<Layout/>` component has a few slots that can be used to inject content at certain locations of the page. Here's an example of injecting a component into the top of the sidebar:

```js
// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'
import MyLayout fro './MyLayout.vue'

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

Full list of slots available in the default theme layout:

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
