---
outline: deep
description: Vollständige Referenz der VitePress-Website-Konfigurationsoptionen einschließlich Einstellungen auf Anwendungsebene, Theme-Konfiguration und Build-Optionen.
---

# Website-Konfiguration

In der Website-Konfiguration definierst du die globalen Einstellungen der Website. Konfigurationsoptionen auf Anwendungsebene gelten für jede VitePress-Website, unabhängig vom verwendeten Theme. Zum Beispiel das Basisverzeichnis oder den Titel der Website.

## Übersicht

### Auflösung der Konfiguration

Die Konfigurationsdatei wird immer aus `<root>/.vitepress/config.[ext]`, wobei `<root>` dein VitePress-[Projektstammverzeichnis](../guide/routing#root-and-source-directory) ist und `[ext]` eine der unterstützten Dateierweiterungen bezeichnet. TypeScript wird standardmäßig unterstützt. Unterstützte Erweiterungen sind `.js`, `.ts`, `.mjs` und `.mts`.

Es wird empfohlen, in Konfigurationsdateien die ES-Modul-Syntax zu verwenden. Die Konfigurationsdatei sollte standardmäßig ein Objekt exportieren:

```ts
export default {
  // app level config options
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',
  ...
}
```

::: details Dynamische (asynchrone) Konfiguration

Wenn du die Konfiguration dynamisch erzeugen musst, kannst du auch standardmäßig eine Funktion exportieren. Zum Beispiel:

```ts
import { defineConfig } from 'vitepress'

export default async () => {
  const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

  return defineConfig({
    // app level config options
    lang: 'en-US',
    title: 'VitePress',
    description: 'Vite & Vue powered static site generator.',

    // Konfigurationsoptionen auf Theme-Ebene
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

Du kannst auch `await` auf oberster Ebene verwenden. Zum Beispiel:

```ts
import { defineConfig } from 'vitepress'

const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

export default defineConfig({
  // app level config options
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',

  // Konfigurationsoptionen auf Theme-Ebene
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

### Konfigurations-IntelliSense

Die Verwendung des Helpers `defineConfig` stellt TypeScript-basierte IntelliSense für Konfigurationsoptionen bereit. Sofern deine IDE dies unterstützt, sollte dies sowohl in JavaScript als auch in TypeScript funktionieren.

```js
import { defineConfig } from 'vitepress'

export default defineConfig({
  // ...
})
```

### Typisierte Theme-Konfiguration

Standardmäßig erwartet der Helper `defineConfig` den Theme-Konfigurationstyp des Standard-Themes:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    // Typ ist `DefaultTheme.Config`
  }
})
```

Wenn du ein eigenes Theme verwendest und Typprüfungen für dessen Theme-Konfiguration möchtest, musst du stattdessen `defineConfigWithTheme` verwenden und den Konfigurationstyp deines eigenen Themes als generisches Argument übergeben:

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

  Du kannst die zugrunde liegende Vite-Instanz über die Option [vite](#vite) in deiner VitePress-Konfiguration konfigurieren. Eine separate Vite-Konfigurationsdatei ist nicht erforderlich.

- **Vue**

  VitePress enthält bereits das offizielle Vue-Plugin für Vite ([@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue)). Du kannst dessen Optionen über die Option [vue](#vue) in deiner VitePress-Konfiguration konfigurieren.

- **Markdown**

  Du kannst die zugrunde liegende [Markdown-It](https://github.com/markdown-it/markdown-it)-Instanz über die Option [markdown](#markdown) in deiner VitePress-Konfiguration konfigurieren.

### Überschreibungen auf Seitenebene

Einige Einstellungen können für bestimmte Seiten über das Frontmatter überschrieben werden.

Weitere Informationen findest du unter [Frontmatter-Konfiguration](./frontmatter-config).

### Überschreibungen auf Verzeichnisebene

Einige Konfigurationseinstellungen können auf Verzeichnisebene überschrieben werden, sodass alle Seiten in diesem Verzeichnis dieselben Einstellungen verwenden können, ohne sie im Frontmatter jeder Seite wiederholen zu müssen.

Dies wird erreicht, indem im entsprechenden Verzeichnis eine Datei namens `config.ts` (oder `.js`, `.mjs` bzw. `.mts`) angelegt wird. Diese Datei sollte wie die Hauptkonfigurationsdatei ein Konfigurationsobjekt über `export default` exportieren.

Verschachtelte Verzeichnisse übernehmen die Einstellungen ihres übergeordneten Verzeichnisses; Überschreibungen werden entsprechend zusammengeführt.

Der Helper `defineAdditionalConfig` kann verwendet werden, um TypeScript-basierte IntelliSense für die verfügbaren Optionen zu erhalten. Wie bei `defineConfig` ist seine Verwendung optional.

Bei einer Website mit mehreren Sprachen möchten wir beispielsweise für jede Sprache eine andere `description` verwenden. Dazu können wir `es/config.ts` mit folgendem Inhalt anlegen:

```ts
import { defineAdditionalConfig } from 'vitepress'

