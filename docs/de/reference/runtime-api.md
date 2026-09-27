---
description: Referenz der VitePress-Runtime-APIs einschließlich Composables, Hilfsfunktionen und integrierter Komponenten.
---

# Runtime API

VitePress bietet mehrere integrierte APIs für den Zugriff auf Anwendungsdaten. VitePress also comes with a few built-in components that can be used globally.

Die Hilfsmethoden können global importiert werden from `vitepress` and are typically used in custom theme Vue components. Sie können jedoch auch innerhalb von `.md`-Seiten verwendet werden because markdown files are compiled into Vue [Single-Datei Komponenten](https://vuejs.org/guide/scaling-up/sfc.html).

Methoden, die mit `use*` beginnen, sind that it is a [Vue 3 Composition API](https://vuejs.org/guide/introduction.html#composition-api) function ("Composable") that can only be used inside `setup()` or `<script setup>`.

## `useData` <Badge type="info" text="composable" />

Gibt seitenspezifische Daten zurück. The returned object has the following type:

```ts
interface VitePressData<T = any> {
  /**
   * Site-level metadata
   */
  site: Ref<SiteData<T>>
  /**
   * themeConfig from .vitepress/config.js
   */
  theme: Ref<T>
  /**
   * Page-level metadata
   */
  page: Ref<PageData>
  /**
   * Page frontmatter
   */
  frontmatter: Ref<PageData['frontmatter']>
  /**
   * Dynamic route params
   */
  params: Ref<PageData['params']>
  title: Ref<string>
  description: Ref<string>
  lang: Ref<string>
  isDark: Ref<boolean>
  dir: Ref<'ltr' | 'rtl' | 'auto'>
  localeIndex: Ref<string>
  /**
   * Current location hash
   */
  hash: Ref<string>
}

interface PageData {
  title: string
  titleTemplate?: string | boolean
  description: string
  relativePath: string
  filePath: string
  headers: Header[]
  frontmatter: Record<string, any>
  params?: Record<string, any>
  isNotFound?: boolean
  lastUpdated?: number
}
```

`page.headers` is populated only when [`markdown.headers`](./site-config#markdown) ist aktiviert. Ohne diese Option bleibt es ein leeres Array. The default theme outline reads rendered headings from the page content, so it can still appear when `page.headers` is empty.

**Beispiel:**

```vue
<script setup>
import { useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <h1>{{ theme.footer.copyright }}</h1>
</template>
```

## `useRoute` <Badge type="info" text="composable" />

Gibt das aktuelle Routenobjekt zurück with the following type:

```ts
interface Route {
  path: string
  data: PageData
  component: Component | null
}
```

## `useRouter` <Badge type="info" text="composable" />

Gibt die VitePress-Routerinstanz zurück, mit der du programmgesteuert zu einer anderen Seite navigieren kannst.

```ts
interface Router {
  /**
   * Current route.
   */
  route: Route
  /**
   * Navigate to a new URL.
   */
  go: (to?: string) => Promise<void>
  /**
   * Called before the route changes. Return `false` to cancel the navigation.
   */
  onBeforeRouteChange?: (to: string) => Awaitable<void | boolean>
  /**
   * Called before the page component is loaded (after the history state is updated).
   * Return `false` to cancel the navigation.
   */
  onBeforePageLoad?: (to: string) => Awaitable<void | boolean>
  /**
   * Called after the page component is loaded (before the page component is updated).
   */
  onAfterPageLoad?: (to: string) => Awaitable<void>
  /**
   * Called after the route changes.
   */
  onAfterRouteChange?: (to: string) => Awaitable<void>
}
```

Assign route-change handlers on the router instance:

```ts
const router = useRouter()

router.onBeforeRouteChange = (to) => {
  console.log('navigating to', to)
}
```

Bei eigenen Themes ist derselbe Router über [`enhanceApp`](../guide/custom-theme#theme-interface).

## `useIcon` <Badge type="info" text="composable" />

- **Type**: `(icon: MaybeRefOrGetter<string | { svg: string } | undefined>, el?: MaybeRefOrGetter<HTMLElement | null>) => ComputedRef<string | undefined>`

Renders an [iconify](https://iconify.design/) icon through VitePress's icon pipeline. Erwartet eine vollständig qualifizierte `collection:name` (resolved against the `@iconify-json/*` packages in your project's dependencies) und gibt die Klasse zurück, die auf dem Element gesetzt werden soll — `vpi-<collection>-<name>`.

Während SSR wird der Name im [`SSGContext`](./site-config#postrender), so the build emits the icon's styles into the generated stylesheet; in dev, icons are served on demand by the dev server from the locally installed collections. No icon is ever fetched from an external service.

```vue
<script setup>
import { useIcon } from 'vitepress'
import { useTemplateRef } from 'vue'

const el = useTemplateRef('el')
const iconClass = useIcon('lucide:rocket', el)
</script>

<template>
  <span ref="el" :class="iconClass" />
</template>
```

Übergebe die Template-Referenz of the element carrying the class so dev mode can resolve the icon on it. Das Element benötigt the mask rules the default theme ships; in a custom theme without them, dev applies an inline equivalent and the generated stylesheet includes zero-specificity base rules for production.

Bei Verwendung des Standard-Themes, the `VPIcon` component from `vitepress/theme` wraps this composable (and also accepts a raw `{ svg }` string):

```vue-html
<VPIcon icon="lucide:rocket" />
```

Symbole, die nur auf dem Client gerendert werden (e.g. inside `<ClientOnly />`) can't be collected during the build — list them in [`icons.include`](./site-config#icons) instead.

## `withBase` <Badge type="info" text="helper" />

- **Type**: `(path: string) => string`

Stellt das konfigurierte [`base`](./site-config#base) einem angegebenen URL-Pfad voran. Also see [Base URL](../guide/asset-handling#base-url).

## `<Inhalt />` <Badge type="info" text="component" />

The `<Inhalt />` component displays the rendered markdown contents. Nützlich [beim Erstellen eines eigenen Themes](../guide/custom-theme).

```vue
<template>
  <h1>Custom Layout!</h1>
  <Content />
</template>
```

## `<ClientOnly />` <Badge type="info" text="component" />

Die Komponente `<ClientOnly />` rendert ihren Slot nur auf der Clientseite.

Da VitePress-Anwendungen beim Erzeugen statischer Builds in Node.js serverseitig gerendert werden, any Vue usage must conform to the universal code requirements. In short, make sure to only access Browser / DOM APIs in beforeMount or mounted hooks.

Wenn du are using or demoing components that are not SSR-friendly (for example, contain custom directives), you can wrap them inside the `ClientOnly` component.

```vue-html
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```

- Related: [SSR Compatibility](../guide/ssr-compat)

## `$frontmatter` <Badge type="info" text="template global" />

Greife direkt auf die [frontmatter](../guide/frontmatter) data in Vue expressions.

```md
---
title: Hello
---

# {{ $frontmatter.title }}
```

## `$params` <Badge type="info" text="template global" />

Greife direkt auf die [dynamic route params](../guide/routing#dynamic-routes) in Vue expressions.

```md
- package name: {{ $params.pkg }}
- version: {{ $params.version }}
```
