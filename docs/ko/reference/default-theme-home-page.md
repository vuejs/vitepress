---
description: 히어로 섹션, 기능 및 커스텀 콘텐츠로 VitePress 기본 테마 홈 페이지 레이아웃을 구성하세요.
---

# 홈 페이지 {#home-page}

VitePress 기본 테마는 홈 페이지 레이아웃을 제공합니다. 이것은 이 사이트의 [홈 페이지](../)에도 사용되었습니다. `layout: home`을 [전문](./frontmatter-config)에 지정하여 어느 페이지에서도 이를 사용할 수 있습니다.

```yaml
---
layout: home
---
```

하지만 이 옵션만으로는 많은 것을 할 수 없습니다. 다행히도 `hero` 및 `features`와 같은 추가 옵션을 설정하여 홈 페이지에 다양한 사전 템플릿 "섹션"들을 추가할 수 있습니다.

## Hero 섹션 {#hero-section}

Hero 섹션은 홈 페이지의 상단에 위치합니다. Hero 섹션을 구성하는 방법은 다음과 같습니다.

```yaml
---
layout: home

hero:
  name: VitePress
  text: Vite & Vue 기반 정적 사이트 생성기
  tagline: 단 몇 분 만에 마크다운을 우아한 문서로 변환
  image:
    src: /logo.png
    alt: VitePress
  actions:
    - theme: brand
      text: VitePress란 무엇인가?
      link: /guide/what-is-vitepress
    - theme: alt
      text: GitHub
      link: https://github.com/vuejs/vitepress
---
```

```ts
interface Hero {
  // `text` 위에 브랜드 색상으로 표시되는 문자열.
  // 제품명 등 간략한 내용을 추천.
  name?: string

  // hero 섹션의 본문.
  // `h1` 태그로 정의됨.
  text: string

  // `text` 아래에 표시되는 슬로건 문자열.
  tagline?: string

  // `text` 및 `tagline` 옆에 표시되는 이미지.
  image?: ThemeableImage

  // hero 섹션에 표시할 버튼 리스트.
  actions?: HeroAction[]
}

type ThemeableImage =
  | string
  | { src: string; alt?: string }
  | { light: string; dark: string; alt?: string }

interface HeroAction {
  // 버튼의 색상 테마. 기본값: `brand`
  theme?: 'brand' | 'alt'

  // 버튼의 레이블.
  text: string

  // 버튼의 목적지 링크.
  link: string

  // 링크의 target 어트리뷰트.
  target?: string

  // 링크의 rel 어트리뷰트.
  rel?: string
}
```

### `name` 색상 커스터마이징 {#customizing-the-name-color}

VitePress는 `name`에 브랜드 색상(`--vp-c-brand-1`)을 사용합니다. 하지만 `--vp-home-hero-name-color` 변수를 재정의하여 이 색상을 커스텀 할 수 있습니다.

```css
:root {
  --vp-home-hero-name-color: blue;
}
```

또한 `--vp-home-hero-name-background` 변수를 정의해 추가적으로 `name`을 그라데이션 색상으로 커스터마이징도 가능합니다.

```css
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe, #41d1ff);
}
```

## Features 섹션 {#features-section}

Features 섹션에서는 Hero 섹션 바로 아래에 표시할 각 feature를 원하는 만큼 나열할 수 있습니다. 이를 구성하려면 `features` 옵션을 전문에 전달하면 됩니다.

각 feature에 아이콘을 제공할 수 있으며, 이는 이모지 또는 이미지의 형태일 수 있습니다. 아이콘으로 이미지(svg, png, jpeg 등)를 사용하려면 적절한 너비와 높이를 제공해야 하며, 필요에 따라 설명, 이미지의 고유 크기, 다크 테마와 라이트 테마에 대한 변형 아이콘도 제공할 수 있습니다.

```yaml
---
layout: home

features:
  - icon: 🛠️
    title: Simple and minimal, always
    details: Lorem ipsum...
  - icon:
      src: /cool-feature-icon.svg
    title: Another cool feature
    details: Lorem ipsum...
  - icon:
      dark: /dark-feature-icon.svg
      light: /light-feature-icon.svg
    title: Another cool feature
    details: Lorem ipsum...
---
```

```ts
interface Feature {
  // 각 feature 박스에 표시할 아이콘.
  icon?: FeatureIcon

  // feature의 제목.
  title: string

  // feature의 세부 정보.
  details: string

  // feature 컴포넌트 클릭 시 링크.
  // 링크는 내부 또는 외부 모두 가능.
  //
  // 예: `guide/reference/default-theme-home-page` 또는 `https://example.com`
  link?: string

  // feature 컴포넌트 내 표시될 링크 텍스트.
  // `link` 옵션과 함께 사용하는 것을 추천.
  //
  // 예: `더 알아보기`, `페이지 방문` 등
  linkText?: string

  // `link` 옵션을 위한 링크 rel 어트리뷰트.
  //
  // 예: `external`
  rel?: string

  // `link` 옵션을 위한 링크 target 어트리뷰트.
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

홈 페이지 레이아웃에 추가 컨텐츠를 작성하려면 전문 구분선 `---` 아래에 마크다운을 추가하면 됩니다.

````md
---
layout: home

hero:
  name: VitePress
  text: Vite & Vue 기반 정적 사이트 생성기
---

## 시작하기

`npx`를 사용하여 VitePress를 바로 시작할 수 있습니다!

```sh
npm init
npx vitepress init
```
````

::: info
`layout: home` 페이지의 추가 컨텐츠에 자동으로 기본 마크다운 스타일이 적용됩니다(영문 원서에서는 반대로 설명함). 스타일을 적용하지 않으려면 전문에 `markdownStyles: false`를 추가하면 됩니다.
:::
