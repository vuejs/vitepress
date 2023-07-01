# Default Theme Config

Theme config lets you customize your theme. You can define theme config via the `themeConfig` option in the config file:

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

**The options documented on this page only apply to the default theme.** Different themes expect different theme config. When using a custom theme, the theme config object will be passed to the theme so the theme can define conditional behavior based on it.

## i18nRouting

- Type: `boolean`

Changing locale to say `zh` will change the URL from `/foo` (or `/en/foo/`) to `/zh/foo`. You can disable this behavior by setting `themeConfig.i18nRouting` to `false`.

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

- Type: `string | false`

You can customize this item to replace the default site title (`title` in app config) in nav. When set to `false`, title in nav will be disabled. Useful when you have `logo` that already contains the site title text.

```ts
export default {
  themeConfig: {
    siteTitle: 'Hello World'
  }
}
```

## nav

- Type: `NavItem`

The configuration for the nav menu item. More details in [Default Theme: Nav](./default-theme-nav#navigation-links).

```js
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
  link: string
  activeMatch?: string
  target?: string
  rel?: string
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

The configuration for the sidebar menu item. More details in [Default Theme: Sidebar](./default-theme-sidebar).

```js
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
  [path: string]: SidebarItem[]
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
}
```

## aside

- Type: `boolean | 'left'`
- Default: `true`
- Can be overridden per page via [frontmatter](./frontmatter-config#aside)

Setting this value to `false` prevents rendering of aside container.\
Setting this value to `true` renders the aside to the right.\
Setting this value to `left` renders the aside to the left.

## outline

- Type: `number | [number, number] | 'deep' | false`
- Default: `2`
- Can be overridden per page via [frontmatter](./frontmatter-config#outline)

The levels of header to display in the outline. You can specify a particular level by passing a number, or you can provide a level range by passing a tuple containing the bottom and upper limits. When passing `'deep'` which equals `[2, 6]`, all header levels are shown in the outline except `h1`. Set `false` to hide outline.

## outlineTitle

- Type: `string`
- Default: `On this page`

Can be used to customize the title of the right sidebar (on the top of outline links). This is useful when writing documentation in another language.

```js
export default {
  themeConfig: {
    outlineTitle: 'In hac pagina'
  }
}
```

## socialLinks

- Type: `SocialLink[]`

You may define this option to show your social account links with icons in nav.

```js
export default {
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
      { icon: 'twitter', link: '...' },
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
  icon: SocialLinkIcon
  link: string
  ariaLabel?: string
}

type SocialLinkIcon =
  | 'discord'
  | 'facebook'
  | 'github'
  | 'instagram'
  | 'linkedin'
  | 'mastodon'
  | 'slack'
  | 'twitter'
  | 'youtube'
  | { svg: string }
```

## footer

- Type: `Footer`

Footer configuration. You can add a message or copyright text on the footer, however, it will only be displayed when the page doesn't contain a sidebar. This is due to design concerns.

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

Edit Link lets you display a link to edit the page on Git management services such as GitHub, or GitLab. See [Default Theme: Edit Link](./default-theme-edit-link) for more details.

```js
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

## lastUpdatedText

- Type: `string`
- Default: `Last updated`

The prefix text showing right before the last updated time.

```ts
export default {
  themeConfig: {
    lastUpdatedText: 'Updated Date'
  }
}
```

## algolia

- Type: `AlgoliaSearch`

An option to support searching your docs site using [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch). Learn more in [Default Theme: Search](./default-theme-search)

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
    }
  }
}
```

```ts
export interface CarbonAdsOptions {
  code: string
  placement: string
}
```

Learn more in [Default Theme: Carbon Ads](./default-theme-carbon-ads)

## docFooter

- Type: `DocFooter`

Can be used to customize text appearing above previous and next links. Helpful if not writing docs in English. Also can be used to disable prev/next links globally. If you want to selectively enable/disable prev/next links, you can use [frontmatter](./default-theme-prev-next-links).

```js
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

Can be used to customize the dark mode switch label. This label is only displayed in the mobile view.

## sidebarMenuLabel

- Type: `string`
- Default: `Menu`

Can be used to customize the sidebar menu label. This label is only displayed in the mobile view.

## returnToTopLabel

- Type: `string`
- Default: `Return to top`

Can be used to customize the label of the return to top button. This label is only displayed in the mobile view.

## langMenuLabel

- Type: `string`
- Default: `Change language`

Can be used to customize the aria-label of the language toggle button in navbar. This is only used if you're using [i18n](../guide/i18n).

## externalLinkIcon

- Type: `boolean`
- Default: `false`

Whether to show an external link icon next to external links in markdown.
