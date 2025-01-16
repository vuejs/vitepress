# 네비게이션 바 {#nav}

네비게이션 바는 페이지 상단에 표시되며, 사이트 제목, 전역 메뉴 링크 등이 포함됩니다.

## 사이트 제목 및 로고 {#site-title-and-logo}

기본적으로 네비게이션 바는 [`config.title`](./site-config#title) 값을 참조하여 사이트 제목을 표시합니다. 여기에 표시되는 내용을 변경하려면 `themeConfig.siteTitle` 옵션에 커스텀 텍스트를 정의합니다.

```js
export default {
  themeConfig: {
    siteTitle: 'My Custom Title'
  }
}
```

사이트에 로고가 있는 경우, 이미지의 경로를 전달하여 로고를 표시할 수 있습니다. 로고는 `public` 폴더에 배치하고, 이것의 절대 경로를 정의해야 합니다.

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg'
  }
}
```

로고를 추가하면 사이트 제목과 함께 표시됩니다. 로고만 필요하고 사이트 제목 텍스트를 숨기고 싶다면, `siteTitle` 옵션을 `false`로 설정하면 됩니다.

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg',
    siteTitle: false
  }
}
```

로고에 `alt` 어트리뷰트를 추가하거나 다크/라이트 모드에 따라 커스터마이징 하려면, 로고를 객체 형태로 전달해야 합니다. 자세한 내용은 [`themeConfig.logo`](./default-theme-config#logo)를 참고하세요.

## 네비게이션 바 링크 {#navigation-links}

`themeConfig.nav` 옵션을 정의하여 네비게이션 바에 링크를 추가할 수 있습니다.

```js
export default {
  themeConfig: {
    nav: [
      { text: '가이드', link: '/guide' },
      { text: '구성', link: '/config' },
      { text: '변경사항', link: 'https://github.com/...' }
    ]
  }
}
```

`text`는 네비게이션 바에 표시되는 실제 텍스트이며, `link`는 텍스트를 클릭했을 때 이동할 링크입니다. 링크의 경로는 `.md` 접미사 없이 실제 파일 경로로 설정하며, 항상 `/`로 시작해야 합니다.

네비게이션 바 링크는 드롭다운 메뉴가 될 수 있습니다. 이를 위해 `link` 옵션에 `items` 키를 설정합니다.

```js
export default {
  themeConfig: {
    nav: [
      { text: '가이드', link: '/guide' },
      {
        text: '드롭다운 메뉴',
        items: [
          { text: '항목 A', link: '/item-1' },
          { text: '항목 B', link: '/item-2' },
          { text: '항목 C', link: '/item-3' }
        ]
      }
    ]
  }
}
```

드롭다운 메뉴의 제목(위 예제에서 `드롭다운 메뉴`)은 드롭다운 대화 상자를 여는 버튼이 되므로 `link` 프로퍼티를 가질 수 없습니다.

드롭다운 메뉴 아이템에 더 많은 중첩된 아이템을 전달하여 "섹션"을 추가할 수도 있습니다.

```js
export default {
  themeConfig: {
    nav: [
      { text: '가이드', link: '/guide' },
      {
        text: '드롭다운 메뉴',
        items: [
          {
            // 섹션의 제목.
            text: '섹션 A 제목',
            items: [
              { text: '섹션 A 항목 A', link: '...' },
              { text: '섹션 B 항목 B', link: '...' }
            ]
          }
        ]
      },
      {
        text: '드롭다운 메뉴',
        items: [
          {
            // 제목을 생략할 수도 있습니다.
            items: [
              { text: '섹션 A 항목 A', link: '...' },
              { text: '섹션 B 항목 B', link: '...' }
            ]
          }
        ]
      }
    ]
  }
}
```

### 링크의 "active" 상태 커스터마이징 {#customize-link-s-active-state}

네비게이션 바 메뉴 아이템은 현재 페이지가 매칭되는 경로에 있을 때 강조 표시됩니다. 매칭할 경로를 커스터마이징 하려면 `activeMatch` 프로퍼티에 정규식을 문자열 값으로 정의합니다.

```js
export default {
  themeConfig: {
    nav: [
      // `/config/` 경로에 있을 때
      // 이 링크는 활성화된 상태가 됩니다.
      {
        text: '가이드',
        link: '/guide',
        activeMatch: '/config/'
      }
    ]
  }
}
```

::: warning
`activeMatch`는 정규식이어야 하지만, 문자열로 정의해야 합니다. 실제 RegExp 객체를 사용할 수 없는 이유는 빌드하는 동안 직렬화할 수 없기 때문입니다.
:::

### 링크의 "target" 및 "rel" 어트리뷰트 커스터마이징 {#customize-link-s-target-and-rel-attributes}

기본적으로 VitePress는 링크가 외부 링크인지 여부에 따라 `target`과 `rel` 어트리뷰트를 자동으로 결정합니다. 하지만 원한다면 이를 커스터마이징 할 수도 있습니다.

```js
export default {
  themeConfig: {
    nav: [
      {
        text: 'GitHub 쇼핑몰',
        link: 'https://www.thegithubshop.com/',
        target: '_self',
        rel: 'sponsored' // https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links
      }
    ]
  }
}
```

## 소셜 링크 {#social-links}

[`socialLinks`](./default-theme-config#sociallinks)를 참고하세요.

## 커스텀 컴포넌트 {#custom-components}

네비게이션 바에 커스텀 컴포넌트를 포함하려면 `component` 옵션을 사용하세요. `component` 키는 Vue 컴포넌트 이름이어야 하며, [Theme.enhanceApp](../guide/custom-theme#theme-interface)을 사용하여 전역적으로 등록해야 합니다.

```js [.vitepress/config.js]
export default {
  themeConfig: {
    nav: [
      {
        text: 'My Menu',
        items: [
          {
            component: 'MyCustomComponent',
            // 컴포넌트에 전달할 선택적 프로퍼티
            props: {
              title: 'My Custom Component'
            }
          }
        ]
      },
      {
        component: 'AnotherCustomComponent'
      }
    ]
  }
}
```

그런 다음, 컴포넌트를 전역적으로 등록해야 합니다:

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'

import MyCustomComponent from './components/MyCustomComponent.vue'
import AnotherCustomComponent from './components/AnotherCustomComponent.vue'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MyCustomComponent', MyCustomComponent)
    app.component('AnotherCustomComponent', AnotherCustomComponent)
  }
}
```

컴포넌트는 네비게이션 바에 렌더링될 것입니다. VitePress는 컴포넌트에 다음과 같은 추가 프로퍼티를 제공합니다:

- `screenMenu`: 컴포넌트가 모바일 네비게이션 바 메뉴 내부에 있는지를 나타내는 선택적 boolean 값

e2e 테스트 예제를 [여기](https://github.com/vuejs/vitepress/tree/main/__tests__/e2e/.vitepress)에서 확인할 수 있습니다.
