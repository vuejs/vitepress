---
outline: deep
---

# Extending the Default Theme

VitePress' default theme is optimized for documentation, and a number of elements can be customized via `.vitepress/config.[extension]`. Consult the [Default Theme Config Overview](../reference/default-theme-config) for a comprehensive list of options.

However, there are a number of cases where configuration alone won't be enough. For example:

1. You need to tweak the CSS styling;
2. You need to modify the Vue app instance, for example to register global components;
3. You need to inject custom content into the theme via layout slots.

These advanced customizations will require using a custom theme that "extends" the default theme.

::: tip
Before proceeding, make sure to first read [Using a Custom Theme](./custom-theme) to understand how custom themes work.
:::

## Customizing CSS

To apply custom CSS, you first need to create a custom VitePress theme. Place the following code into `.vitepress/theme/index.js` which imports the default theme and adds an additional CSS file to the bundle:

::: code-group
```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default DefaultTheme
```
:::

The default theme CSS is customizable by overriding root level CSS variables. This example shows how to change the site's color scheme from the default VitePress indigo to shades of red, using one of the built-in color schemes:

::: code-group
```css [.vitepress/theme/custom.css]
/**
 * Customize default theme styling by overriding CSS variables:
 * https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/styles/vars.css
 */
:root {
  /* Brand color 1: for colored text and links */
  --vp-c-brand-1: var(--vp-c-red-1);
  /* Brand color 2: for button hover state, etc. */
  --vp-c-brand-2: var(--vp-c-red-2);
  /* Brand color 3: for button backgrounds, etc. */
  --vp-c-brand-3: var(--vp-c-red-3);
  /* Brand color soft: for tip boxes etc. 
     Must have transparency to account for nested boxes. */
  --vp-c-brand-soft: var(--vp-c-red-soft);
}
```
:::

You can swap out the word `red` in the CSS above for other built-in colours: `gray`, `indigo`, `purple`, `green`, or `yellow`. 

Or you can use your own custom colors:

```css
/* Change site color scheme to orange */
:root {
   --vp-c-brand-1: orange;
   --vp-c-brand-2: #ffbf48;
   --vp-c-brand-3: orange;
   --vp-c-brand-soft: rgba(250, 215, 151, 0.14);
}
```

There are many other CSS variables that can be overridden if required. See [`vars.css`](https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/styles/vars.css) in the default theme for the full list.

You can also apply any other CSS style rules here. While using CSS variables is good practice to help reduce repetition, plain CSS is also fine.

