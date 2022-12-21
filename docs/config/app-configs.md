# App Configs

App configs are where you can define the global settings of the site. App configs define fundamental settings that are not only limited to the theme configs such as configuration for "base directory", or the "title" of the site.

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

- Type: `boolean | 'dark'`
- Default: `true`

Whether to enable dark mode or not.

- If the option is set to `true`, the default theme will be determined by the user's preferred color scheme.
- If the option is set to `dark`, the theme will be dark by default, unless the user manually toggles it.
- If the option is set to `false`, users will not be able to toggle the theme.

It also injects inline script that tries to read users settings from local storage by `vitepress-theme-appearance` key and restores users preferred color mode.

```ts
export default {
  appearance: true
}
```

## base

- Type: `string`
- Default: `/`

The base URL the site will be deployed at. You will need to set this if you plan to deploy your site under a sub path, for example, GitHub pages. If you plan to deploy your site to `https://foo.github.io/bar/`, then you should set base to `'/bar/'`. It should always start and end with a slash.

The base is automatically prepended to all the URLs that start with / in other options, so you only need to specify it once.

```ts
export default {
  base: '/base/'
}
```

## description

- Type: `string`
- Default: `A VitePress site`

Description for the site. This will render as a `<meta>` tag in the page HTML.

```ts
export default {
  description: 'A VitePress site'
}
```

## head

- Type: `HeadConfig[]`
- Default: `[]`

Additional elements to render in the `<head>` tag in the page HTML. The user-added tags are rendered before the closing `head` tag, after VitePress tags.

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

- Type: `boolean`
- Default: `false`

When set to `true`, VitePress will not fail builds due to dead links.

```ts
export default {
  ignoreDeadLinks: true
}
```

## lang

- Type: `string`
- Default: `en-US`

The lang attribute for the site. This will render as a `<html lang="en-US">` tag in the page HTML.

```ts
export default {
  lang: 'en-US'
}
```

## lastUpdated

- Type: `boolean`
- Default: `false`

Use git commit to get the timestamp. This option enables the default theme to display the page's last updated time. You can customize the text via [`themeConfig.lastUpdatedText`](theme-configs#lastupdatedtext) option.

```ts
export default {
  lastUpdated: true
}
```

## markdown

- Type: `MarkdownOption`

Configure Markdown parser options. VitePress uses [Markdown-it](https://github.com/markdown-it/markdown-it) as the parser, and [Shiki](https://shiki.matsu.io/) to highlight language syntax. Inside this option, you may pass various Markdown related options to fit your needs.

```js
export default {
  markdown: {
    theme: 'material-palenight',
    lineNumbers: true
  }
}
```

Below are all the options that you can have in this object:

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

- Type: `string`
- Default: `./.vitepress/dist`

The build output location for the site, relative to project root (`docs` folder if you're running `vitepress build docs`).

```ts
export default {
  outDir: '../public'
}
```

## cacheDir

- Type: `string`
- Default: `./.vitepress/cache`

The directory for cache files, relative to project root (`docs` folder if you're running `vitepress build docs`). See also: [cacheDir](https://vitejs.dev/config/shared-options.html#cachedir).

```ts
export default {
  cacheDir: './.vitepress/.vite'
}
```

## srcDir

- Type: `string`
- Default: `.`

The directory where your markdown pages are stored, relative to project root.

```ts
export default {
  srcDir: './src'
}
```

## title

- Type: `string`
- Default: `VitePress`

Title for the site. This will be displayed in the nav bar. Also used as the suffix for all page titles unless `titleTemplate` is defined.

```ts
export default {
  title: 'VitePress'
}
```

## titleTemplate

- Type: `string | boolean`

The suffix for the title. For example, if you set `title` as `VitePress` and set `titleTemplate` as `My Site`, the html title becomes `VitePress | My Site`.

Set `false` to disable the feature. If the option is `undefined`, then the value of `title` option will be used.

```ts
export default {
  title: 'VitePress',
  titleTemplate: 'Vite & Vue powered static site generator'
}
```

## cleanUrls (Experimental)

- Type: `'disabled' | 'without-subfolders' | 'with-subfolders'`
- Default: `'disabled'`

Allows removing trailing `.html` from URLs and, optionally, generating clean directory structure. Available modes:

|          Mode          |   Page    |  Generated Page   |     URL     |
| :--------------------: | :-------: | :---------------: | :---------: |
|      `'disabled'`      | `/foo.md` |    `/foo.html`    | `/foo.html` |
| `'without-subfolders'` | `/foo.md` |    `/foo.html`    |   `/foo`    |
|  `'with-subfolders'`   | `/foo.md` | `/foo/index.html` |   `/foo`    |

::: warning

Enabling this may require additional configuration on your hosting platform. For it to work, your server must serve the generated page on requesting the URL (see above table) **without a redirect**.

:::

```ts
export default {
  cleanUrls: 'with-subfolders'
}
```

## Build Hooks

VitePress build hooks allow you to add new functionality and behaviors to your website:

- Sitemap
- Search Indexing
- PWA

### transformHead

- Type: `(ctx: TransformContext) => Awaitable<HeadConfig[]>`

`transformHead` is a build hook to transform the head before generating each page. It will allow you to add head entries that cannot be statically added to your VitePress config. You only need to return extra entries, they will be merged automatically with the existing ones.

::: warning
Don't mutate anything inside the `ctx`.
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

- Type: `(code: string, id: string, ctx: TransformContext) => Awaitable<string | void>`

`transformHtml` is a build hook to transform the content of each page before saving to disk.

::: warning
Don't mutate anything inside the `ctx`. Also, modifying the html content may cause hydration problems in runtime.
:::

```ts
export default {
  async transformHtml(code, id, context) {
    // ...
  }
}
```

### transformPageData

- Type: `(pageData: PageData) => Awaitable<Partial<PageData> | { [key: string]: any } | void>`

`transformPageData` is a hook to transform the `pageData` of each page. You can directly mutate `pageData` or return changed values which will be merged into PageData.

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

- Type: `(siteConfig: SiteConfig) => Awaitable<void>`

`buildEnd` is a build CLI hook, it will run after build (SSG) finish but before VitePress CLI process exits.

```ts
export default {
  async buildEnd(siteConfig) {
    // ...
  }
}
```
