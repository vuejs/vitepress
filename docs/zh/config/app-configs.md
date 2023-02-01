# 应用全局配置 {#app-configs}

应用全局配置是定义站点的全局配置的地方。应用全局配置不仅限于主题配置，还有如“根目录”的配置，或站点的“标题”设置。

```ts
export default {
  // These are app level configs.
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',
  ...
}
```

## appearance

- 类型：`boolean | 'dark'`
- 默认值：`true`

这个配置项可以配置是否开启“黑暗”模式。

- 如果选项设置为 `true`，默认的主题将由用户的首选的颜色方案来决定。
- 如果选项设置为 `dark`，该主题将默认为深色，用户手动切换颜色才会发生改变。
- 如果选项设置为 `false`，用户将无法切换主题。

它还注入了内联脚本，通过 `vitepress-theme-appearance` 键从本地存储中读取用户设置，并恢复用户偏好的颜色模式。

```ts
export default {
  appearance: true
}
```

## base

- 类型：`string`
- 默认值：`/`

站点将被部署到的根 URL。如果你打算在一个子路径下部署你的站点，例如 GitHub 页面，你就需要进行配置。如果你计划将站点部署到 `https://foo.github.io/bar/`，那么你应该将 base 设置为 `'/bar/'`。它应该总是以斜线开始，以斜线结束。

base 会自动预置到其他选项中以/开头的所有 URL 中，所以你只需要指定一次。

```ts
export default {
  base: '/base/'
}
```

## description

- 类型：`string`
- 默认值：`A VitePress site`

站点的描述。在 HTML 页面中将被渲染成 `<meta>` 标签。

```ts
export default {
  description: 'A VitePress site'
}
```

## head

- 类型：`HeadConfig[]`
- 默认值：`[]`

在 HTML 页面的 `<head>` 标签中呈现的额外元素。用户添加的标签将在 `head` 标签结束前呈现，在 VitePress 标签之后。

```ts
export default {
  head: [
    [
      'link',
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
    ]
    // would render: <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  ]
}
```

```ts
type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

## ignoreDeadLinks

- 类型：`boolean | 'localhostLinks'`
- 默认值：`false`

当将其设置为 `true` 时，VitePress 不会因为死链接构建失败。若将其设置为 `localhostLinks`，`localhost` 链接不会构建失败，其他的死链接仍然会使构建失败。

```ts
export default {
  ignoreDeadLinks: true
}
```

## lang

- 类型：`string`
- 默认值：`en-US`

站点的语言属性。在 HTML 页面中将被渲染为 `<html lang="en-US">` 标签。

```ts
export default {
  lang: 'en-US'
}
```

## lastUpdated

- 类型：`boolean`
- 默认值：`false`

使用 git commit 来获取时间戳。该选项使默认主题显示页面的最后更新时间。你可以通过 [`themeConfig.lastUpdatedText`](theme-configs#lastupdatedtext) 选项来自定义文本。

```ts
export default {
  lastUpdated: true
}
```

## markdown

- 类型：`MarkdownOption`

配置 Markdown 解析器的选项。VitePress 使用 [Markdown-it](https://github.com/markdown-it/markdown-it) 作为解析器，并使用 [Shiki](https://shiki.matsu.io/) 来高亮语言的语法。在这个选项中，你可以通过各种与 Markdown 有关的选项来满足你的需要。

```js
export default {
  markdown: {
    theme: 'material-palenight',
    lineNumbers: true
  }
}
```

以下是你在这个对象中可以进行设置的所有选项：

```ts
interface MarkdownOptions extends MarkdownIt.Options {
  // Custom theme for syntax highlighting.
  // You can use an existing theme.
  // See: https://github.com/shikijs/shiki/blob/main/docs/themes.md#all-themes
  // Or add your own theme.
  // See: https://github.com/shikijs/shiki/blob/main/docs/themes.md#loading-theme
  theme?:
    | Shiki.IThemeRegistration
    | { light: Shiki.IThemeRegistration; dark: Shiki.IThemeRegistration }

