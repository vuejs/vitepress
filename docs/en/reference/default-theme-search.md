---
outline: deep
---

# Search

## Local Search

VitePress supports fuzzy full-text search using an in-browser index thanks to [minisearch](https://github.com/lucaong/minisearch/). To enable this feature, simply set the `themeConfig.search.provider` option to `'local'` in your `.vitepress/config.ts` file:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local'
    }
  }
})
```

Example result:

![screenshot of the search modal](/search.png)

Alternatively, you can use [Algolia DocSearch](#algolia-search) or some community plugins like:

- <https://www.npmjs.com/package/vitepress-plugin-search>
- <https://www.npmjs.com/package/vitepress-plugin-pagefind>
- <https://www.npmjs.com/package/@orama/plugin-vitepress>
- <https://www.npmjs.com/package/vitepress-plugin-typesense>

### i18n {#local-search-i18n}

You can use a config like this to use multilingual search:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: { // make this `root` if you want to translate the default locale
            translations: {
              button: {
                buttonText: '搜索',
                buttonAriaLabel: '搜索'
              },
              modal: {
                displayDetails: '显示详细列表',
                resetButtonTitle: '重置搜索',
                backButtonTitle: '关闭搜索',
                noResultsText: '没有结果',
                footer: {
                  selectText: '选择',
                  selectKeyAriaLabel: '输入',
                  navigateText: '导航',
                  navigateUpKeyAriaLabel: '上箭头',
                  navigateDownKeyAriaLabel: '下箭头',
                  closeText: '关闭',
                  closeKeyAriaLabel: 'esc'
                }
              }
            }
          }
        }
      }
    }
  }
})
```

### miniSearch options

You can configure MiniSearch like this:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          /**
           * @type {Pick<import('minisearch').Options, 'extractField' | 'tokenize' | 'processTerm'>}
           */
          options: {
            /* ... */
          },
          /**
           * @type {import('minisearch').SearchOptions}
           * @default
           * { fuzzy: 0.2, prefix: true, boost: { title: 4, text: 2, titles: 1 } }
           */
          searchOptions: {
            /* ... */
          }
        }
      }
    }
  }
})
```

Learn more in [MiniSearch docs](https://lucaong.github.io/minisearch/classes/MiniSearch.MiniSearch.html).

### Custom content renderer

You can customize the function used to render the markdown content before indexing it:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        /**
         * @param {string} src
         * @param {import('vitepress').MarkdownEnv} env
         * @param {import('markdown-it-async')} md
         */
        async _render(src, env, md) {
          // return html string
        }
      }
    }
  }
})
```

This function will be stripped from client-side site data, so you can use Node.js APIs in it.

#### Example: Excluding pages from search

You can exclude pages from search by adding `search: false` to the frontmatter of the page. Alternatively:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        async _render(src, env, md) {
          const html = await md.renderAsync(src, env)
          if (env.frontmatter?.search === false) return ''
          if (env.relativePath.startsWith('some/path')) return ''
          return html
        }
      }
    }
  }
})
```

::: warning Note
In case a custom `_render` function is provided, you need to handle the `search: false` frontmatter yourself. Also, the `env` object won't be completely populated before `md.renderAsync` is called, so any checks on optional `env` properties like `frontmatter` should be done after that.
:::

#### Example: Transforming content - adding anchors

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        async _render(src, env, md) {
          const html = await md.renderAsync(src, env)
          if (env.frontmatter?.title)
            return (await md.renderAsync(`# ${env.frontmatter.title}`)) + html
          return html
        }
      }
    }
  }
})
```

## Algolia Search

VitePress supports searching your docs site using [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch). Refer to their getting started guide. In your `.vitepress/config.ts` you'll need to provide at least the following to make it work:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'algolia',
      options: {
        appId: '...',
        apiKey: '...',
        indexName: '...'
      }
    }
  }
})
```

### i18n {#algolia-search-i18n}

You can use a config like this to use multilingual search:

<details>
<summary>View full example</summary>

<<< @/snippets/algolia-i18n.ts

</details>

Refer [official Algolia docs](https://docsearch.algolia.com/docs/api#translations) to learn more about them. To quickly get started, you can also copy the translations used by this site from [our GitHub repo](https://github.com/search?q=repo:vuejs/vitepress+%22function+searchOptions%22&type=code).

### Algolia Ask AI Support {#ask-ai}

If you would like to include **Ask AI**, pass the `askAi` option (or any of the partial fields) inside `options`:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'algolia',
      options: {
        appId: '...',
        apiKey: '...',
        indexName: '...',
        // askAi: "YOUR-ASSISTANT-ID"
        // OR
        askAi: {
          // at minimum you must provide the assistantId you received from Algolia
          assistantId: 'XXXYYY',
          // optional overrides – if omitted, the top-level appId/apiKey/indexName values are reused
          // apiKey: '...',
          // appId: '...',
          // indexName: '...'
        }
      }
    }
  }
})
```

::: warning Note
If you want to default to keyword search and do not want to use Ask AI, omit the `askAi` property.
:::

### Ask AI Side Panel {#ask-ai-side-panel}

DocSearch v4.5+ supports an optional **Ask AI side panel**. When enabled, it can be opened with **Ctrl/Cmd+I** by default. The [Sidepanel API Reference](https://docsearch.algolia.com/docs/sidepanel/api-reference) contains the full list of options.

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'algolia',
      options: {
        appId: '...',
        apiKey: '...',
        indexName: '...',
        askAi: {
          assistantId: 'XXXYYY',
          sidePanel: {
            panel: {
              variant: 'floating', // or 'inline'
              side: 'right',
              width: '360px',
              expandedWidth: '580px',
              suggestedQuestions: true
            }
          }
        }
      }
    }
  }
})
```

If you need to disable the keyboard shortcut, use the `keyboardShortcuts` option at the sidepanel root level:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'algolia',
      options: {
        appId: '...',
        apiKey: '...',
        indexName: '...',
        askAi: {
          assistantId: 'XXXYYY',
          sidePanel: {
            keyboardShortcuts: {
              'Ctrl/Cmd+I': false
            }
          }
        }
      }
    }
  }
})
```

#### Mode (auto / sidePanel / hybrid / modal) {#ask-ai-mode}

You can optionally control how VitePress integrates keyword search and Ask AI:

- `mode: 'auto'` (default): infer `hybrid` when keyword search is configured, otherwise `sidePanel` when Ask AI side panel is configured.
- `mode: 'sidePanel'`: force side panel only (hides the keyword search button).
- `mode: 'hybrid'`: enable keyword search modal + Ask AI side panel (requires keyword search configuration).
- `mode: 'modal'`: keep Ask AI inside the DocSearch modal (even if you configured the side panel).

#### Ask AI only (no keyword search) {#ask-ai-only}

If you want to use **Ask AI side panel only**, you can omit top-level keyword search config and provide credentials under `askAi`:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'algolia',
      options: {
        mode: 'sidePanel',
        askAi: {
          assistantId: 'XXXYYY',
          appId: '...',
          apiKey: '...',
          indexName: '...',
          sidePanel: true
        }
      }
    }
  }
})
```

### Crawler Config

Here is an example config based on what this site uses:

<<< @/snippets/algolia-crawler.js
