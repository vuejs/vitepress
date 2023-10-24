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

## i18nRouting {#i18nrouting}

- key: `i18nRouting`
- Type: `boolean`

将本地语言更改为 `zh` 会将 URL 从 `/foo`（或 `/en/foo/`）更改为 `/zh/foo`。你可以通过将 `themeConfig.i18nRouting` 设置为 `false` 来禁用此行为。

## 图标 {#logo}

- key: `logo`
- Type: `ThemeableImage`

导航栏上显示的 Logo，位于网站标题右侧。可以接受一个路径字符串，或者一个对象来设置在浅色/深色模式下不同的 Logo。

```ts
export default {
	themeConfig: {
		logo: '/logo.svg',
	},
}
```

```ts
type ThemeableImage = string | { src: string; alt?: string } | { light: string; dark: string; alt?: string }
```

## 站点标题开关 {#sitetitle}

- key: `siteTitle`
- Type: `string | false`

你可以自定义此项以替换导航中的默认站点标题（应用配置中的 `title`）。当设置为 `false` 时，导航中的标题将被禁用。这在当你的 `logo` 已经包含网站标题文本时很有用。

```ts
export default {
	themeConfig: {
		siteTitle: 'Hello World',
	},
}
```

## 导航栏 {#nav}

- key: `nav`
- Type: `NavItem`

导航菜单项的配置。你可以在[默认主题: 导航栏](./default-theme-nav#navigation-links) 了解更多详情。

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
					{ text: 'Item C', link: '/item-3' },
				],
			},
		],
	},
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

## 侧边栏 {#sidebar}

- key: `sidebar`
- Type: `Sidebar`

侧边栏菜单项的配置。你可以在[默认主题: 侧边栏](./default-theme-sidebar) 了解更多详情。

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

## 大纲开关 {#aside}

- key: `aside`
- Type: `boolean`
- Default: `true`
- 每个页面可以通过 [frontmatter](./frontmatter-config#aside) 覆写

  将此值设置为 `false` 可禁用 aside(大纲) 容器。

## 大纲层级 {#outline}

- key: `outline`
- Type: `number | [number, number] | 'deep' | false`
- Default: `2`
- 每个页面可以通过 [frontmatter](./frontmatter-config#outline) 覆写

配置在大纲中显示的标题级别。你可以通过传递一个数字来指定一个特定的级别，或者你可以通过传递一个包含下限和上限的元组来提供一个级别范围。当传递等于 `[2, 6]` 的 `deep` 时，除 `h1` 外，所有标题级别都显示在轮廓中。设置 `false` 以隐藏轮廓。

## 大纲标题 {#outlinetitle}

- key: `outlineTitle`
- Type: `string`
- Default: `On this page`

可用于自定义右侧边栏的标题（在大纲链接的顶部）。这在用另一种语言编写文档时很有用。

```js
export default {
	themeConfig: {
		outlineTitle: 'In hac pagina',
	},
}
```

## 社交链接 {#sociallinks}

- Type: `SocialLink[]`

你可以定义此选项以在导航栏中展示带有图标的社交帐户链接。

```js
export default {
	themeConfig: {
		socialLinks: [
			{ icon: 'github', link: 'https://github.com/vuejs/vitepress' },
			{ icon: 'twitter', link: '...' },
			// You can also add custom icons by passing SVG as string:
			{
				icon: {
					svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Dribbble</title><path d="M12...6.38z"/></svg>',
				},
				link: '...',
			},
		],
	},
}
```

```ts
interface SocialLink {
	icon: SocialLinkIcon
	link: string
}

type SocialLinkIcon = 'discord' | 'facebook' | 'github' | 'instagram' | 'linkedin' | 'mastodon' | 'slack' | 'twitter' | 'youtube' | { svg: string }
```

## 页脚 {#footer}

- Type: `Footer`

页脚配置。你可以添加 message 和 copyright。由于设计原因，仅当页面不包含侧边栏时才会显示页脚。

```ts
export default {
	themeConfig: {
		footer: {
			message: 'Released under the MIT License.',
			copyright: 'Copyright © 2019-present Evan You',
		},
	},
}
```

```ts
export interface Footer {
	message?: string
	copyright?: string
}
```

## 编辑链接 {#editlink}

- Type: `EditLink`
- 每个页面可以通过 [frontmatter](./frontmatter-config#editlink) 覆写

编辑链接可让你显示链接以编辑 Git 管理服务（例如 GitHub 或 GitLab）上的页面。有关详细信息，请参阅 [默认主题：编辑链接](./default-theme-edit-link)。

```js
export default {
	themeConfig: {
		editLink: {
			pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
			text: 'Edit this page on GitHub',
		},
	},
}
```

```ts
export interface EditLink {
	pattern: string
	text?: string
}
```

## 最近更新时间文本 {#lastupdatedtext}

- Type: `string`
- Default: `Last updated`

显示最近更新时间之前的前缀文本。

```ts
export default {
	themeConfig: {
		lastUpdatedText: 'Updated Date',
	},
}
```

## algolia

- Type: `AlgoliaSearch`

支持使用 [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch) 搜索站点文档。在 [默认主题：搜索](./default-theme-search) 中了解更多信息。

```ts
export interface AlgoliaSearchOptions extends DocSearchProps {
	locales?: Record<string, Partial<DocSearchProps>>
}
```

在[这里](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts)查看完整配置。

## carbonAds {#carbon-ads}

- Type: `CarbonAdsOptions`

一个配置即可展示 [Carbon Ads](https://www.carbonads.net/)。

```ts
export default {
	themeConfig: {
		carbonAds: {
			code: 'your-carbon-code',
			placement: 'your-carbon-placement',
		},
	},
}
```

```ts
export interface CarbonAdsOptions {
	code: string
	placement: string
}
```

Learn more in [Default Theme: Carbon Ads](./default-theme-carbon-ads)

## 文档页脚 {#docFooter}

- Type: `DocFooter`

可用于自定义出现在上一篇和下一篇链接上方的文本。如果不是用英语编写文档，这很有帮助。

```js
export default {
	themeConfig: {
		docFooter: {
			prev: 'Pagina prior',
			next: 'Proxima pagina',
		},
	},
}
```

```ts
export interface DocFooter {
	prev?: string
	next?: string
}
```

## 暗模式开关标签 {#darkmodeswitchlabel}

- key: `darkModeSwitchLabel`
- Type: `string`
- Default: `Appearance`

可用于自定义深色模式开关标签。此标签仅显示在移动视图中。

## 侧边栏菜单标签 {#sidebarmenulabel}

- key: `sidebarMenuLabel`
- Type: `string`
- Default: `Menu`

可用于自定义侧边栏菜单标签。此标签仅显示在移动视图中。

## 返回顶部标签 {#returntotoplabel}

- key: `returnToTopLabel`
- Type: `string`
- Default: `Return to top`

可用于自定义返回顶部按钮的标签。此标签仅显示在移动视图中。

## 多语言菜单标签 {#langmenulabel}

- key: `langMenuLabel`
- Type: `string`
- Default: `Change language`

可用于自定义导航栏中语言切换按钮的 aria-label。这仅在你使用 [i18n](../guide/i18n) 时使用。
