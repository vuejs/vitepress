# Search

VitePress supports searching your docs site using [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch). Refer their getting started guide. In your `.vitepress/config.ts` you'll need to provide at least the following to make it work:

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

If you are not eligible for DocSearch, you might wanna use some community plugins like <https://github.com/emersonbottero/vitepress-plugin-search> or explore some custom solutions on [this GitHub thread](https://github.com/vuejs/vitepress/issues/670).

## i18n

You can use a config like this to use multilingual search:

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

[These options](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts) can be overridden. Refer official Algolia docs to learn more about them.
