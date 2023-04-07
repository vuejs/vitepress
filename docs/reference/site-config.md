---
outline: deep
---

# Site Config

Site config is where you can define the global settings of the site. App config options define settings that apply to every VitePress site, regardless of what theme it is using. For example, the base directory or the title of the site.

## Overview

### Config Resolution

The config file is always resolved from `<root>/.vitepress/config.[ext]`, where `<root>` is your VitePress [project root](../guide/routing#root-and-source-directory), and `[ext]` is one of the supported file extensions. TypeScript is supported out of the box. Supported extensions include `.js`, `.ts`, `.cjs`, `.mjs`, `.cts`, and `.mts`.

It is recommended to use ES modules syntax in config files. The config file should default export an object:

```ts
export default {
  // app level config options
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',
  ...
}
```

### Config Intellisense

Using the `defineConfig` helper will provide TypeScript-powered intellisense for config options. Assuming your IDE supports it, this should work in both JavaScript and TypeScript.

```js
import { defineConfig } from 'vitepress'

export default defineConfig({
  // ...
})
```

### Typed Theme Config

By default, `defineConfig` helper expects the theme config type from default theme:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    // Type is `DefaultTheme.Config`
  }
})
```

If you use a custom theme and want type checks for the theme config, you'll need to use `defineConfigWithTheme` instead, and pass the config type for your custom theme via a generic argument:

```ts
import { defineConfigWithTheme } from 'vitepress'
import type { ThemeConfig } from 'your-theme'

export default defineConfigWithTheme<ThemeConfig>({
  themeConfig: {
    // Type is `ThemeConfig`
  }
})
```

### Vite, Vue & Markdown Config

- **Vite**

    You can configure the underlying Vite instance using the [vite](#vite) option in your VitePress config. No need to create a separate Vite config file.

- **Vue**

    VitePress already includes the official Vue plugin for Vite ([@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue)). You can configure its options using the [vue](#vue) option in your VitePress config.

- **Markdown**

    You can configure the underlying [Markdown-It](https://github.com/markdown-it/markdown-it) instance using the [markdown](#markdown) option in your VitePress config.

## Site Metadata

### title

- Type: `string`
- Default: `VitePress`
- Can be overridden per page via [frontmatter](./frontmatter-config#title)

Title for the site. When using the default theme, this will be displayed in the nav bar.

It will also be used as the default suffix for all individual page titles, unless [`titleTemplate`](#titletemplate) is defined. An individual page's final title will be the text content of its first `<h1>` header, combined with the global `title` as the suffix. For example with the following config and page content:

```ts
export default {
  title: 'My Awesome Site'
}
```
```md
# Hello
```

The title of the page will be `Hello | My Awesome Site`.

### titleTemplate

- Type: `string | boolean`
- Can be overridden per page via [frontmatter](./frontmatter-config#titletemplate)

Allows customizing each page's title suffix or the entire title. For example:

```ts
export default {
  title: 'My Awesome Site',
  titleTemplate: 'Custom Suffix'
}
```
```md
# Hello
```

The title of the page will be `Hello | Custom Suffix`.

To completely customize how the title should be rendered, you can use the `:title` symbol in `titleTemplate`:

```ts
export default {
  titleTemplate: ':title - Custom Suffix'
}
```

Here `:title` will be replaced with the text inferred from the page's first `<h1>` header. The title of the previous example page will be `Hello - Custom Suffix`.

The option can be set to `false` to disable title suffixes.

### description

- Type: `string`
- Default: `A VitePress site`
- Can be overridden per page via [frontmatter](./frontmatter-config#description)

Description for the site. This will render as a `<meta>` tag in the page HTML.

```ts
export default {
  description: 'A VitePress site'
}
```

### head

- Type: `HeadConfig[]`
- Default: `[]`
- Can be appended per page via [frontmatter](./frontmatter-config#head)

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

### lang

- Type: `string`
- Default: `en-US`

The lang attribute for the site. This will render as a `<html lang="en-US">` tag in the page HTML.

```ts
export default {
  lang: 'en-US'
}
```

### base

- Type: `string`
- Default: `/`

The base URL the site will be deployed at. You will need to set this if you plan to deploy your site under a sub path, for example, GitHub pages. If you plan to deploy your site to `https://foo.github.io/bar/`, then you should set base to `'/bar/'`. It should always start and end with a slash.

The base is automatically prepended to all the URLs that start with / in other options, so you only need to specify it once.

```ts
export default {
  base: '/base/'
}
```

## Routing

### cleanUrls

- Type: `boolean`
- Default: `false`

