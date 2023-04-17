# 搜索 {#search}

## 本地搜索 {#local-search}

得益于 [minisearch](https://github.com/lucaong/minisearch/)，VitePress 支持使用浏览器内索引进行模糊全文搜索。
要启用此功能，只需在 `.vitepress/config.ts` 文件中将 `themeConfig.search.provider` 选项设置为 `'local'` 即可：

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
	themeConfig: {
		search: {
			provider: 'local',
		},
	},
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
								buttonAriaLabel: '搜索文档',
							},
							modal: {
								noResultsText: '无法找到相关结果',
								resetButtonTitle: '清除查询条件',
								footer: {
									selectText: '选择',
									navigateText: '切换',
								},
							},
						},
					},
				},
			},
		},
	},
})
```

## Algolia Search {#algolia-search}

VitePress 支持使用 [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch) 搜索你的文档站点。请参阅他们的入门指南。在你的 `.vitepress/config.ts` 中，你至少需要提供以下内容才能使其正常工作：

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
			},
		},
	},
})
```

### i18n {#algolia-search-i18n}

你可以使用这样的配置来使用多语言搜索：

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
	// ...
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
							button: {
								buttonText: '搜索文档',
								buttonAriaLabel: '搜索文档',
							},
							modal: {
								searchBox: {
									resetButtonTitle: '清除查询条件',
									resetButtonAriaLabel: '清除查询条件',
									cancelButtonText: '取消',
									cancelButtonAriaLabel: '取消',
								},
								startScreen: {
									recentSearchesTitle: '搜索历史',
									noRecentSearchesText: '没有搜索历史',
									saveRecentSearchButtonTitle: '保存至搜索历史',
									removeRecentSearchButtonTitle: '从搜索历史中移除',
									favoriteSearchesTitle: '收藏',
									removeFavoriteSearchButtonTitle: '从收藏中移除',
								},
								errorScreen: {
									titleText: '无法获取结果',
									helpText: '你可能需要检查你的网络连接',
								},
								footer: {
									selectText: '选择',
									navigateText: '切换',
									closeText: '关闭',
									searchByText: '搜索提供者',
								},
								noResultsScreen: {
									noResultsText: '无法找到相关结果',
									suggestedQueryText: '你可以尝试查询',
									reportMissingResultsText: '你认为该查询应该有结果？',
									reportMissingResultsLinkText: '点击反馈',
								},
							},
						},
					},
				},
			},
		},
	},
})
```

[这些选项](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts)可以被覆盖。请参阅官方 Algolia 文档以了解更多信息。

<style>
img[src="/search.png"] {
  width: 100%;
  aspect-ratio: 1 / 1;
}
</style>
