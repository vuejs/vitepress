# 카본 광고 {#carbon-ads}

VitePress는 [카본 광고](https://www.carbonads.net/)에 대한 내장된 네이티브 지원을 제공합니다. config에서 카본 광고 자격증명을 정의함으로써, VitePress는 페이지에 광고를 표시합니다.

```js
export default {
  themeConfig: {
    carbonAds: {
      code: '당신의-카본-코드',
      placement: '당신의-카본-위치'
    }
  }
}
```

이 값들은 아래와 같이 카본 CDN 스크립트를 호출하는 데 사용됩니다.

```js
`//cdn.carbonads.com/carbon.js?serve=${code}&placement=${placement}`
```

카본 광고 설정에 대해 자세히 알아보려면, [카본 광고 웹사이트](https://www.carbonads.net/)를 방문해 주십시오.
