---
description: Reference of the VitePress Node API for building, serving and rendering Markdown programmatically.
---

# Node API

Besides the [CLI](./cli), VitePress can be driven from Node.js. The functions below are exported from `vitepress` for build scripts, tests and the Node-side extension points - [build hooks](./site-config#build-hooks) and [data loaders](../guide/data-loading). They are not available in the browser; see the [Runtime API](./runtime-api) for that.

Other Node exports are documented with the feature they belong to: [`defineConfig`](./site-config#config-intellisense), [`createContentLoader` and `defineLoader`](../guide/data-loading), [`defineRoutes`](../guide/routing#dynamic-routes), [`loadEnv`](../guide/cms) and [`postcssIsolateStyles`](../guide/markdown#raw).

## `build`

- Type: `(root?: string, options?: BuildOptions & { base?: string }) => Promise<void>`

Builds the site, like [`vitepress build`](./cli#vitepress-build). `root` defaults to the current working directory. `options` accepts Vite's [build options](https://vite.dev/config/build-options) (`outDir` is resolved against the current working directory) plus a `base` override.

```ts
import { build } from 'vitepress'

await build('docs', { outDir: 'dist' })
```

## `createServer`

- Type: `(root?: string, options?: ServerOptions & { base?: string }) => Promise<ViteDevServer>`

Creates the dev server behind [`vitepress dev`](./cli#vitepress-dev) without starting it. `options` accepts Vite's [server options](https://vite.dev/config/server-options) plus a `base` override.

```ts
import { createServer } from 'vitepress'

const server = await createServer('docs', { port: 5173 })
await server.listen()
// ...
await server.close()
```

## `serve`

- Type: `(options?: { root?: string; base?: string; port?: number }) => Promise<Polka>`

Serves a built site, like [`vitepress preview`](./cli#vitepress-preview). It resolves once the server is listening (on port `4173` by default) with the underlying [Polka](https://github.com/lukeed/polka) app.

```ts
import { serve } from 'vitepress'

const app = await serve({ root: 'docs', port: 4173 })
// ...
app.server.close()
```

## `renderMd`

- Type: `(src: string, options?: RenderMdOptions) => Promise<string>`

Renders Markdown to HTML with the `markdown-it` instance VitePress uses for pages, so every [Markdown extension](../guide/markdown) and [`markdown`](./site-config#markdown) config option applies. It is available once VitePress is running - in [build hooks](./site-config#build-hooks), [`transformPageData`](./site-config#transformpagedata) and [data loaders](../guide/data-loading#rendering-markdown) - and rejects when called earlier, for example while the config file is evaluated.

```ts
import { renderMd } from 'vitepress'

const html = await renderMd('Hello **world**')
// '<p>Hello <strong>world</strong></p>\n'

const inline = await renderMd('Hello **world**', { inline: true })
// 'Hello <strong>world</strong>'
```

```ts
interface RenderMdOptions extends Partial<MarkdownEnv> {
  // render without the wrapping paragraph, like markdown-it's `renderInline`
  inline?: boolean
}
```

The other options are the `MarkdownEnv` fields the renderer reads, mainly `path` - the absolute path of the file the Markdown belongs to, used to resolve relative [includes](../guide/markdown#markdown-file-inclusion) and [snippets](../guide/markdown#import-code-snippets) - and `cleanUrls`, which defaults to the [site config](./site-config#cleanurls). The result is plain HTML for `v-html`: Vue components and expressions in it are not processed.
