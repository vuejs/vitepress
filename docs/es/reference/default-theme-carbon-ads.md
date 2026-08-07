---
description: Integra Carbon Ads en tu sitio VitePress usando el soporte integrado del tema predeterminado.
---

# Carbon Ads {#carbon-ads}

VitePress ha incorporado soporte nativo para [Carbon Ads](https://www.carbonads.net/). Al definir las credenciales de Carbon Ads en la configuración, VitePress mostrará anuncios en la página.

```js
export default {
  themeConfig: {
    carbonAds: {
      code: 'tu-código-carbon',
      placement: 'tu-vinculación-carbon',
      format: 'classic'
    }
  }
}
```

Estos valores se utilizan para llamar al script en CDN de carbon como se muestra a continuación.

La opción `format` admite `classic`, `responsive` y `cover`.

```js
`//cdn.carbonads.com/carbon.js?serve=${code}&placement=${placement}&format=${format}`
```

Para obtener más información de la configuración de Carbono Ads, por favor visite [Site Carbon Ads](https://www.carbonads.net/).
