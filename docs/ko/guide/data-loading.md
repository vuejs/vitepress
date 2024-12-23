# 빌드할 때 데이터 로딩하기 {#build-time-data-loading}

VitePress는 페이지나 컴포넌트에서 임의의 데이터를 로드하고 이를 가져올 수 있는 **데이터 로더** 기능을 제공합니다. 데이터 로딩은 **빌드할 때에만** 실행되며, 결과적으로 생성된 데이터는 최종 JavaScript 번들에 JSON으로 직렬화됩니다.

데이터 로더는 원격 데이터를 가져오거나 로컬 파일을 기반으로 메타데이터를 생성하는 데 사용할 수 있습니다. 예를 들어, 데이터 로더를 사용하여 모든 로컬 API 페이지를 파싱하고 모든 API 항목의 색인을 자동으로 생성할 수 있습니다.

## 기본 사용법 {#basic-usage}

데이터 로더 파일은 반드시 `.data.js` 또는 `.data.ts`로 끝나야 합니다. 이 파일은 `load()` 메서드를 가진 객체를 "export default" 해야 합니다:

```js [example.data.js]
export default {
  load() {
    return {
      hello: 'world'
    }
  }
}
```

로더 모듈은 Node.js에서만 평가되므로, 필요한 경우 Node API와 npm 종속성을 "import" 할 수 있습니다.

그런 다음 `.md` 페이지와 `.vue` 컴포넌트에서 `data`라는 이름으로 "export" 한 데이터를 이 파일에서 "import" 할 수 있습니다:

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

데이터 로더 자체가 `data`를 "export" 하지 않는다는 점에 주목하십시오. VitePress가 백그라운드에서 `load()` 메서드를 호출하고 결과를 암묵적으로 `data`라는 이름으로 "export" 하기 때문입니다.

이 방법은 로더가 비동기적이어도 작동합니다:

```js
export default {
  async load() {
    // 원격 데이터 가져오기
    return (await fetch('...')).json()
  }
}
```

## 로컬 파일에서 데이터 가져오기 {#data-from-local-files}

로컬 파일을 기반으로 데이터를 생성해야 할 때는 데이터 로더에서 `watch` 옵션을 사용해야 합니다. 이 옵션을 사용하면 이러한 파일에 변경이 있을 때 핫 업데이트를 트리거할 수 있습니다.

