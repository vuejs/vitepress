# Carbon Ads {#carbon-ads}

VitePress имеет встроенную поддержку [Carbon Ads](https://www.carbonads.net/). Определив в конфиге учётные данные Carbon Ads, VitePress будет отображать рекламу на странице.

```js
export default {
  themeConfig: {
    carbonAds: {
      code: 'код-рекламы',
      placement: 'место-размещения-рекламы'
    }
  }
}
```

Эти значения используются для вызова сценария Carbon CDN, как показано ниже:

```js
;`//cdn.carbonads.com/carbon.js?serve=${code}&placement=${placement}`
```

Чтобы узнать больше о настройке Carbon Ads, посетите [веб-сайт Carbon Ads](https://www.carbonads.net/).
