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
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
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

### MiniSearch 配置项 {#mini-search-options}

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
          // 返回 html 字符串
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
            return await md.renderAsync(`# ${env.frontmatter.title}`) + html
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
        locales: {
          zh: {
            placeholder: '搜索文档',
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
              modal: {
                searchBox: {
                  clearButtonTitle: '清除查询条件',
                  clearButtonAriaLabel: '清除查询条件',
                  closeButtonText: '关闭',
                  closeButtonAriaLabel: '关闭',
                  placeholderText: '搜索文档',
                  placeholderTextAskAi: '向 AI 提问：',
                  placeholderTextAskAiStreaming: '回答中...',
                  searchInputLabel: '搜索',
                  backToKeywordSearchButtonText: '返回关键字搜索',
                  backToKeywordSearchButtonAriaLabel: '返回关键字搜索'
                },
                startScreen: {
                  recentSearchesTitle: '搜索历史',
                  noRecentSearchesText: '没有搜索历史',
                  saveRecentSearchButtonTitle: '保存至搜索历史',
                  removeRecentSearchButtonTitle: '从搜索历史中移除',
                  favoriteSearchesTitle: '收藏',
                  removeFavoriteSearchButtonTitle: '从收藏中移除',
                  recentConversationsTitle: '最近的对话',
                  removeRecentConversationButtonTitle: '从历史记录中删除对话'
                },
                errorScreen: {
                  titleText: '无法获取结果',
                  helpText: '请检查网络连接'
                },
                noResultsScreen: {
                  noResultsText: '无法找到相关结果',
                  suggestedQueryText: '你可以尝试查询',
                  reportMissingResultsText: '你认为该查询应该有结果？',
                  reportMissingResultsLinkText: '点击反馈'
                },
                resultsScreen: { askAiPlaceholder: '向 AI 提问： ' },
                askAiScreen: {
                  disclaimerText: '答案由 AI 生成，可能不准确，请自行验证。',
                  relatedSourcesText: '相关来源',
                  thinkingText: '思考中...',
                  copyButtonText: '复制',
                  copyButtonCopiedText: '已复制！',
                  copyButtonTitle: '复制',
                  likeButtonTitle: '赞',
                  dislikeButtonTitle: '踩',
                  thanksForFeedbackText: '感谢你的反馈！',
                  preToolCallText: '搜索中...',
                  duringToolCallText: '搜索 ',
                  afterToolCallText: '已搜索'
                },
                footer: {
                  selectText: '选择',
                  submitQuestionText: '提交问题',
                  selectKeyAriaLabel: 'Enter 键',
                  navigateText: '切换',
                  navigateUpKeyAriaLabel: '向上箭头',
                  navigateDownKeyAriaLabel: '向下箭头',
                  closeText: '关闭',
                  backToSearchText: '返回搜索',
                  closeKeyAriaLabel: 'Esc 键',
                  poweredByText: '搜索提供者'
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

### Algolia Ask AI 支持 {#ask-ai}

如果需要启用 **Ask AI**，只需在 `options` 中添加 `askAi`：

```ts
options: {
  appId: '...',
  apiKey: '...',
  indexName: '...',
  askAi: {
    assistantId: 'XXXYYY'
  }
}
```

::: warning 提示
若仅需关键词搜索，可省略 `askAi`。
:::

**模态框**中 Ask AI 的翻译位于 `options.translations.modal.askAiScreen` 和 `options.translations.modal.resultsScreen` — 查看[类型定义](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts)了解所有键。

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

#### 侧边栏 i18n

侧边栏翻译配置在 `options.askAi.sidePanel.panel.translations` 下。完整的结构请参考[类型定义](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts)。

### 模式 (auto / sidePanel / hybrid / modal) {#ask-ai-mode}

你可以选择性地控制 VitePress 如何集成关键词搜索和 Ask AI：

- `mode: 'auto'`（默认）：当配置了关键词搜索时推断为 `hybrid`，否则当配置了 Ask AI 侧边栏时推断为 `sidePanel`。
- `mode: 'sidePanel'`：强制仅使用侧边栏（隐藏关键词搜索按钮）。
- `mode: 'hybrid'`：启用关键词搜索模态框 + Ask AI 侧边栏（需要关键词搜索配置）。
- `mode: 'modal'`：将 Ask AI 保留在 DocSearch 模态框内（即使你配置了侧边栏）。

### 仅 Ask AI（无关键词搜索） {#ask-ai-only}

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

```ts
new Crawler({
  appId: '...',
  apiKey: '...',
  rateLimit: 8,
  startUrls: ['https://vitepress.dev/'],
  renderJavaScript: false,
  sitemaps: [],
  exclusionPatterns: [],
  ignoreCanonicalTo: false,
  discoveryPatterns: ['https://vitepress.dev/**'],
  schedule: 'at 05:10 on Saturday',
  actions: [
    {
      indexName: 'vitepress',
      pathsToMatch: ['https://vitepress.dev/**'],
      recordExtractor: ({ $, helpers }) => {
        return helpers.docsearch({
          recordProps: {
            lvl1: '.content h1',
            content: '.content p, .content li',
            lvl0: {
              selectors: 'section.has-active div h2',
              defaultValue: 'Documentation'
            },
            lvl2: '.content h2',
            lvl3: '.content h3',
            lvl4: '.content h4',
            lvl5: '.content h5'
          },
          indexHeadings: true
        })
      }
    }
  ],
  initialIndexSettings: {
    vitepress: {
      attributesForFaceting: ['type', 'lang'],
      attributesToRetrieve: ['hierarchy', 'content', 'anchor', 'url'],
      attributesToHighlight: ['hierarchy', 'hierarchy_camel', 'content'],
      attributesToSnippet: ['content:10'],
      camelCaseAttributes: ['hierarchy', 'hierarchy_radio', 'content'],
      searchableAttributes: [
        'unordered(hierarchy_radio_camel.lvl0)',
        'unordered(hierarchy_radio.lvl0)',
        'unordered(hierarchy_radio_camel.lvl1)',
        'unordered(hierarchy_radio.lvl1)',
        'unordered(hierarchy_radio_camel.lvl2)',
        'unordered(hierarchy_radio.lvl2)',
        'unordered(hierarchy_radio_camel.lvl3)',
        'unordered(hierarchy_radio.lvl3)',
        'unordered(hierarchy_radio_camel.lvl4)',
        'unordered(hierarchy_radio.lvl4)',
        'unordered(hierarchy_radio_camel.lvl5)',
        'unordered(hierarchy_radio.lvl5)',
        'unordered(hierarchy_radio_camel.lvl6)',
        'unordered(hierarchy_radio.lvl6)',
        'unordered(hierarchy_camel.lvl0)',
        'unordered(hierarchy.lvl0)',
        'unordered(hierarchy_camel.lvl1)',
        'unordered(hierarchy.lvl1)',
        'unordered(hierarchy_camel.lvl2)',
        'unordered(hierarchy.lvl2)',
        'unordered(hierarchy_camel.lvl3)',
        'unordered(hierarchy.lvl3)',
        'unordered(hierarchy_camel.lvl4)',
        'unordered(hierarchy.lvl4)',
        'unordered(hierarchy_camel.lvl5)',
        'unordered(hierarchy.lvl5)',
        'unordered(hierarchy_camel.lvl6)',
        'unordered(hierarchy.lvl6)',
        'content'
      ],
      distinct: true,
      attributeForDistinct: 'url',
      customRanking: [
        'desc(weight.pageRank)',
        'desc(weight.level)',
        'asc(weight.position)'
      ],
      ranking: [
        'words',
        'filters',
        'typo',
        'attribute',
        'proximity',
        'exact',
        'custom'
      ],
      highlightPreTag: '<span class="algolia-docsearch-suggestion--highlight">',
      highlightPostTag: '</span>',
      minWordSizefor1Typo: 3,
      minWordSizefor2Typos: 7,
      allowTyposOnNumericTokens: false,
      minProximity: 1,
      ignorePlurals: true,
      advancedSyntax: true,
      attributeCriteriaComputedByMinProximity: true,
      removeWordsIfNoResults: 'allOptional'
    }
  }
})
```
