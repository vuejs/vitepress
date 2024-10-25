# 푸터 {#footer}

`themeConfig.footer`가 존재하면 VitePress는 페이지 하단에 전역 푸터를 표시합니다.

```ts
export default {
  themeConfig: {
    footer: {
      message: 'MIT 라이선스에 따라 릴리즈되었습니다.',
      copyright: '저작권 © 2019-현재 홍길동'
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

위의 구성은 HTML 문자열도 지원합니다. 예를 들어, 푸터 텍스트에 링크를 포함하고 싶다면, 다음과 같이 구성을 수정하면 됩니다:

```ts
export default {
  themeConfig: {
    footer: {
      message: '<a href="https://github.com/vuejs/vitepress/blob/main/LICENSE">MIT 라이선스</a>에 따라 릴리즈되었습니다.',
      copyright: '저작권 © 2019-현재 <a href="https://github.com/niceplugin">홍길동</a>'
    }
  }
}
```

::: warning
`message`와 `copyright`는 `<p>` 엘리먼트 내부에 렌더링되므로 인라인 엘리먼트만 사용할 수 있습니다. 블록 엘리먼트를 추가하려면 [`layout-bottom`](../guide/extending-default-theme#layout-slots) 슬롯을 사용하는 것이 좋습니다.
:::

[사이드바](./default-theme-sidebar)가 표시되는 경우 푸터는 표시되지 않습니다.

## 전문에서 설정하기 {#frontmatter-config}

이 기능은 전문의 `footer` 옵션을 사용하여 페이지별로 비활성화 할 수 있습니다.

```yaml
---
footer: false
---
```
