# 기본 테마 설정 {#default-theme-config}

테마 설정을 통해 테마를 사용자 정의할 수 있습니다. 설정 파일의 `themeConfig` 옵션을 통해 테마 설정을 정의할 수 있습니다:

```ts
export default {
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue로 구동되는 정적 사이트 생성기.',

  // 테마 관련 설정.
  themeConfig: {
    logo: '/logo.svg',
    nav: [...],
    sidebar: { ... }
  }
}
```

**이 페이지에 문서화된 옵션은 기본 테마에만 적용됩니다.** 다른 테마는 다른 테마 설정을 기대합니다. 커스텀 테마를 사용할 때, 테마 설정 객체는 테마로 전달되어 테마가 그것에 따라 조건적인 동작을 정의할 수 있습니다.

## i18nRouting

- 타입: `boolean`

예를 들어 `zh`로 로케일을 변경하면 URL이 `/foo` (또는 `/en/foo/`)에서 `/zh/foo`로 변경됩니다. 이 동작을 비활성화하려면 `themeConfig.i18nRouting`을 `false`로 설정하세요.

## logo

- 타입: `ThemeableImage`

내비게이션 바에 사이트 제목 바로 앞에 표시되는 로고 파일입니다. 경로 문자열을 받거나, 밝은/어두운 모드에 따라 다른 로고를 설정하기 위해 객체를 사용할 수 있습니다.

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

내비게이션에서 기본 사이트 제목(`app config`의 `title`)을 대체하기 위해 이 항목을 사용자 정의할 수 있습니다. `false`로 설정하면 내비게이션의 제목이 비활성화됩니다. `logo`가 이미 사이트 제목 텍스트를 포함하고 있을 때 유용합니다.

```ts
export default {
  themeConfig: {
    siteTitle: 'Hello World'
  }
}
```

## nav

- 타입: `NavItem`

내비게이션 메뉴 항목의 설정입니다. 자세한 내용은 [기본 테마: Nav](./default-theme-nav#navigation-links)에서 확인할 수 있습니다.

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

사이드바 메뉴 항목의 설정입니다. 자세한 내용은 [기본 테마: Sidebar](./default-theme-sidebar)에서 확인할 수 있습니다.

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
   * 항목의 텍스트 레이블.
   */
  text?: string

  /**
   * 항목의 링크.
   */
  link?: string

  /**
   * 항목의 자식들.
   */
  items?: SidebarItem[]

  /**
   * 명시되지 않은 경우, 그룹은 접을 수 없습니다.
   *
   * `true`이면, 그룹은 접을 수 있고 기본적으로 접혀 있습니다
   *
   * `false`이면, 그룹은 접을 수 있지만 기본적으로 펼쳐져 있습니다
   */
  collapsed?: boolean
}
```

## aside

- 타입: `boolean | 'left'`
- 기본값: `true`
- [frontmatter](./frontmatter-config#aside)를 통해 페이지별로 재정의 가능

이 값을 `false`로 설정하면 aside 컨테이너의 렌더링을 방지합니다.\
이 값을 `true`로 설정하면 aside를 오른쪽에 렌더링합니다.\
이 값을 `left`로 설정하면 aside를 왼쪽에 렌더링합니다.

모든 뷰포트에 대해 비활성화하려면 `outline: false`를 사용해야 합니다.

## outline

- 타입: `Outline | Outline['level'] | false`
- [frontmatter](./frontmatter-config#outline)를 통해 페이지별로 레벨 재정의 가능

이 값을 `false`로 설정하면 윤곽선 컨테이너의 렌더링을 방지합니다. 자세한 내용은 이 인터페이스를 참조하세요:

```ts
interface Outline {
  /**
   * 개요에 표시될 제목 수준.
   * 단일 수치는 해당 수준의 제목만 표시됨을 의미합니다.
   * 튜플이 전달되면 첫 번째 수치는 최소 수준이고 두 번째 수치는 최대 수준입니다.
   * `'deep'`은 `[2, 6]`과 동일하며, `<h2>`부터 `<h6>`까지의 모든 제목이 표시됨을 의미합니다.
   *
   * @default 2
   */
  level?: number | [number, number] | 'deep'

