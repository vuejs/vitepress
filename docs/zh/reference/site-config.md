---
outline: deep
---

# 站点配置 {#site-config}

站点配置可以定义站点的全局设置。应用配置选项适用于每个 VitePress 站点，无论它使用什么主题。例如根目录或站点的标题。

## 概览 {#overview}

### 配置解析 {#config-resolution}

配置文件总是从 `<root>/.vitepress/config.[ext]` 解析，其中 `<root>` 是 VitePress [项目根目录](../guide/routing#root-and-source-directory)，`[ext]` 是支持的文件扩展名之一。开箱即用地支持 TypeScript。支持的扩展名包括 `.js`、`.ts`、`.mjs` 和 `.mts`。

建议在配置文件中使用 ES 模块语法。配置文件应该默认导出一个对象：

```ts
export default {
  // 应用级配置选项
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',
  ...
}
```

:::details 异步的动态配置

如果需要动态生成配置，也可以默认导出一个函数，例如：

```ts
import { defineConfig } from 'vitepress'

export default async () => {
  const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

  return defineConfig({
    // 应用级配置选项
    lang: 'en-US',
    title: 'VitePress',
    description: 'Vite & Vue powered static site generator.',

    // 主题级配置选项
    themeConfig: {
      sidebar: [
        ...posts.map((post) => ({
          text: post.name,
          link: `/posts/${post.name}`
        }))
      ]
    }
  })
}
```

也可以在最外层使用 `await`。例如：

```ts
import { defineConfig } from 'vitepress'

const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

export default defineConfig({
  // 应用级配置选项
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',

  // 主题级别配置选项
  themeConfig: {
    sidebar: [
      ...posts.map((post) => ({
        text: post.name,
        link: `/posts/${post.name}`
      }))
    ]
  }
})
```

:::

### 配置智能提示 {#config-intellisense}

使用 `defineConfig` 辅助函数将为配置选项提供 TypeScript 支持的智能提示。假设 IDE 支持它，那么在 JavaScript 和 TypeScript 中都将触发智能提示。

```js
import { defineConfig } from 'vitepress'

export default defineConfig({
  // ...
})
```

### 主题类型提示 {#typed-theme-config}

默认情况下，`defineConfig` 辅助函数期望默认主题的主题配置数据类型为：

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    // 类型为 `DefaultTheme.Config`
  }
})
```

如果使用自定义主题并希望对主题配置进行类型检查，则需要改用 `defineConfigWithTheme`，并通过通用参数传递自定义主题的配置类型：

```ts
import { defineConfigWithTheme } from 'vitepress'
import type { ThemeConfig } from 'your-theme'

export default defineConfigWithTheme<ThemeConfig>({
  themeConfig: {
    // 类型为 `ThemeConfig`
  }
})
```

### Vite、Vue 和 Markdown 配置

- **Vite**

  可以使用 VitePress 配置中的 [vite](#vite) 选项配置底层 Vite 实例。无需创建单独的 Vite 配置文件。

- **Vue**

  VitePress 已经包含 Vite 的官方 Vue 插件 ([@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue))，所以我们可以配置 VitePress 中的 [vue](#vue) 选项。

- **Markdown**

  可以使用 VitePress 配置中的 [markdown](#markdown) 选项配置底层的 [Markdown-It](https://github.com/markdown-it/markdown-it) 实例。

## 站点元数据 {#site-metadata}

### title

- 类型：`string`
- 默认值： `VitePress`
- 每个页面可以通过 [frontmatter](./frontmatter-config#title) 覆盖

站点的标题。使用默认主题时，这将显示在导航栏中。

它还将用作所有单独页面标题的默认后缀，除非定义了 [`titleTemplate`](#titletemplate)。单个页面的最终标题将是其第一个 `<h1>` 标题的文本内容加上的全局 `title`。例如使用以下配置和页面内容：

```ts
export default {
  title: 'My Awesome Site'
}
```

```md
# Hello
```

页面标题就是 `Hello | My Awesome Site`.

### titleTemplate

- 类型：`string | boolean`
- 每个页面可以通过 [frontmatter](./frontmatter-config#titletemplate) 覆盖

允许自定义每个页面的标题后缀或整个标题。例如：

```ts
export default {
  title: 'My Awesome Site',
  titleTemplate: 'Custom Suffix'
}
```

```md
# Hello
```

页面标题就是 `Hello | Custom Suffix`.

要完全自定义标题的呈现方式，可以在 `titleTemplate` 中使用 `:title` 标识符：

```ts
export default {
  titleTemplate: ':title - Custom Suffix'
}
```

这里的 `:title` 将替换为从页面的第一个 `<h1>` 标题推断出的文本。上一个示例页面的标题将是 `Hello - Custom Suffix`。

该选项可以设置为 `false` 以禁用标题后缀。

### description

- 类型：`string`
- 默认值： `A VitePress site`
- 每个页面可以通过 [frontmatter](./frontmatter-config#description) 覆盖

站点的描述。这将呈现为页面 HTML 中的 `<meta>` 标签。

```ts
export default {
  description: 'A VitePress site'
}
```

### head

- 类型：`HeadConfig[]`
- 默认值： `[]`
- 可以通过 [frontmatter](./frontmatter-config#head) 为每个页面追加

要在页面 HTML 的 `<head>` 标签中呈现的其他元素。用户添加的标签在结束 `head` 标签之前呈现，在 VitePress 标签之后。

```ts
type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

