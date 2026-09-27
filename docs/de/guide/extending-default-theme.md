---
outline: deep
description: Anpassen and extend the VitePress Standard-Theme mit custom CSS, components, layouts, and slots.
---

# Standard-Theme erweitern

VitePress' Standard-Theme is optimized for documentation, and can be customized. Consult the [Standard-Theme Config Übersicht](../reference/default-theme-config) for a comprehensive list of options.

However, there are a number of cases where Konfiguration alone won't be enough. Zum Beispiel:

1. You need to tweak the CSS styling;
2. You need to modify the Vue app instance, zum Beispiel to register global components;
3. You need to inject custom content in the theme via layout slots.

These advanced customizations will require Verwendung a eigenes Theme that "extends" das Standard-Theme.

::: tip
Before proceeding, make sure to first read [Using a Eigenes Theme](./custom-theme) to understand how eigenes Themes work.
:::

## Anpassen CSS

The Standard-Theme CSS is customizable by overriding root level CSS variables:

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default DefaultTheme
```

```css
/* .vitepress/theme/custom.css */
:root {
  --vp-c-brand-1: #646cff;
  --vp-c-brand-2: #747bff;
}
```

Siehe [Standard-Theme CSS variables](https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/styles/vars.css) that can be overridden.

### Navbar

The navbar draws a single background surface controlled by CSS variables, so its look can be changed ohne touching component internals:

```css
:root {
  /* bar height and background */
  --vp-nav-height: 4rem;
  --vp-nav-bg-color: var(--vp-c-bg);

  /* background while on top of the home page (unscrolled);
     set to var(--vp-nav-bg-color) to opt out of the transparent treatment */
  --vp-nav-home-bg-color: transparent;

  /* filter applied to the content behind the bar */
  --vp-nav-backdrop-filter: none;

  /* the bar's bottom rule and the mobile menu background */
  --vp-nav-divider-color: var(--vp-c-gutter);
  --vp-nav-screen-bg-color: var(--vp-c-bg);
}
```

Zum Beispiel, a frosted-glass navbar:

```css
:root {
  --vp-nav-bg-color: color-mix(in srgb, var(--vp-c-bg) 65%, transparent);
  --vp-nav-backdrop-filter: saturate(180%) blur(8px);
}
```

The same treatment carries over to the local nav: `--vp-local-nav-bg-color` follows the navbar surface color standardmäßig, and where the two bars meet they share a single blurred surface, so the glass stays continuous across them.

::: warning
`backdrop-filter` has a measurable scroll performance cost, especially on large or high-DPI screens. Wenn Verwendung a translucent bar, also check text contrast over your page content. Safari 17 and earlier don't apply variable-driven backdrop filters, so they show the translucent color ohne the blur.
:::

Wenn the nav items don't fit the verfügbar width, they move in the `⋯` menu at the end of the navbar instead of being clipped, starting mit the social links, the appearance switch and the locale switcher, followed by the nav items right-to-left. Its button label can be localized mit [`extraMenuLabel`](../reference/default-theme-config#extramenulabel).

## Using Different Fonts

VitePress verwendet [Inter](https://rsms.me/inter/) as the default font, and will include the fonts in the Build-Ausgabe. The font is also auto preloaded in production. However, this may not be desirable wenn you want to use a different main font.

To avoid including Inter in the Build-Ausgabe, import the theme von `vitepress/theme-ohne-fonts` instead:

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme-without-fonts'
import './my-fonts.css'

export default DefaultTheme
```

```css
/* .vitepress/theme/my-fonts.css */
:root {
  --vp-font-family-base: /* normal text font */
  --vp-font-family-mono: /* code font */
}
```

::: warning
Wenn du are Verwendung optional components like the [Team Seite](../reference/default-theme-team-page) components, make sure to also import them von `vitepress/theme-ohne-fonts`!
:::

