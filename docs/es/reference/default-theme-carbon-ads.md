# Carbon Ads {#carbon-ads}

VitePress ha incorporado soporte nativo para [Carbon Ads](https://www.carbonads.net/). Al definir las credenciales de Carbon Ads en la configuración, VitePress mostrará anuncios en la página.

```js
export default {
  themeConfig: {
    carbonAds: {
      code: 'tu-código-carbon',
      placement: 'tu-vinculación-carbon'
    }
  }
}
```

Estos valores se utilizan para llamar al script en CDN de carbon como se muestra a continuación.

```js
`//cdn.carbonads.com/carbon.js?serve=${code}&placement=${placement}`
```

Para obtener más información de la configuración de Carbono Ads, por favor visite [Site Carbon Ads](https://www.carbonads.net/).
