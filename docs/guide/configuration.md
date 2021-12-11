# Configuration

## Overview

Without any configuration, the page is pretty minimal, and the user has no way to navigate around the site. To customize your site, let’s first create a `.vitepress` directory inside your docs directory. This is where all VitePress-specific files will be placed. Your project structure is probably like this:

```bash
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.js
│  └─ index.md
└─ package.json
```

The essential file for configuring a VitePress site is `.vitepress/config.js`, which should export a JavaScript object:

```js
module.exports = {
  title: 'Hello VitePress',
  description: 'Just playing around.'
}
```

Check out the [Config Reference](/config/basics) for a full list of options.


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

```js
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
     // Type is `DefaultTheme.Config` 
  }
})
```

If you use a custom theme, you'll be able to pass the generics type for your custom theme, and you need overload it with the second parameter of `defineConfig` helper:

```js
import { defineConfig } from 'vitepress'
import { ThemeConfig } from 'your-theme'

export default defineConfig<ThemeConfig>({
  themeConfig: {
    // Type is `ThemeConfig` 
  }
}, true); // declare `usingCustomTheme` and discard usage of the default theme.
```
