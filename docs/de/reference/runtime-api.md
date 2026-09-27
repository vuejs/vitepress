---
description: Referenz der VitePress-Runtime-APIs einschließlich Composables, Hilfsfunktionen und integrierter Komponenten.
---

# Runtime API

VitePress bietet außerdem einige integrierte Komponenten, die global verwendet werden können.

Die Hilfsmethoden können global aus `vitepress` importiert werden und werden normalerweise in Vue-Komponenten eigener Themes verwendet. Sie können jedoch auch innerhalb von `.md`-Seiten verwendet werden, da Markdown-Dateien in Vue-[Single-File-Komponenten](https://vuejs.org/guide/scaling-up/sfc.html) kompiliert werden.

Methoden, die mit `use*` beginnen, sind [Vue-3-Composition-API](https://vuejs.org/guide/introduction.html#composition-api)-Funktionen („Composables“), die nur innerhalb von `setup()` oder `<script setup>` verwendet werden können.

## `useData` <Badge type="info" text="composable" />

Gibt seitenspezifische Daten zurück. Das zurückgegebene Objekt hat folgenden Typ:

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

`page.headers` wird nur gefüllt, wenn [`markdown.headers`](./site-config#markdown) aktiviert ist. Ohne diese Option bleibt es ein leeres Array. Die Seitenübersicht des Standard-Themes liest gerenderte Überschriften aus dem Seiteninhalt, sodass sie auch bei leerem `page.headers` angezeigt werden kann.

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

Gibt das aktuelle Routenobjekt mit folgendem Typ zurück:

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

Weise der Routerinstanz Handler für Routenänderungen zu:

```ts
const router = useRouter()

router.onBeforeRouteChange = (to) => {
  console.log('navigating to', to)
}
```

Bei eigenen Themes ist derselbe Router über [`enhanceApp`](../guide/custom-theme#theme-interface).

## `useIcon` <Badge type="info" text="composable" />

- **Type**: `(icon: MaybeRefOrGetter<string | { svg: string } | undefined>, el?: MaybeRefOrGetter<HTMLElement | null>) => ComputedRef<string | undefined>`

Rendert ein [Iconify](https://iconify.design/)-Symbol über die Icon-Pipeline von VitePress. Erwartet eine vollständig qualifizierte `collection:name` (aufgelöst anhand der `@iconify-json/*`-Pakete in den Abhängigkeiten deines Projekts) und gibt die Klasse zurück, die auf dem Element gesetzt werden soll — `vpi-<collection>-<name>`.

Während SSR wird der Name im [`SSGContext`](./site-config#postrender) registriert, sodass der Build die Symbolstile in das erzeugte Stylesheet schreibt. Im Entwicklungsmodus liefert der Entwicklungsserver Symbole bei Bedarf aus den lokal installierten Sammlungen. Kein Symbol wird jemals von einem externen Dienst geladen.

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

Übergebe die Template-Referenz des Elements, das die Klasse trägt, damit der Entwicklungsmodus das Symbol darauf auflösen kann. Das Element benötigt die Maskenregeln des Standard-Themes; bei einem eigenen Theme ohne diese Regeln verwendet der Entwicklungsmodus ein entsprechendes Inline-Äquivalent und das erzeugte Stylesheet enthält für die Produktion Basisregeln ohne Spezifität.

Bei Verwendung des Standard-Themes kapselt die Komponente `VPIcon` aus `vitepress/theme` dieses Composable (und akzeptiert auch eine rohe `{ svg }`-Zeichenkette):

```vue-html
<VPIcon icon="lucide:rocket" />
```

Symbole, die nur auf dem Client gerendert werden (z. B. innerhalb von `<ClientOnly />`), können während des Builds nicht erfasst werden. Liste sie stattdessen unter [`icons.include`](./site-config#icons) auf.

## `withBase` <Badge type="info" text="helper" />

- **Type**: `(path: string) => string`

Stellt das konfigurierte [`base`](./site-config#base) einem angegebenen URL-Pfad voran. Siehe auch [Basis-URL](../guide/asset-handling#base-url).

## `<Inhalt />` <Badge type="info" text="component" />

Die Komponente `<Content />` zeigt den gerenderten Markdown-Inhalt an. Nützlich [beim Erstellen eines eigenen Themes](../guide/custom-theme).

```vue
<template>
  <h1>Custom Layout!</h1>
  <Content />
</template>
```

## `<ClientOnly />` <Badge type="info" text="component" />

Die Komponente `<ClientOnly />` rendert ihren Slot nur auf der Clientseite.

Da VitePress-Anwendungen beim Erzeugen statischer Builds in Node.js serverseitig gerendert werden, muss jede Vue-Verwendung den Anforderungen an universellen Code entsprechen. Kurz gesagt: Greife nur in `beforeMount`- oder `mounted`-Hooks auf Browser-/DOM-APIs zu.

Wenn du nicht SSR-kompatible Komponenten verwendest oder demonstrierst (beispielsweise solche mit eigenen Direktiven), kannst du sie in die `ClientOnly`-Komponente einschließen.

```vue-html
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```

- Related: [SSR Compatibility](../guide/ssr-compat)

## `$frontmatter` <Badge type="info" text="template global" />

Greife direkt auf die [Frontmatter](../guide/frontmatter)-Daten in Vue-Ausdrücken zu.

```md
---
title: Hello
---

# {{ $frontmatter.title }}
```

## `$params` <Badge type="info" text="template global" />

Greife direkt auf die [Parameter dynamischer Routen](../guide/routing#dynamic-routes) in Vue-Ausdrücken zu.

```md
- package name: {{ $params.pkg }}
- version: {{ $params.version }}
```
