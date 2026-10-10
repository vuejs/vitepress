---
outline: deep
description: Passe das VitePress-Standard-Theme mit benutzerdefiniertem CSS, Komponenten, Layouts und Slots an und erweitere es.
---

# Standard-Theme erweitern

Das VitePress-Standard-Theme ist für Dokumentation optimiert und kann angepasst werden. Eine umfassende Liste der Optionen findest du in der [Übersicht zur Standard-Theme-Konfiguration](../reference/default-theme-config).

Es gibt jedoch einige Fälle, in denen die Konfiguration allein nicht ausreicht. Zum Beispiel:

1. Du musst die CSS-Gestaltung anpassen;
2. Du musst die Vue-App-Instanz ändern, zum Beispiel um globale Komponenten zu registrieren;
3. Du musst über Layout-Slots benutzerdefinierte Inhalte in das Theme einfügen.

Diese fortgeschrittenen Anpassungen erfordern ein eigenes Theme, das das Standard-Theme „erweitert“.

::: tip
Bevor du fortfährst, lies zunächst [Ein eigenes Theme verwenden](./custom-theme), um zu verstehen, wie eigene Themes funktionieren.
:::

## Anpassen CSS

Das CSS des Standard-Themes kann durch Überschreiben der CSS-Variablen auf Stammebene angepasst werden:

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

Siehe die [CSS-Variablen des Standard-Themes](https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/styles/vars.css), die überschrieben werden können.

### Navbar

Die Navigationsleiste verwendet eine einzelne, über CSS-Variablen gesteuerte Hintergrundfläche. Ihr Erscheinungsbild kann daher geändert werden, ohne die Interna der Komponenten anzupassen:

```css
:root {
  /* Höhe und Hintergrund der Leiste */
  --vp-nav-height: 4rem;
  --vp-nav-bg-color: var(--vp-c-bg);

  /* Hintergrund am oberen Rand der Startseite (nicht gescrollt);
     auf var(--vp-nav-bg-color) setzen, um die Transparenz zu deaktivieren */
  --vp-nav-home-bg-color: transparent;

  /* Filter für den Inhalt hinter der Leiste */
  --vp-nav-backdrop-filter: none;

  /* untere Linie der Leiste und Hintergrund des mobilen Menüs */
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

Dieselbe Gestaltung gilt auch für die lokale Navigation: `--vp-local-nav-bg-color` folgt standardmäßig der Oberflächenfarbe der Navigationsleiste. Wo die beiden Leisten zusammentreffen, teilen sie sich eine einzige verschwommene Fläche, sodass der Glaseffekt durchgehend bleibt.

::: warning
`backdrop-filter` kann die Scrollleistung messbar beeinträchtigen, insbesondere auf großen Bildschirmen oder Bildschirmen mit hoher Pixeldichte. Wenn du eine halbtransparente Leiste verwendest, prüfe daher den Kontrast des Textes gegenüber deinem Seiteninhalt. Safari 17 und ältere Versionen wenden variablenbasierte Hintergrundfilter nicht an und zeigen daher die halbtransparente Farbe ohne Unschärfe.
:::

Wenn the nav items don't fit the verfügbar width, they move in the `⋯` menu at the end of the navbar instead of being clipped, starting mit the social links, the appearance switch and the locale switcher, followed by the nav items right-to-left. Its button label can be localized mit [`extraMenuLabel`](../reference/default-theme-config#extramenulabel).

## Andere Schriftarten verwenden

VitePress verwendet [Inter](https://rsms.me/inter/) als Standardschriftart und fügt die Schriftarten der Build-Ausgabe hinzu. Die Schriftart wird in der Produktion außerdem automatisch vorab geladen. Das ist möglicherweise nicht erwünscht, wenn du eine andere Hauptschriftart verwenden möchtest.

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
