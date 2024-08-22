# 사이드바 {#sidebar}

사이드바는 문서의 기본 탐색 블록입니다. [`themeConfig.sidebar`](./default-theme-config#sidebar)에서 사이드바 메뉴를 구성할 수 있습니다.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: '가이드',
        items: [
          { text: '소개', link: '/introduction' },
          { text: '시작하기', link: '/getting-started' },
          ...
        ]
      }
    ]
  }
}
```

## 기본 사용법 {#the-basics}

사이드바 메뉴의 가장 간단한 형태는 링크 배열을 전달하는 것입니다. 첫 번째 계층 아이템은 사이드바의 "섹션"을 정의합니다. 이 섹션에는 제목인 `text`와 실제 탐색 링크인 `items`가 포함되어야 합니다.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: '섹션 제목 A',
        items: [
          { text: '아이템 A', link: '/item-a' },
          { text: '아이템 B', link: '/item-b' },
          ...
        ]
      },
      {
        text: '섹션 제목 B',
        items: [
          { text: '아이템 C', link: '/item-c' },
          { text: '아이템 D', link: '/item-d' },
          ...
        ]
      }
    ]
  }
}
```

각 `link`는 `/`로 시작하는 실제 파일 경로를 지정해야 합니다. 링크 끝에 슬래시를 추가하면 해당 디렉터리의 `index.md`를 보여줍니다.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: '가이드',
        items: [
          // 이것은 `/guide/index.md` 페이지를 보여줍니다.
          { text: '소개', link: '/guide/' }
        ]
      }
    ]
  }
}
```

사이드바 아이템을 루트 단계에서 최대 6단계까지 중첩할 수 있습니다. 6단계를 초과하는 중첩 아이템은 무시되며 사이드바에 표시되지 않습니다.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: '1단계',
        items: [
          {
            text: '2단계',
            items: [
              {
                text: '3단계',
                items: [
                  ...
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

## 여러 사이드바 {#multiple-sidebars}

페이지 경로에 따라 다른 사이드바를 표시할 수 있습니다. 예를 들어 이 사이트처럼 문서의 각 섹션을 "가이드"와 "레퍼런스" 페이지에 따라 별도로 만들고 싶을 수 있습니다.

이를 위해 먼저 각 섹션 디렉터리로 페이지를 구성합니다:

```
.
├─ guide/
│  ├─ index.md
│  ├─ one.md
│  └─ two.md
└─ config/
   ├─ index.md
   ├─ three.md
   └─ four.md
```

그런 다음 각 섹션에 대한 사이드바를 정의하도록 구성 파일을 업데이트합니다. 이런 경우에는 배열 대신 객체를 전달해야 합니다.

```js
export default {
  themeConfig: {
    sidebar: {
      // 이 사이드바는 유저가
      // `guide` 디렉토리에 있을 때 표시됩니다.
      '/guide/': [
        {
          text: '가이드',
          items: [
            { text: '개요', link: '/guide/' },
            { text: '하나', link: '/guide/one' },
            { text: '둘', link: '/guide/two' }
          ]
        }
      ],

      // 이 사이드바는 유저가
      // `config` 디렉토리에 있을 때 표시됩니다.
      '/config/': [
        {
          text: '설정',
          items: [
            { text: '개요', link: '/config/' },
            { text: '셋', link: '/config/three' },
            { text: '넷', link: '/config/four' }
          ]
        }
      ]
    }
  }
}
```

## 접을 수 있는 사이드바 그룹 {#collapsible-sidebar-groups}

사이드바 그룹에 `collapsed` 옵션을 추가하면 각 섹션을 접거나 펼칠 수 있는 토글 버튼이 표시됩니다.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: '섹션 제목 A',
        collapsed: false,
        items: [...]
      }
    ]
  }
}
```

모든 섹션은 기본적으로 "열림" 상태입니다. 초기 페이지 로드 시 "닫힘" 상태로 두려면 `collapsed` 옵션을 `true`로 설정합니다.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: '섹션 제목 A',
        collapsed: true,
        items: [...]
      }
    ]
  }
}
```

## `useSidebar` <Badge type="info" text="composable" />

사이드바 관련 데이터를 반환합니다. 반환된 객체는 다음과 같은 타입을 가집니다:

```ts
export interface DocSidebar {
  isOpen: Ref<boolean>
  sidebar: ComputedRef<DefaultTheme.SidebarItem[]>
  sidebarGroups: ComputedRef<DefaultTheme.SidebarItem[]>
  hasSidebar: ComputedRef<boolean>
  hasAside: ComputedRef<boolean>
  leftAside: ComputedRef<boolean>
  isSidebarEnabled: ComputedRef<boolean>
  open: () => void
  close: () => void
  toggle: () => void
}
```

**예제:**

```vue
<script setup>
import { useSidebar } from 'vitepress/theme'

const { hasSidebar } = useSidebar()
</script>

<template>
  <div v-if="hasSidebar">사이드바가 있을 때만 보여줍니다</div>
</template>
```