#### 示例：添加一个图标 {#example-adding-a-favicon}

```ts
export default {
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]]
} // 将 favicon.ico 放在公共目录中，如果设置了 base，则使用 /base/favicon.ico

/* 渲染成:
  <link rel="icon" href="/favicon.ico">
*/
```

#### 示例：添加谷歌字体 {#example-adding-google-fonts}

```ts
export default {
  head: [
    [
      'link',
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' }
    ],
    [
      'link',
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
    ],
    [
      'link',
      { href: 'https://fonts.googleapis.com/css2?family=Roboto&display=swap', rel: 'stylesheet' }
    ]
  ]
}

/* 渲染成:
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
*/
```

#### 示例：添加一个 serviceWorker {#example-registering-a-service-worker}

```ts
export default {
  head: [
    [
      'script',
      { id: 'register-sw' },
      `;(() => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js')
        }
      })()`
    ]
  ]
}

/* 渲染成:
  <script id="register-sw">
    ;(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
      }
    })()
  </script>
*/
```

#### 示例：使用谷歌分析 {#example-using-google-analytics}

```ts
export default {
  head: [
    [
      'script',
      { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=TAG_ID' }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'TAG_ID');`
    ]
  ]
}

/* 渲染成:
  <script async src="https://www.googletagmanager.com/gtag/js?id=TAG_ID"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'TAG_ID');
  </script>
*/
```

### lang

- 类型：`string`
- 默认值： `en-US`

站点的 lang 属性。这将呈现为页面 HTML 中的 `<html lang="en-US">` 标签。

```ts
export default {
  lang: 'en-US'
}
```

### base

- 类型：`string`
- 默认值： `/`

站点将部署到的 base URL。如果计划在子路径例如 GitHub 页面下部署站点，则需要设置此项。如果计划将站点部署到 `https://foo.github.io/bar/`，那么应该将 `base` 设置为 `'/bar/'`。它应该始终以 `/` 开头和结尾。

base 会自动添加到其他选项中以 `/` 开头的所有 URL 前面，因此只需指定一次。

```ts
export default {
  base: '/base/'
}
```

## 路由 {#routing}

### cleanUrls

- 类型：`boolean`
- 默认值： `false`