export default defineAdditionalConfig({
  description: 'Generador de Sitios Estáticos desarrollado con Vite y Vue.'
})
```

Diese `description` wird anschließend für alle Seiten im Verzeichnis `es` verwendet.

Alternativ können die Einstellungen eines Sprachverzeichnisses bei Verwendung der integrierten i18n-Funktionen über die `locales`-Einstellung in der Hauptkonfigurationsdatei überschrieben werden. Weitere Informationen findest du unter [Internationalisierung](../guide/i18n).

## Website-Metadaten

### title

- Type: `string`
- Default: `VitePress`
- Kann pro Seite über das [Frontmatter](./frontmatter-config#title) oder auf [Verzeichnisebene](#directory-level-overrides) überschrieben werden

Titel der Website. Bei Verwendung des Standard-Themes wird er in der Navigationsleiste angezeigt.

Er wird außerdem als Standardsuffix für alle einzelnen Seitentitel verwendet, sofern [`titleTemplate`](#titletemplate) nicht definiert ist. Der endgültige Titel einer einzelnen Seite besteht aus dem Text ihrer ersten `<h1>`-Überschrift und dem globalen `title` als Suffix. Zum Beispiel bei folgender Konfiguration und folgendem Seiteninhalt:

```ts
export default {
  title: 'My Awesome Site'
}
```

```md
# Hello
```

Der Titel der Seite lautet `Hello | My Awesome Site`.

### titleTemplate

- Type: `string | boolean`
- Kann pro Seite über das [Frontmatter](./frontmatter-config#titletemplate) oder auf [Verzeichnisebene](#directory-level-overrides) überschrieben werden

Ermöglicht die Anpassung des Titelsuffixes jeder Seite oder des gesamten Titels. Zum Beispiel:

```ts
export default {
  title: 'My Awesome Site',
  titleTemplate: 'Custom Suffix'
}
```

```md
# Hello
```

Der Titel der Seite lautet `Hello | Eigenes Suffix`.

Um die Darstellung des Titels vollständig anzupassen, kannst du das Symbol `:title` in `titleTemplate` verwenden:

```ts
export default {
  titleTemplate: ':title - Custom Suffix'
}
```

Hier wird `:title` durch den aus der ersten `<h1>`-Überschrift der Seite ermittelten Text ersetzt. Der Titel der vorherigen Beispielseite lautet `Hello - Eigenes Suffix`.

Die Option kann auf `false` gesetzt werden, um Titelsuffixe zu deaktivieren.

### description

- Type: `string`
- Standard: `Eine VitePress-Website`
- Can be overridden per page via [frontmatter](./frontmatter-config#description) or at the [directory level](#directory-level-overrides)

Beschreibung der Website. Sie wird als `<meta>`-Tag im HTML der Seite ausgegeben.

```ts
export default {
  description: 'A VitePress site'
}
```

### head

- Type: `HeadConfig[]`
- Default: `[]`
- Can be appended per page via [frontmatter](./frontmatter-config#head) or at the [directory level](#directory-level-overrides)

Zusätzliche Elemente, die im `<head>`-Tag des Seiten-HTML gerendert werden. Vom Benutzer hinzugefügte Tags werden nach den VitePress-Tags und vor dem schließenden `head`-Tag gerendert.

```ts
type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

