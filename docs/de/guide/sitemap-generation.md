---
description: a sitemap.xml file for your VitePress site to improve search engine discoverability.
---

# Sitemap-Generierung

VitePress unterstützt standardmäßig die Erzeugung einer `sitemap.xml`-Datei für deine Website. Um dies zu aktivieren, füge Folgendes zu deiner `.vitepress/config.js` hinzu:

```ts
export default {
  sitemap: {
    hostname: 'https://example.com'
  }
}
```

Damit deine `sitemap.xml`-Datei `<lastmod>`-Tags enthält, kannst du die [`lastUpdated`](../reference/default-theme-last-updated) option.

## Optionen

Sitemap wird unterstützt durch the [`sitemap`](https://www.npmjs.com/package/sitemap) module. Du kannst pass any options supported by it to the `sitemap` option in your config file. Diese werden direkt an the `SitemapStream` constructor. Siehe die [`sitemap` documentation](https://www.npmjs.com/package/sitemap#options-you-can-pass) für weitere Details. Beispiel:

```ts
export default {
  sitemap: {
    hostname: 'https://example.com',
    lastmodDateOnly: false
  }
}
```

Wenn du're Verwendung `base` in your config, you should append it to the `hostname` option:

```ts
export default {
  base: '/my-site/',
  sitemap: {
    hostname: 'https://example.com/my-site/'
  }
}
```

## `transformItems` Hook

Du kannst use the `sitemap.transformItems` Hook verwenden, um die Sitemap-Einträge vor dem Schreiben in die `sitemap.xml` file. This hook is genannt with an array of sitemap items und erwartet, dass ein Array von Sitemap-Einträgen zurückgegeben wird. Beispiel:

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
