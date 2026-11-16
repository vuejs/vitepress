---
description: Integriere Carbon Ads mithilfe der integrierten Unterstützung des Standard-Themes in deine VitePress-Website.
---

# Carbon Ads

VitePress bietet integrierte Unterstützung für [Carbon Ads](https://www.carbonads.net/). Wenn du die Carbon-Ads-Zugangsdaten in der Konfiguration definierst, zeigt VitePress Anzeigen auf der Seite an.

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

Die Option `format` unterstützt `classic`, `responsive` und `cover`.

```js
`//cdn.carbonads.com/carbon.js?serve=${code}&placement=${placement}&format=${format}`
```

Weitere Informationen zur Konfiguration von Carbon Ads findest du auf der [Carbon-Ads-Website](https://www.carbonads.net/).