Wenn your font is a local file referenced via `@font-face`, it will be processed as an asset and included under `.vitepress/dist/assets` mit hashed filename. To preload this file, use the [transformHead](../reference/site-config#transformhead) build hook:

```js [.vitepress/config.js]
export default {
  transformHead({ assets }) {
    // adjust the regex accordingly to match your font
    const myFontFile = assets.find(file => /font-name\.[\w-]+\.woff2/.test(file))
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

## Registering Global Components

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // register your custom global components
    app.component('MyGlobalComponent' /* ... */)
  }
}
```

Wenn du're Verwendung TypeScript:
```ts [.vitepress/theme/index.ts]
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // register your custom global components
    app.component('MyGlobalComponent' /* ... */)
  }
} satisfies Theme
```

Since we are Verwendung Vite, du kannst außerdem leverage Vite's [glob import feature](https://vite.dev/guide/features.html#glob-import) to auto register a directory of components.

## Layout Slots

The Standard-Theme's `<Layout/>` component has a few slots that can be verwendet to inject content at certain locations of die Seite. Here's an example of injecting a component in the bevor outline:

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'
import MyLayout from './MyLayout.vue'

export default {
  extends: DefaultTheme,
  // override the Layout with a wrapper component that
  // injects the slots
  Layout: MyLayout
}
```

```vue [.vitepress/theme/MyLayout.vue]
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

```js [.vitepress/theme/index.js]
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import MyComponent from './MyComponent.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'aside-outline-before': () => h(MyComponent)
    })
  }
}
```

Full list of slots verfügbar in das Standard-Theme layout:

- Wenn `layout: 'doc'` (default) is enabled via frontmatter:
  - `doc-top`
  - `doc-bottom`
  - `doc-footer-bevor`
  - `doc-bevor`
  - `doc-nach`
  - `sidebar-nav-bevor`
  - `sidebar-nav-nach`
  - `aside-top`
  - `aside-bottom`
  - `aside-outline-bevor`
  - `aside-outline-nach`
  - `aside-ads-bevor`
  - `aside-ads-nach`
- Wenn `layout: 'home'` is enabled via frontmatter:
  - `home-hero-bevor`
  - `home-hero-info-bevor`
  - `home-hero-info`
  - `home-hero-info-nach`
  - `home-hero-actions-bevor-actions`
  - `home-hero-actions-nach`
  - `home-hero-image`
  - `home-hero-nach`
  - `home-features-bevor`
  - `home-features-nach`
- Wenn `layout: 'page'` is enabled via frontmatter:
  - `page-top`
  - `page-bottom`
- On not found (404) page:
  - `not-found`
- Always:
  - `layout-top`
  - `layout-bottom`
  - `nav-bar-title-bevor`
  - `nav-bar-title-nach`
  - `nav-bar-content-bevor`
  - `nav-bar-content-nach`
  - `nav-screen-content-bevor`
  - `nav-screen-content-nach`

## Using View Transitions API

### On Appearance Toggle

Du kannst extend das Standard-Theme to provide a custom transition wenn the color mode is toggled. An example:

<<< @/components/AppearanceToggleTransition.vue [.vitepress/theme/Layout.vue]

Result (**warning!**: flashing colors, sudden movements, bright lights):

<details>
<summary>Demo</summary>

![Appearance Toggle Transition Demo](/appearance-toggle-transition.webp)

</details>

Refer [Chrome Docs](https://developer.chrome.com/docs/web-platform/view-transitions/) von more details on view transitions.

### On Route Change

Coming soon.

## Overriding Internal Components

Du kannst use Vite's [aliases](https://vite.dev/config/shared-options.html#resolve-alias) to replace Standard-Theme components mit your custom ones:

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
            new URL('./theme/components/CustomNavBar.vue', import.meta.url)
          )
        }
      ]
    }
  }
})
```

To know the exact name of the component refer [our source code](https://github.com/vuejs/vitepress/tree/main/src/client/theme-default/components). Since the components are internal, there is a slight chance their name is updated zwischen minor releases.
