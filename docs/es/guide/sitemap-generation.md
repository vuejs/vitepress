# Generación de Sitemap {#sitemap-generation}

VitePress viene con soporte embutido para generar un archivo `sitemap.xml` para su sitio. Para habilitar, adicione lo siguiente a su `.vitepress/config.js`:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  sitemap: {
    hostname: 'https://example.com'
  }
})
```

Para tener tags `<lastmod>` en su `sitemap.xml`, puede habilitar la opción [`lastUpdated`](../reference/default-theme-last-updated).

## Opciones {#options}

El soporte de Sitemap es alimentado por el módulo [`sitemap`](https://www.npmjs.com/package/sitemap). Puede pasar cualquiera de las opciones soportadas por el en la opción `sitemap` de su archivo de configuración. Estos serán pasados directamente al constructor `SitemapStream`. Consulte la [documentación `sitemap`](https://www.npmjs.com/package/sitemap#options-you-can-pass) para más detalles. Ejemplo:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  sitemap: {
    hostname: 'https://example.com',
    lastmodDateOnly: false
  }
})
```

## Hook `transformItems`

Puede usar el hook `sitemap.transformItems` para modificar los items del sitemap antes de ser escritos en el archivo `sitemap.xml`. Este hook es llamado como un _array_ de items sitemap y espera un _array_ de items sitemap como retorno. Ejemplo:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  sitemap: {
    hostname: 'https://example.com',
    transformItems: (items) => {
      // adiciona nuevos items o modifica/filtra items existentes
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
