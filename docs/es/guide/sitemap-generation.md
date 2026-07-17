---
description: Genera un archivo sitemap.xml para tu sitio VitePress para mejorar la visibilidad en motores de búsqueda.
---

# Generación de Sitemap {#sitemap-generation}

VitePress incluye soporte integrado para generar un archivo `sitemap.xml` para tu sitio. Para habilitarlo, agrega lo siguiente a tu archivo `.vitepress/config.js`:

```ts
export default {
  sitemap: {
    hostname: 'https://ejemplo.com'
  }
}
```

Para tener etiquetas `<lastmod>` en tu `sitemap.xml`, puedes habilitar la opción [`lastUpdated`](../reference/default-theme-last-updated).

## Opciones {#options}

El soporte de Sitemap se basa en el módulo [`sitemap`](https://www.npmjs.com/package/sitemap). Puedes pasar cualquiera opciones soportadas con este módulo a la opción `sitemap` en tu archivo de configuración. Estas opciones se pasarán directamente al constructor de `SitemapStream`. Consulta la documentación de [`sitemap`](https://www.npmjs.com/package/sitemap#options-you-can-pass) para más detalles. Ejemplo:
```ts
export default {
  sitemap: {
    hostname: 'https://ejemplo.com',
    lastmodDateOnly: false
  }
}
```

Si estás usando `base` en tu configuración, debes agregarlo a la opción `hostname`:

```ts
export default {
  base: '/my-site/',
  sitemap: {
    hostname: 'https://ejemplo.com/mi-pagina/'
  }
}
```

## Hook `transformItems` {transformitems-hook}

Puede usar el hook `sitemap.transformItems` para modificar los elementos del sitemap antes de que se escriban en el archivo `sitemap.xml`. Este hook se llama con un _array_ de elementos del mapa del sitio y espera que se devuelva un _array_ de elementos del sitemap. Ejemplo:

```ts
export default {
  sitemap: {
    hostname: 'https://ejemplo.com',
    transformItems: (items) => {
      // agregar nuevos elementos o modificar/filtrar elementos existentes
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
