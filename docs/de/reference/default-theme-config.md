---
description: Referenz aller für das VitePress-Standard-Theme verfügbaren Konfigurationsoptionen.
---

# Konfiguration des Standard-Themes

Mit der Theme-Konfiguration kannst du dein Theme anpassen. Du kannst sie über die Option `themeConfig` in der Konfigurationsdatei definieren:

```ts
export default {
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',

  // Theme related configurations.
  themeConfig: {
    logo: '/logo.svg',
    nav: [...],
    sidebar: { ... }
  }
}
```

**Die auf dieser Seite dokumentierten Optionen gelten nur für das Standard-Theme.** Andere Themes erwarten eine andere Theme-Konfiguration. Bei Verwendung eines eigenen Themes wird das Theme-Konfigurationsobjekt an das Theme übergeben, damit es davon abhängiges Verhalten definieren kann.

## i18nRouting

- Type: `boolean | ((data: VitePressData<DefaultTheme.Config>, route: Route, targetLocale: string) => string)`

Changing locale to say `zh` will change the URL from `/foo` (or `/en/foo/`) to `/zh/foo`. Du kannst disable this behavior by setting `themeConfig.i18nRouting` to `false`.

Setze `themeConfig.i18nRouting` auf eine Funktion, um den Sprachlink anzupassen. Die Funktion erhält die aktuellen VitePress-Daten, die aktuelle Route und den Schlüssel der Zielsprache und gibt den Ziellink zurück.

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    i18nRouting(data, route, targetLocale) {
      const target = data.site.value.locales[targetLocale]
      const targetLink =
        target.link || (targetLocale === 'root' ? '/' : `/${targetLocale}/`)

      return `${targetLink}${route.data.relativePath.replace(/\.md$/, '')}${route.hash}`
    }
  }
})
```

## logo

- Type: `ThemeableImage`

Logo-Datei, die in der Navigationsleiste direkt vor dem Seitentitel angezeigt wird. Akzeptiert eine Pfadzeichenkette oder ein Objekt, um unterschiedliche Logos für den Hell-/Dunkelmodus festzulegen.

```ts
export default {
  themeConfig: {
    logo: '/logo.svg'
  }
}
```

```ts
type ThemeableImage =
  | string
  | { src: string; alt?: string }
  | { light: string; dark: string; alt?: string }
```

## siteTitle

- Type: `string | false`

Du kannst dieses Element anpassen, um den Standard-Seitentitel (`title` in der App-Konfiguration) in der Navigation zu ersetzen. Bei `false` wird der Titel in der Navigation deaktiviert. Dies ist nützlich, wenn dein `logo` den Seitentitel bereits enthält.

```ts
export default {
  themeConfig: {
    siteTitle: 'Hello World'
  }
}
```

## nav

- Type: `NavItem`

Die Konfiguration für einen Navigationseintrag. Weitere Details findest du unter [Standard-Theme: Navigation](./Standard-theme-nav#navigation-links).

```ts
export default {
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide' },
      {
        text: 'Dropdown Menu',
        items: [
          { text: 'Item A', link: '/item-1' },
          { text: 'Item B', link: '/item-2' },
          { text: 'Item C', link: '/item-3' }
        ]
      }
    ]
  }
}
```

```ts
type NavItem = NavItemWithLink | NavItemWithChildren

interface NavItemWithLink {
  text: string
  link: string | ((payload: PageData) => string)
  activeMatch?: string
  target?: string
  rel?: string
  noIcon?: boolean
}

interface NavItemChildren {
  text?: string
  items: NavItemWithLink[]
}

interface NavItemWithChildren {
  text?: string
  items: (NavItemChildren | NavItemWithLink)[]
  activeMatch?: string
}
```

## sidebar

- Type: `Sidebar`

Die Konfiguration für einen Seitenleisteneintrag. Weitere Details findest du unter [Standard-Theme: Seitenleiste](./Standard-theme-sidebar).

```ts
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Getting Started', link: '/getting-started' },
          ...
        ]
      }
    ]
  }
}
```

```ts
export type Sidebar = SidebarItem[] | SidebarMulti

export interface SidebarMulti {
  [path: string]: SidebarItem[] | { items: SidebarItem[]; base: string }
}

