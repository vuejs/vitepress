---
outline: deep
---

# Site Config

Site config is where you can define the global settings of the site. App config options define settings that apply to every VitePress site, regardless of what theme it is using. For example, the base directory or the title of the site.

## Overview

### Config Resolution

The config file is always resolved from `<root>/.vitepress/config.[ext]`, where `<root>` is your VitePress [project root](../guide/routing#root-and-source-directory), and `[ext]` is one of the supported file extensions. TypeScript is supported out of the box. Supported extensions include `.js`, `.ts`, `.mjs`, and `.mts`.

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

:::details Dynamic (Async) Config

If you need to dynamically generate the config, you can also default export a function. For example:

```ts
import { defineConfig } from 'vitepress'

export default async () => {
  const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

  return defineConfig({
    // app level config options
    lang: 'en-US',
    title: 'VitePress',
    description: 'Vite & Vue powered static site generator.',

    // theme level config options
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

You can also use top-level `await`. For example:

```ts
import { defineConfig } from 'vitepress'

const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

export default defineConfig({
  // app level config options
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',

  // theme level config options
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
type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

#### Example: Adding a favicon

```ts
export default {
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]]
} // put favicon.ico in public directory, if base is set, use /base/favicon.ico

/* Would render:
  <link rel="icon" href="/favicon.ico">
*/
```

#### Example: Adding Google Fonts

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

/* Would render:
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
*/
```

#### Example: Registering a service worker

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

/* Would render:
  <script id="register-sw">
    ;(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
      }
    })()
  </script>
*/
```

#### Example: Using Google Analytics

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

/* Would render:
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

Defines custom directory &lt;-&gt; URL mappings. See [Routing: Route Rewrites](../guide/routing#route-rewrites) for more details.

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

- Type: `string[]`
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

### assetsDir

- Type: `string`
- Default: `assets`

Specify the directory to nest generated assets under. The path should be inside [`outDir`](#outdir) and is resolved relative to it.

```ts
export default {
  assetsDir: 'static'
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

It can also be an array of exact url string, regex patterns, or custom filter functions.

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

### metaChunk <Badge type="warning" text="experimental" />

- Type: `boolean`
- Default: `false`

When set to `true`, extract pages metadata to a separate JavaScript chunk instead of inlining it in the initial HTML. This makes each page's HTML payload smaller and makes the pages metadata cacheable, thus reducing server bandwidth when you have many pages in the site.

### mpa <Badge type="warning" text="experimental" />

- Type: `boolean`
- Default: `false`

When set to `true`, the production app will be built in [MPA Mode](../guide/mpa-mode). MPA mode ships 0kb JavaScript by default, at the cost of disabling client-side navigation and requires explicit opt-in for interactivity.

## Theming

### appearance

- Type: `boolean | 'dark' | 'force-dark' | 'force-auto' | import('@vueuse/core').UseDarkOptions`
- Default: `true`

Whether to enable dark mode (by adding the `.dark` class to the `<html>` element).

- If the option is set to `true`, the default theme will be determined by the user's preferred color scheme.
- If the option is set to `dark`, the theme will be dark by default, unless the user manually toggles it.
- If the option is set to `false`, users will not be able to toggle the theme.
- If the option is set to `'force-dark'`, the theme will always be dark and users will not be able to toggle it.
- If the option is set to `'force-auto'`, the theme will always be determined by the user's preferred color scheme and users will not be able to toggle it.

This option injects an inline script that restores users settings from local storage using the `vitepress-theme-appearance` key. This ensures the `.dark` class is applied before the page is rendered to avoid flickering.

`appearance.initialValue` can only be `'dark' | undefined`. Refs or getters are not supported.

### lastUpdated

- Type: `boolean`
- Default: `false`

Whether to get the last updated timestamp for each page using Git. The timestamp will be included in each page's page data, accessible via [`useData`](./runtime-api#usedata).

When using the default theme, enabling this option will display each page's last updated time. You can customize the text via [`themeConfig.lastUpdatedText`](./default-theme-config#lastupdatedtext) option.

## Customization

### markdown

- Type: `MarkdownOption`

Configure Markdown parser options. VitePress uses [Markdown-it](https://github.com/markdown-it/markdown-it) as the parser, and [Shiki](https://github.com/shikijs/shiki) to highlight language syntax. Inside this option, you may pass various Markdown related options to fit your needs.

```js
export default {
  markdown: {...}
}
```

Check the [type declaration and jsdocs](https://github.com/vuejs/vitepress/blob/main/src/node/markdown/markdown.ts) for all the options available.

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
Don't mutate anything inside the `context`.
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

Note that this hook is only called when generating the site statically. It is not called during dev. If you need to add dynamic head entries during dev, you can use the [`transformPageData`](#transformpagedata) hook instead:

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

#### Example: Adding a canonical URL `<link>`

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

- Type: `(code: string, id: string, context: TransformContext) => Awaitable<string | void>`

`transformHtml` is a build hook to transform the content of each page before saving to disk.

::: warning
Don't mutate anything inside the `context`. Also, modifying the html content may cause hydration problems in runtime.
:::

```ts
export default {
  async transformHtml(code, id, context) {
    // ...
  }
}
```

### transformPageData

- Type: `(pageData: PageData, context: TransformPageContext) => Awaitable<Partial<PageData> | { [key: string]: any } | void>`

`transformPageData` is a hook to transform the `pageData` of each page. You can directly mutate `pageData` or return changed values which will be merged into the page data.

::: warning
Don't mutate anything inside the `context` and be careful that this might impact the performance of dev server, especially if you have some network requests or heavy computations (like generating images) in the hook. You can check for `process.env.NODE_ENV === 'production'` for conditional logic.
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
