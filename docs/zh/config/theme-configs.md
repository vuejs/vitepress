# 主题配置 {#theme-configs}

主题配置可让你自定义主题。你可以通过将 `themeConfig` 键添加到配置文件来定义主题配置。

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

这里描述了 VitePress 默认主题的设置。如果你使用的是其他人创建的自定义主题，这些设置可能没有任何效果，或者可能表现不同。

## i18nRouting

- 类型：`boolean`

改变语言环境意味着，`zh` 将 URL 从 `/foo` (or `/en/foo/`) 变成 `/zh/foo`。将 `themeConfig.i18nRouting` 设置为 `false` 可以禁用这一特性。

## logo

- 类型：`ThemeableImage`

显示在导航栏中的 logo 文件，位于站点标题之前。接受路径字符串或包含明亮或黑暗模式不同 logo 的对象。

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

你可以自定义此项以替换导航中的默认站点标题 (应用配置中的 `title`)。当设置为 `false` 时，导航中的标题将被禁用。这在当你的 `logo` 已经包含网站标题文本时很有用。

```ts
export default {
  themeConfig: {
    siteTitle: 'Hello World'
  }
}
```

## nav

- 类型：`NavItem`

导航菜单项的配置。你可以在[主题: 导航栏](../guide/theme-nav#navigation-links)中了解更多详情。

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

type NavItemWithLink = {
  text: string
  link: string
  activeMatch?: string
}

interface NavItemWithChildren {
  text?: string
  items: NavItemWithLink[]
  activeMatch?: string
}
```

## sidebar

- 类型：`Sidebar`

侧边栏菜单项的配置。你可以在[主题: 侧边栏](../guide/theme-sidebar)了解更多详情。

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
type Sidebar = SidebarGroup[] | SidebarMulti

interface SidebarMulti {
  [path: string]: SidebarGroup[]
}

interface SidebarGroup {
  text: string
  items: SidebarItem[]
  collapsible?: boolean
  collapsed?: boolean
}

interface SidebarItem {
  text: string
  link: string
}
```

## outline

- 类型：`number | [number, number] | 'deep' | false`
- 默认值：`2`

纲要中显示的标题的级别。你可以通过传递一个数字来指定一个特定的级别，也可以通过传递一个包含底限和上限的元组来提供一个级别范围。当传递等于 `[2, 6]` 的 `'deep'` 时，除了 `h1` 之外，所有的标题级别都显示在大纲中。可以设置 `false` 来隐藏轮廓。

## outlineTitle

- 类型：`string`
- 默认值：`On this page`

可用于自定义右侧边栏的标题 (在大纲链接的顶部)。这在用另一种语言编写文档时很有用。

```js
export default {
  themeConfig: {
    outlineTitle: 'In hac pagina'
  }
}
```

## socialLinks

- 类型：`SocialLink[]`

你可以定义此选项以在导航中展示带有图标的社交帐户链接。

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
        link: '...'
      }
    ]
  }
}
```

```ts
interface SocialLink {
  icon: SocialLinkIcon
  link: string
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

页脚配置。你可以添加一些消息和版权内容。出于设计考虑，仅当页面不包含侧边栏时才会显示页脚。

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

编辑链接可让你显示链接以编辑 Git 管理服务 (例如 GitHub 或 GitLab上的页面)。有关详细信息，请参见[主题：编辑链接](../guide/theme-edit-link)。

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

- 类型：`string`
- 默认值：`Last updated`

显示“上次更新时间”之前的前缀文本。

```ts
export default {
  themeConfig: {
    lastUpdatedText: 'Updated Date'
  }
}
```

## carbonAds

- 类型：`CarbonAds`

显示 [Carbon Ads](https://www.carbonads.net/) 的选项。

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
export interface CarbonAds {
  code: string
  placement: string
}
```

有关详细信息，请参见 [Theme: Carbon Ads](../guide/theme-carbon-ads)

## docFooter

- 类型：`DocFooter`

可用于自定义出现在上一个和下一个链接上方的文本。如果不是用英语编写文档，这很有帮助。

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
  prev?: string
  next?: string
}
```
