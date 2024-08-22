# 전문 {#frontmatter}

## 사용법 {#usage}

VitePress는 모든 마크다운 파일에서 YAML 전문(frontmatter)을 지원하며, [gray-matter](https://github.com/jonschlinkert/gray-matter)로 이를 파싱합니다. 전문은 마크다운 파일의 맨 위에 있어야 하며(모든 엘리먼트 포함 `<script>` 태그 이전), 세 개의 대시 라인 사이에 유효한 YAML 형태로 작성되어야 합니다. 예:

```md
---
title: VitePress로 문서 작성하기
editLink: true
---
```

많은 사이트 또는 기본 테마 구성 옵션은 전문에 해당 옵션이 있습니다. 전문을 사용하여 현재 페이지에 대한 특정 동작을 재정의할 수 있습니다. 자세한 내용은 [전문 구성 레퍼런스](../reference/frontmatter-config)를 참고하세요.

또한 페이지에서 동적 Vue 표현식에 사용할 커스텀 전문 데이터를 정의할 수도 있습니다.

## 전문 데이터에 접근하기 {#accessing-frontmatter-data}

전문 데이터는 특별한 `$frontmatter` 전역 변수를 통해 접근할 수 있습니다:

다음은 마크다운 파일에서 이를 사용하는 예입니다:

```md
---
title: VitePress로 문서 작성하기
editLink: true
---

# {{ $frontmatter.title }}

가이드 내용
```

현재 페이지의 전문 데이터는 [`useData()`](../reference/runtime-api#usedata) 헬퍼를 사용하여 `<script setup>`에서도 접근할 수 있습니다.

## 기타 전문 형식 {#alternative-frontmatter-formats}

VitePress는 중괄호로 시작하고 끝나는 JSON 전문 문법도 지원합니다:

```json
---
{
  "title": "해커처럼 블로깅하기",
  "editLink": true
}
---
```
