# 푸터 {#footer}

VitePress는 `themeConfig.footer`가 존재할 때 페이지 하단에 전역 푸터를 표시합니다.

```ts
export default {
  themeConfig: {
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present Niceplugin'
    }
  }
}
```

```ts
export interface Footer {
  // 저작권 전에 표시되는 메시지.
  message?: string

  // 실제 저작권 텍스트.
  copyright?: string
}
```

위의 구성은 HTML 문자열도 지원합니다. 예를 들어, 푸터 텍스트에 몇 가지 링크를 구성하고 싶다면, 다음과 같이 구성을 조정할 수 있습니다:

```ts
export default {
  themeConfig: {
    footer: {
      message: '<a href="https://github.com/vuejs/vitepress/blob/main/LICENSE">MIT 라이선스</a>에 따라 릴리즈되었습니다.',
      copyright: '저작권 © 2019-현재 <a href="https://github.com/yyx990803">Evan You</a>'
    }
  }
}
```

::: warning
`message`와 `저작권`에는 `<p>` 요소 안에 렌더링되기 때문에 인라인 요소만 사용할 수 있습니다. 블록 요소를 추가하고 싶다면, 대신 [`layout-bottom`](../guide/extending-default-theme#layout-slots) 슬롯을 사용하는 것을 고려하세요.
:::

푸터는 [사이드바](./default-theme-sidebar)가 보이는 경우에는 표시되지 않습니다.

## 프론트매터 구성 {#frontmatter-config}

이 기능은 프론트매터의 `footer` 옵션을 사용하여 페이지별로 비활성화될 수 있습니다:

```yaml
---
footer: false
---
```