export type SidebarItem = {
  /**
   * The text label of the item.
   */
  text?: string

  /**
   * The link of the item.
   */
  link?: string

  /**
   * The children of the item.
   */
  items?: SidebarItem[]

  /**
   * If not specified, group is not collapsible.
   *
   * If `true`, group is collapsible and collapsed by default
   *
   * If `false`, group is collapsible but expanded by default
   */
  collapsed?: boolean

  /**
   * Base path for the children items.
   */
  base?: string

  /**
   * Anpassen text that appears on the footer of previous/next page.
   */
  docFooterText?: string

  rel?: string
  target?: string
}
```

## aside

- Type: `boolean | 'left'`
- Default: `true`
- Can be overridden per page via [frontmatter](./frontmatter-config#aside)

Setting this value to `false` prevents rendering of aside container.\
Setting this value to `true` renders the aside to the right.\
Wenn dieser Wert auf `left` gesetzt wird, wird der Aside-Container links gerendert.\
In Rechts-nach-Links-Layouts werden beide Seiten gespiegelt.

Wenn du es für alle Ansichtsgrößen deaktivieren möchtest, solltest du stattdessen `outline: false` verwenden.

## outline

- Type: `Outline | Outline['level'] | false`
- Die Ebene kann pro Seite über das [Frontmatter] überschrieben werden.(./frontmatter-config#outline)

Wenn dieser Wert auf `false` gesetzt wird, wird der Outline-Container nicht gerendert. Weitere Details findest du in diesem Interface:

```ts
interface Outline {
  /**
   * The levels of headings to be displayed in the outline.
   * Single number means only headings of that level will be displayed.
   * If a tuple is passed, the first number is the minimum level and the second number is the maximum level.
   * `'deep'` is same as `[2, 6]`, which means all headings from `<h2>` to `<h6>` will be displayed.
   *
   * @default 2
   */
  level?: number | [number, number] | 'deep'

  /**
   * The title to be displayed on the outline.
   *
   * @default 'On this page'
   */
  label?: string
}
```

## socialLinks

- Type: `SocialLink[]`

Du kannst diese Option definieren, um Links zu deinen sozialen Konten mit Symbolen in der Navigation anzuzeigen.

```ts
export default {
  themeConfig: {
    socialLinks: [
      // You can add any icon from simple-icons (https://simpleicons.org/):
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
      { icon: 'twitter', link: '...' },
      { icon: 'discord', link: '/community', target: '_self' },
      // You can use any other iconify collection installed in your project
      // as `collection:name` (e.g. after `npm add -D @iconify-json/lucide`):
      { icon: 'lucide:rss', link: '/feed.rss' },
      // You can also add custom icons by passing SVG as string:
      {
        icon: {
          svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Dribbble</title><path d="M12...6.38z"/></svg>'
        },
        link: '...',
        // You can include a custom label for accessibility too (optional but recommended):
        ariaLabel: 'cool link'
      }
    ]
  }
}
```

```ts
interface SocialLink {
  icon: string | { svg: string }
  link: string
  ariaLabel?: string
  target?: string
}
```

## footer

- Type: `Fußzeile`
- Can be overridden per page via [frontmatter](./frontmatter-config#footer)

Konfiguration der Fußzeile. Du kannst eine Nachricht oder einen Copyright-Text in der Fußzeile hinzufügen. Er wird jedoch nur angezeigt, wenn die Seite keine Seitenleiste enthält. Dies ist eine bewusste Designentscheidung.

```ts
export default {
  themeConfig: {
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present Evan You'
    }
  }
}
```

```ts
export interface Footer {
  message?: string
  copyright?: string
}
```

## editLink

- Type: `EditLink`
- Can be overridden per page via [frontmatter](./frontmatter-config#editlink)

Bearbeitungslink lets you display a link to edit the page on Git management services such as GitHub, or GitLab. See [Standard-Theme: Bearbeitungslink](./Standard-theme-edit-link) for more details.

```ts
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
}
```

```ts
export interface EditLink {
  pattern: string
  text?: string
}
```

## lastUpdated

- Type: `LastUpdatedOptions`

Ermöglicht die Anpassung des Textes und Datumsformats für die letzte Aktualisierung.

```ts
export default {
  themeConfig: {
    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    }
  }
}
```

```ts
export interface LastUpdatedOptions {
  /**
   * @default 'Last updated'
   */
  text?: string

