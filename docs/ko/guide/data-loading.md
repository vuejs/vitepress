# 빌드할 때 데이터 로딩 {#build-time-data-loading}

VitePress는 **데이터 로더**라고 불리는 기능을 제공하여 임의의 데이터를 로드하고 페이지나 컴포넌트에서 가져올 수 있습니다. 데이터 로딩은 **빌드 시간에만 실행**됩니다: 결과적으로 생성된 데이터는 최종 자바스크립트 번들에 JSON으로 직렬화됩니다.

데이터 로더는 원격 데이터를 가져오거나 로컬 파일을 기반으로 메타데이터를 생성하는 데 사용할 수 있습니다. 예를 들어, 모든 로컬 API 페이지를 파싱하고 모든 API 항목의 색인을 자동으로 생성하기 위해 데이터 로더를 사용할 수 있습니다.

## 기본 사용법 {#basic-usage}

데이터 로더 파일은 `.data.js` 또는 `.data.ts`로 끝나야 합니다. 이 파일은 `load()` 메서드를 가진 객체를 기본 내보내기해야 합니다:

```js
// example.data.js
export default {
  load() {
    return {
      hello: 'world'
    }
  }
}
```

로더 모듈은 Node.js에서만 평가되므로, 필요에 따라 Node API와 npm 종속성을 가져올 수 있습니다.

이 파일에서 데이터를 `.md` 페이지와 `.vue` 컴포넌트에서 `data`라는 이름으로 내보낼 수 있습니다:

```vue
<script setup>
import { data } from './example.data.js'
</script>

<pre>{{ data }}</pre>
```

출력:

```json
{
  "hello": "world"
}
```

데이터 로더 자체가 `data`를 내보내지 않는 것을 알 수 있습니다. 이는 VitePress가 내부에서 `load()` 메서드를 호출하고 `data`라는 이름으로 결과를 암시적으로 노출한다는 것을 의미합니다.

로더가 비동기인 경우에도 작동합니다:

```js
export default {
  async load() {
    // 원격 데이터 가져오기
    return (await fetch('...')).json()
  }
}
```

## 로컬 파일에서 데이터 가져오기 {#data-from-local-files}

로컬 파일을 기반으로 데이터를 생성해야 할 때는 데이터 로더에서 `watch` 옵션을 사용해야 합니다. 그래야 해당 파일에 변경 사항이 발생했을 때 핫 업데이트를 트리거할 수 있습니다.