`watch` 옵션은 또한 여러 파일을 매칭하는 [glob 패턴](https://github.com/mrmlnc/fast-glob#pattern-syntax)을 사용할 수 있어서 편리합니다. 패턴은 로더 파일 자체에 상대적일 수 있으며, `load()` 함수는 매칭된 파일을 절대 경로로 받게 됩니다.

다음 예제는 CSV 파일을 로드하고 이를 [csv-parse](https://github.com/adaltas/node-csv/tree/master/packages/csv-parse/)를 사용하여 JSON으로 변환하는 방법을 보여줍니다. 이 파일은 빌드할 때에만 실행되므로 CSV 파서를 클라이언트로 전송하지 않습니다!

```js
import fs from 'node:fs'
import { parse } from 'csv-parse/sync'

export default {
  watch: ['./data/*.csv'],
  load(watchedFiles) {
    // watchedFiles는 매칭된 파일의 절대 경로 배열 입니다.
    // 테마 레이아웃에서 목록을 렌더링하는 데 사용할 수 있는
    // 블로그 포스트 메타데이터 배열을 생성합니다.
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

콘텐츠가 많은 사이트를 구축할 때, 종종 "아카이브" 또는 "인덱스" 페이지를 만들어야 합니다. 이 페이지는 콘텐츠 모음에 있는 모든 항목(예: 블로그 게시물, API 페이지)을 나열하는 페이지입니다. 데이터 로더 API를 직접 사용하여 이를 구현할 수 있지만, VitePress는 이러한 일반적인 사용 사례를 간소화하기 위해 `createContentLoader` 헬퍼를 제공합니다:

```js [posts.data.js]
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', /* options */)
```

이 헬퍼는 [소스 디렉터리](./routing#source-directory)를 기준으로 glob 패턴을 허용하고 데이터 로드 파일에서 "default export"로 사용할 수 있는 `{ watch, load }` 데이터 로더 객체를 반환합니다. 또한 파일 수정 타임스탬프를 기반으로 캐싱을 구현하여 개발 성능을 향상시킵니다.

참고로 로더는 마크다운 파일에서만 작동하며, 매칭되는 마크다운이 아닌 파일은 건너뜁니다.

로드된 데이터는 `ContentData[]` 타입의 배열입니다:

```ts
interface ContentData {
  // 페이지에 매핑된 URL입니다. 예: /posts/hello.html (base는 포함하지 않음)
  // 수동으로 반복하거나 커스텀 `transform`을 사용하여 경로를 정규화.
  url: string
  // 페이지의 전문(front-matter) 데이터
  frontmatter: Record<string, any>

  // 다음은 관련 옵션이 활성화된 경우에만 나타납니다.
  // 아래에서 이에 대해 논의할 것입니다.
  src: string | undefined
  html: string | undefined
  excerpt: string | undefined
}
```

기본적으로 `url`과 `frontmatter`만 제공됩니다. 이는 로드된 데이터가 클라이언트 번들에 JSON으로 인라인되기 때문에 크기에 주의해야 합니다. 다음은 데이터를 사용하여 최소한의 블로그 인덱스 페이지를 구축하는 예입니다:

```vue
<script setup>
import { data as posts } from './posts.data.js'
</script>

<template>
  <h1>All Blog Posts</h1>
  <ul>
    <li v-for="post of posts">
      <a :href="post.url">{{ post.frontmatter.title }}</a>
      <span>by {{ post.frontmatter.author }}</span>
    </li>
  </ul>
</template>
```

### 옵션 {#options}

기본 데이터가 모든 요구 사항에 충족하지 않을 수 있습니다. 옵션을 사용하여 데이터를 변환할 수 있습니다:

```js [posts.data.js]
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', {
  includeSrc: true, // 원시 마크다운 소스를 포함할까요?
  render: true,     // 렌더링된 전체 페이지 HTML을 포함할까요?
  excerpt: true,    // 발췌문을 포함할까요?
  transform(rawData) {
    // 필요에 따라 원시 데이터를 매핑, 정렬 또는 필터링.
    // 최종 결과를 클라이언트에 전달.
    return rawData.sort((a, b) => {
      return +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date)
    }).map((page) => {
      page.src     // 원시 마크다운 소스
      page.html    // 렌더링된 전체 페이지 HTML
      page.excerpt // 렌더링된 발췌문 HTML (첫 번째 `---` 위에 있는 내용)
      return {/* ... */}
    })
  }
})
```

[Vue.js 블로그](https://github.com/vuejs/blog/blob/main/.vitepress/theme/posts.data.ts)에서 어떻게 사용되었는지 확인해보세요.

`createContentLoader` API는 [빌드 훅](../reference/site-config#build-hooks) 내에서도 사용할 수 있습니다:

```js [.vitepress/config.js]
export default {
  async buildEnd() {
    const posts = await createContentLoader('posts/*.md').load()
    // 포스트 메타데이터를 기반으로 파일 생성하기, 예: RSS 피드
    // 게시물 메타데이터를 기반으로 파일 생성, 예: RSS 피드
  }
}
```

**타입**

```ts
interface ContentOptions<T = ContentData[]> {
  /**
   * src를 포함할까요?
   * @default false
   */
  includeSrc?: boolean

  /**
   * src를 HTML로 렌더링하고 데이터에 포함할까요?
   * @default false
   */
  render?: boolean

  /**
   * `boolean` 타입인 경우, 발췌문을 파싱하고 포함할지 여부를 나타냅니다. (HTML로 렌더링됨)
   *
   * `function` 타입인 경우, 콘텐츠에서 발췌문을 추출하는 방법을 제어합니다.
   *
   * `string` 타입인 경우, 발췌문을 추출하는 데 사용할 커스텀 구분자를 정의합니다.
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
   * 데이터를 변환합니다. 데이터는 컴포넌트나 마크다운 파일에서 가져올 경우,
   * 클라이언트 번들에 JSON으로 포함됩니다.
   */
  transform?: (data: ContentData[]) => T | Promise<T>
}
```

## 데이터 로더의 "export" 타입 {#typed-data-loaders}

TypeScript를 사용할 때, 로더와 `data` "export"를 다음과 같이 타입 지정할 수 있습니다:

```ts
import { defineLoader } from 'vitepress'

export interface Data {
  // 데이터 타입
}

declare const data: Data
export { data }

export default defineLoader({
  // type checked loader options
  watch: ['...'],
  async load(): Promise<Data> {
    // ...
  }
})
```

## 구성 {#configuration}

로더 내부에서 구성 정보를 가져오려면 다음과 같이 코드를 사용해야 합니다:

```ts
import type { SiteConfig } from 'vitepress'

const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG
```