  /**
   * @default
   * { dateStyle: 'short',  timeStyle: 'short' }
   */
  formatOptions?: Intl.DateTimeFormatOptions & { forceLocale?: boolean }
}
```

## algolia

- Type: `AlgoliaSearch`

An option to support searching your docs site using [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch). Learn more in [Standard-Theme: Suche](./Standard-theme-search)

```ts
export interface AlgoliaSearchOptions extends DocSearchProps {
  locales?: Record<string, Partial<DocSearchProps>>
}
```

Eine vollständige Liste der Optionen findest du [hier](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts).

## carbonAds {#carbon-ads}

- Type: `CarbonAdsOptions`

An option to display [Carbon Ads](https://www.carbonads.net/).

```ts
export default {
  themeConfig: {
    carbonAds: {
      code: 'your-carbon-code',
      placement: 'your-carbon-placement'
      format: 'classic'
    }
  }
}
```

```ts
export interface CarbonAdsOptions {
  code: string
  placement: string
  format?: 'classic' | 'responsive' | 'cover'
}
```

Weitere Informationen findest du unter [Standard-Theme: Carbon Ads](./Standard-theme-carbon-ads)

## docFooter

- Type: `DocFooter`

Kann verwendet werden, um den Text über den Links zur vorherigen und nächsten Seite anzupassen. Dies ist hilfreich, wenn die Dokumentation nicht auf Englisch verfasst ist. Außerdem können die Links global deaktiviert werden. Wenn du die Links gezielt aktivieren oder deaktivieren möchtest, kannst du [frontmatter](./Standard-theme-prev-next-links).

```ts
export default {
  themeConfig: {
    docFooter: {
      prev: 'Pagina prior',
      next: 'Proxima pagina'
    }
  }
}
```

```ts
export interface DocFooter {
  prev?: string | false
  next?: string | false
}
```

## darkModeSwitchLabel

- Type: `string`
- Default: `Appearance`

Kann verwendet werden, um die Beschriftung des Dunkelmodus-Schalters anzupassen. Diese Beschriftung wird nur in der mobilen Ansicht angezeigt.

## lightModeSwitchTitle

- Type: `string`
- Default: `Switch to light theme`

Kann verwendet werden, um den Titel des Hellmodus-Schalters anzupassen, der beim Darüberfahren angezeigt wird.

## darkModeSwitchTitle

- Type: `string`
- Default: `Switch to dark theme`

Kann verwendet werden, um den Titel des Dunkelmodus-Schalters anzupassen, der beim Darüberfahren angezeigt wird.

## sidebarMenuLabel

- Type: `string`
- Default: `Menu`

Kann verwendet werden, um die Beschriftung des Seitenleistenmenüs anzupassen. Diese Beschriftung wird nur in der mobilen Ansicht angezeigt.

## returnToTopLabel

- Type: `string`
- Default: `Return to top`

Kann verwendet werden, um die Beschriftung der Schaltfläche zum Zurückkehren nach oben anzupassen. Diese Beschriftung wird nur in der mobilen Ansicht angezeigt.

## langMenuLabel

- Type: `string`
- Default: `Change language`

Kann verwendet werden, um das aria-label der Sprachumschalt-Schaltfläche in der Navigationsleiste anzupassen. Dies wird nur bei Verwendung von [i18n] genutzt.(../guide/i18n).

## navMenuLabel

- Type: `string`
- Default: `Main Navigation`

Can be used to customize the accessible label of the main navigation landmarks (the navbar menu and the mobile menu).

## mobileMenuLabel

- Type: `string`
- Default: `Menu`

Can be used to customize the aria-label of the mobile menu (hamburger) button.

## extraMenuLabel

- Type: `string`
- Default: `More options`

Can be used to customize the aria-label of the `⋯` menu button in the navbar. That menu collects the nav items and controls that don't fit in the bar at the current viewport size.

## skipToContentLabel

- Type: `string`
- Default: `Skip to content`

Can be used to customize the label of the skip to content link. Dies link is shown when the user is navigating the site using a keyboard.

## externalLinkIcon

- Type: `boolean`
- Default: `false`

Whether to show an external link icon next to external links in markdown.

## gradedContainers

- Type: `boolean`
- Default: `false`

Whether to color [custom containers](../guide/markdown#custom-containers), [GitHub-flavored alerts](../guide/markdown#github-flavored-alerts), and badges on a graded severity scale — danger red, warning orange, caution yellow. By Standard, colors match GitHub's alerts, where caution shares danger's red and warning is yellow.

## `useLayout` <Badge type="info" text="composable" />

Returns layout-related data. The returned object has the following type:

```ts
interface {
  isHome: ComputedRef<boolean>

  sidebar: Readonly<ShallowRef<DefaultTheme.SidebarItem[]>>
  sidebarGroups: ComputedRef<DefaultTheme.SidebarItem[]>
  hasSidebar: ComputedRef<boolean>
  isSidebarEnabled: ComputedRef<boolean>

  hasAside: ComputedRef<boolean>
  leftAside: ComputedRef<boolean>

  headers: Readonly<ShallowRef<DefaultTheme.OutlineItem[]>>
  hasLocalNav: ComputedRef<boolean>
}
```

**Beispiel:**

```vue
<script setup>
import { useLayout } from 'vitepress/theme'

const { hasSidebar } = useLayout()
</script>

<template>
  <div v-if="hasSidebar">Only show when sidebar exists</div>
</template>
```
