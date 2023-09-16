# Sitemap Generation

VitePress comes with out-of-the-box support for generating a `sitemap.xml` file for your site. To enable it, add the following to your `.vitepress/config.js`:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  sitemap: {
    hostname: 'https://example.com'
  }
})
```

To have `<lastmod>` tags in your `sitemap.xml`, you can enable the [`lastUpdated`](../reference/default-theme-last-updated) option.

## Options

Sitemap support is powered by the [`sitemap`](https://www.npmjs.com/package/sitemap) module. You can pass any options supported by it to the `sitemap` option in your config file. These will be passed directly to the `SitemapStream` constructor. Refer to the [`sitemap` documentation](https://www.npmjs.com/package/sitemap#options-you-can-pass) for more details. Example:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  sitemap: {
    hostname: 'https://example.com',
    lastmodDateOnly: false
  }
})
```

## `transformItems` Hook

You can use the `sitemap.transformItems` hook to modify the sitemap items before they are written to the `sitemap.xml` file. This hook is called with an array of sitemap items and expects an array of sitemap items to be returned. Example:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  sitemap: {
    hostname: 'https://example.com',
    transformItems: (items) => {
      // add new items or modify/filter existing items
      items.push({
        url: '/extra-page',
        changefreq: 'monthly',
        priority: 0.8
      })
      return items
    }
  }
})
```
