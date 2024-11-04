# 기본 테마 구성 {#default-theme-config}

테마 구성은 테마를 커스텀 할 수 있게 해줍니다. 구성 파일에서 `themeConfig` 옵션을 통해 테마 구성을 정의할 수 있습니다:

```ts
export default {
  lang: 'ko-KR',
  title: 'VitePress',
  description: 'Vite 및 Vue로 기반 정적 사이트 생성기.',

  // 테마 관련 구성.
  themeConfig: {
    logo: '/logo.svg',
    nav: [...],
    sidebar: { ... }
  }
}
```

**이 페이지에 문서화된 옵션은 기본 테마에만 적용됩니다.** 다른 테마는 다른 테마 구성이 필요합니다. 커스텀 테마를 사용하는 경우, 테마 구성 객체는 테마에 전달되어 테마가 이를 기반으로 다르게 동작할 수 있습니다.

## i18nRouting

- 타입: `boolean`

로케일을 `ko`로 변경하면 URL이 `/foo` (또는 `/en/foo/`)에서 `/ko/foo`로 변경됩니다. 이 동작을 비활성화하려면 `themeConfig.i18nRouting`을 `false`로 설정하세요.

## logo

- 타입: `ThemeableImage`

네비게이션 바에 사이트 제목 바로 앞에 표시할 로고 파일입니다. 경로 문자열 또는 라이트/다크 모드에 대해 다른 로고를 설정할 수 있는 객체를 사용합니다.

```ts
export default {
  themeConfig: {
    logo: '/logo.svg'
  }
}
```

```ts
type ThemeableImage =
  | string
  | { src: string; alt?: string }
  | { light: string; dark: string; alt?: string }
```

## siteTitle

- 타입: `string | false`

이 항목을 커스텀하여 네비게이션 바의 기본 사이트 제목(애플리케이션 구성의 `title`)을 대체할 수 있습니다. `false`로 설정하면 네비게이션 바에서 제목이 비활성화됩니다. 이미 사이트 제목 텍스트가 포함된 `logo`가 있을 때 유용합니다.

```ts
export default {
  themeConfig: {
    siteTitle: 'Hello World'
  }
}
```

## nav

- 타입: `NavItem`

네비게이션 바 메뉴 아이템의 구성입니다. 자세한 내용은 [기본 테마: 네비게이션 바](./default-theme-nav#navigation-links)를 참고하세요.

```ts
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

```ts
type NavItem = NavItemWithLink | NavItemWithChildren

interface NavItemWithLink {
  text: string
  link: string
  activeMatch?: string
  target?: string
  rel?: string
  noIcon?: boolean
}

interface NavItemChildren {
  text?: string
  items: NavItemWithLink[]
}

interface NavItemWithChildren {
  text?: string
  items: (NavItemChildren | NavItemWithLink)[]
  activeMatch?: string
}
```

## sidebar

- 타입: `Sidebar`

사이드바 메뉴 항목에 대한 구성입니다. 자세한 내용은 [기본 테마: 사이드바](./default-theme-sidebar)에서 확인하세요.

```ts
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

```ts
export type Sidebar = SidebarItem[] | SidebarMulti

export interface SidebarMulti {
  [path: string]: SidebarItem[] | { items: SidebarItem[]; base: string }
}

export type SidebarItem = {
  /**
   * 아이템의 텍스트 레이블
   */
  text?: string

  /**
   * 아이템의 링크
   */
  link?: string

  /**
   * 아이템의 하위 항목
   */
  items?: SidebarItem[]

  /**
   * 명시하지 않은 경우, 그룹을 접을 수 없습니다.
   *
   * `true`: 그룹은 접을 수 있고 기본적으로 접혀 있습니다.
   *
   * `false`: 그룹은 접을 수 있고 기본적으로 펼쳐져 있습니다.
   */
  collapsed?: boolean

  /**
   * 하위 아이템에 대한 기본 경로입니다.
   */
  base?: string

  /**
   * 이전/다음 페이지의 푸터에 나타나는 텍스트를 커스텀 합니다.
   */
  docFooterText?: string

  rel?: string
  target?: string
}
```

## aside

- 타입: `boolean | 'left'`
- 기본값: `true`
- [전문](./frontmatter-config#aside)을 통해 페이지별로 재정의할 수 있습니다.

`false`: 어사이드 컨테이너가 렌더링되지 않습니다.\
`true`: 어사이드가 오른쪽에 렌더링됩니다.\
`left`: 어사이드가 왼쪽에 렌더링됩니다.

모든 뷰포트에서 비활성화하려면 `outline: false`를 사용해야 합니다.

## outline

- 타입: `Outline | Outline['level'] | false`
- [전문](./frontmatter-config#outline)을 사용해 각 페이지별로 계층 구조를 재정의할 수 있습니다.

이 값을 `false`로 설정하면 아웃라인(개요) 컨테이너가 렌더링되지 않습니다. 자세한 내용은 아래 인터페이스를 참고하세요:

```ts
interface Outline {
  /**
   * 아웃라인에 표시할 제목 레벨.
   * 단일 숫자는 해당 레벨의 제목만 표시됨을 의미합니다.
   * 튜플이 전달되면, 첫 번째 숫자는 최소 수준을, 두 번째 숫자는 최대 수준을 나타냅니다.
   * `'deep'`은 `[2, 6]`과 동일하며, 이는 `<h2>`에서 `<h6>`까지의 모든 제목이 표시됨을 의미합니다.
   *
   * @default 2
   */
  level?: number | [number, number] | 'deep'

  /**
   * 아웃라인에 표시될 제목.
   *
   * @default 'On this page'
   */
  label?: string
}
```

## socialLinks

- 타입: `SocialLink[]`

이 옵션을 정의하여 네비게이션 바에 소셜 링크를 아이콘과 함께 표시할 수 있습니다.

```ts
export default {
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
      { icon: 'twitter', link: '...' },
      // SVG를 문자열로 전달하여 커스텀 아이콘을 추가할 수도 있습니다:
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-350Z"/></svg>'
        },
        link: '...',
        // 접근성을 위해 커스텀 레이블을 포함할 수도 있습니다 (선택 사항이지만 권장됨):
        ariaLabel: '스타 링크'
      }
    ]
  }
}
```

```ts
interface SocialLink {
  icon: string | { svg: string }
  link: string
  ariaLabel?: string
}
```

## footer

- 타입: `Footer`
- [전문](./frontmatter-config#footer)을 사용해 페이지별로 재정의할 수 있습니다.

푸터 구성입니다. 메시지 또는 저작권 텍스트를 푸터에 추가할 수 있지만, 이는 페이지에 사이드바가 포함되지 않은 경우에만 표시됩니다. 이는 디자인상의 이유 때문입니다.

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
  message?: string
  copyright?: string
}
```

## editLink

- 타입: `EditLink`
- [전문](./frontmatter-config#footer)을 사용해 페이지별로 재정의할 수 있습니다.

편집 링크 기능을 사용하면 GitHub 또는 GitLab과 같은 Git 관리 서비스에서 페이지를 편집할 수 있는 링크를 표시할 수 있습니다. 자세한 내용은 [기본 테마: 편집 링크](./default-theme-edit-link)를 참고하세요.

```ts
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'GitHub에서 이 페이지 편집하기'
    }
  }
}
```

```ts
export interface EditLink {
  pattern: string
  text?: string
}
```

## lastUpdated

- 타입: `LastUpdatedOptions`

마지막 업데이트된 날짜의 텍스트와 날짜 형식을 커스텀 할 수 있습니다.

```ts
export default {
  themeConfig: {
    lastUpdated: {
      text: '마지막 업데이트 날짜',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    }
  }
}
```

```ts
export interface LastUpdatedOptions {
  /**
   * @default 'Last updated'
   */
  text?: string

