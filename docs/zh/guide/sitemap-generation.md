# 生成 sitemap {#sitemap-generation}

VitePress 提供开箱即用的配置，为站点生成 `sitemap.xml` 文件。要启用它，请将以下内容添加到 `.vitepress/config.js` 中：

```ts
export default {
  sitemap: {
    hostname: 'https://example.com'
  }
}
```

要在 `sitemap.xml` 中包含 `<lastmod>` 标签，可以启用 [`lastUpdated`](../reference/default-theme-last-updated) 选项。

## 选项 {#options}

VitePress 的 sitemap 由 [`sitemap`](https://www.npmjs.com/package/sitemap) 模块提供支持。可以将该模块支持的选项传递给配置文件中的 `sitemap` 选项。这些选项将直接传递给 `SitemapStream` 构造函数。有关更多详细信息，请参阅 [`sitemap` 文档](https://www.npmjs.com/package/sitemap#options-you-can-pass)。例如：

```ts
export default {
  sitemap: {
    hostname: 'https://example.com',
    lastmodDateOnly: false
  }
}
```

如果在配置中使用 `base`，则应将其追加到 `hostname` 选项中：

```ts
export default {
  base: '/my-site/',
  sitemap: {
    hostname: 'https://example.com/my-site/'
  }
}
```

## `transformItems` Hook

在将 sitemap 写入 `sitemap.xml` 文件之前，可以使用 `sitemap.transformItems` 钩子来修改 sitemap。使用 sitemap 调用该钩子，应返回 sitemap 数组。例如：

```ts
export default {
  sitemap: {
    hostname: 'https://example.com',
    transformItems: (items) => {
      // 添加新项目或修改/筛选现有选项
      items.push({
        url: '/extra-page',
        changefreq: 'monthly',
        priority: 0.8
      })
      return items
    }
  }
}
```
