# Carbon Ads

VitePress has built in native support for [Carbon Ads](https://www.carbonads.net/). By defining the Carbon Ads credentials in config, VitePress will display ads on the page.

```ts
export default {
  themeConfig: {
    carbonAds: {
      code: 'your-carbon-code',
      placement: 'your-carbon-placement'
    }
  }
}
```

These values are used to call carbon CDN script as shown below.

```ts
`https://cdn.carbonads.com/carbon.js?serve=${code}&placement=${placement}`
```

To learn more about Carbon Ads configuration, please visit [Carbon Ads website](https://www.carbonads.net/).
