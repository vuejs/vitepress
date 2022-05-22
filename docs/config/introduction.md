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