`watch` 옵션은 또한 여러 파일을 일치시키기 위해 [글로브 패턴](https://github.com/mrmlnc/fast-glob#pattern-syntax)을 사용할 수 있어 편리합니다. 패턴은 로더 파일 자체에 상대적이며, `load()` 함수는 일치한 파일을 절대 경로로 받습니다.

다음 예제는 [csv-parse](https://github.com/adaltas/node-csv/tree/master/packages/csv-parse/)를 사용하여 CSV 파일을 불러오고 JSON으로 변환하는 방법을 보여줍니다. 이 파일은 빌드 시간에만 실행되므로, CSV 파서를 클라이언트에 전송하지 않을 것입니다!

```js
import fs from 'node:fs'
import { parse } from 'csv-parse/sync'

export default {
  watch: ['./data/*.csv'],
  load(watchedFiles) {
    // watchedFiles는 일치하는 파일의 절대 경로 배열이 될 것입니다.
    // 블로그 포스트 메타데이터의 배열을 생성하여
    // 테마 레이아웃에서 목록을 렌더링하는 데 사용할 수 있습니다
    return watchedFiles.map((file) => {
      return parse(fs.readFileSync(file, 'utf-8'), {
        columns: true,
        skip_empty_lines: true
      })
    })
  }
}
```

## `createContentLoader`

콘텐츠 중심 사이트를 구축할 때, 우리는 종종 "아카이브" 또는 "인덱스" 페이지를 만들 필요가 있습니다: 우리 콘텐츠 컬렉션에서 사용 가능한 모든 항목을 나열하는 페이지, 예를 들어 블로그 게시물이나 API 페이지의 경우입니다. 데이터 로더 API를 직접 사용하여 이를 구현할 **수 있지만**, 이는 흔한 사용 사례이므로 VitePress는 이를 단순화하기 위해 `createContentLoader` 헬퍼를 제공합니다:

```js
// posts.data.js
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', /* 옵션 */)
```

헬퍼는 [소스 디렉토리](./routing#source-directory)에 상대적인 글로브 패턴을 취하며, 기본 내보내기로 사용할 수 있는 `{ watch, load }` 데이터 로더 객체를 반환합니다. 이는 또한 파일 수정 타임스탬프를 기반으로 캐싱을 구현하여 개발 성능을 향상시킵니다.

로더는 마크다운 파일과만 작동합니다 - 마크다운이 아닌 일치하는 파일은 건너뜁니다.

로드된 데이터는 `ContentData[]` 타입의 배열일 것입니다:

```ts
interface ContentData {
  // 페이지의 매핑된 URL입니다. 예: /posts/hello.html (base는 포함하지 않음)
  // 수동으로 반복하거나 사용자 정의 `transform`을 사용하여 경로를 정규화하세요
  url: string
  // 페이지의 프론트매터 데이터
  frontmatter: Record<string, any>

  // 다음은 관련 옵션이 활성화되어 있을 때만 존재합니다
  // 아래에서 이에 대해 논의할 것입니다
  src: string | undefined
  html: string | undefined
  excerpt: string | undefined
}
```

기본적으로 `url`과 `frontmatter`만 제공됩니다. 로드된 데이터는 클라이언트 번들에 JSON으로 인라인되기 때문에 크기에 대해 신중해야 합니다. 다음은 데이터를 사용하여 최소한의 블로그 인덱스 페이지를 구축하는 예입니다:

```vue
<script setup>
import { data as posts } from './posts.data.js'
</script>

<template>
  <h1>모든 블로그 게시물</h1>
  <ul>
    <li v-for="post of posts">
      <a :href="post.url">{{ post.frontmatter.title }}</a>
      <span>by {{ post.frontmatter.author }}</span>
    </li>
  </ul>
</template>
```

### 옵션 {#options}

기본 데이터가 모든 요구 사항에 맞지 않을 수 있습니다 - 옵션을 사용하여 데이터를 변환할 수 있습니다:

```js
// posts.data.js
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', {
  includeSrc: true, // 원시 마크다운 소스를 포함시킬까요?
  render: true,     // 완성된 전체 페이지 HTML을 렌더링하여 포함시킬까요?
  excerpt: true,    // 발췌문을 포함시킬까요?
  transform(rawData) {
    // 원하는 대로 원시 데이터를 매핑, 정렬 또는 필터링하세요.
    // 최종 결과가 클라이언트에 전송될 것입니다.
    return rawData.sort((a, b) => {
      return +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date)
    }).map((page) => {
      page.src     // 원시 마크다운 소스
      page.html    // 렌더링된 전체 페이지 HTML
      page.excerpt // 렌더링된 발췌문 HTML (`---` 위의 내용)
      return {/* ... */}
    })
  }
})
```

[Vue.js 블로그](https://github.com/vuejs/blog/blob/main/.vitepress/theme/posts.data.ts)에서 사용되는 방법을 확인하세요.

`createContentLoader` API는 [빌드 후크](../reference/site-config#build-hooks) 내에서도 사용될 수 있습니다:

```js
// .vitepress/config.js
export default {
  async buildEnd() {
    const posts = await createContentLoader('posts/*.md').load()
    // 포스트 메타데이터를 기반으로 파일 생성하기, 예: RSS 피드
  }
}
```

**타입**

```ts
interface ContentOptions<T = ContentData[]> {
  /**
   * src를 포함시킬까요?
   * @default false
   */
  includeSrc?: boolean

  /**
   * src를 HTML로 렌더링하고 데이터에 포함시킬까요?
   * @default false
   */
  render?: boolean

  /**
   * `boolean`인 경우, 발췌문을 구문 분석하고 포함할지 여부입니다. (HTML로 렌더링됨)
   *
   * `function`인 경우, 콘텐츠에서 발췌문이 추출되는 방식을 제어합니다.
   *
   * `string`인 경우, 발췌문을 추출하는 데 사용되는 사용자 정의 구분자를 정의합니다.
   * `excerpt`가 `true`인 경우 기본 구분자는 `---`입니다.
   *
   * @see https://github.com/jonschlinkert/gray-matter#optionsexcerpt
   * @see https://github.com/jonschlinkert/gray-matter#optionsexcerpt_separator
   *
   * @default false
   */
  excerpt?:
    | boolean
    | ((file: { data: { [key: string]: any }; content: string; excerpt?: string }, options?: any) => void)
    | string

  /**
   * 데이터를 변환하십시오. 컴포넌트나 마크다운 파일에서 가져올 경우,
   * 데이터는 클라이언트 번들에 JSON으로 인라인될 것입니다.
   */
  transform?: (data: ContentData[]) => T | Promise<T>
}
```

## 타입된 데이터 로더 {#typed-data-loaders}

TypeScript를 사용할 때, 다음과 같이 로더와 `data` 내보내기를 타입할 수 있습니다:

```ts
import { defineLoader } from 'vitepress'

export interface Data {
  // 데이터 타입
}

declare const data: Data
export { data }

export default defineLoader({
  // 타입 검사된 로더 옵션
  watch: ['...'],
  async load(): Promise<Data> {
    // ...
  }
})
```

## 구성 {#configuration}

로더 내부에서 구성 정보를 가져오려면 다음과 같은 코드를 사용할 수 있습니다:

```ts
import type { SiteConfig } from 'vitepress'

const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG
```
