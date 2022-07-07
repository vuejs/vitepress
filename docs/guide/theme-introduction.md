# Theme Introduction

VitePress comes with its default theme providing many features out of the box. Learn more about each feature on its dedicated page listed below.

- [Nav](./theme-nav)
- [Sidebar](./theme-sidebar)
- [Prev Next Link](./theme-prev-next-link)
- [Edit Link](./theme-edit-link)
- [Last Updated](./theme-last-updated)
- [Layout](./theme-layout)
- [Home Page](./theme-home-page)
- [Team Page](./theme-team-page)
- [Footer](./theme-footer)
- [Search](./theme-search)
- [Carbon Ads](./theme-carbon-ads)

If you don't find the features you're looking for, or you would rather create your own theme, you may customize VitePress to fit your requirements. In the following sections, we'll go through each way of customizing the VitePress theme.

## Using a Custom Theme

You can enable a custom theme by adding the `.vitepress/theme/index.js` or `.vitepress/theme/index.ts` file (the "theme entry file").

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

The theme entry file should export the theme as its default export:

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
}
```

...where the `Layout` component could look like this:

```vue
<!-- .vitepress/theme/Layout.vue -->
<template>
  <h1>Custom Layout!</h1>

  <!-- this is where markdown content will be rendered -->
  <Content />
</template>
```

The default export is the only contract for a custom theme. Inside your custom theme, it works just like a normal Vite + Vue 3 application. Do note the theme also needs to be [SSR-compatible](./using-vue#browser-api-access-restrictions).

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
    app.component('MyGlobalComponent', /* ... */)
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
  --vp-c-brand: #646cff;
  --vp-c-brand-light: #747bff;
}
```

See [default theme CSS variables](https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/styles/vars.css) that can be overridden.

### Layout Slots

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
  - `doc-before`
  - `doc-after`
  - `aside-top`
  - `aside-bottom`
  - `aside-outline-before`
  - `aside-outline-after`
  - `aside-ads-before`
  - `aside-ads-after`
- When `layout: 'home'` is enabled via frontmatter:
  - `home-hero-before`
  - `home-hero-after`
  - `home-features-before`
  - `home-features-after`
