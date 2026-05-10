---
outline: deep
description: How to use environment variables in VitePress configuration and client code.
---

# Environment Variables

VitePress is built on [Vite](https://vitejs.dev/guide/env-and-mode), so the standard Vite environment variable behavior applies. This page covers the most common patterns.

## Loading Env Variables in Config

Environment variables are **not** automatically available in the VitePress config file. You need to load them explicitly using the `loadEnv` helper re-exported from Vite:

```ts
// .vitepress/config.ts
import { defineConfig, loadEnv } from 'vitepress'

const env = loadEnv('', process.cwd())

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'algolia',
      options: {
        appId: env.VITE_ALGOLIA_APP_ID,
        apiKey: env.VITE_ALGOLIA_API_KEY,
        indexName: env.VITE_ALGOLIA_INDEX_NAME
      }
    }
  }
})
```

Only variables prefixed with `VITE_` are exposed. Given an `.env` file like:

```
VITE_ALGOLIA_APP_ID=XXXXXXXX
VITE_ALGOLIA_API_KEY=xxxxxxxxxxxx
SECRET_KEY=should-not-be-exposed
```

`env.VITE_ALGOLIA_APP_ID` and `env.VITE_ALGOLIA_API_KEY` will be available, but `env.SECRET_KEY` will not.

::: warning
Since `VITE_`-prefixed variables will be leaked into client-side code, make sure they do not contain sensitive information. Use non-prefixed variables with `process.env` for secrets that should stay on the server (e.g., in [build hooks](/reference/site-config#build-hooks) or [data loaders](/guide/data-loading)).
:::

### Accessing Non-Prefixed Variables

For Node-only contexts like `buildEnd`, `transformPageData`, or [data loaders](/guide/data-loading), you can read `process.env` directly without the `VITE_` prefix:

```ts
// .vitepress/config.ts
export default defineConfig({
  async transformPageData() {
    // process.env is available in Node contexts
    const data = await fetchFromCMS(process.env.CMS_SECRET_TOKEN)
    // ...
  }
})
```

## Using Env Variables in Client Code

In Markdown and Vue components, `VITE_`-prefixed variables are available via `import.meta.env`:

```md
Current mode: {{ import.meta.env.MODE }}
```

```vue
<script setup>
const apiUrl = import.meta.env.VITE_API_URL
</script>
```

VitePress also provides the following [built-in env variables](https://vitejs.dev/guide/env-and-mode#env-variables):

- `import.meta.env.MODE` — `'development'` or `'production'`
- `import.meta.env.BASE_URL` — the configured [`base`](/reference/site-config#base) path
- `import.meta.env.DEV` / `import.meta.env.PROD` — boolean flags
- `import.meta.env.SSR` — whether running during server-side rendering

## `.env` Files

VitePress loads `.env` files from your [project root](./routing#root-and-source-directory). Files are loaded based on mode:

```
.env                # always loaded
.env.local          # always loaded, git-ignored
.env.[mode]         # only in specified mode
.env.[mode].local   # only in specified mode, git-ignored
```

See [Vite — Env Variables and Modes](https://vitejs.dev/guide/env-and-mode) for full details.