  // Enable line numbers in code block.
  lineNumbers?: boolean

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

## outDir

- 类型：`string`
- 默认值：`./.vitepress/dist`

站点的构建输出位置，相对于项目根目录。(比如相对于 `docs` 目录，如果你运行的是 `vitepress build docs`)。

```ts
export default {
  outDir: '../public'
}
```

## cacheDir

- 类型：`string`
- 默认值：`./.vitepress/cache`

缓存文件的目录，相对于项目根目录。(比如相对于 `docs` 目录，如果你运行的是 `vitepress build docs`)。参见：[cacheDir](https://cn.vitejs.dev/config/shared-options.html#cachedir)。

```ts
export default {
  cacheDir: './.vitepress/.vite'
}
```

## srcDir

- 类型：`string`
- 默认值：`.`

存储 markdown 文件的位置，相对于项目根目录。

```ts
export default {
  srcDir: './src'
}
```

## title

- 类型：`string`
- 默认值：`VitePress`

站点的标题。这将显示在导航栏中。除非定义了 `titleTemplate`，否则也作为所有页面标题的后缀。

```ts
export default {
  title: 'VitePress'
}
```

## titleTemplate

- 类型：`string | boolean`

标题的后缀。例如，如果你将 `title` 设置为 `VitePress`，并将 `titleTemplate` 设置为 `My Site`，那么html 标题就变成 `VitePress | My Site`。

设置为 `false` 表示禁用该功能。如果该选项是 `undefined`，那么将使用 `title` 选项的值。

```ts
export default {
  title: 'VitePress',
  titleTemplate: 'Vite & Vue powered static site generator'
}
```

要配置 `|` 以外的标题分隔符，你可以省略 `title`，在 `titleTemplate` 中使用 `:title` 符号。

```ts
export default {
  titleTemplate: ':title - Vitepress'
}
```

## cleanUrls {#cleanurls}

- 类型：`boolean`
- 默认值：`false`

允许从 URL 中去除尾部的 `.html`，并可选择生成简洁的目录结构。

```ts
export default {
  cleanUrls: true
}
```

::: warning
启用此功能可能需要在你的托管平台上进行额外配置。为了使其正常工作，你的服务器必须**在不重定向的情况下**，请求 `/foo` 时提供 `/foo.html` 。
:::

## rewrites

- Type: `Record<string, string>`

定义自定义目录和 URL 的映射。有关详细信息，请参阅[路由：自定义映射](/guide/routing#customize-the-mappings)。

```ts
export default {
  rewrites: {
    'source/:page': 'destination/:page'
  }
}
```

## 构建钩子 {#build-hooks}

VitePress 构建钩子允许你向你的网站添加新的功能和行为：

- Sitemap
- Search Indexing
- PWA

### transformHead

- 类型：`(ctx: TransformContext) => Awaitable<HeadConfig[]>`

`transformHead` 是一个构建钩子，用于在生成每个页面之前转换 head。它将允许你添加不能静态添加到你的VitePress 配置中的 head 选项。你只需要返回额外的选项，它们将被自动合并到现有的选项中。

::: warning
不要改变 `ctx` 中的任何东西。
:::

```ts
export default {
  async transformHead(ctx) {
    // ...
  }
}
```

```ts
interface TransformContext {
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

- 类型：`(code: string, id: string, ctx: TransformContext) => Awaitable<string | void>`

`transformHtml` 是一个构建钩子，用于在保存到磁盘之前转换每个页面的内容。

::: warning
不要改变 `ctx` 中的任何东西。另外，修改 html 内容可能会在运行时引起激活问题。
:::

```ts
export default {
  async transformHtml(code, id, context) {
    // ...
  }
}
```

### transformPageData

- 类型：`(pageData: PageData) => Awaitable<Partial<PageData> | { [key: string]: any } | void>`

`transformPageData` 是一个用于转换每个页面的 `pageData` 的钩子。你可以直接改变 `pageData` 或者返回改变的值，这些值将被合并到 PageData 中。

```ts
export default {
  async transformPageData(pageData) {
    pageData.contributors = await getPageContributors(pageData.relativePath)
  }

  // or return data to be merged
  async transformPageData(pageData) {
    return {
      contributors: await getPageContributors(pageData.relativePath)
    }
  }
}
```

### buildEnd

- 类型：`(siteConfig: SiteConfig) => Awaitable<void>`

`buildEnd` 是一个构建 CLI 的钩子，它将在构建 (SSG) 完成后，VitePress CLI 进程退出前运行。

```ts
export default {
  async buildEnd(siteConfig) {
    // ...
  }
}
```
