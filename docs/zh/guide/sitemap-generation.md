# Sitemap 生成器 {#sitemap-generation}

VitePress 提供开箱即用的为您的网站生成 `sitemap.xml` 文件。要启用它，请将以下内容添加到 `.vitepress/config.js` 中：

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
	sitemap: {
		hostname: 'https://example.com',
	},
})
```

To have `<lastmod>` tags in your `sitemap.xml`, you can enable the [`lastUpdated`](../reference/default-theme-last-updated) option.
要在 `sitemap.xml` 中有 `<lastmod>` 标签，你可以启用 [`lastUpdated`](../reference/default-theme-last-updated) 选项。

## 选项 {#options}

站点地图由 [`sitemap`](https://www.npmjs.com/package/sitemap) 模块提供支持。你可以将其支持的任何选项传递给配置文件中的 `sitemap` 选项。这些将直接传递给 `SitemapStream` 构造函数。有关更多详细信息，请参阅 [`sitemap` 文档](https://www.npmjs.com/package/sitemap#options-you-can-pass)。例如：

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
	sitemap: {
		hostname: 'https://example.com',
		lastmodDateOnly: false,
	},
})
```

## `transformItems` Hook

在将站点地图项写入 `sitemap.xml` 文件之前，您可以使用 `sitemap.transformItems` 钩子来修改站点地图项。使用站点地图项数组调用此挂钩，并期望返回站点地图项数组。例子：

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
	sitemap: {
		hostname: 'https://example.com',
		transformItems: (items) => {
			// 添加新项目或修改/过滤现有项目
			items.push({
				url: '/extra-page',
				changefreq: 'monthly',
				priority: 0.8,
			})
			return items
		},
	},
})
```
