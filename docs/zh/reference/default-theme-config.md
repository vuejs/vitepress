# 默认主题配置 {#default-theme-config}

主题配置可以让你能够自定义主题。可以通过将 `themeConfig` 添加到配置文件来进行主题配置：

```ts
export default {
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',

  // 主题相关配置
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

将本地语言更改为 `zh` 会将 URL 从 `/foo`（或 `/en/foo/`）更改为 `/zh/foo`。可以通过将 `themeConfig.i18nRouting` 设置为 `false` 来禁用此行为。

## logo

- 类型：`ThemeableImage`

导航栏上显示的 Logo，位于站点标题前。可以接受一个路径字符串，或者一个对象来设置在浅色/深色模式下不同的 Logo。

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

可以自定义此项以替换导航中的默认站点标题 (应用配置中的 `title`)。当设置为 `false` 时，导航中的标题将被禁用。这在当 `logo` 已经包含站点标题文本时很有用。

```ts
export default {
  themeConfig: {
    siteTitle: 'Hello World'
  }
}
```

## nav

- 类型：`NavItem`

导航菜单项的配置。可以在[默认主题: 导航栏](./default-theme-nav#navigation-links) 了解更多详情。

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

- 类型：`Sidebar`

侧边栏菜单项的配置。可以在[默认主题: 侧边栏](./default-theme-sidebar)了解更多详情。

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
   * 侧边栏项的文本标签
   */
  text?: string

  /**
   * 侧边栏项的链接
   */
  link?: string

  /**
   * 侧边栏项的子项
   */
  items?: SidebarItem[]

  /**
   * 如果未指定，侧边栏组不可折叠
   *
   * 如果为 `true`，则侧边栏组可折叠并且默认折叠
   *
   * 如果为 `false`，则侧边栏组可折叠但默认展开
   */
  collapsed?: boolean
}
```

## aside

- 类型：`boolean | 'left'`
- 默认值：`true`
- 每个页面可以通过 [frontmatter](./frontmatter-config#aside) 覆盖

将此值设置为 `false` 可禁用 aside 容器。\
将此值设置为 `true` 将在页面右侧渲染。\
将此值设置为 `left` 将在页面左侧渲染。

如果想对所有页面禁用它，应该使用 `outline: false`。

## outline

- 类型：`Outline | Outline['level'] | false`
- 每个页面可以通过 [frontmatter](./frontmatter-config#outline) 覆盖层级

将此值设置为 `false` 可禁止渲染大纲容器。更多详情请参考该接口：

```ts
interface Outline {
  /**
   * outline 中要显示的标题级别。
   * 单个数字表示只显示该级别的标题。
   * 如果传递的是一个元组，第一个数字是最小级别，第二个数字是最大级别。
   * `'deep'` 与 `[2, 6]` 相同，将显示从 `<h2>` 到 `<h6>` 的所有标题。
   *
   * @default 2
   */
  level?: number | [number, number] | 'deep'

  /**
   * 显示在 outline 上的标题。
   *
   * @default 'On this page'
   */
  label?: string
}
```

## socialLinks

- 类型：`SocialLink[]`

可以定义此选项以在导航栏中展示带有图标的社交帐户链接。

```ts
export default {
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
      { icon: 'twitter', link: '...' },
      // 可以通过将 SVG 作为字符串传递来添加自定义图标：
      {
        icon: {
          svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Dribbble</title><path d="M12...6.38z"/></svg>'
        },
        link: '...',
        // 也可以为无障碍添加一个自定义标签 (可选但推荐):
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
}
```

## footer

- 类型：`Footer`
- 可以通过 [frontmatter](./frontmatter-config#footer) 进行覆盖。

页脚配置。可以添加 message 和 copyright。由于设计原因，仅当页面不包含侧边栏时才会显示页脚。

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
- 每个页面可以通过 [frontmatter](./frontmatter-config#editlink) 覆盖

编辑链接可让显示链接以编辑 Git 管理服务 (例如 GitHub 或 GitLab) 上的页面。有关详细信息，请参阅[默认主题：编辑链接](./default-theme-edit-link)。

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

支持使用 [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch) 搜索站点文档。在[默认主题：搜索](./default-theme-search) 中了解更多信息。

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

在 [Default Theme: Carbon Ads](./default-theme-carbon-ads) 中了解更多信息。

## docFooter

- 类型：`DocFooter`

可用于自定义出现在上一页和下一页链接上方的文本。如果不是用英语编写文档，这很有帮助。也可用于全局禁用上一页/下一页链接。如果想有选择地启用/禁用上一个/下一个链接，可以使用 [frontmatter](./default-theme-prev-next-links)。

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

用于自定义深色模式开关标签，该标签仅在移动端视图中显示。

## lightModeSwitchTitle

- 类型：`string`
- 默认值：`Switch to light theme`

用于自定义悬停时显示的浅色模式开关标题。

## darkModeSwitchTitle

- 类型：`string`
- 默认值：`Switch to dark theme`

用于自定义悬停时显示的深色模式开关标题。

## sidebarMenuLabel

- 类型：`string`
- 默认值：`Menu`

用于自定义侧边栏菜单标签，该标签仅在移动端视图中显示。

## returnToTopLabel

- 类型：`string`
- 默认值：`Return to top`

用于自定义返回顶部按钮的标签，该标签仅在移动端视图中显示。

## langMenuLabel

- 类型：`string`
- 默认值：`Change language`

用于自定义导航栏中语言切换按钮的 aria-label，仅当使用 [i18n](../guide/i18n) 时才使用此选项。

## externalLinkIcon

- 类型：`boolean`
- 默认值：`false`

是否在 markdown 中的外部链接旁显示外部链接图标。