When set to `true`, VitePress will remove the trailing `.html` from URLs. Also see [Generating Clean URL](../guide/routing#generating-clean-url).

::: warning Server Support Required
Enabling this may require additional configuration on your hosting platform. For it to work, your server must be able to serve `/foo.html` when visiting `/foo` **without a redirect**.
:::

### rewrites

- Type: `Record<string, string>`

Defines custom directory <-> URL mappings. See [Routing: Route Rewrites](../guide/routing#route-rewrites) for more details.

```ts
export default {
  rewrites: {
    'source/:page': 'destination/:page'
  }
}
```

## Build

### srcDir

- Type: `string`
- Default: `.`

The directory where your markdown pages are stored, relative to project root. Also see [Root and Source Directory](../guide/routing#root-and-source-directory).

```ts
export default {
  srcDir: './src'
}
```

### srcExclude

- Type: `string`
- Default: `undefined`

A [glob pattern](https://github.com/mrmlnc/fast-glob#pattern-syntax) for matching markdown files that should be excluded as source content.

```ts
export default {
  srcExclude: ['**/README.md', '**/TODO.md']
}
```

### outDir

- Type: `string`
- Default: `./.vitepress/dist`

The build output location for the site, relative to [project root](../guide/routing#root-and-source-directory).

```ts
export default {
  outDir: '../public'
}
```

### cacheDir

- Type: `string`
- Default: `./.vitepress/cache`

The directory for cache files, relative to [project root](../guide/routing#root-and-source-directory). See also: [cacheDir](https://vitejs.dev/config/shared-options.html#cachedir).

```ts
export default {
  cacheDir: './.vitepress/.vite'
}
```

### ignoreDeadLinks

- Type: `boolean | 'localhostLinks' | (string | RegExp | ((link: string) => boolean))[]`
- Default: `false`

When set to `true`, VitePress will not fail builds due to dead links.

When set to `'localhostLinks'`, the build will fail on dead links, but won't check `localhost` links.

```ts
export default {
  ignoreDeadLinks: true
}
```

It can also be an array of extact url string, regex patterns, or custom filter functions. 

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
    }
  ]
}
```

### mpa <Badge type="warning" text="experimental" />

- Type: `boolean`
- Default: `false`

When set to `true`, the production app will be built in [MAP Mode](../guide/mpa-mode). MPA mode ships 0kb JavaScript by default, at the cost of disabling client-side navigation and requires explicit opt-in for interactivity.

## Theming

### appearance

- Type: `boolean | 'dark'`
- Default: `true`

Whether to enable dark mode (by adding the `.dark` class to the `<html>` element).

- If the option is set to `true`, the default theme will be determined by the user's preferred color scheme.
- If the option is set to `dark`, the theme will be dark by default, unless the user manually toggles it.
- If the option is set to `false`, users will not be able to toggle the theme.

This option injects an inline script that restores users settings from local storage using the `vitepress-theme-appearance` key. This ensures the `.dark` class is applied before the page is rendered to avoid flickering.

### lastUpdated

- Type: `boolean`
- Default: `false`

Whether to get the last updated timestamp for each page using Git. The timestamp will be included in each page's page data, accessible via [`useData`](./runtime-api#usedata).

When using the default theme, enabling this option will display each page's last updated time. You can customize the text via [`themeConfig.lastUpdatedText`](./default-theme-config#lastupdatedtext) option.

## Customization

### markdown

- Type: `MarkdownOption`

Configure Markdown parser options. VitePress uses [Markdown-it](https://github.com/markdown-it/markdown-it) as the parser, and [Shiki](https://shiki.matsu.io/) to highlight language syntax. Inside this option, you may pass various Markdown related options to fit your needs.

```js
export default {
  markdown: {
    theme: 'material-theme-palenight',
    lineNumbers: true,

    // adjust how header anchors are generated,
    // useful for integrating with tools that use different conventions
    anchors: {
      slugify(str) {
        return encodeURIComponent(str)
      }
    }
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

- Type: `import('vite').UserConfig`

Pass raw [Vite Config](https://vitejs.dev/config/) to internal Vite dev server / bundler.

```js
export default {
  vite: {
    // Vite config options
  }
}
```

### vue

- Type: `import('@vitejs/plugin-vue').Options`

Pass raw [`@vitejs/plugin-vue` options](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#options) to the internal plugin instance.

```js
export default {
  vue: {
    // @vitejs/plugin-vue options
  }
}
```

## Build Hooks

VitePress build hooks allow you to add new functionality and behaviors to your website:

- Sitemap
- Search Indexing
- PWA
- Teleports

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

### postRender

- Type: `(context: SSGContext) => Awaitable<SSGContext | void>`

`postRender` is a build hook, called when SSG rendering is done. It will allow you to handle the teleports content during SSG.

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

- Type: `(context: TransformContext) => Awaitable<HeadConfig[]>`

`transformHead` is a build hook to transform the head before generating each page. It will allow you to add head entries that cannot be statically added to your VitePress config. You only need to return extra entries, they will be merged automatically with the existing ones.

::: warning
Don't mutate anything inside the `ctx`.
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

- Type: `(pageData: PageData, ctx: TransformPageContext) => Awaitable<Partial<PageData> | { [key: string]: any } | void>`

`transformPageData` is a hook to transform the `pageData` of each page. You can directly mutate `pageData` or return changed values which will be merged into PageData.

::: warning
Don't mutate anything inside the `ctx`. 
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
