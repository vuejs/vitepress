# 사이드바 {#sidebar}

사이드바는 문서의 주요 탐색 블록입니다. 사이드바 메뉴를 [`themeConfig.sidebar`](./default-theme-config#sidebar)에서 설정할 수 있습니다.

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

## 기초 {#the-basics}

사이드바 메뉴의 가장 간단한 형태는 링크의 단일 배열을 전달하는 것입니다. 첫 번째 레벨 아이템은 사이드바의 "섹션"을 정의합니다. 해당 섹션의 제목인 `text`와 실제 탐색 링크인 `items`를 포함해야 합니다.

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

`link`는 `/`로 시작하는 실제 파일 경로를 지정해야 합니다. 링크 끝에 슬래시를 추가하면 해당 디렉토리의 `index.md`를 보여줍니다.

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

루트 레벨부터 시작해서 최대 6레벨 깊이까지 사이드바 아이템을 중첩할 수 있습니다. 6레벨 이상 중첩된 아이템은 무시되며 사이드바에 표시되지 않습니다.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: '레벨 1',
        items: [
          {
            text: '레벨 2',
            items: [
              {
                text: '레벨 3',
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

## 다중 사이드바 {#multiple-sidebars}

페이지 경로에 따라 다른 사이드바를 표시할 수 있습니다. 예를 들어, 이 사이트에 표시된 것과 같이 "가이드" 페이지와 "설정" 페이지와 같이 문서의 콘텐츠 섹션을 별도로 생성할 수 있습니다.

이를 위해 먼저 각 원하는 섹션에 대한 디렉토리로 페이지를 구성합니다:

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

그다음, 구성을 업데이트하여 각 섹션에 대한 사이드바를 정의합니다. 이때, 배열 대신 객체를 전달해야 합니다.

```js
export default {
  themeConfig: {
    sidebar: {
      // 이 사이드바는 사용자가
      // `guide` 디렉토리에 있을 때 표시됩니다.
      '/guide/': [
        {
          text: '가이드',
          items: [
            { text: '인덱스', link: '/guide/' },
            { text: '하나', link: '/guide/one' },
            { text: '둘', link: '/guide/two' }
          ]
        }
      ],

      // 이 사이드바는 사용자가
      // `config` 디렉토리에 있을 때 표시됩니다.
      '/config/': [
        {
          text: '설정',
          items: [
            { text: '인덱스', link: '/config/' },
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

사이드바 그룹에 `collapsed` 옵션을 추가하면 각 섹션을 숨기기/보이기 위한 토글 버튼이 나타납니다.

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

모든 섹션은 기본적으로 "열림" 상태입니다. 초기 페이지 로드 시 "닫힘" 상태로 하고 싶다면 `collapsed` 옵션을 `true`로 설정하세요.

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

사이드바 관련 데이터를 반환합니다. 반환된 객체는 다음과 같은 유형을 가집니다:

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
