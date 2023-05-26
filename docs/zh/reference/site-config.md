---
outline: deep
---

# 站点配置 {#site-config}

Site config 可以定义站点的全局设置。App config 配置选项适用于每个 VitePress 站点，无论它使用什么主题。例如 base 目录或网站的标题。

## 概览 {#overview}

### 配置解析 {#config-resolution}

配置文件总是从 `<root>/.vitepress/config.[ext]` 解析，其中 `<root>` 是你的 VitePress [项目根目录](../guide/routing#root-and-source-directory)，`[ext]` 是支持的文件扩展名之一。开箱即用地支持 TypeScript。支持的扩展名包括 `.js`、`.ts`、`.cjs`、`.mjs`、`.cts` 和 `.mts`。

建议在配置文件中使用 ES 模块语法。配置文件应该默认导出一个对象：

```ts
export default {
  // app level config options
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',
  ...
}
```

### 配置智能提示 {#config-intellisense}

使用 `defineConfig` 辅助函数将为配置选项提供 TypeScript 支持的智能提示。假设你的 IDE 支持它，那么智能提示在 JavaScript 和 TypeScript 中都将触发。

```js
import { defineConfig } from 'vitepress'

export default defineConfig({
	// ...
})
```

### 主题类型提示 {#typed-theme-config}

默认情况下，`defineConfig` 辅助函数期望默认主题的主题配置数据类型：

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
	themeConfig: {
		// Type is `DefaultTheme.Config`
	},
})
```

如果你使用自定义主题并希望对主题配置进行类型检查，则需要改用 `defineConfigWithTheme`，并通过通用参数传递自定义主题的配置类型：

```ts
import { defineConfigWithTheme } from 'vitepress'
import type { ThemeConfig } from 'your-theme'

