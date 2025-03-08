# 레이아웃 {#layout}

페이지의 [전문](./frontmatter-config)에 `layout` 옵션을 설정하여 페이지 레이아웃을 선택할 수 있습니다. `doc`, `page`, `home` 세 가지 레이아웃 옵션이 있습니다. 아무것도 지정하지 않으면 `doc` 페이지로 처리됩니다.

```yaml
---
layout: doc
---
```

## `doc` 레이아웃 {#doc-layout}

`doc` 옵션은 기본 레이아웃으로, 전체 마크다운 콘텐츠를 "문서" 스타일로 변환합니다. 이 레이아웃은 전체 콘텐츠를 `vp-doc` CSS 클래스로 감싸고, 하위 엘리먼트에 스타일을 적용하는 방식으로 작동합니다.

`p`나 `h2` 같은 거의 모든 일반적인 엘리먼트들이 특별한 스타일을 갖게 됩니다. 따라서 마크다운 콘텐츠에 커스텀 HTML을 추가할 경우, 해당 HTML도 이러한 스타일의 영향을 받게 된다는 점을 유념해야 합니다.

이 레이아웃에서는 아래에 나열된 문서 전용 기능들도 제공됩니다. 이 기능들은 오직 이 레이아웃에서만 활성화됩니다.

- 편집 링크
- 이전/다음 링크
- 개요(outline)
- [카본 광고](./default-theme-carbon-ads)

## `page` 레이아웃 {#page-layout}

`page` 옵션은 "빈 페이지"로 처리됩니다. 마크다운은 여전히 파싱되며, 모든 [마크다운 확장 기능](../guide/markdown)이 `doc` 레이아웃과 동일하게 작동하지만, 기본 스타일링은 적용되지 않습니다.

이 페이지 레이아웃은 VitePress 테마가 마크업에 영향을 미치지 않도록 하여, 모든 스타일을 직접 지정할 수 있게 해줍니다. 이는 커스텀 페이지를 만들고자 할 때 유용합니다.

이 레이아웃에서도 페이지에 매칭되는 사이드바 구성이 있는 경우 사이드바는 여전히 표시됩니다.

## `home` 레이아웃 {#home-layout}

`home` 옵션은 템플릿화된 "홈 페이지"를 생성합니다. 이 레이아웃에서는 `hero`와 `features` 같은 추가 옵션을 설정하여 콘텐츠를 더 커스터마이징 할 수 있습니다. 자세한 내용은 [기본 테마: 홈 페이지](./default-theme-home-page)를 참고하세요.

## 레이아웃 없음 {#no-layout}

어떤 레이아웃도 원하지 않는 경우, 전문에 `layout: false`를 전달할 수 있습니다. 이 옵션은 (기본적으로 사이드바, 네비게이션 바, 또는 푸터가 없는) 완전히 커스터마이징 가능한 랜딩 페이지를 만들고자 할 때 유용합니다.

## 커스텀 레이아웃 {#custom-layout}

커스텀 레이아웃을 사용할 수도 있습니다:

```md
---
layout: foo
---
```

이것은 컨텍스트에 등록된 `foo`라는 이름의 컴포넌트를 찾습니다. 예를 들어 `.vitepress/theme/index.ts`에서 컴포넌트를 전역으로 등록할 수 있습니다:

```ts
import DefaultTheme from 'vitepress/theme'
import Foo from './Foo.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('foo', Foo)
  }
}
```
