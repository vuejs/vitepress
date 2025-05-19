# 카본 광고 {#carbon-ads}

VitePress는 [카본 광고](https://www.carbonads.net/)에 대한 기본적인 지원을 제공합니다. 구성에서 카본 광고 자격 증명을 정의하면 VitePress는 페이지에 광고를 표시합니다.

```js
export default {
  themeConfig: {
    carbonAds: {
      code: 'your-carbon-code',
      placement: 'your-carbon-placement'
    }
  }
}
```

이 값들은 아래와 같이 카본 CDN 스크립트를 호출하는 데 사용됩니다.

```js
`//cdn.carbonads.com/carbon.js?serve=${code}&placement=${placement}`
```

카본 광고 구성에 대해 더 알고 싶다면 [카본 광고 웹사이트](https://www.carbonads.net/)를 방문하세요.