export default defineConfigWithTheme<ThemeConfig>({
	themeConfig: {
		// Type is `ThemeConfig`
	},
})
```

### Vite, Vue & Markdown Config

- **Vite**

  你可以使用 VitePress 配置中的 [vite](#vite) 选项配置底层 Vite 实例。无需创建单独的 Vite 配置文件。

- **Vue**

  VitePress 已经包含 Vite 的官方 Vue 插件（[@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue)）。你可以配置 VitePress 中的 [vue](#vue) 选项。

- **Markdown**

  你可以使用 VitePress 配置中的 [markdown](#markdown) 选项配置底层的 [Markdown-It](https://github.com/markdown-it/markdown-it) 实例。

## 站点元数据 {#site-metadata}

### 标题 {#title}

- key `title`
- Type: `string`
- Default: `VitePress`
- 每个页面可以通过 [frontmatter](./frontmatter-config#title) 覆写

网站的标题。使用默认主题时，这将显示在导航栏中。

它还将用作所有单独页面标题的默认后缀，除非定义了 [`titleTemplate`](#titletemplate)。单个页面的最终标题将是其第一个 `<h1>` 标题的文本内容加上的全局 `title`。例如使用以下配置和页面内容：

```ts
export default {
	title: 'My Awesome Site',
}
```

```md
# Hello
```

页面标题就是 `Hello | My Awesome Site`.

### 标题模板 {#titletemplate}

- key: `titleTemplate`
- Type: `string | boolean`
- 每个页面可以通过 [frontmatter](./frontmatter-config#titletemplate) 覆写

允许自定义每个页面的标题后缀或整个标题。例如：

```ts
export default {
	title: 'My Awesome Site',
	titleTemplate: 'Custom Suffix',
}
```

```md
# Hello
```

页面标题就是 `Hello | Custom Suffix`.

要完全自定义标题的呈现方式，你可以在 `titleTemplate` 中使用 `:title` 标识符：

```ts
export default {
	titleTemplate: ':title - Custom Suffix',
}
```

这里的 `:title` 将替换为从页面的第一个 `<h1>` 标题推断出的文本。上一个示例页面的标题将是 `Hello - Custom Suffix`。

该选项可以设置为 `false` 以禁用标题后缀。

### 描述 {#description}

- key: `description`
- Type: `string`
- Default: `A VitePress site`
- 每个页面可以通过 [frontmatter](./frontmatter-config#description) 覆写

网站的描述。这将呈现为页面 HTML 中的 `<meta>` 标签。

```ts
export default {
	description: 'A VitePress site',
}
```

### head

- key: `head`
- Type: `HeadConfig[]`
- Default: `[]`
- 每个页面可以通过 [frontmatter](./frontmatter-config#head) 添加

::: details 要在页面 HTML 的 `<head>` 标记中呈现的其他元素。用户添加的标签在结束 `head` 标签之前呈现，在 VitePress 标签之后。
:::

```ts
export default {
	head: [
		[
			'link',
			{ rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
			// would render:
			//
			// <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
		],

		[
			'script',
			{ id: 'register-sw' },
			`;(() => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js')
        }
      })()`,
			// would render:
			//
			// <script id="register-sw">
			// ;(() => {
			//   if ('serviceWorker' in navigator) {
			//     navigator.serviceWorker.register('/sw.js')
			//   }
			// })()
			// </script>
		],
	],
}
```

```ts
type HeadConfig = [string, Record<string, string>] | [string, Record<string, string>, string]
```

### 语言 {#lang}

- key: `lang`
- Type: `string`
- Default: `en-US`

站点的 lang 属性。这将呈现为页面 HTML 中的 `<html lang="en-US">` 标签。

```ts
export default {
	lang: 'en-US',
}
```

### base

- key: `base`
- Type: `string`
- Default: `/`

站点将部署到的 base URL。如果你计划在子路径（例如 GitHub 页面）下部署站点，则需要设置此项。如果你计划将你的站点部署到 `https://foo.github.io/bar/`，那么你应该将 `base` 设置为 `“/bar/”`。它应该始终以 `/`开头和结尾。

base 会自动添加到其他选项中以 `/` 开头的所有 URL 前面，因此你只需指定一次。

```ts
export default {
	base: '/base/',
}
```

## 路由 {#routing}

### 简洁 URL {#cleanurls}

- key: `cleanUrls`
- Type: `boolean`
- Default: `false`

当设置为 `true` 时，VitePress 将从 URL 中删除 `.html` 后缀。另请参阅[生成简洁的 URL](../guide/routing#generating-clean-url)。

::: warning 需要服务器支持
要启用此功能，可能需要在你的托管平台上进行额外配置。要使其正常工作，你的服务器必须能够在**不重定向的情况下**访问 `/foo` 时提供 `/foo.html`。
:::

### 路由重写 {#rewrites}

- key: `rewrites`
- Type: `Record<string, string>`

自定义目录 <-> URL 映射。详细信息请参阅[路由：路由重写](../guide/routing#route-rewrites)。

```ts
export default {
	rewrites: {
		'source/:page': 'destination/:page',
	},
}
```

## Build

### srcDir

- key: `srcDir`
- Type: `string`
- Default: `.`

markdown 页面的目录，相对于项目根目录。另请参阅[根目录和源目录](../guide/routing#root-and-source-directory)。

```ts
export default {
	srcDir: './src',
}
```

### srcExclude

- key: `srcExclude`
- Type: `string`
- Default: `undefined`

::: details 用于匹配应作为源内容输出的 markdown 文件的 [全局模式](https://github.com/mrmlnc/fast-glob#pattern-syntax)。
A [glob pattern](https://github.com/mrmlnc/fast-glob#pattern-syntax) for matching markdown files that should be excluded as source content.
:::

```ts
export default {
	srcExclude: ['**/README.md', '**/TODO.md'],
}
```

### outDir

- key: `outDir`
- Type: `string`
- Default: `./.vitepress/dist`

项目的构建输出位置，相对于[项目根目录](../guide/routing#root-and-source-directory)。

```ts
export default {
	outDir: '../public',
}
```

### cacheDir

- key: `cacheDir`
- Type: `string`
- Default: `./.vitepress/cache`

缓存文件的目录，相对于[项目根目录](../guide/routing#root-and-source-directory)。另请参阅：[vite: cacheDir](https://cn.vitejs.dev/config/shared-options)。

```ts
export default {
	cacheDir: './.vitepress/.vite',
}
```

### 忽略死链 {#ignoredeadlinks}

- key: `ignoreDeadLinks`
- Type: `boolean | 'localhostLinks' | (string | RegExp | ((link: string) => boolean))[]`
- Default: `false`

当设置为 `true` 时，VitePress 不会因为死链而导致构建失败。

当设置为 `'localhostLinks'` ，出现死链时构建将失败，但不会检查 `localhost` 链接。

```ts
export default {
	ignoreDeadLinks: true,
}
```

它也可以是一组精确的 url 字符串、正则表达式模式或自定义过滤函数。

```ts
export default {
	ignoreDeadLinks: [
		// ignore exact url "/playground"
		'/playground',
		// ignore all localhost links
		/^https?:\/\/localhost/,
		// ignore all links include "/repl/""
		/\/repl\//,
		// custom function, ignore all links include "ignore"
		(url) => {
			return url.toLowerCase().includes('ignore')
		},
	],
}
```

### 多页应用 <Badge type="warning" text="experimental" /> {#mpa}

- key: `mpa`
- Type: `boolean`
- Default: `false`

::: details 设置为 `true` 时，生产应用程序将在 [MPA 模式](../guide/mpa-mode)下构建。MPA 模式默认提供 零 JavaScript 支持，代价是禁用客户端导航，并且需要明确选择加入才能进行交互。
When set to `true`, the production app will be built in [MPA Mode](../guide/mpa-mode). MPA mode ships 0kb JavaScript by default, at the cost of disabling client-side navigation and requires explicit opt-in for interactivity.
:::

## 主题 {#theming}

### 外观 {#appearance}

- key: `appearance`
- Type: `boolean | 'dark'`
- Default: `true`

是否启用深色模式（通过将 `.dark` 类添加到 `<html>` 元素）。

- 如果该选项设置为 `true`，则默认主题将由用户的首选配色方案决定。
- 如果该选项设置为 `dark`，则默认情况下主题将是深色的，除非用户手动切换它。
- 如果该选项设置为 `false`，用户将无法切换主题。

此选项注入一个内联脚本，使用 `vitepress-theme-appearance` key 从本地存储恢复用户设置。这确保在呈现页面之前应用 `.dark` 类以避免闪烁。

### 最近更新时间 {#lastupdated}

- key: `lastUpdated`
- Type: `boolean`
- Default: `false`

是否使用 Git 获取每个页面的最后更新时间戳。时间戳将包含在每个页面的页面数据中，可通过 [`useData`](./runtime-api#usedata) 访问。

使用默认主题时，启用此选项将显示每个页面的最后更新时间。你可以通过 [`themeConfig.lastUpdatedText`](./default-theme-config#lastupdatedtext) 选项自定义文本。

## 定制 {#customization}

### markdown

- key: `markdown`
- Type: `MarkdownOption`

配置 Markdown 解析器选项。 VitePress 使用 [Markdown-it](https://github.com/markdown-it/markdown-it) 作为解析器，使用 [Shiki](https://shiki.matsu.io/) 来高亮不同语言语法。在此选项中，你可以传递各种 Markdown 相关选项以满足你的需要。

```js
export default {
	markdown: {
		theme: 'material-theme-palenight',
		lineNumbers: true,

		// adjust how header anchors are generated,
		// useful for integrating with tools that use different conventions
		anchor: {
			slugify(str) {
				return encodeURIComponent(str)
			},
		},
	},
}
```

以下是你可以在此对象中可配置的所有选项：

```ts
interface MarkdownOptions extends MarkdownIt.Options {
	// Custom theme for syntax highlighting.
	// You can use an existing theme.
	// See: https://github.com/shikijs/shiki/blob/main/docs/themes.md#all-themes
	// Or add your own theme.
	// See: https://github.com/shikijs/shiki/blob/main/docs/themes.md#loading-theme
	theme?: Shiki.IThemeRegistration | { light: Shiki.IThemeRegistration; dark: Shiki.IThemeRegistration }

	// Enable line numbers in code block.
	lineNumbers?: boolean

	// Add support for your own languages.
	// https://github.com/shikijs/shiki/blob/main/docs/languages.md#supporting-your-own-languages-with-shiki
	languages?: Shiki.ILanguageRegistration

	// markdown-it-anchor plugin options.
	// See: https://github.com/valeriangalliat/markdown-it-anchor#usage
	anchor?: anchorPlugin.AnchorOptions

	// markdown-it-attrs plugin options.
	// See: https://github.com/arve0/markdown-it-attrs
	attrs?: {
		leftDelimiter?: string
		rightDelimiter?: string
		allowedAttributes?: string[]
		disable?: boolean
	}

	// specify default language for syntax highlighter
	defaultHighlightLang?: string

	// @mdit-vue/plugin-frontmatter plugin options.
	// See: https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-frontmatter#options
	frontmatter?: FrontmatterPluginOptions

	// @mdit-vue/plugin-headers plugin options.
	// See: https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-headers#options
	headers?: HeadersPluginOptions

	// @mdit-vue/plugin-sfc plugin options.
	// See: https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-sfc#options
	sfc?: SfcPluginOptions

	// @mdit-vue/plugin-toc plugin options.
	// See: https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-toc#options
	toc?: TocPluginOptions

	// Configure the Markdown-it instance.
	config?: (md: MarkdownIt) => void
}
```

### vite

- key: `vite`
- Type: `import('vite').UserConfig`

将原始 [Vite 配置](https://vitejs.dev/config/)传递给内部 Vite 开发服务器 / bundler。

```js
export default {
	vite: {
		// Vite config options
	},
}
```

### vue

- key: `vue`
- Type: `import('@vitejs/plugin-vue').Options`

将原始的 [@vitejs/plugin-vue 选项](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#options)传递给内部插件实例。

```js
export default {
	vue: {
		// @vitejs/plugin-vue options
	},
}
```

## 构建钩子 {#build-hooks}

VitePress build hooks allow you to add new functionality and behaviors to your website:
VitePress 构建钩子允许你向你的网站添加新功能和行为：

- Sitemap 网站地图
- Search Indexing 搜索索引
- PWA 渐进式网页应用
- Teleports 传送门

### buildEnd

- key: `buildEnd`
- Type: `(siteConfig: SiteConfig) => Awaitable<void>`

`buildEnd` 是一个构建 CLI 钩子，它将在构建（SSG）完成后但在 VitePress CLI 进程退出之前运行。

```ts
export default {
	async buildEnd(siteConfig) {
		// ...
	},
}
```

### postRender

- key: `postRender`
- Type: `(context: SSGContext) => Awaitable<SSGContext | void>`

::: details `postRender` 是一个构建钩子，在 SSG 渲染完成时调用。它将允许你在 SSG(静态站点生成) 期间处理传递的内容。
`postRender` is a build hook, called when SSG rendering is done. It will allow you to handle the teleports content during SSG.
:::

```ts
export default {
	async postRender(context) {
		// ...
	},
}
```

```ts
interface SSGContext {
	content: string
	teleports?: Record<string, string>
	[key: string]: any
}
```

### transformHead

- key: `transformHead`
- Type: `(context: TransformContext) => Awaitable<HeadConfig[]>`

`transformHead` 是一个构建钩子，用于在生成每个页面之前转换 head。它将允许你添加无法静态添加到你的 VitePress 配置中的 head entries。你只需要返回额外的 entries，它们将自动与现有 entries 合并。

::: warning 警告
不要改变 `ctx` 中的任何东西。
:::

```ts
export default {
	async transformHead(context) {
		// ...
	},
}
```

```ts
interface TransformContext {
	page: string // e.g. index.md (relative to srcDir)
	assets: string[] // all non-js/css assets as fully resolved public URL
	siteConfig: SiteConfig
	siteData: SiteData
	pageData: PageData
	title: string
	description: string
	head: HeadConfig[]
	content: string
}
```

### transformHtml

- key: `transformHtml`
- Type: `(code: string, id: string, ctx: TransformContext) => Awaitable<string | void>`

`transformHtml` 是一个构建钩子，用于在保存到磁盘之前转换每个页面的内容。

::: warning 警告
不要改变 `ctx` 中的任何东西。另外，修改 html 内容可能会导致运行时出现 hydration 问题。
:::

```ts
export default {
	async transformHtml(code, id, context) {
		// ...
	},
}
```

### transformPageData

- key: `transformPageData`
- Type: `(pageData: PageData, ctx: TransformPageContext) => Awaitable<Partial<PageData> | { [key: string]: any } | void>`

`transformPageData` 是一个钩子，用于转换每个页面的 `pageData`。你可以直接改变 `pageData` 或返回将合并到 `PageData` 中的更改值。

::: warning 警告
不要改变 `ctx` 中的任何东西。
:::

```ts
export default {
  async transformPageData(pageData, { siteConfig }) {
    pageData.contributors = await getPageContributors(pageData.relativePath)
  }

  // or return data to be merged
  async transformPageData(pageData, { siteConfig }) {
    return {
      contributors: await getPageContributors(pageData.relativePath)
    }
  }
}
```

```ts
interface TransformPageContext {
	siteConfig: SiteConfig
}
```