  /**
   * 개요에 표시될 제목.
   *
   * @default '이 페이지에서'
   */
  label?: string
}
```

## socialLinks

- 타입: `SocialLink[]`

내비게이션에 아이콘과 함께 소셜 계정 링크를 표시하기 위해 이 옵션을 정의할 수 있습니다.

```ts
export default {
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
      { icon: 'twitter', link: '...' },
      // SVG 문자열을 전달하여 사용자 정의 아이콘을 추가할 수도 있습니다:
      {
        icon: {
          svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Dribbble</title><path d="M12...6.38z"/></svg>'
        },
        link: '...',
        // 접근성을 위해 사용자 정의 레이블을 포함할 수도 있습니다 (선택 사항이지만 권장됨):
        ariaLabel: '멋진 링크'
      }
    ]
  }
}
```

```ts
interface SocialLink {
  icon: SocialLinkIcon
  link: string
  ariaLabel?: string
}

type SocialLinkIcon =
  | 'discord'
  | 'facebook'
  | 'github'
  | 'instagram'
  | 'linkedin'
  | 'mastodon'
  | 'npm'
  | 'slack'
  | 'twitter'
  | 'x'
  | 'youtube'
  | { svg: string }
```

## footer

- 타입: `Footer`
- [frontmatter](./frontmatter-config#footer)를 통해 페이지별로 재정의 가능

풋터 설정입니다. 풋터에 메시지나 저작권 텍스트를 추가할 수 있지만, 사이드바를 포함하지 않는 페이지에서만 표시됩니다. 이는 디자인 우려사항 때문입니다.

```ts
export default {
  themeConfig: {
    footer: {
      message: 'MIT 라이선스에 따라 릴리즈되었습니다.',
      copyright: '저작권 © 2019-현재 Evan You'
    }
  }
}
```

```ts
export interface Footer {
  message?: string
  COPYRIGHT?: string
}
```

## editLink

- 타입: `EditLink`
- [frontmatter](./frontmatter-config#editlink)를 통해 페이지별로 재정의 가능

편집 링크를 통해 GitHub이나 GitLab과 같은 Git 관리 서비스에서 페이지를 편집하는 링크를 표시할 수 있습니다. [기본 테마: 편집 링크](./default-theme-edit-link)에서 자세한 내용을 확인하세요.

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

마지막 업데이트 텍스트와 날짜 형식을 사용자 정의할 수 있습니다.

```ts
export default {
  themeConfig: {
    lastUpdated: {
      text: '업데이트 되었습니다',
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
   * @default '마지막 업데이트'
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

[Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch)를 사용하여 문서 사이트를 검색할 수 있는 옵션입니다. [기본 테마: 검색](./default-theme-search)에서 자세히 알아보세요.

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

[기본 테마: Carbon Ads](./default-theme-carbon-ads)에서 자세히 알아보세요.

## docFooter

- 타입: `DocFooter`

영어로 문서를 작성하지 않을 때 이전 및 다음 링크 위에 나타나는 텍스트를 사용자 정의하는 데 사용할 수 있습니다. 또한 이전/다음 링크를 전역적으로 비활성화할 수 있습니다. 이전/다음 링크를 선택적으로 활성화/비활성화하려면 [frontmatter](./default-theme-prev-next-links)를 사용할 수 있습니다.

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
- 기본값: `외관`

어두운 모드 전환 레이블을 사용자 정의하는 데 사용할 수 있습니다. 이 레이블은 모바일 뷰에서만 표시됩니다.

## lightModeSwitchTitle

- 타입: `string`
- 기본값: `라이트 테마로 전환`

호버 시 나타나는 라이트 모드 전환 제목을 사용자 정의하는 데 사용할 수 있습니다.

## darkModeSwitchTitle

- 타입: `string`
- 기본값: `어두운 테마로 전환`

호버 시 나타나는 어두운 모드 전환 제목을 사용자 정의하는 데 사용할 수 있습니다.

## sidebarMenuLabel

- 타입: `string`
- 기본값: `메뉴`

사이드바 메뉴 레이블을 사용자 정의하는 데 사용할 수 있습니다. 이 레이블은 모바일 뷰에서만 표시됩니다.

## returnToTopLabel

- 타입: `string`
- 기본값: `맨 위로 돌아가기`

맨 위로 돌아가기 버튼의 레이블을 사용자 정의하는 데 사용할 수 있습니다. 이 레이블은 모바일 뷰에서만 표시됩니다.

## langMenuLabel

- 타입: `string`
- 기본값: `언어 변경`

내비게이션 바의 언어 토글 버튼의 aria-label을 사용자 정의하는 데 사용됩니다. [i18n](../guide/i18n)을 사용하는 경우에만 사용됩니다.

## externalLinkIcon

- 타입: `boolean`
- 기본값: `false`

마크다운의 외부 링크 옆에 외부 링크 아이콘을 표시할지 여부입니다.
