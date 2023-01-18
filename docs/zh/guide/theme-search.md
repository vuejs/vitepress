# 搜索 {#search}

VitePress 支持使用 [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch) 来让你的站点具有搜索功能。可以参考它们的入门指南。在你的 `.vitepress/config.ts` 中，你至少需要做如下的配置才能让它起作用：

```ts
import { defineConfig } from 'vitepress'
export default defineConfig({
  themeConfig: {
    algolia: {
      appId: '...',
      apiKey: '...',
      indexName: '...'
    }
  }
})
```

如果你认为 DocSearch 不合适，你可以使用社区的插件，像 <https://github.com/emersonbottero/vitepress-plugin-search> 或者在 [这个 GitHub 议题](https://github.com/vuejs/vitepress/issues/670)下寻找一些自定义的解决方案。

## 国际化 {#i8n}

你可以这样配置来使站点支持多种语言的搜索功能：

```ts
import { defineConfig } from 'vitepress'
export default defineConfig({
  // ...
  themeConfig: {
    // ...
    algolia: {
      appId: '...',
      apiKey: '...',
      indexName: '...',
      locales: {
        zh: {
          placeholder: '搜索文档',
          translations: {
            button: {
              buttonText: '搜索文档',
              buttonAriaLabel: '搜索文档'
            },
            modal: {
              searchBox: {
                resetButtonTitle: '清除查询条件',
                resetButtonAriaLabel: '清除查询条件',
                cancelButtonText: '取消',
                cancelButtonAriaLabel: '取消'
              },
              startScreen: {
                recentSearchesTitle: '搜索历史',
                noRecentSearchesText: '没有搜索历史',
                saveRecentSearchButtonTitle: '保存至搜索历史',
                removeRecentSearchButtonTitle: '从搜索历史中移除',
                favoriteSearchesTitle: '收藏',
                removeFavoriteSearchButtonTitle: '从收藏中移除'
              },
              errorScreen: {
                titleText: '无法获取结果',
                helpText: '你可能需要检查你的网络连接'
              },
              footer: {
                selectText: '选择',
                navigateText: '切换',
                closeText: '关闭',
                searchByText: '搜索提供者'
              },
              noResultsScreen: {
                noResultsText: '无法找到相关结果',
                suggestedQueryText: '你可以尝试查询',
                reportMissingResultsText: '你认为该查询应该有结果？',
                reportMissingResultsLinkText: '点击反馈'
              }
            }
          }
        }
      }
    }
  }
})
```

[这些参数](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts)可以被覆盖，参考 Algolia 官方文档了解更多信息。
