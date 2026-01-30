---
outline: deep
---

# 検索 {#search}

## ローカル検索 {#local-search}

VitePress は、[minisearch](https://github.com/lucaong/minisearch/) によるブラウザ内インデックスを使った曖昧一致の全文検索をサポートします。有効化するには、`.vitepress/config.ts` で `themeConfig.search.provider` を `'local'` に設定します。

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

表示例:

![screenshot of the search modal](/search.png)

代わりに [Algolia DocSearch](#algolia-search) や、次のコミュニティ製プラグインを使うこともできます。

- <https://www.npmjs.com/package/vitepress-plugin-search>
- <https://www.npmjs.com/package/vitepress-plugin-pagefind>
- <https://www.npmjs.com/package/@orama/plugin-vitepress>

### i18n {#local-search-i18n}

多言語検索を行う設定例です。

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: { // 既定ロケールの文言も翻訳したい場合はこれを `root` に
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

### miniSearch のオプション {#mini-search-options}

MiniSearch の設定例です。

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

詳しくは [MiniSearch のドキュメント](https://lucaong.github.io/minisearch/classes/MiniSearch.MiniSearch.html) を参照してください。

### コンテンツレンダラーのカスタマイズ {#custom-content-renderer}

インデックス前に Markdown コンテンツをレンダリングする関数をカスタマイズできます。

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
          // HTML 文字列を返す
        }
      }
    }
  }
})
```

この関数はクライアント側のサイトデータからは除外されるため、Node.js の API を使用できます。

#### 例: 検索対象からページを除外する {#example-excluding-pages-from-search}

フロントマターに `search: false` を追加すると、そのページを検索対象から除外できます。あるいは次のようにもできます。

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

::: warning 注意
カスタムの `_render` 関数を提供する場合、`search: false` の処理は自分で行う必要があります。また、`env` は `md.renderAsync` の呼び出し前には完全ではないため、`frontmatter` などの任意プロパティのチェックはその後に行ってください。
:::

#### 例: コンテンツの変換 — 見出しアンカーを追加 {#example-transforming-content-adding-anchors}

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
            return await md.renderAsync(`# ${env.frontmatter.title}`) + html
          return html
        }
      }
    }
  }
})
```

## Algolia 検索 {#algolia-search}

VitePress は [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch) によるサイト検索をサポートします。導入は公式のガイドを参照してください。`.vitepress/config.ts` では最低限次の設定が必要です。

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

多言語検索の設定例です。

<details>
<summary>クリックして展開</summary>

<<< @/snippets/algolia-i18n.ts

</details>

詳しくは[公式 Algolia ドキュメント](https://docsearch.algolia.com/docs/api#translations)を参照してください。すぐに始めるには、このサイトで使っている翻訳を[GitHub リポジトリ](https://github.com/search?q=repo:vuejs/vitepress+%22function+searchOptions%22&type=code)からコピーすることもできます。

### Algolia Ask AI のサポート {#ask-ai}

**Ask AI** を有効にするには、`options` 内に `askAi` オプション（またはその一部）を指定します。

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
        // または
        askAi: {
          // 少なくとも Algolia から受け取った assistantId を指定
          assistantId: 'XXXYYY',
          // 任意の上書き — 省略時は上位の appId/apiKey/indexName を再利用
          // apiKey: '...',
          // appId: '...',
          // indexName: '...'
        }
      }
    }
  }
})
```

::: warning 注意
キーワード検索を既定にして Ask AI を使わない場合は、`askAi` を指定しないでください。
:::

### Ask AI サイドパネル {#ask-ai-side-panel}

DocSearch v4.5+ はオプションの **Ask AI サイドパネル**をサポートしています。有効にすると、デフォルトで **Ctrl/Cmd+I** で開くことができます。[サイドパネル API リファレンス](https://docsearch.algolia.com/docs/sidepanel/api-reference)にオプションの完全なリストがあります。

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
            // @docsearch/sidepanel-js SidepanelProps API をミラー
            panel: {
              variant: 'floating', // または 'inline'
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

キーボードショートカットを無効にする必要がある場合は、サイドパネルの `keyboardShortcuts` オプションを使用してください：

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

#### モード (auto / sidePanel / hybrid / modal) {#ask-ai-mode}

VitePress がキーワード検索と Ask AI を統合する方法をオプションで制御できます：

- `mode: 'auto'`（デフォルト）：キーワード検索が設定されている場合は `hybrid` を推論し、それ以外の場合は Ask AI サイドパネルが設定されている場合は `sidePanel` を推論します。
- `mode: 'sidePanel'`：サイドパネルのみを強制（キーワード検索ボタンを非表示）。
- `mode: 'hybrid'`：キーワード検索モーダル + Ask AI サイドパネルを有効化（キーワード検索設定が必要）。
- `mode: 'modal'`：Ask AI を DocSearch モーダル内に保持（サイドパネルを設定した場合でも）。

#### Ask AI のみ（キーワード検索なし） {#ask-ai-only}

**Ask AI サイドパネルのみ**を使用する場合は、トップレベルのキーワード検索設定を省略し、`askAi` の下に認証情報を提供できます：

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

### クローラー設定 {#crawler-config}

このサイトで使用している設定を元にした例です。

<<< @/snippets/algolia-crawler.js
