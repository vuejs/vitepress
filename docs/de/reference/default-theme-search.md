---
outline: deep
description: Richte eine lokale oder von Algolia bereitgestellte Suche für deine VitePress-Website ein.
---

# Suche

## Lokale Suche

VitePress unterstützt eine unscharfe Volltextsuche mithilfe eines Index im Browser dank [minisearch](https://github.com/lucaong/minisearch/). Um diese Funktion zu aktivieren, setze einfach die Option `themeConfig.search.provider` in deiner Datei `.vitepress/config.ts` auf `'local'`:

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

Beispielergebnis:

![screenshot of the search modal](/search.png)

Alternativ kannst du [Algolia DocSearch](#algolia-search) oder Community-Plugins verwenden, zum Beispiel:

- <https://npmx.dev/package/vitepress-plugin-pagefind>
- <https://npmx.dev/package/vitepress-plugin-typesense>
- <https://npmx.dev/package/vitepress-plugin-cloudflare-ai-search>

<!-- - <https://npmx.dev/package/@orama/plugin-vitepress> -- replace with zbsearch one when published -->

### Internationalisierung {#local-search-i18n}

Du kannst eine Konfiguration wie diese verwenden, um eine mehrsprachige Suche einzurichten:

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

### MiniSearch-Optionen

Du kannst MiniSearch folgendermaßen konfigurieren:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          /**
           * @type {Pick<import('minisearch').Optionen, 'extractField' | 'tokenize' | 'processTerm'>}
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

Weitere Informationen findest du in der [MiniSearch-Dokumentation](https://lucaong.github.io/minisearch/classes/MiniSearch.MiniSearch.html).

::: info Document IDs
Die Dokument-IDs der Suche (wie sie von `searchOptions.filter`, `boostDocument` und im rohen Index verwendet werden) sind relative Pfade innerhalb der Website wie `/guide/page.html#section` – sie enthalten nicht [`base`](../reference/site-config#base). Das Theme löst sie beim Rendern der Ergebnisse gegen `base` auf.
:::

### Eigenen Inhalts-Renderer

Du kannst die Funktion anpassen, mit der der Markdown-Inhalt vor der Indizierung gerendert wird:

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

Diese Funktion wird aus den clientseitigen Websitedaten entfernt, sodass du darin Node.js-APIs verwenden kannst.

#### Beispiel: Seiten aus der Suche ausschließen

Du kannst Seiten aus der Suche ausschließen, indem du `search: false` in das Frontmatter der Seite einfügst. Alternativ:

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
Wenn eine eigene `_render`-Funktion bereitgestellt wird, musst du das Frontmatter `search: false` selbst behandeln. Also, das `env`-Objekt ist vor dem Aufruf von `md.renderAsync` is called, so any checks on optional `env` properties like `frontmatter` should be done after that.
:::

#### Beispiel: Transforming content - adding anchors

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

## Algolia-Suche

VitePress unterstützt die Suche in deiner Dokumentation mit [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch). Siehe die entsprechende Einstiegsanleitung. In your `.vitepress/config.ts` you'll need to provide at least the following to make it work:

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

Du kannst eine Konfiguration wie diese verwenden, um eine mehrsprachige Suche einzurichten:

<details>
<summary>Vollständiges Beispiel anzeigen</summary>

<<< @/snippets/algolia-i18n.ts

</details>

Refer [official Algolia docs](https://docsearch.algolia.com/docs/api#translations) to learn more about them. Für einen schnellen Einstieg kannst du auch the translations used by this site from [our GitHub repo](https://github.com/search?q=repo:vuejs/vitepress+%22function+searchOptions%22&type=code).

### Algolia Ask AI Support {#ask-ai}

Wenn du **Ask AI** einbinden möchtest, pass the `askAi` option (or any of the partial fields) inside `options`:

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
Wenn du standardmäßig die Stichwortsuche verwenden und Ask AI nicht nutzen möchtest, lasse the `askAi` property.
:::

### Ask AI Side Panel {#ask-ai-side-panel}

DocSearch v4.5+ unterstützt an optional **Ask-AI-Seitenleiste**. Wenn sie aktiviert ist, kann sie with **Ctrl/Cmd+I** by default. The [Sidepanel API Reference](https://docsearch.algolia.com/docs/sidepanel/api-reference) contains the full list of options.

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

Use `askAi.sidePanel.panel.suggestedQuestions` for side panel suggested
questions. Algolia's standalone Ask AI examples also mention
`askAi.suggestedQuestions`, but that top-level option is not enough for
VitePress side panel mode and does not make the integrated keyword-search
modal display suggested questions on first open.

Wenn du die Tastenkombination deaktivieren möchtest, verwende the `keyboardShortcuts` option at the sidepanel root level:

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

Du kannst optional festlegen, wie VitePress Stichwortsuche und Ask AI integriert:

- `mode: 'auto'` (default): infer `hybrid` when keyword search is configured, otherwise `sidePanel` when Ask-AI-Seitenleiste is configured.
- `mode: 'sidePanel'`: force side panel only (hides the keyword search button).
- `mode: 'hybrid'`: enable keyword search modal + Ask-AI-Seitenleiste (requires keyword search configuration).
- `mode: 'modal'`: keep Ask AI inside the DocSearch modal (even if you configured the side panel).

#### Ask AI only (no keyword search) {#ask-ai-only}

Wenn du want to use **Ask-AI-Seitenleiste only**, you can omit top-level keyword search config and provide credentials under `askAi`:

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
