# Using a Custom Theme

## Theme Resolving

You can enable a custom theme by creating a `.vitepress/theme/index.js` or `.vitepress/theme/index.ts` file (the "theme entry file"):

```
.
├─ docs                # project root
│  ├─ .vitepress
│  │  ├─ theme
│  │  │  └─ index.js   # theme entry
│  │  └─ config.js     # config file
│  └─ index.md
└─ package.json
```

VitePress will always use the custom theme instead of the default theme when it detects presence of a theme entry file. You can, however, [extend the default theme](./extending-default-theme) to perform advanced customizations on top of it.

## Theme Interface

A VitePress custom theme is defined as an object with the following interface:

```ts
interface Theme {
  /**
   * Root layout component for every page
   * @required
   */
  Layout: Component
  /**
   * Enhance Vue app instance
   * @optional
   */
  enhanceApp?: (ctx: EnhanceAppContext) => Awaitable<void>
  /**
   * Extend another theme, calling its `enhanceApp` before ours
   * @optional
   */
  extends?: Theme
}

interface EnhanceAppContext {
  app: App // Vue app instance
  router: Router // VitePress router instance
  siteData: Ref<SiteData> // Site-level metadata
}
```

The theme entry file should export the theme as its default export:

```js
// .vitepress/theme/index.js

// You can directly import Vue files in the theme entry
// VitePress is pre-configured with @vitejs/plugin-vue.
import Layout from './Layout.vue'

export default {
  Layout,
  enhanceApp({ app, router, siteData }) {
    // ...
  }
}
```

The default export is the only contract for a custom theme, and only the `Layout` property is required. So technically, a VitePress theme can be as simple as a single Vue component.

Inside your layout component, it works just like a normal Vite + Vue 3 application. Do note the theme also needs to be [SSR-compatible](./using-vue#browser-api-access-restrictions).

## Building a Layout

The most basic layout component needs to contain a [`<Content />`](/reference/runtime-api#content) component:

```vue
<!-- .vitepress/theme/Layout.vue -->
<template>
  <h1>Custom Layout!</h1>

  <!-- this is where markdown content will be rendered -->
  <Content />
</template>
```

The above layout simply renders every page's markdown as HTML. The first improvement we can add is to handle 404 errors:

```vue{1-4,9-12}
<script setup>
import { useData } from 'vitepress'
const { page } = useData()
</script>

<template>
  <h1>Custom Layout!</h1>

  <div v-if="page.isNotFound">
    Custom 404 page!
  </div>
  <Content v-else />
</template>
```

The [`useData()`](/reference/runtime-api#usedata) helper provides us with all the runtime data we need to conditionally render different layouts. One of the other data we can access is the current page's frontmatter. We can leverage this to allow the end user to control the layout in each page. For example, the user can indicate the page should use a special home page layout with:

```md
---
layout: home
---
```

And we can adjust our theme to handle this:

```vue{3,12-14}
<script setup>
import { useData } from 'vitepress'
const { page, frontmatter } = useData()
</script>

<template>
  <h1>Custom Layout!</h1>

  <div v-if="page.isNotFound">
    Custom 404 page!
  </div>
  <div v-if="frontmatter.layout === 'home'">
    Custom home page!
  </div>
  <Content v-else />
</template>
```

You can, of course, split the layout into more components:

```vue{3-5,12-15}
<script setup>
import { useData } from 'vitepress'
import NotFound from './NotFound.vue'
import Home from './Home.vue'
import Page from './Page.vue'

const { page, frontmatter } = useData()
</script>

<template>
  <h1>Custom Layout!</h1>

  <NotFound v-if="page.isNotFound" />
  <Home v-if="frontmatter.layout === 'home'" />
  <Page v-else /> <!-- <Page /> renders <Content /> -->
</template>
```

Consult the [Runtime API Reference](/reference/runtime-api) for everything available in theme components. In addition, you can leverage [Build-Time Data Loading](./data-loading) to generate data-driven layout - for example, a page that lists all blog posts in the current project.

## Distributing a Custom Theme

The easiest way to distribute a custom theme is by providing it as a [template repository on GitHub](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository).

If you wish to distribute the theme as an npm package, follow these steps:

1. Export the theme object as the default export in your package entry.

2. If applicable, export your theme config type definition as `ThemeConfig`.

3. If your theme requires adjusting the VitePress config, export that config under a package sub-path (e.g. `my-theme/config`) so the user can extend it.

4. Document the theme config options (both via config file and frontmatter).

5. Provide clear instructions on how to consume your theme (see below).

## Consuming a Custom Theme

To consume an external theme, import and re-export it from the custom theme entry:

```js
// .vitepress/theme/index.js
import Theme from 'awesome-vitepress-theme'

export default Theme
```

If the theme needs to be extended:

```js
// .vitepress/theme/index.js
import Theme from 'awesome-vitepress-theme'

export default {
  extends: Theme,
  enhanceApp(ctx) {
    // ...
  }
}
```

If the theme requires special VitePress config, you will need to also extend it in your own config:

```ts
// .vitepress/theme/config.ts
import baseConfig from 'awesome-vitepress-theme/config'

export default {
  // extend theme base config (if needed)
  extends: baseConfig
}
```

Finally, if the theme provides types for its theme config:

```ts
// .vitepress/theme/config.ts
import baseConfig from 'awesome-vitepress-theme/config'
import { defineConfigWithTheme } from 'vitepress'
import type { ThemeConfig } from 'awesome-vitepress-theme'

export default defineConfigWithTheme<ThemeConfig>({
  extends: baseConfig,
  themeConfig: {
    // Type is `ThemeConfig`
  }
})
```
