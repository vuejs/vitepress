---
outline: deep
---

# 搜索 {#search}

## 本地搜索 {#local-search}

得益于 [minisearch](https://github.com/lucaong/minisearch/)，VitePress 支持使用浏览器内索引进行模糊全文搜索。要启用此功能，只需在 `.vitepress/config.ts` 文件中将 `themeConfig.search.provider` 选项设置为 `'local'` 即可：

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

示例结果：

![搜索弹窗截图](/search.png)

或者，你可以使用 [Algolia DocSearch](#algolia-search) 或一些社区插件，例如：<https://www.npmjs.com/package/vitepress-plugin-search> 或者 <https://www.npmjs.com/package/vitepress-plugin-pagefind>。

### i18n {#local-search-i18n}

你可以使用这样的配置来使用多语言搜索：

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: { // 如果你想翻译默认语言，请将此处设为 `root`
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
                  closeKeyAriaLabel: 'Esc'
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

### MiniSearch 配置项 {#minisearch-options}

你可以像这样配置 MiniSearch ：

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

参阅 [MiniSearch 文档](https://lucaong.github.io/minisearch/classes/MiniSearch.MiniSearch.html)了解更多信息。

### 自定义渲染内容 {#custom-content-renderer}

可以在索引之前自定义用于渲染 Markdown 内容的函数：

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
          // 返回 HTML 字符串
        }
      }
    }
  }
})
```

该函数将从客户端站点数据中剥离，因此你可以在其中使用 Node.js API。

#### 示例：从搜索中排除页面 {#example-excluding-pages-from-search}

你可以通过将 `search: false` 添加到页面的 `frontmatter` 来从搜索中排除页面。或者：

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
如果提供了自定义的 `_render` 函数，你需要自己处理 `search: false` 的 frontmatter。此外，在调用 `md.renderAsync` 之前，`env` 对象不会完全填充，因此对可选 `env` 属性 (如 `frontmatter`) 的任何检查都应该在此之后完成。
:::

#### 示例：转换内容——添加锚点 {#example-transforming-content-adding-anchors}

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

## Algolia Search {#algolia-search}

VitePress 支持使用 [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch) 搜索文档站点。请参阅他们的入门指南。在你的 `.vitepress/config.ts` 中，你至少需要提供以下内容才能使其正常工作：

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

你可以使用这样的配置来使用多语言搜索：

<details>
<summary>点击展开</summary>

<<< @/snippets/algolia-i18n.ts

</details>

更多信息请参考[官方 Algolia 文档](https://docsearch.algolia.com/docs/api#translations)。想要快速开始，你也可以从[我们的 GitHub 仓库](https://github.com/search?q=repo:vuejs/vitepress+%22function+searchOptions%22&type=code)复制此站点使用的翻译。

### Algolia Ask AI 支持 {#ask-ai}

如果需要启用 **Ask AI**，只需在 `options` 中添加 `askAi`：

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
        // askAi: "你的助手ID"
        // 或
        askAi: {
          // 至少需要提供从 Algolia 获取的 assistantId
          assistantId: 'XXXYYY',
          // 可选覆盖 — 若省略，将复用顶层 appId/apiKey/indexName 的值
          // apiKey: '...',
          // appId: '...',
          // indexName: '...'
        }
      }
    }
  }
})
```

::: warning 提示
若仅需关键词搜索，可省略 `askAi`。
:::

### Ask AI 侧边栏 {#ask-ai-side-panel}

DocSearch v4.5+ 支持可选的 **Ask AI 侧边栏**。启用后，默认可通过 **Ctrl/Cmd+I** 打开。完整的选项列表请参阅[侧边栏 API 参考](https://docsearch.algolia.com/docs/sidepanel/api-reference)。

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
            // 镜像 @docsearch/sidepanel-js SidepanelProps API
            panel: {
              variant: 'floating', // 或 'inline'
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

如果需要禁用键盘快捷键，请使用侧边栏的 `keyboardShortcuts` 选项：

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

#### 模式 (auto / sidePanel / hybrid / modal) {#ask-ai-mode}

你可以选择性地控制 VitePress 如何集成关键词搜索和 Ask AI：

- `mode: 'auto'`（默认）：当配置了关键词搜索时推断为 `hybrid`，否则当配置了 Ask AI 侧边栏时推断为 `sidePanel`。
- `mode: 'sidePanel'`：强制仅使用侧边栏（隐藏关键词搜索按钮）。
- `mode: 'hybrid'`：启用关键词搜索模态框 + Ask AI 侧边栏（需要关键词搜索配置）。
- `mode: 'modal'`：将 Ask AI 保留在 DocSearch 模态框内（即使你配置了侧边栏）。

#### 仅 Ask AI（无关键词搜索） {#ask-ai-only}

如果你想**仅使用 Ask AI 侧边栏**，可以省略顶级关键词搜索配置，并在 `askAi` 下提供凭据：

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

### 爬虫配置 {#crawler-config}

以下是基于此站点使用的示例配置：

<<< @/snippets/algolia-crawler.js
