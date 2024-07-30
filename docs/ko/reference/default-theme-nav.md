# Nav {#nav}

Nav 페이지 상단에 표시되는 내비게이션 바입니다. 사이트 제목, 전역 메뉴 링크 등을 포함하고 있습니다.

## 사이트 제목 및 로고 {#site-title-and-logo}

기본적으로 nav는 [`config.title`](./site-config#title) 값이 참조하는 사이트 제목을 표시합니다. nav에 표시되는 내용을 변경하고 싶다면 `themeConfig.siteTitle` 옵션에 사용자 정의 텍스트를 정의할 수 있습니다.

```js
export default {
  themeConfig: {
    siteTitle: 'My Custom Title'
  }
}
```

사이트에 로고가 있다면 이미지 경로를 전달하여 표시할 수 있습니다. 로고를 `public` 디렉터리에 위치시키고, 그 절대 경로를 정의해야 합니다.

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg'
  }
}
```

로고를 추가하면 사이트 제목과 함께 표시됩니다. 로고만 필요하고 사이트 제목 텍스트를 숨기고 싶다면 `siteTitle` 옵션에 `false`를 설정하세요.

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg',
    siteTitle: false
  }
}
```

`alt` 속성을 추가하거나 어두운/밝은 모드에 따라 로고를 커스터마이즈하고 싶다면 객체로써 로고를 전달할 수 있습니다. 자세한 내용은 [`themeConfig.logo`](./default-theme-config#logo)를 참조하세요.

## 내비게이션 링크 {#navigation-links}

`themeConfig.nav` 옵션을 정의하여 nav에 링크를 추가할 수 있습니다.

```js
export default {
  themeConfig: {
    nav: [
      { text: '가이드', link: '/guide' },
      { text: '설정', link: '/config' },
      { text: '변경사항', link: 'https://github.com/...' }
    ]
  }
}
```

`text`는 nav에 표시되는 실제 텍스트이고, `link`는 텍스트를 클릭할 때 이동할 링크입니다. 링크는 실제 파일의 경로를 `.md` 접두어 없이 설정하고 항상 `/`로 시작해야 합니다.

Nav 링크는 드롭다운 메뉴일 수도 있습니다. 이를 위해 링크 옵션에 `items` 키를 설정하세요.

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

드롭다운 메뉴 제목(`위 예제에서의 드롭다운 메뉴`)은 드롭다운 대화상자를 열 버튼이 되므로 `link` 속성을 가질 수 없습니다.

더 많은 중첩된 항목을 전달하여 드롭다운 메뉴 항목에 "섹션"을 추가할 수도 있습니다.

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

현재 페이지가 일치하는 경로에 있을 때 Nav 메뉴 항목이 강조 표시됩니다. 매치되길 원하는 경로를 커스터마이징하고 싶다면 문자열 값으로 `activeMatch` 속성과 정규식을 정의하세요.

```js
export default {
  themeConfig: {
    nav: [
      // 사용자가 `/config/` 경로에 있을 때
      // 이 링크는 활성 상태가 됩니다.
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
`activeMatch`는 정규식 문자열로 예상되지만, 문자열로 정의해야 합니다. 실제 RegExp 객체를 여기서 사용할 수 없는 이유는 빌드 시간 동안 직렬화가 가능하지 않기 때문입니다.
:::

### 링크의 "target" 및 "rel" 속성 커스터마이즈 {#customize-link-s-target-and-rel-attributes}

기본적으로 VitePress는 링크가 외부 링크인지에 따라 `target` 및 `rel` 속성을 자동으로 결정합니다. 하지만 원한다면 이들도 커스터마이징할 수 있습니다.

```js
export default {
  themeConfig: {
    nav: [
      {
        text: '상품',
        link: 'https://www.thegithubshop.com/',
        target: '_self',
        rel: 'sponsored'
      }
    ]
  }
}
```

## 소셜 링크 {#social-links}

[`socialLinks`](./default-theme-config#sociallinks)를 참조하세요.

## 사용자 정의 구성 요소 {#custom-components}

`component` 옵션을 사용하여 탐색 모음에 사용자 정의 구성 요소를 포함할 수 있습니다. `component` 키는 Vue 구성 요소 이름이어야 하며, [Theme.enhanceApp](../guide/custom-theme#theme-interface)을 사용하여 전역으로 등록해야 합니다.

```js
// .vitepress/config.js
export default {
  themeConfig: {
    nav: [
      {
        text: 'My Menu',
        items: [
          {
            component: 'MyCustomComponent',
            // 구성 요소에 전달할 선택적 props
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

그런 다음, 구성 요소를 전역으로 등록해야 합니다:

```js
// .vitepress/theme/index.js
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

구성 요소가 탐색 모음에 렌더링됩니다. VitePress는 구성 요소에 다음과 같은 추가 props를 제공합니다:

- `screenMenu`: 구성 요소가 모바일 탐색 메뉴 내부에 있는지 여부를 나타내는 선택적 boolean 값

예제는 [여기](https://github.com/vuejs/vitepress/tree/main/__tests__/e2e/.vitepress)에서 확인할 수 있습니다.
