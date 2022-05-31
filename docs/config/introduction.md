# Introduction

Place your configuration file at `.vitepress/config.js`. This is where all VitePress-specific files will be placed.

```
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.js
│  └─ index.md
└─ package.json
```

VitePress comes with 2 types of configs. One is the [App Configs](./app-configs) which configures the site's fundamental features such as setting title of the site, or customize how markdown parser works. Second is the [Theme Config](./theme-config) which configures the theme of the site, for example, adding a sidebar, or add features such as "Edit this page on GitHub" link.

There's also another configuration you may do in [Frontmatter](./frontmatter-configs). Frontmatter configs can override global configs defined on App Configs or Theme Configs for that specific page. However, there're several options that are only available at frontmatter as well.

Please refer to the corresponding configs page to learn more.

## Config Intellisense

Since VitePress ships with TypeScript typings, you can leverage your IDE's intellisense with jsdoc type hints:

```js
/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
  // ...
}

export default config
```

Alternatively, you can use the `defineConfig` helper at which should provide intellisense without the need for jsdoc annotations:

```js
import { defineConfig } from 'vitepress'

export default defineConfig({
  // ...
})
```

VitePress also directly supports TS config files. You can use `.vitepress/config.ts` with the `defineConfig` helper as well.

## Typed Theme Config

By default, `defineConfig` helper leverages the theme config type from default theme:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    // Type is `DefaultTheme.Config`
  }
})
```

If you use a custom theme and want type checks for the theme config, you'll need to use `defineConfigWithTheme` instead, and pass the config type for your custom theme via a generic argument:

```ts
import { defineConfigWithTheme } from 'vitepress'
import { ThemeConfig } from 'your-theme'

export default defineConfigWithTheme<ThemeConfig>({
  themeConfig: {
    // Type is `ThemeConfig`
  }
})
```
