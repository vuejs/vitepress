---
description: Reference of all Konfiguration options verfügbar for the VitePress Standard theme.
---

# Konfiguration des Standard-Themes

Theme config lets you customize your theme. Du kannst define theme config via the `themeConfig` option in the config file:

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

**The options documented on this page only apply to the Standard theme.** Different themes expect different theme config. When using a custom theme, the theme config object will be passed to the theme so the theme can define conditional behavior based on it.

## i18nRouting

- Type: `boolean | ((data: VitePressData<DefaultTheme.Config>, route: Route, targetLocale: string) => string)`

Changing locale to say `zh` will change the URL from `/foo` (or `/en/foo/`) to `/zh/foo`. Du kannst disable this behavior by setting `themeConfig.i18nRouting` to `falsch`.

Set `themeConfig.i18nRouting` to a function to customize the locale link. The function receives the current VitePress data, the current route, and the target locale key, and gibt zurück the target link.

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

Logo file to display in nav bar, right before the site title. Accepts a path string, or an object to set a different logo for light/dark mode.

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

- Type: `string | falsch`

Du kannst customize this item to replace the Standard site title (`title` in app config) in nav. When set to `falsch`, title in nav will be deaktiviert. Useful when you have `logo` that already contains the site title text.

```ts
export default {
  themeConfig: {
    siteTitle: 'Hello World'
  }
}
```

## nav

- Type: `NavItem`

The Konfiguration for the nav menu item. More details in [Standard-Theme: Nav](./Standard-theme-nav#navigation-links).

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

- Type: `Seitenleiste`

The Konfiguration for the sidebar menu item. More details in [Standard-Theme: Seitenleiste](./Standard-theme-sidebar).

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
- Default: `wahr`
- Can be overridden per page via [frontmatter](./frontmatter-config#aside)

Setting this value to `falsch` prevents rendering of aside container.\
Setting this value to `wahr` renders the aside to the right.\
Setting this value to `left` renders the aside to the left.\
In right-to-left layouts, both sides are mirrored.

Wenn du want to disable it for all viewports, you should use `outline: falsch` instead.

## outline

- Type: `Outline | Outline['level'] | falsch`
- Level can be overridden per page via [frontmatter](./frontmatter-config#outline)

Setting this value to `falsch` prevents rendering of outline container. Refer this interface for more details:

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

Du kannst define this option to show your social account links with icons in nav.

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

Fußzeile Konfiguration. Du kannst add a message or copyright text on the footer, however, it will only be displayed when the page doesn't contain a sidebar. Dies is due to design concerns.

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
export interface Fußzeile {
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

Allows customization for the last updated text and date format.

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

View full options [here](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts).

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

Learn more in [Standard-Theme: Carbon Ads](./Standard-theme-carbon-ads)

## docFooter

- Type: `DocFooter`

Can be used to customize text appearing above previous and next links. Helpful if not writing docs in English. Also can be used to disable prev/next links globally. Wenn du want to selectively enable/disable prev/next links, you can use [frontmatter](./Standard-theme-prev-next-links).

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

Can be used to customize the dark mode switch label. Dies label is only displayed in the mobile view.

## lightModeSwitchTitle

- Type: `string`
- Default: `Switch to light theme`

Can be used to customize the light mode switch title that appears on hovering.

## darkModeSwitchTitle

- Type: `string`
- Default: `Switch to dark theme`

Can be used to customize the dark mode switch title that appears on hovering.

## sidebarMenuLabel

- Type: `string`
- Default: `Menu`

Can be used to customize the sidebar menu label. Dies label is only displayed in the mobile view.

## returnToTopLabel

- Type: `string`
- Default: `Return to top`

Can be used to customize the label of the zurückgeben to top button. Dies label is only displayed in the mobile view.

## langMenuLabel

- Type: `string`
- Default: `Change language`

Can be used to customize the aria-label of the language toggle button in navbar. Dies is only used if you're using [i18n](../guide/i18n).

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
- Default: `falsch`

Whether to show an external link icon next to external links in markdown.

## gradedContainers

- Type: `boolean`
- Default: `falsch`

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
