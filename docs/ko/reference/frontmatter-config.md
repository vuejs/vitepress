---
outline: deep
---

# 프론트매터 구성 {#frontmatter-config}

프론트매터(머리말)는 페이지 기반 구성을 가능하게 합니다. 모든 마크다운 파일에서, 사이트 수준 또는 테마 수준의 구성 옵션을 재정의하기 위해 프론트매터 구성을 사용할 수 있습니다. 또한, 프론트매터에서만 정의할 수 있는 구성 옵션이 있습니다.

사용 예시:

```md
---
title: VitePress로 문서화
editLink: true
---
```

Vue 표현식에서 `$frontmatter` 전역을 통해 프론트매터 데이터에 접근할 수 있습니다:

```md
{{ $frontmatter.title }}
```

## title

- 유형: `string`

페이지의 제목입니다. [config.title](./site-config#title)과 동일하며, 사이트 수준의 구성을 재정의합니다.

```yaml
---
title: VitePress
---
```

## titleTemplate

- 유형: `string | boolean`

제목의 접미사입니다. [config.titleTemplate](./site-config#titletemplate)와 동일하며, 사이트 수준의 구성을 재정의합니다.

```yaml
---
title: VitePress
titleTemplate: Vite & Vue로 구동되는 정적 사이트 생성기
---
```

## description

- 유형: `string`

페이지의 설명입니다. [config.description](./site-config#description)과 동일하며, 사이트 수준의 구성을 재정의합니다.

```yaml
---
description: VitePress
---
```

## head

- 유형: `HeadConfig[]`

현재 페이지에 삽입할 추가 head 태그를 지정합니다. 사이트 수준 구성에 의해 삽입된 head 태그들 이후에 추가됩니다.

```yaml
---
head:
  - - meta
    - name: description
      content: 안녕하세요
  - - meta
    - name: keywords
      content: 슈퍼 두퍼 SEO
---
```

```ts
type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

## 기본 테마 전용 {#default-theme-only}

다음 프론트매터 옵션은 기본 테마를 사용할 때만 적용됩니다.

### layout

- 유형: `doc | home | page`
- 기본값: `doc`

페이지의 레이아웃을 결정합니다.

- `doc` - 마크다운 콘텐츠에 기본 문서 스타일을 적용합니다.
- `home` - "홈 페이지"를 위한 특별한 레이아웃입니다. `hero` 및 `features`와 같은 추가 옵션을 추가하여 아름다운 랜딩 페이지를 빠르게 만들 수 있습니다.
- `page` - `doc`과 비슷하게 동작하지만 콘텐츠에 스타일을 적용하지 않습니다. 완전히 사용자 정의된 페이지를 만들고 싶을 때 유용합니다.

```yaml
---
layout: doc
---
```

### hero <Badge type="info" text="홈 페이지 전용" />

`layout`이 `home`으로 설정될 때 홈 히어로 섹션의 내용을 정의합니다. [기본 테마: 홈 페이지](./default-theme-home-page)에서 자세한 내용을 확인할 수 있습니다.

### features <Badge type="info" text="홈 페이지 전용" />

`layout`이 `home`으로 설정될 때 기능 섹션에 표시할 항목을 정의합니다. [기본 테마: 홈 페이지](./default-theme-home-page)에서 자세한 내용을 확인할 수 있습니다.

### navbar

- 유형: `boolean`
- 기본값: `true`

[navbar](./default-theme-nav)를 표시할지 여부입니다.

```yaml
---
navbar: false
---
```

### sidebar

- 유형: `boolean`
- 기본값: `true`

[sidebar](./default-theme-sidebar)를 표시할지 여부입니다.

```yaml
---
sidebar: false
---
```

### aside

- 유형: `boolean | 'left'`
- 기본값: `true`

`doc` 레이아웃에서 aside 컴포넌트의 위치를 정의합니다.

이 값을 `false`로 설정하면 aside 컨테이너가 렌더링되지 않습니다.\
이 값을 `true`로 설정하면 aside가 오른쪽에 렌더링됩니다.\
이 값을 `'left'`로 설정하면 aside가 왼쪽에 렌더링됩니다.

```yaml
---
aside: false
---
```

### outline

- 유형: `number | [number, number] | 'deep' | false`
- 기본값: `2`

페이지에 표시할 개요의 헤더 레벨입니다. [config.themeConfig.outline.level](./default-theme-config#outline)과 동일하며, 사이트 수준 구성에서 설정한 값을 재정의합니다.

### lastUpdated

- 유형: `boolean | Date`
- 기본값: `true`

현재 페이지의 바닥글에 [마지막 업데이트](./default-theme-last-updated) 텍스트를 표시할지 여부입니다. 날짜와 시간이 지정되면 마지막 git 수정 타임스탬프 대신 표시됩니다.

```yaml
---
lastUpdated: false
---
```

### editLink

- 유형: `boolean`
- 기본값: `true`

현재 페이지의 바닥글에 [편집 링크](./default-theme-edit-link)를 표시할지 여부입니다.

```yaml
---
editLink: false
---
```

### footer

- 유형: `boolean`
- 기본값: `true`

[footer](./default-theme-footer)를 표시할지 여부입니다.

```yaml
---
footer: false
---
```

### pageClass

- 유형: `string`

특정 페이지에 추가 클래스 이름을 추가합니다.

```yaml
---
pageClass: custom-page-class
---
```

그런 다음 `.vitepress/theme/custom.css` 파일에서 이 특정 페이지의 스타일을 사용자 정의할 수 있습니다:

```css
.custom-page-class {
  /* 페이지별 스타일 */
}
```
