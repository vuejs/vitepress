# 홈페이지 {#home-page}

VitePress 기본 테마는 홈페이지 레이아웃을 제공하며, 이 사이트의 [홈페이지](../)에서도 사용된 것을 볼 수 있습니다. [frontmatter](./frontmatter-config)에 `layout: home`을 지정함으로써 여러분의 페이지에도 이를 사용할 수 있습니다.

```yaml
---
layout: home
---
```

하지만, 이 옵션만으로는 큰 효과를 보지 못합니다. `hero` 및 `features`와 같은 추가적인 옵션을 설정함으로써 홈페이지에 여러 가지 다른 사전 템플릿 "섹션"을 추가할 수 있습니다.

## Hero 섹션 {#hero-section}

Hero 섹션은 홈페이지 맨 위에 옵니다. 여기에서 Hero 섹션을 구성하는 방법입니다.

```yaml
---
layout: home

hero:
  name: VitePress
  text: Vite & Vue로 구동되는 정적 사이트 생성기.
  tagline: Lorem ipsum...
  image:
    src: /logo.png
    alt: VitePress
  actions:
    - theme: brand
      text: 시작하기
      link: /guide/what-is-vitepress
    - theme: alt
      text: GitHub에서 보기
      link: https://github.com/vuejs/vitepress
---
```

```ts
interface Hero {
  // `text` 위에 표시되는 문자열입니다. 브랜드 색상이
  // 함께 제공되며 제품 이름과 같이 짧을 것으로 예상됩니다.
  name?: string

  // hero 섹션의 주요 텍스트입니다.
  // 이는 `h1` 태그로 정의됩니다.
  text: string

  // `text` 아래에 표시되는 태그라인입니다.
  tagline?: string

  // 이미지는 텍스트 및 태그라인 영역 옆에 표시됩니다.
  image?: ThemeableImage

  // 홈 hero 섹션에 표시할 작업 버튼들입니다.
  actions?: HeroAction[]
}

type ThemeableImage =
  | string
  | { src: string; alt?: string }
  | { light: string; dark: string; alt?: string }

interface HeroAction {
  // 버튼의 색상 테마입니다. 기본값은 `brand`입니다.
  theme?: 'brand' | 'alt'

  // 버튼의 레이블입니다.
  text: string

  // 버튼의 목적지 링크입니다.
  link: string

  // 링크 타겟 속성입니다.
  target?: string

  // 링크 rel 속성입니다.
  rel?: string
}
```

### 이름 색상 사용자 정의 {#customizing-the-name-color}

VitePress는 `name`에 대해 브랜드 색상 (`--vp-c-brand-1`)을 사용합니다. 하지만, `--vp-home-hero-name-color` 변수를 오버라이딩함으로써 이 색상을 사용자 정의할 수 있습니다.

```css
:root {
  --vp-home-hero-name-color: blue;
}
```

또한 `--vp-home-hero-name-background`와 결합하여 `name`에 그라데이션 색상을 부여할 수도 있습니다.

```css
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe, #41d1ff);
}
```

## 기능 섹션 {#features-section}

기능 섹션에서는 Hero 섹션 바로 다음에 보여주고 싶은 기능의 수를 제한 없이 나열할 수 있습니다. 구성하려면 frontmatter에 `features` 옵션을 전달합니다.

각 기능에 대해 이모지나 이미지 형태의 아이콘을 제공할 수 있습니다. 구성된 아이콘가 이미지(svg, png, jpeg...)인 경우, 적절한 너비와 높이를 가진 아이콘을 제공해야 합니다; 필요한 경우 어두운 테마 및 밝은 테마의 변형뿐만 아니라 설명, 본질적인 크기도 제공할 수 있습니다.

```yaml
---
layout: home

features:
  - icon: 🛠️
    title: 항상 간단하고 최소한의
    details: Lorem ipsum...
  - icon:
      src: /cool-feature-icon.svg
    title: 또 다른 멋진 기능
    details: Lorem ipsum...
  - icon:
      dark: /dark-feature-icon.svg
      light: /light-feature-icon.svg
    title: 또 다른 멋진 기능
    details: Lorem ipsum...
---
```

```ts
interface Feature {
  // 각 기능 상자에 아이콘을 표시합니다.
  icon?: FeatureIcon

  // 기능의 제목입니다.
  title: string

  // 기능의 세부 정보입니다.
  details: string

  // 기능 구성 요소에서 클릭 시 링크합니다.
  // 링크는 내부 또는 외부 모두 가능합니다.
  //
  // 예: `guide/reference/default-theme-home-page` 또는 `https://example.com`
  link?: string

  // 기능 구성 요소 내에서 표시될 링크 텍스트입니다.
  // `link` 옵션과 함께 사용하는 것이 좋습니다.
  //
  // 예: `더 알아보기`, `페이지 방문`, 등
  linkText?: string

  // `link` 옵션을 위한 링크 rel 속성입니다.
  //
  // 예: `external`
  rel?: string

  // `link` 옵션을 위한 링크 target 속성입니다.
  target?: string
}

type FeatureIcon =
  | string
  | { src: string; alt?: string; width?: string; height: string }
  | {
      light: string
      dark: string
      alt?: string
      width?: string
      height: string
    }
```

## 마크다운 컨텐츠 {#markdown-content}

`---` frontmatter 구분자 아래에 마크다운을 더함으로써 사이트의 홈페이지에 추가 컨텐츠를 추가할 수 있습니다.

````md
---
layout: home

hero:
  name: VitePress
  text: Vite & Vue로 구동되는 정적 사이트 생성기.
---

## 시작하기

`npx`를 사용하여 바로 VitePress를 사용할 수 있습니다!

```sh
npm init
npx vitepress init
```
````

::: info
VitePress는 항상 `layout: home` 페이지의 추가 컨텐츠에 자동 스타일을 적용하지는 않았습니다. 이전 동작으로 되돌리려면, frontmatter에 `markdownStyles: false`를 추가할 수 있습니다.
:::