当设置为 `true` 时，VitePress 将从 URL 中删除 `.html` 后缀。另请参阅[生成简洁的 URL](../guide/routing#generating-clean-url)。

::: warning 需要服务器支持
要启用此功能，可能需要在托管平台上进行额外配置。要使其正常工作，服务器必须能够在**不重定向的情况下**访问 `/foo` 时提供 `/foo.html`。
:::

### rewrites

- 类型：`Record<string, string>`

自定义目录 &lt;-&gt; URL 映射。详细信息请参阅[路由：路由重写](../guide/routing#route-rewrites)。

```ts
export default {
  rewrites: {
    'source/:page': 'destination/:page'
  }
}
```

## 构建 {#build}

### srcDir

- 类型：`string`
- 默认值： `.`

相对于项目根目录的 markdown 文件所在的文件夹。另请参阅[根目录和源目录](../guide/routing#root-and-source-directory)。

```ts
export default {
  srcDir: './src'
}
```

### srcExclude

- 类型：`string`
- 默认值： `undefined`

用于匹配应排除作为源内容输出的 markdown 文件，语法详见 [glob pattern](https://github.com/mrmlnc/fast-glob#pattern-syntax)。

```ts
export default {
  srcExclude: ['**/README.md', '**/TODO.md']
}
```

### outDir

- 类型：`string`
- 默认值： `./.vitepress/dist`

项目的构建输出位置，相对于[项目根目录](../guide/routing#root-and-source-directory)。

```ts
export default {
  outDir: '../public'
}
```

### assetsDir

- 类型：`string`
- 默认值： `assets`

指定放置生成的静态资源的目录。该路径应位于 [`outDir`](#outdir) 内，并相对于它进行解析。

```ts
export default {
  assetsDir: 'static'
}
```

### cacheDir

- 类型：`string`
- 默认值： `./.vitepress/cache`

缓存文件的目录，相对于[项目根目录](../guide/routing#root-and-source-directory)。另请参阅：[cacheDir](https://vitejs.dev/config/shared-options.html#cachedir)。

```ts
export default {
  cacheDir: './.vitepress/.vite'
}
```

### ignoreDeadLinks

- 类型：`boolean | 'localhostLinks' | (string | RegExp | ((link: string) => boolean))[]`
- 默认值： `false`

当设置为 `true` 时，VitePress 不会因为死链而导致构建失败。

当设置为 `'localhostLinks'` ，出现死链时构建将失败，但不会检查 `localhost` 链接。

```ts
export default {
  ignoreDeadLinks: true
}
```

它也可以是一组精确的 url 字符串、正则表达式模式或自定义过滤函数。

```ts
export default {
  ignoreDeadLinks: [
    // 忽略精确网址 "/playground"
    '/playground',
    // 忽略所有 localhost 链接
    /^https?:\/\/localhost/,
    // 忽略所有包含 "/repl/" 的链接
    /\/repl\//,
    // 自定义函数，忽略所有包含 "ignore "的链接
    (url) => {
      return url.toLowerCase().includes('ignore')
    }
  ]
}
```

### metaChunk <Badge type="warning" text="experimental" />

- 类型：`boolean`
- 默认值：`false`

当设置为 `true` 时，将页面元数据提取到单独的 JavaScript 块中，而不是内联在初始 HTML 中。这使每个页面的 HTML 负载更小，并使页面元数据可缓存，从而当站点中有很多页面时可以减少服务器带宽。

### mpa <Badge type="warning" text="experimental" />

- 类型：`boolean`
- 默认值： `false`

设置为 `true` 时，生产应用程序将在 [MPA 模式](../guide/mpa-mode)下构建。MPA 模式默认提供 零 JavaScript 支持，代价是禁用客户端导航，并且需要明确选择加入才能进行交互。

## 主题 {#theming}

### appearance

- 类型：`boolean | 'dark' | 'force-dark' | import('@vueuse/core').UseDarkOptions`
- 默认值： `true`

是否启用深色模式 (通过将 `.dark` 类添加到 `<html>` 元素)。

- 如果该选项设置为 `true`，则默认主题将由用户的首选配色方案决定。
- 如果该选项设置为 `dark`，则默认情况下主题将是深色的，除非用户手动切换它。
- 如果该选项设置为 `false`，用户将无法切换主题。

此选项注入一个内联脚本，使用 `vitepress-theme-appearance` key 从本地存储恢复用户设置。这确保在呈现页面之前应用 `.dark` 类以避免闪烁。

`appearance.initialValue` 只能是 `'dark' | undefined`。 不支持 Refs 或 getters。

### lastUpdated

- 类型：`boolean`
- 默认值： `false`

是否使用 Git 获取每个页面的最后更新时间戳。时间戳将包含在每个页面的页面数据中，可通过 [`useData`](./runtime-api#usedata) 访问。

使用默认主题时，启用此选项将显示每个页面的最后更新时间。可以通过 [`themeConfig.lastUpdatedText`](./default-theme-config#lastupdatedtext) 选项自定义文本。

## 自定义 {#customization}

### markdown

- 类型：`MarkdownOption`

配置 Markdown 解析器选项。VitePress 使用 [Markdown-it](https://github.com/markdown-it/markdown-it) 作为解析器，使用 [Shiki](https://github.com/shikijs/shiki) 来高亮不同语言语法。在此选项中，可以传递各种 Markdown 相关选项以满足你的需要。

```js
export default {
  markdown: {...}
}
```

查看[类型声明和 jsdocs](https://github.com/vuejs/vitepress/blob/main/src/node/markdown/markdown.ts) 以获得所有可配置的选项。

### vite

- 类型：`import('vite').UserConfig`

将原始 [Vite 配置](https://vitejs.dev/config/)传递给内部 Vite 开发服务器 / bundler。

```js
export default {
  vite: {
    // Vite 配置选项
  }
}
```

### vue

- 类型：`import('@vitejs/plugin-vue').Options`

将原始的 [@vitejs/plugin-vue 选项](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#options)传递给内部插件实例。

```js
export default {
  vue: {
    // @vitejs/plugin-vue 选项
  }
}
```

## 构建钩子 {#build-hooks}

VitePress 构建钩子允许向站点添加新功能和行为：

- Sitemap
- Search Indexing
- PWA
- Teleport

### buildEnd

- 类型：`(siteConfig: SiteConfig) => Awaitable<void>`

`buildEnd` 是一个构建 CLI 钩子，它将在构建 SSG 完成后但在 VitePress CLI 进程退出之前运行。

```ts
export default {
  async buildEnd(siteConfig) {
    // ...
  }
}
```

### postRender

- 类型：`(context: SSGContext) => Awaitable<SSGContext | void>`

 `postRender` 是一个构建钩子，在 SSG 渲染完成时调用。它将允许在 SSG 期间处理传递的内容。

```ts
export default {
  async postRender(context) {
    // ...
  }
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

- 类型：`(context: TransformContext) => Awaitable<HeadConfig[]>`

`transformHead` 是一个构建钩子，用于在生成每个页面之前转换 head。它将允许添加无法静态添加到 VitePress 配置中的 head entries。只需要返回额外的 entries，它们将自动与现有 entries 合并。

::: warning
不要改变 `context` 中的任何东西。
:::

```ts
export default {
  async transformHead(context) {
    // ...
  }
}
```

```ts
interface TransformContext {
  page: string // 例如 index.md (相对于 srcDir)
  assets: string[] // 所有非 js/css 资源均作为完全解析的公共 URL
  siteConfig: SiteConfig
  siteData: SiteData
  pageData: PageData
  title: string
  description: string
  head: HeadConfig[]
  content: string
}
```

请注意，仅在静态生成站点时才会调用此钩子。在开发期间不会调用它。如果需要在开发期间添加动态 head 条目，可以使用 [`transformPageData`](#transformpagedata) 钩子来替代：

```ts
export default {
  transformPageData(pageData) {
    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push([
      'meta',
      {
        name: 'og:title',
        content:
          pageData.frontmatter.layout === 'home'
            ? `VitePress`
            : `${pageData.title} | VitePress`
      }
    ])
  }
}
```

#### 示例：添加 canonical URL `<link>` {#example-adding-a-canonical-url-link}

```ts
export default {
  transformPageData(pageData) {
    const canonicalUrl = `https://example.com/${pageData.relativePath}`
      .replace(/index\.md$/, '')
      .replace(/\.md$/, '.html')

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push([
      'link',
      { rel: 'canonical', href: canonicalUrl }
    ])
  }
}
```

### transformHtml

- 类型：`(code: string, id: string, context: TransformContext) => Awaitable<string | void>`

`transformHtml` 是一个构建钩子，用于在保存到磁盘之前转换每个页面的内容。

::: warning
不要改变 `context` 中的任何东西。另外，修改 html 内容可能会导致运行时出现激活问题。
:::

```ts
export default {
  async transformHtml(code, id, context) {
    // ...
  }
}
```

### transformPageData

- 类型：`(pageData: PageData, context: TransformPageContext) => Awaitable<Partial<PageData> | { [key: string]: any } | void>`

`transformPageData` 是一个钩子，用于转换每个页面的 `pageData`。可以直接改变 `pageData` 或返回将合并到 `PageData` 中的更改值。

::: warning
不要改变 `context` 中的任何东西。请注意，这可能会影响开发服务器的性能，特别是当在钩子中有一些网络请求或大量计算 (例如生成图像) 时。可以通过判断 `process.env.NODE_ENV === 'production'` 匹配符合条件的情况。
:::

```ts
export default {
  async transformPageData(pageData, { siteConfig }) {
    pageData.contributors = await getPageContributors(pageData.relativePath)
  }

  // 或返回要合并的数据
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