Just remember to choose colors that work well in both dark and light modes, unless you disable the dark mode toggle or specify unique colors for both light and dark modes. See [Dark Mode](#dark-mode) below for more.

## Using CSS Pre-Processors

If you'd like to use SASS, LESS, or Stylus within your theme, first make sure the relevant pre-processor is installed by running the applicable command:

```bash
# .scss and .sass
npm install -D sass

# .less
npm install -D less

# .styl and .stylus
npm install -D stylus
```

Then update your `import` statement to refer to the appropriate file extension:

::: code-group
```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'
import './custom.scss'      // [!code hl]

export default DefaultTheme
```
:::

Here's an example SCSS file that could be used to change the brand colors, automatically creating variations from a single base color:

::: code-group
```scss [.vitepress/theme/custom.scss]
/**
 * Customize default theme styling by overriding CSS variables:
 * https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/styles/vars.css
 */

 $brand-color: #27afd5;

 :root {
   /* Brand color 1: for colored text and links */
   --vp-c-brand-1: #{$brand-color};
   /* Brand color 2: for button hover state, etc. */
   --vp-c-brand-2: #{lighten($brand-color, 10%)};
   /* Brand color 3: for button backgrounds, etc. */
   --vp-c-brand-3: #{$brand-color};
   /* Brand color soft: for tip boxes etc. 
      Must have transparency to account for nested boxes. */
   --vp-c-brand-soft: #{transparentize($brand-color, 0.86)};
 }
```

::: tip
When SASS variables or functions are used to define a CSS variable, they need to be wrapped in `#{ ... }`. See the SASS documentation [here](https://sass-lang.com/documentation/breaking-changes/css-vars) and [here](https://sass-lang.com/documentation/variables).
:::

## Dark Mode

To control whether the dark mode toggle is enabled or set to light or dark by default, see the [appearance setting](../reference/site-config#appearance).

When dark mode is enabled, the `<html>` root tag will become `<html class="dark">`. This allows you to apply style overrides based on which setting the user has selected:

```css
.dark {
  --vp-c-brand-1: orange;
  --vp-c-brand-2: #ffbf48;
  --vp-c-brand-3: orange;
}
.dark body {
  background-color: black;
}
```

## Using Different Fonts

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

::: warning
If you are using optional components like the [Team Page](../reference/default-theme-team-page) components, make sure to also import them from `vitepress/theme-without-fonts`!
:::

If your font is a local file referenced via `@font-face`, it will be processed as an asset and included under `.vitepress/dist/assets` with hashed filename. To preload this file, use the [transformHead](../reference/site-config#transformhead) build hook:

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

## Registering Global Components

```js
// .vitepress/theme/index.js
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

If you're using TypeScript:
```ts
// .vitepress/theme/index.ts
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

Since we are using Vite, you can also leverage Vite's [glob import feature](https://vitejs.dev/guide/features.html#glob-import) to auto register a directory of components.

## Layout Slots

The default theme's `<Layout/>` component has a few slots that can be used to inject content at certain locations of the page. Here's an example of injecting a component into the before outline:

```js
// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'
import MyLayout from './MyLayout.vue'

export default {
  extends: DefaultTheme,
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
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'aside-outline-before': () => h(MyComponent)
    })
  }
}
```

Full list of slots available in the default theme layout:

- When `layout: 'doc'` (default) is enabled via frontmatter:
  - `doc-top`
  - `doc-bottom`
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
  - `home-hero-info-before`
  - `home-hero-info`
  - `home-hero-info-after`
  - `home-hero-actions-after`
  - `home-hero-image`
  - `home-hero-after`
  - `home-features-before`
  - `home-features-after`
- When `layout: 'page'` is enabled via frontmatter:
  - `page-top`
  - `page-bottom`
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

## Using View Transitions API

### On Appearance Toggle

You can extend the default theme to provide a custom transition when the color mode is toggled. An example:

```vue
<!-- .vitepress/theme/Layout.vue -->

<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { nextTick, provide } from 'vue'

const { isDark } = useData()

const enableTransitions = () =>
  'startViewTransition' in document &&
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches

provide('toggle-appearance', async ({ clientX: x, clientY: y }: MouseEvent) => {
  if (!enableTransitions()) {
    isDark.value = !isDark.value
    return
  }

  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    )}px at ${x}px ${y}px)`
  ]

  await document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  }).ready

  document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    {
      duration: 300,
      easing: 'ease-in',
      pseudoElement: `::view-transition-${isDark.value ? 'old' : 'new'}(root)`
    }
  )
})
</script>

<template>
  <DefaultTheme.Layout />
</template>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root),
.dark::view-transition-new(root) {
  z-index: 1;
}

::view-transition-new(root),
.dark::view-transition-old(root) {
  z-index: 9999;
}

.VPSwitchAppearance {
  width: 22px !important;
}

.VPSwitchAppearance .check {
  transform: none !important;
}
</style>
```

Result (**warning!**: flashing colors, sudden movements, bright lights):

<details>
<summary>Demo</summary>

![Appearance Toggle Transition Demo](/appearance-toggle-transition.webp)

</details>

Refer [Chrome Docs](https://developer.chrome.com/docs/web-platform/view-transitions/) from more details on view transitions.

### On Route Change

Coming soon.

## Overriding Internal Components

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
