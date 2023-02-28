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

::: tip
You can also use any of `.ts`, `.cjs`, `.mjs`, `.cts`, `.mts` as the config file extension.
:::

VitePress comes with 2 types of configuration. One is the [App Config](./app-config) which configures the site's fundamental features such as setting title of the site, or customize how markdown parser works. Second is the [Theme Config](./theme-config) which configures the theme of the site, for example, adding a sidebar, or add features such as "Edit this page on GitHub" link.

There's also another configuration you may do in [Frontmatter](./frontmatter-config). Frontmatter config can override global config defined in App Config or Theme Config for that specific page. However, there're several options that are only available at frontmatter as well.

Please refer to the corresponding config page to learn more.

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