Head entries from the site config, [locale config](../guide/i18n), [directory-level config](#directory-level-overrides), [frontmatter](./frontmatter-config#head) and [`transformHead`](#transformhead) are merged in that order. A later entry replaces an earlier one with the same key instead of being appended:

- Any element with an `id` attribute is keyed by its `id`.
- A `meta` element without an `id` is keyed by its first attribute other than `content` (e.g. `name`, `property`, `http-equiv`) and that attribute's value.

Other elements are never deduplicated. To render multiple `meta` tags that would share a key, like several `<meta name="author">`, give each of them a unique `id`.

#### Beispiel: Adding a favicon

```ts
export default {
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]]
} // put favicon.ico in public directory, if base is set, use /base/favicon.ico

/* Would render:
  <link rel="icon" href="/favicon.ico">
*/
```

#### Beispiel: Adding Google Fonts

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

#### Beispiel: Registering a service worker

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

#### Beispiel: Using Google Analytics

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
- Can be overridden at the [directory level](#directory-level-overrides)

The lang attribute for the site. This will render as a `<html lang="en-US">` tag in the page HTML.

```ts
export default {
  lang: 'en-US'
}
```

### dir

- Type: `'ltr' | 'rtl' | 'auto'`
- Default: `ltr`
- Can be overridden at the [directory level](#directory-level-overrides)

The text direction of the site. This will render as a `<html dir="rtl">` tag in the page HTML, and the default theme mirrors its layout for right-to-left languages. It can also be overridden per page via [frontmatter](./frontmatter-config#dir). See [RTL Support](../guide/i18n#rtl-support).

```ts
export default {
  dir: 'rtl'
}
```

### base

- Type: `string`
- Default: `/`

The base URL the site will be deployed at. You will need to set this if you plan to deploy your site under a sub path, for example, GitHub pages. Wenn du plan to deploy your site to `https://foo.github.io/bar/`, then you should set base to `'/bar/'`. It should always start and end with a slash.

The one exception is `'./'`, which produces a [relocatable build](../guide/deploy#relocatable-builds-relative-base): pages reference everything relative to their own location, so the same output works from any sub path (IPFS gateways, archives) without rebuilding and stays browsable when opened directly from the file system.

The base is automatisch prepended to all the URLs that start with / in other options, so you only need to specify it once.

```ts
export default {
  base: '/base/'
}
```

Can also be set per build with `vitepress build --base /base/`.

## Routing

### cleanUrls

- Type: `boolean`
- Default: `false`

When set to `true`, VitePress will remove the trailing `.html` from URLs. Also see [Generating Clean URLs](../guide/routing#generating-clean-urls).

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

The directory where your markdown pages are stored, relative to project root. Also see [Root and Quelle Verzeichnis](../guide/routing#root-and-source-directory).

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

### assetsBase

- Type: `string`
- Default: `undefined`

URL prefix the generated assets (everything under [`assetsDir`](#assetsdir)) are served from — typically a CDN. Must be an absolute URL, a protocol-relative URL, or a root-absolute path; a trailing slash is appended if missing.

```ts
export default {
  base: '/',
  assetsBase: 'https://cdn.example.com/'
  // scripts, styles, fonts and imported images resolve to
  // https://cdn.example.com/assets/*
}
```

The emitted asset URL is `assetsBase` joined with the output-relative file path, so the CDN should mirror the layout of `outDir` (upload `outDir/assets` so it is reachable at `<assetsBase>/assets/*`). HTML pages, Markdown links, [`public`](../guide/asset-handling#the-public-directory) files and `hashmap.json` stay on [`base`](#base).

When `assetsBase` points at another origin, VitePress adds `crossorigin` to the emitted script and preload tags — the CDN must send `Access-Control-Allow-Origin` for your site's origin (module scripts are always fetched in CORS mode).

Only production builds are affected. `vitepress preview` serves a root-absolute `assetsBase` (like `/cdn/`) from the local dist; an external one is requested from the real URL. Can also be set per build with `vitepress build --assetsBase https://cdn.example.com/`.

### assetsShards

- Type: `number`
- Default: `undefined`

Spreads the generated assets over this many subdirectories of [`assetsDir`](#assetsdir), `assets/0/` through `assets/N-1/`, instead of one flat directory. Use it when the host caps the number of files per directory; Netlify, for example, ermöglicht 54,000. Each page emits two JavaScript files, so a site with 60,000 pages needs at least three shards, plus some headroom because files are distributed by a hash of their name.

```ts
export default {
  assetsShards: 4
}
```

Shared chunks stay in `assets/chunks/`. A file's shard depends only on its name, so unchanged files keep their URL between builds. Only production builds are affected.

### icons

- Type: `{ include?: string[] }`

Optionen for the generated icon styles. The build collects every iconify icon rendered during SSR. Names are fully qualified as `collection:name`, resolved against the `@iconify-json/*` packages declared in your project's dependencies.

Symbole, die nur auf dem Client gerendert werden — inside `<ClientOnly>`, or after hydration — are invisible to SSR collection. List them in `include` to force them into the stylesheet:

```ts
export default {
  icons: {
    include: ['mdi:home', 'simple-icons:discord']
  }
}
```

### cacheDir

- Type: `string`
- Default: `./.vitepress/cache`

The directory for cache files, relative to [project root](../guide/routing#root-and-source-directory). Siehe auch: [cacheDir](https://vite.dev/config/shared-options.html#cachedir).

```ts
export default {
  cacheDir: './.vitepress/.vite'
}
```

### ignoreDeadLinks

- Type: `boolean | 'localhostLinks' | (string | RegExp | ((link: string, source: string) => boolean))[]`
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

Bei Verwendung des Standard-Themes, enabling this option will display each page's last updated time. Du kannst customize the text via [`themeConfig.lastUpdated.text`](./default-theme-config#lastupdated) option.

## Customization

### markdown

- Type: `MarkdownOption`

Konfigurieren Markdown parser options. VitePress uses [Markdown-it](https://github.com/markdown-it/markdown-it) as the parser, and [Shiki](https://github.com/shikijs/shiki) to highlight language syntax. Inside this option, you may pass various Markdown related options to fit your needs.

```js
export default {
  markdown: {...}
}
```

Check the [type declaration and jsdocs](https://github.com/vuejs/vitepress/blob/main/src/node/markdown/markdown.ts) for all the options verfügbar.

Set `markdown.headers` to `true` or pass [`@mdit-vue/plugin-headers`](https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-headers) options to collect headings into [`useData().page.headers`](./runtime-api#usedata). This option is deaktiviert by default.

### vite

- Type: `import('vite').UserConfig`

Pass raw [Vite Config](https://vite.dev/config/) to internal Vite dev server / bundler.

```js
export default {
  vite: {
    // Vite config options
  }
}
```

### vue

- Type: `import('@vitejs/plugin-vue').Optionen`

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
- Suche Indexing
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
  vpIcons: Set<string>
  [key: string]: any
}
```

### transformHead

- Type: `(context: TransformContext) => Awaitable<HeadConfig[]>`

`transformHead` is a build hook to add extra tags to the `<head>` of each page. It ermöglicht you to add head entries that cannot be statically added to your VitePress config. You only need to zurückgeben extra entries, they will be merged automatisch with the existing ones.

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

This hook is only called when performing a build, it is not called during dev.

The extra tags will be added to the static HTML files generated by the build. They will not be updated during client-side navigation.

In many cases, using the [`transformPageData`](#transformpagedata) hook is a cleaner solution. That hook will also be applied to both client-side navigation and during dev. But if generating the head tags is computationally expensive then `transformHead` will avoid that overhead during dev.

#### Beispiel: Adding `og:image` meta

```ts
export default {
  async transformHead(context) {
    if (context.page === '404.md') {
      return
    }

    // The implementation details of `generatePageImage` would depend
    // on your requirements. Here we assume it generates a suitable
    // image for each page and returns the image URL.
    const imageUrl = await generatePageImage(context)
    
    return [[
      'meta',
      { name: 'og:image', content: imageUrl }
    ]]
  }
}
```

Here we're assuming that the image URL is dynamic and time-consuming to generate. Using `transformHead` avoids that overhead during development.

For simpler cases, it may be possible to use the [`head`](./frontmatter-config#head) setting in frontmatter, or [`transformPageData`](#transformpagedata).

### transformHtml

- Type: `(code: string, id: string, context: TransformContext) => Awaitable<string | void>`

`transformHtml` is a build hook to transform the content of each page before saving to disk.

::: warning
Don't mutate anything inside the `context`. Also, modifying the html content may cause hydration problems in runtime.
:::

::: note
The icon stylesheet link still carries its `vp-icons.__VP_ICONS_HASH__.css` placeholder at this point — the content hash only exists once every page has rendered, and it is substituted right after. Hooks that inline or fingerprint head assets should skip that tag.
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

`transformPageData` is a hook to transform the `pageData` of each page. Du kannst directly mutate `pageData` or zurückgeben changed values which will be merged into the page data.

::: warning
Don't mutate anything inside the `context` and be careful that this might impact the performance of dev server, especially if you have some network requests or heavy computations (like generating images) in the hook. Du kannst check for `process.env.NODE_ENV === 'production'` for conditional logic.
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

#### Beispiel: Adding a `<meta name="og:title">`

```ts
export default {
  transformPageData(pageData) {
    const title = pageData.frontmatter.layout === 'home'
      ? 'VitePress'
      : `${pageData.title} | VitePress`

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push([
      'meta',
      { name: 'og:title', content: title }
    ])
  }
}
```

#### Beispiel: Adding a canonical URL `<link>`

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
