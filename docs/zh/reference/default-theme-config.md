# 默认主题配置 {#default-theme-config}

主题配置可让你自定义主题。你可以通过将 `themeConfig` 添加到配置文件来定义主题配置：

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

**此页面上记录的选项仅适用于默认主题**。不同的主题需要不同的主题配置。使用自定义主题时，主题配置对象将传递给主题，以便主题可以基于它作出不同表现。

## i18nRouting

- 类型：`boolean`

将本地语言更改为 `zh` 会将 URL 从 `/foo`（或 `/en/foo/`）更改为 `/zh/foo`。你可以通过将 `themeConfig.i18nRouting` 设置为 `false` 来禁用此行为。

## logo

- 类型：`ThemeableImage`

导航栏上显示的 Logo，位于网站标题右侧。可以接受一个路径字符串，或者一个对象来设置在浅色/深色模式下不同的 Logo。

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

- 类型：`string | false`

你可以自定义此项以替换导航中的默认站点标题（应用配置中的 `title`）。当设置为 `false` 时，导航中的标题将被禁用。这在当你的 `logo` 已经包含网站标题文本时很有用。

```ts
export default {
  themeConfig: {
    siteTitle: 'Hello World'
  }
}
```

## nav

- 类型：`NavItem`

导航菜单项的配置。你可以在[默认主题: 导航栏](./default-theme-nav#navigation-links) 了解更多详情。

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

- 类型：`Sidebar`

侧边栏菜单项的配置。你可以在[默认主题: 侧边栏](./default-theme-sidebar) 了解更多详情。

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

- 类型：`boolean | 'left'`
- 默认值：`true`
- 每个页面可以通过 [frontmatter](./frontmatter-config#aside) 覆写

将此值设置为 `false` 可禁用 aside(大纲) 容器。\
将此值设置为 `true` 将在页面右侧渲染。\
将此值设置为 `left` 将在页面左侧渲染。

如果你想对所有页面禁用它，你应该使用 `outline: false`。

## outline

- 类型：`Outline | Outline['level'] | false`
- 每个页面可以通过 [frontmatter](./frontmatter-config#outline) 覆写层级

将此值设置为 `false` 可禁止渲染大纲容器。更多详情请参考该接口：

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

- 类型：`SocialLink[]`

你可以定义此选项以在导航栏中展示带有图标的社交帐户链接。

```ts
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

- 类型：`Footer`
- 可以通过 [frontmatter](./frontmatter-config#footer) 进行覆盖。

页脚配置。你可以添加 message 和 copyright。由于设计原因，仅当页面不包含侧边栏时才会显示页脚。

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

- 类型：`EditLink`
- 每个页面可以通过 [frontmatter](./frontmatter-config#editlink) 覆写

编辑链接可让你显示链接以编辑 Git 管理服务（例如 GitHub 或 GitLab）上的页面。有关详细信息，请参阅 [默认主题：编辑链接](./default-theme-edit-link)。

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

- 类型：`LastUpdatedOptions`

允许自定义上次更新的文本和日期格式。

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

- 类型：`AlgoliaSearch`

支持使用 [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch) 搜索站点文档。在 [默认主题：搜索](./default-theme-search) 中了解更多信息。

```ts
export interface AlgoliaSearchOptions extends DocSearchProps {
  locales?: Record<string, Partial<DocSearchProps>>
}
```

在[这里](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts)查看完整配置。

## carbonAds {#carbon-ads}

- 类型：`CarbonAdsOptions`

一个配置即可展示 [Carbon Ads](https://www.carbonads.net/)。

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

- 类型：`DocFooter`

可用于自定义出现在上一页和下一页链接上方的文本。如果不是用英语编写文档，这很有帮助。也可用于全局禁用上一页/下一页链接。如果你想有选择地启用/禁用上一个/下一个链接，可以使用 [frontmatter](./default-theme-prev-next-links)。

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

- 类型：`string`
- 默认值：`Appearance`

Can be used to customize the dark mode switch label. This label is only displayed in the mobile view.

## lightModeSwitchTitle

- 类型：`string`
- 默认值：`Switch to light theme`

Can be used to customize the light mode switch title that appears on hovering.

## darkModeSwitchTitle

- 类型：`string`
- 默认值：`Switch to dark theme`

Can be used to customize the dark mode switch title that appears on hovering.

## sidebarMenuLabel

- 类型：`string`
- 默认值：`Menu`

Can be used to customize the sidebar menu label. This label is only displayed in the mobile view.

## returnToTopLabel

- 类型：`string`
- 默认值：`Return to top`

Can be used to customize the label of the return to top button. This label is only displayed in the mobile view.

## langMenuLabel

- 类型：`string`
- 默认值：`Change language`

Can be used to customize the aria-label of the language toggle button in navbar. This is only used if you're using [i18n](../guide/i18n).

## externalLinkIcon

- 类型：`boolean`
- 默认值：`false`

Whether to show an external link icon next to external links in markdown.
