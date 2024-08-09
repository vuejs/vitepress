---
outline: deep
---

# 전문 구성 {#frontmatter-config}

전문은 페이지 기반 구성을 가능하게 합니다. 각 마크다운 파일에서 전문 구성을 사용하여 사이트 수준 또는 테마 수준의 구성 옵션을 재정의할 수 있습니다. 또한, 전문에서만 정의할 수 있는 구성 옵션도 있습니다.

사용 예:

```md
---
title: Docs with VitePress
editLink: true
---
```

Vue 표현식에서 `$frontmatter` 전역 변수를 통해 전문 데이터에 접근할 수 있습니다:

```md
{{ $frontmatter.title }}
```

## title

- 타입: `string`

페이지의 제목입니다. [config.title](./site-config#title)과 동일하며, 사이트 레벨의 구성을 재정의합니다.

```yaml
---
title: VitePress
---
```

## titleTemplate

- 타입: `string | boolean`

제목의 접미사입니다. [config.titleTemplate](./site-config#titletemplate)와 동일하며, 사이트 레벨의 구성을 재정의합니다.

```yaml
---
title: VitePress
titleTemplate: Vite & Vue powered static site generator
---
```

## description

- 타입: `string`

페이지의 설명입니다. [config.description](./site-config#description)과 동일하며, 사이트 레벨의 구성을 재정의합니다.

```yaml
---
description: VitePress
---
```

## head

- 타입: `HeadConfig[]`

현재 페이지에 삽입할 추가 head 태그를 지정합니다. 사이트 수준 구성에 의해 삽입된 head 태그 뒤에 추가됩니다.

```yaml
---
head:
  - - meta
    - name: description
      content: hello
  - - meta
    - name: keywords
      content: super duper SEO
---
```

```ts
type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

## 기본 테마 전용 {#default-theme-only}

다음 전문 옵션은 기본 테마를 사용할 때만 적용됩니다.

### layout

- 타입: `doc | home | page`
- 기본값: `doc`

페이지의 레이아웃을 결정합니다.

- `doc` - 마크다운 컨텐츠에 기본 문서 스타일을 적용합니다.
- `home` - "홈 페이지"를 위한 특별 레이아웃입니다. 아름다운 랜딩 페이지를 빠르게 만들기 위해 `hero` 및 `features`와 같은 옵션을 추가할 수 있습니다.
- `page` - `doc`과 유사하게 작동하지만 콘텐츠에 스타일을 적용하지 않습니다. 완전히 커스텀 페이지를 만들 때 유용합니다.

```yaml
---
layout: doc
---
```

### hero <Badge type="info" text="홈 페이지 전용" />

`layout`이 `home`으로 설정된 경우, 홈 히어로 섹션의 내용을 정의합니다. 자세한 내용은 [기본 테마: 홈 페이지](./default-theme-home-page)에서 확인할 수 있습니다.

### features <Badge type="info" text="홈 페이지 전용" />

`layout`이 `home`으로 설정된 경우, 기능 섹션에 표시할 항목을 정의합니다. 자세한 내용은 [기본 테마: 홈 페이지](./default-theme-home-page)에서 확인할 수 있습니다.

### navbar

- 타입: `boolean`
- 기본값: `true`

[네비게이션 바](./default-theme-nav)를 표시할지 여부를 설정합니다.

```yaml
---
navbar: false
---
```

### sidebar

- 타입: `boolean`
- 기본값: `true`

[사이드바](./default-theme-sidebar)를 표시할지 여부를 설정합니다.

```yaml
---
sidebar: false
---
```

### aside

- 타입: `boolean | 'left'`
- 기본값: `true`

`doc` 레이아웃에서 어사이드(aside) 컴포넌트의 위치를 정의합니다.

이 값을 `false`로 설정하면 어사이드 컨테이너가 렌더링되지 않습니다.\
이 값을 `true`로 설정하면 어사이드를 오른쪽에 렌더링합니다.\
이 값을 `'left'`로 설정하면 어사이드를 왼쪽에 렌더링합니다.

```yaml
---
aside: false
---
```

### outline

- 타입: `number | [number, number] | 'deep' | false`
- 기본값: `2`

페이지에 표시할 아웃라인(개요) 헤더의 레벨을 설정합니다. [config.themeConfig.outline.level](./default-theme-config#outline)과 동일하며, 사이트 수준 구성에서 설정된 값을 재정의합니다.

### lastUpdated

- 타입: `boolean | Date`
- 기본값: `true`

현재 페이지의 푸터에 [마지막 업데이트 날짜](./default-theme-last-updated) 텍스트를 표시할지 여부를 설정합니다. 날짜/시간이 지정되면 마지막 git 수정 타임스탬프 대신 해당 날짜/시간이 표시됩니다.

```yaml
---
lastUpdated: false
---
```

### editLink

- 타입: `boolean`
- 기본값: `true`

현재 페이지의 푸터에 [편집 링크](./default-theme-edit-link)를 표시할지 여부를 설정합니다.

```yaml
---
editLink: false
---
```

### footer

- 타입: `boolean`
- 기본값: `true`

[푸터](./default-theme-footer)를 표시할지 여부를 설정합니다.

```yaml
---
footer: false
---
```

### pageClass

- 타입: `string`

페이지에 추가할 클래스 입니다.

```yaml
---
pageClass: custom-page-class
---
```

그런 다음 `.vitepress/theme/custom.css` 파일에서 이 페이지의 스타일을 커스텀 할 수 있습니다:

```css
.custom-page-class {
  /* 페이지별 스타일 */
}
```
