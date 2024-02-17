# Carbon Ads {#carbon-ads}

VitePress tem suporte embutido para [Carbon Ads](https://www.carbonads.net/). Ao definir as credenciais Carbon Ads na configuração, VitePress mostrará anúncios na página.

```js
export default {
  themeConfig: {
    carbonAds: {
      code: 'seu-código-carbon',
      placement: 'sua-veiculação-carbon'
    }
  }
}
```

Esses valores são usados para chamar o sript em CDN do carbon como mostrado abaixo.

```js
`//cdn.carbonads.com/carbon.js?serve=${code}&placement=${placement}`
```

Para aprender mais sobre a configuração Carbon Ads, por favor visite [Site Carbon Ads](https://www.carbonads.net/).
