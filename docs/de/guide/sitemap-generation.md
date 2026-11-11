---
description: Eine sitemap.xml-Datei für deine VitePress-Website zur besseren Auffindbarkeit durch Suchmaschinen.
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

Damit deine `sitemap.xml`-Datei `<lastmod>`-Tags enthält, kannst du die Option [`lastUpdated`](../reference/default-theme-last-updated) aktivieren.

## Optionen

Die Sitemap wird durch das [`sitemap`](https://www.npmjs.com/package/sitemap)-Modul unterstützt. Du kannst alle von ihm unterstützten Optionen an die `sitemap`-Option deiner Konfigurationsdatei übergeben. Diese werden direkt an den `SitemapStream`-Konstruktor übergeben. Siehe die [`sitemap`-Dokumentation](https://www.npmjs.com/package/sitemap#options-you-can-pass) für weitere Details. Beispiel:

```ts
export default {
  sitemap: {
    hostname: 'https://example.com',
    lastmodDateOnly: false
  }
}
```

Wenn du `base` in deiner Konfiguration verwendest, solltest du den Wert an die Option `hostname` anhängen:

```ts
export default {
  base: '/my-site/',
  sitemap: {
    hostname: 'https://example.com/my-site/'
  }
}
```

## `transformItems` Hook

Du kannst den `sitemap.transformItems`-Hook verwenden, um die Sitemap-Einträge vor dem Schreiben in die Datei `sitemap.xml` zu verändern. Dieser Hook wird mit einem Array von Sitemap-Einträgen aufgerufen und erwartet, dass ein Array von Sitemap-Einträgen zurückgegeben wird. Beispiel:

```ts
export default {
  sitemap: {
    hostname: 'https://example.com',
    transformItems: (items) => {
      // Neue Einträge hinzufügen oder vorhandene Einträge ändern/filtern
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
