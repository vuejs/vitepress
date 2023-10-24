# 默认主题配置 {#default-theme-config}

主题配置可让你自定义主题。 你可以通过将 `themeConfig` 添加到配置文件来定义主题配置：

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

## i18nRouting {#i18n-routing}

- key: `i18nRouting`
- Type: `boolean`

将本地语言更改为 `zh` 会将 URL 从 `/foo`（或 `/en/foo/`）更改为 `/zh/foo`。你可以通过将 `themeConfig.i18nRouting` 设置为 `false` 来禁用此行为。

## 图标 {#logo}

- key: `logo`
- Type: `ThemeableImage`

Logo file to display in nav bar, right before the site title. Accepts a path string, or an object to set a different logo for light/dark mode.

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

## 站点标题开关 {#site-title}

- key: `siteTitle`
- Type: `string | false`

你可以自定义此项以替换导航中的默认站点标题（应用配置中的 `title`）。 当设置为 `false` 时，导航中的标题将被禁用。 这在当你的 `logo` 已经包含网站标题文本时很有用。

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

导航菜单项的配置。 你可以在[默认主题: 导航栏](./default-theme-nav#navigation-links) 了解更多详情。

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

侧边栏菜单项的配置。 你可以在[默认主题: 侧边栏](./default-theme-sidebar) 了解更多详情。

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

## 大纲开关 {#aside}

- key: `aside`
- Type: `boolean | 'left'`
- Default: `true`
- 每个页面可以通过 [frontmatter](./frontmatter-config#aside) 覆写

将此值设置为 `false` 可禁用 aside(大纲) 容器。\
将此值设置为 `true` 将在页面右侧渲染。\
将此值设置为 `left` 将在页面左侧渲染。

如果您想对所有页面禁用它，您应该使用 `outline: false`。

### 大纲层级 {#outline}

- key: `outline`
- Type: `number | [number, number] | 'deep' | false`

将此值设置为 `false` 可禁止渲染大纲容器。更多详情请参考该接口：

```ts
interface Outline {
	/**
	 * 大纲中显示的标题级别。
	 * 单个数字表示仅显示该级别的标题。
	 * 如果传递一个元组，则第一个数字是最小级别，第二个数字是最大级别。
	 * `'deep'` 和`[2, 6]` 等效, 这意味着 `<h2>` 到 `<h6>` 都会展示。
	 *
	 * @default 2
	 */
	level?: number | [number, number] | 'deep'

	/**
	 * 要显示在大纲上的标题。
	 *
	 * @default 'On this page'
	 */
	label?: string
}
```

## 社交链接 {#social-links}

- key: `socialLinks`
- Type: `SocialLink[]`

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
					svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Dribbble</title><path d="M12...6.38z"/></svg>',
				},
				link: '...',
				// 你也可以自定义标签别名以实现无障碍访问（可选但推荐）：
				ariaLabel: 'cool link',
			},
		],
	},
}
```

```ts
interface SocialLink {
	icon: SocialLinkIcon
	link: string，
  ariaLabel?: string
}

type SocialLinkIcon = 'discord' | 'facebook' | 'github' | 'instagram' | 'linkedin' | 'mastodon' | 'slack' | 'twitter' | 'youtube' | { svg: string }
```

## 页脚 {#footer}

- key: `footer`
- Type: `Footer`
- 每个页面可以通过 [frontmatter](./frontmatter-config#footer) 覆写

页脚配置。 你可以添加 message 和 copyright。 由于设计原因，仅当页面不包含侧边栏时才会显示页脚。

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

## 编辑链接 {#edit-link}

- key: editLink
- Type: `EditLink`
- 每个页面可以通过 [frontmatter](./frontmatter-config#editlink) 覆写

编辑链接可让你显示链接以编辑 Git 管理服务（例如 GitHub 或 GitLab）上的页面。 有关详细信息，请参阅 [默认主题：编辑链接](./default-theme-edit-link)。

```ts
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

## 最近更新 {#last-updated}

- key: `lastUpdated`
- Type: `LastUpdatedOptions`

允许自定义上次更新的文本和日期格式。

```ts
export default {
	themeConfig: {
		lastUpdated: {
			text: 'Updated at',
			formatOptions: {
				dateStyle: 'full',
				timeStyle: 'medium',
			},
		},
	},
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
	// calendar?: string | undefined;
	// dayPeriod?: "narrow" | "short" | "long" | undefined;
	// numberingSystem?: string | undefined;
	// dateStyle?: "full" | "long" | "medium" | "short" | undefined;
	// timeStyle?: "full" | "long" | "medium" | "short" | undefined;
	// hourCycle?: "h11" | "h12" | "h23" | "h24" | undefined;
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

## 翻页文案 {#doc-footer}

- Type: `DocFooter`

可用于自定义出现在上一篇和下一篇链接上方的文本。 如果不是用英语编写文档，这很有帮助。也可用于全局禁用上一个/下一个链接。如果您想选择性地启用/禁用上一个/下一个链接，可以使用 [frontmatter](./default-theme-prev-next-links)。

```ts
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
	prev?: string | false
	next?: string | false
}
```

## 暗模式开关标签 {#dark-mode-switch-label}

- key: `darkModeSwitchLabel`
- Type: `string`
- Default: `Appearance`

可用于自定义深色模式开关标签。此标签仅显示在移动视图中。

## 侧边栏菜单标签 {#sidebar-menu-label}

- key: `sidebarMenuLabel`
- Type: `string`
- Default: `Menu`

可用于自定义侧边栏菜单标签。此标签仅显示在移动视图中。

## 返回顶部标签 {#return-to-top-label}

- key: `returnToTopLabel`
- Type: `string`
- Default: `Return to top`

可用于自定义返回顶部按钮的标签。此标签仅显示在移动视图中。

## 多语言菜单标签 {#langmenu-label}

- key: `langMenuLabel`
- Type: `string`
- Default: `Change language`

可用于自定义导航栏中语言切换按钮的 aria-label。这仅在你使用 [i18n](../guide/i18n) 时使用。

## 外部链接图标 {#external-link-icon}

- key: `externalLinkIcon`
- Type: `boolean`
- Default: `false`

是否在 Markdown 中的外部链接旁边显示外部链接图标。
