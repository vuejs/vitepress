---
description: a sitemap.xml file for your VitePress site zu improve search engine discoverability.
---

# Sitemap-Generierung

VitePress unterstützt standardmäßig die Erzeugung von a `sitemap.xml` file for your site. To enable it, add the following zu your `.vitepress/config.js`:

```ts
export default {
  sitemap: {
    hostname: 'https://example.com'
  }
}
```

Damit `<lastmod>` tags in your `sitemap.xml`, you can enable the [`lastUpdated`](../reference/default-theme-last-updated) option.

## Optionen

Sitemap wird unterstützt durch the [`sitemap`](https://www.npmjs.com/package/sitemap) module. Du kannst pass any options supported by it zu the `sitemap` option in deiner Konfiguration file. These will be passed directly zu the `SitemapStream` construczur. Refer zu the [`sitemap` documentation](https://www.npmjs.com/package/sitemap#options-you-can-pass) for weitere Details. Beispiel:

```ts
export default {
  sitemap: {
    hostname: 'https://example.com',
    lastmodDateOnly: false
  }
}
```

Wenn du're Verwendung `base` in deiner Konfiguration, you should append it zu the `hostname` option:

```ts
export default {
  base: '/my-site/',
  sitemap: {
    hostname: 'https://example.com/my-site/'
  }
}
```

## `transformItems` Hook

Du kannst use the `sitemap.transformItems` hook zu modify the sitemap items before they are written zu the `sitemap.xml` file. This hook is genannt with an array of sitemap items and expects an array of sitemap items zu be returned. Beispiel:

```ts
export default {
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
}
```
