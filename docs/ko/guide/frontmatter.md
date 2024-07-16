# 전문 {#frontmatter}

## 사용법 {#usage}

VitePress는 모든 Markdown 파일에서 YAML 전문(frontmatter)을 지원하며, 이를 [gray-matter](https://github.com/jonschlinkert/gray-matter)로 분석합니다. 전문은 Markdown 파일의 맨 위에 위치해야 합니다(`<script>` 태그를 포함한 모든 요소 이전에)하며, 세 개의 대시 라인 사이에 유효한 YAML 형식으로 설정되어야 합니다. 예시:

```md
---
title: VitePress로 문서 작성하기
editLink: true
---
```

많은 사이트 또는 기본 테마 구성 옵션이 전문에서 대응하는 옵션을 가지고 있습니다. 전문을 사용하여 현재 페이지에 대한 특정 동작을 재정의 할 수 있습니다. 자세한 내용은 [전문 구성 참조](../reference/frontmatter-config)를 참조하십시오.

또한 페이지상의 동적 Vue 표현식에서 사용될 수 있는 자체적인 전문 데이터를 정의할 수 있습니다.

## 전문 데이터 접근 {#accessing-frontmatter-data}

전문 데이터는 특별한 `$frontmatter` 전역 변수를 통해 접근할 수 있습니다:

여기 Markdown 파일에서 사용하는 방법의 예시입니다:

```md
---
title: VitePress로 문서 작성하기
editLink: true
---

# {{ $frontmatter.title }}

가이드 내용
```

`<script setup>`에서 현재 페이지의 전문 데이터에 접근하려면 [`useData()`](../reference/runtime-api#usedata) 헬퍼를 사용할 수 있습니다.

## 대체 전문 형식 {#alternative-frontmatter-formats}

VitePress는 중괄호로 시작하고 끝나는 JSON 전문 구문도 지원합니다:

```json
---
{
  "title": "해커처럼 블로깅하기",
  "editLink": true
}
---
```
