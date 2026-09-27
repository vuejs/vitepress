---
description: Integriere Carbon Ads mithilfe der integrierten Unterstützung des Standard-Themes in deine VitePress-Website.
---

# Carbon Ads

VitePress has built in native support for [Carbon Ads](https://www.carbonads.net/). Wenn du die Carbon-Ads-Zugangsdaten in der Konfiguration definierst, zeigt VitePress Anzeigen auf der Seite an.

```js
export default {
  themeConfig: {
    carbonAds: {
      code: 'your-carbon-code',
      placement: 'your-carbon-placement',
      format: 'classic'
    }
  }
}
```

Diese Werte werden verwendet, um das Carbon-CDN-Skript wie unten gezeigt aufzurufen.

The `format` option supports `classic`, `responsive`, and `cover`.

```js
`//cdn.carbonads.com/carbon.js?serve=${code}&placement=${placement}&format=${format}`
```

To learn more about Carbon Ads Konfiguration, please visit [Carbon Ads website](https://www.carbonads.net/).