  /**
   * @default
   * {dateStyle: 'short', timeStyle: 'short'}
   */
  formatOptions?: Intl.DateTimeFormatOptions & { forceLocale?: boolean }
}
```

## algolia

- 타입: `AlgoliaSearch`

[Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch)를 사용하여 문서 사이트를 검색할 수 있는 옵션입니다. 자세한 내용은 [기본 테마: 검색](./default-theme-search)을 참고하세요.

```ts
export interface AlgoliaSearchOptions extends DocSearchProps {
  locales?: Record<string, Partial<DocSearchProps>>
}
```

전체 옵션은 [여기](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts)에서 확인하세요.

## carbonAds {#carbon-ads}

- 타입: `CarbonAdsOptions`

[Carbon Ads](https://www.carbonads.net/)를 표시할 수 있는 옵션입니다.

```ts
export default {
  themeConfig: {
    carbonAds: {
      code: 'your-carbon-code',
      placement: 'your-carbon-placement'
    }
  }
}
```

```ts
export interface CarbonAdsOptions {
  code: string
  placement: string
}
```

자세한 내용은 [기본 테마: 카본 광고](./default-theme-carbon-ads)를 참고하세요.

## docFooter

- 타입: `DocFooter`

이 옵션은 이전 및 다음 링크에 표시되는 텍스트를 커스텀하는 데 사용합니다. 영어로 문서를 작성하지 않는 경우 유용합니다. 또한 이전/다음 링크를 전역적으로 비활성화할 수도 있습니다. 선택적으로 이전/다음 링크를 활성화/비활성화하려면 [전문](./default-theme-prev-next-links)을 사용합니다.

```ts
export default {
  themeConfig: {
    docFooter: {
      prev: '이전 페이지',
      next: '다음 페이지'
    }
  }
}
```

```ts
export interface DocFooter {
  prev?: string | false
  next?: string | false
}
```

## darkModeSwitchLabel

- 타입: `string`
- 기본값: `Appearance`

이 옵션은 다크 모드 스위치 레이블을 커스텀할 때 사용합니다. 이 레이블은 모바일 뷰에서만 표시됩니다.

## lightModeSwitchTitle

- 타입: `string`
- 기본값: `Switch to light theme`

이 옵션은 라이트 모드 스위치 타이틀을 커스텀할 때 사용합니다. 이것은 호버(hover)할 때 나타납니다.

## darkModeSwitchTitle

- 타입: `string`
- 기본값: `Switch to dark theme`

호버 시 나타나는 다크 모드 스위치 타이틀을 커스텀할 때 사용합니다.

## sidebarMenuLabel

- 타입: `string`
- 기본값: `Menu`

사이드바 메뉴 레이블을 커스텀 할 때 사용합니다. 이 레이블은 모바일 뷰에서만 표시됩니다.

## returnToTopLabel

- 타입: `string`
- 기본값: `Return to top`

맨 위로 이동 버튼의 레이블을 커스텀 할 때 사용합니다. 이 레이블은 모바일 뷰에서만 표시됩니다.

## langMenuLabel

- 타입: `string`
- 기본값: `Change language`

네비게이션 바에서 언어 토글 버튼의 aria-label을 커스텀 할 때 사용합니다. 이는 [i18n](../guide/i18n)을 사용하는 경우에만 사용됩니다.

## externalLinkIcon

- 타입: `boolean`
- 기본값: `false`

마크다운의 외부 링크 옆에 외부 링크 아이콘을 표시할지 여부를 설정합니다.
