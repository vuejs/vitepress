---
outline: deep
---

# 사이트 구성 {#site-config}

사이트 구성(config)은 사이트의 전역 설정을 정의할 수 있는 곳입니다. 애플리케이션 구성 옵션은 사용 중인 테마와 상관없이 모든 VitePress 사이트에 적용되는 설정을 정의합니다. 예를 들어 기본 디렉터리나 사이트의 제목 등이 있습니다.

## 개요 {#overview}

### 구성 분석 {#config-resolution}

구성 파일은 항상 `<root>/.vitepress/config.[ext]`에서 처리됩니다. 여기서 `<root>`는 VitePress [프로젝트 루트](../guide/routing#root-and-source-directory)를 의미하며, `[ext]`는 지원되는 파일 확장자 중 하나입니다. TypeScript는 기본적으로 지원됩니다. 지원되는 확장자에는 `.js`, `.ts`, `.mjs`, `.mts`가 포함됩니다.

구성 파일에서는 ES 모듈 구문을 사용하는 것이 권장됩니다. 구성 파일은 객체를 "default export"해야 합니다:

```ts
export default {
  // 애플리케이션 레벨의 구성 옵션
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',
  ...
}
```

::: details 동적(비동기) 구성

구성을 동적으로 생성해야 하는 경우, 함수를 "default export" 할 수 있습니다. 예:

```ts
import { defineConfig } from 'vitepress'

export default async () => {
  const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

  return defineConfig({
    // 애플리케이션 레벨의 구성 옵션
    lang: 'en-US',
    title: 'VitePress',
    description: 'Vite & Vue powered static site generator.',

    // 테마 레벨의 구성 옵션
    themeConfig: {
      sidebar: [
        ...posts.map((post) => ({
          text: post.name,
          link: `/posts/${post.name}`
        }))
      ]
    }
  })
}
```

최상위 수준의 `await`도 사용할 수 있습니다. 예:

```ts
import { defineConfig } from 'vitepress'

const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

export default defineConfig({
  // 앱 레벨 설정 옵션
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue를 활용한 정적 사이트 생성기.',

  // 테마 레벨 설정 옵션
  themeConfig: {
    sidebar: [
      ...posts.map((post) => ({
        text: post.name,
        link: `/posts/${post.name}`
      }))
    ]
  }
})
```

:::

### 구성 인텔리센스 {#config-intellisense}

`defineConfig` 헬퍼를 사용하면 구성 옵션에 대해 TypeScript 기반의 인텔리센스(자동완성)를 제공받을 수 있습니다. IDE가 이를 지원하는 경우, JavaScript와 TypeScript 모두에서 작동합니다.

```js
import { defineConfig } from 'vitepress'

export default defineConfig({
  // ...
})
```

### 타입이 지정된 테마 구성 {#typed-theme-config}

기본적으로 `defineConfig` 헬퍼는 기본 테마에서 테마 구성 타입을 예측합니다:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    // 타입은 `DefaultTheme.Config`
  }
})
```

커스텀 테마를 사용하고 테마 구성에 대한 타입 검사를 원한다면, `defineConfigWithTheme`를 사용하고 제네릭 인수를 통해 커스텀 테마의 구성 타입을 전달해야 합니다:

```ts
import { defineConfigWithTheme } from 'vitepress'
import type { ThemeConfig } from 'your-theme'

export default defineConfigWithTheme<ThemeConfig>({
  themeConfig: {
    // 타입은 `ThemeConfig`
  }
})
```

### Vite, Vue, Markdown 설정 {#vite-vue-markdown-config}

- **Vite**

  VitePress 구성에서 [vite](#vite) 옵션을 사용하여 기본 Vite 인스턴스를 구성할 수 있습니다. 별도의 Vite 구성 파일을 만들 필요는 없습니다.

- **Vue**

  VitePress는 이미 Vite의 공식 Vue 플러그인([@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue))을 포함하고 있습니다. VitePress 구성에서 [vue](#vue) 옵션을 사용하여 해당 옵션을 구성할 수 있습니다.

- **Markdown**

  [Markdown-It](https://github.com/markdown-it/markdown-it) 인스턴스를 VitePress 구성에서 [markdown](#markdown) 옵션을 사용하여 구성할 수 있습니다.

## 사이트 메타데이터 {#site-metadata}

### title

- 타입: `string`
- 기본값: `VitePress`
- [전문](./frontmatter-config#title)을 통해 페이지별로 재정의 가능

사이트의 제목입니다. 기본 테마를 사용할 경우, 이는 내비게이션 바에 표시됩니다.

[`titleTemplate`](#titletemplate)이 정의되지 않은 경우, 모든 개별 페이지 제목의 기본 접미사로 사용됩니다. 개별 페이지의 최종 제목은 첫 번째 `<h1>` 헤더의 텍스트 콘텐츠와 전역 `title`을 접미사로 결합한 것입니다. 예를 들어 다음 구성과 페이지 콘텐츠가 있을 경우:

```ts
export default {
  title: 'My Awesome Site'
}
```

```md
# Hello
```

페이지의 제목은 `Hello | My Awesome Site`가 됩니다.

### titleTemplate

- 타입: `string | boolean`
- [전문](./frontmatter-config#titletemplate)을 통해 페이지별로 재정의 가능

각 페이지의 제목 접미사 또는 전체 제목을 커스터마이징할 수 있습니다. 예를 들어:

```ts
export default {
  title: 'My Awesome Site',
  titleTemplate: 'Custom Suffix'
}
```

```md
# Hello
```

페이지의 제목은 `Hello | Custom Suffix`가 됩니다.

제목이 렌더링되는 방식을 완전히 커스터마이징하려면 `titleTemplate`에서 `:title` 심볼을 사용할 수 있습니다:

```ts
export default {
  titleTemplate: ':title - Custom Suffix'
}
```

여기서 `:title`은 페이지의 첫 번째 `<h1>` 헤더에서 추론된 텍스트로 대체됩니다. 이전 예제 페이지의 제목은 `Hello - Custom Suffix`가 됩니다.

이 옵션을 `false`로 설정하여 제목 접미사를 비활성화할 수 있습니다.

### description

- 타입: `string`
- 기본값: `A VitePress site`
- [전문](./frontmatter-config#description)을 통해 페이지별로 재정의 가능

사이트의 설명입니다. 이는 페이지 HTML의 `<meta>` 태그로 렌더링됩니다.

```ts
export default {
  description: 'A VitePress site'
}
```

### head

- 타입: `HeadConfig[]`
- 기본값: `[]`
- [전문](./frontmatter-config#head)을 통해 페이지별로 추가 가능

페이지 HTML의 `<head>` 태그에 렌더링할 추가 엘리먼트입니다. 추가한 태그는 VitePress 태그 뒤 ~ 닫는 `head` 태그 앞에 렌더링됩니다.

```ts
type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

#### 예제: 파비콘 추가 {#example-adding-a-favicon}

```ts
export default {
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]]
} // favicon.ico를 public 디렉토리에 배치하거나 base가 설정된 경우,
  // /base/favicon.ico를 사용하세요.
/* 다음과 같이 랜더링:
  <link rel="icon" href="/favicon.ico">
*/
```

#### 예제: Google 폰트 추가 {#example-adding-google-fonts}

```ts
export default {
  head: [
    [
      'link',
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' }
    ],
    [
      'link',
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
    ],
    [
      'link',
      { href: 'https://fonts.googleapis.com/css2?family=Roboto&display=swap', rel: 'stylesheet' }
    ]
  ]
}

/* 다음과 같이 랜더링:
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
*/
```

#### 예제: 서비스 워커 등록 {#example-registering-a-service-worker}

```ts
export default {
  head: [
    [
      'script',
      { id: 'register-sw' },
      `;(() => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js')
        }
      })()`
    ]
  ]
}

/* 다음과 같이 랜더링:
  <script id="register-sw">
    ;(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
      }
    })()
  </script>
*/
```

#### 예제: Google Analytics 사용 {#example-using-google-analytics}

```ts
export default {
  head: [
    [
      'script',
      { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=TAG_ID' }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'TAG_ID');`
    ]
  ]
}

/* 다음과 같이 랜더링:
  <script async src="https://www.googletagmanager.com/gtag/js?id=TAG_ID"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'TAG_ID');
  </script>
*/
```

### lang

- 타입: `string`
- 기본값: `en-US`

사이트의 언어 어트리뷰트입니다. 이는 페이지 HTML의 `<html lang="en-US">` 태그로 렌더링됩니다.

```ts
export default {
  lang: 'en-US'
}
```

### base

- 타입: `string`
- 기본값: `/`

사이트가 배포될 기본 URL입니다. 예를 들어 GitHub Pages와 같이 서브 경로에 사이트를 배포하려는 경우 이것을 설정해야 합니다. `https://foo.github.io/bar/` 에 사이트를 배포하려면 `'/bar/'`로 설정해야 합니다. 항상 슬래시로 시작하고 끝나야 합니다.

이것은 다른 옵션에서 `/`로 시작하는 모든 URL에 자동으로 추가되므로, 한 번만 지정하면 됩니다.

```ts
export default {
  base: '/base/'
}
```

## 라우팅 {#routing}

### cleanUrls

- 타입: `boolean`
- 기본값: `false`

`true`로 설정하면 VitePress는 URL에서 `.html`을 제거합니다. [간결한 URL 생성](../guide/routing#generating-clean-url)을 참고하세요.

::: warning 서버 지원 필요
이를 활성화하려면 호스팅 플랫폼에서 추가 구성이 필요할 수 있습니다. 서버가 `/foo`를 방문할 때 **리디렉션 없이** `/foo.html`을 제공할 수 있어야 합니다.
:::

### rewrites

- 타입: `Record<string, string>`

커스텀 디렉터리와 URL 매핑을 정의합니다. 자세한 내용은 [라우팅: 라우트 재작성](../guide/routing#route-rewrites)을 참고하세요.

```ts
export default {
  rewrites: {
    'source/:page': 'destination/:page'
  }
}
```

## 빌드 {#build}

### srcDir

- 타입: `string`
- 기본값: `.`

마크다운 페이지가 저장되는 디렉터리입니다. 프로젝트 루트에 상대적입니다. 또한 [루트와 소스 디렉터리](../guide/routing#root-and-source-directory)를 참고하세요.

```ts
export default {
  srcDir: './src'
}
```

### srcExclude

- 타입: `string`
- 기본값: `undefined`

소스 컨텐츠에서 제외해야 하는 마크다운 파일을 매칭하기 위한 [glob 패턴](https://github.com/mrmlnc/fast-glob#pattern-syntax)입니다.

```ts
export default {
  srcExclude: ['**/README.md', '**/TODO.md']
}
```

### outDir

- 타입: `string`
- 기본값: `./.vitepress/dist`

사이트의 빌드 결과물 위치입니다. [프로젝트 루트](../guide/routing#root-and-source-directory)에 상대적입니다.

```ts
export default {
  outDir: '../public'
}
```

### assetsDir

- 타입: `string`
- 기본값: `assets`

생성된 에셋을 포함할 디렉터리를 지정합니다. 경로는 [`outDir`](#outdir) 내에 있어야 하며, 그것을 기준으로 처리됩니다.

```ts
export default {
  assetsDir: 'static'
}
```

### cacheDir

- 타입: `string`
- 기본값: `./.vitepress/cache`

캐시 파일을 위한 디렉터리입니다. [프로젝트 루트](../guide/routing#root-and-source-directory)에 상대적입니다. [cacheDir](https://vitejs.dev/config/shared-options.html#cachedir)을 참고하세요.

```ts
export default {
  cacheDir: './.vitepress/.vite'
}
```

### ignoreDeadLinks

- 타입: `boolean | 'localhostLinks' | (string | RegExp | ((link: string) => boolean))[]`
- 기본값: `false`

`true`로 설정하면, 빌드 시 죽은 링크로 인해 실패하지 않습니다.

`'localhostLinks'`로 설정하면, 죽은 링크가 있으면 빌드에 실패하지만 `localhost` 링크는 확인하지 않습니다.

```ts
export default {
  ignoreDeadLinks: true
}
```

정확히 일치하는 URL 문자열, 정규 표현식 패턴, 커스텀 필터 함수로 구성된 배열도 가능합니다.

```ts
export default {
  ignoreDeadLinks: [
    // "/playground"과 정확히 일치하는 url 무시
    '/playground',
    // 모든 localhost 링크 무시
    /^https?:\/\/localhost/,
    // 모든 "/repl/" 포함 링크 무시
    /\/repl\//,
    // 커스텀 함수, "ignore"를 포함한 모든 링크 무시
    (url) => {
      return url.toLowerCase().includes('ignore')
    }
  ]
}
```

### metaChunk <Badge type="warning" text="실험적" />

- 타입: `boolean`
- 기본값: `false`

`true`로 설정하면 페이지 메타데이터를 초기 HTML에 인라인으로 삽입하는 대신 별도의 JavaScript 청크로 추출합니다. 이렇게 하면 각 페이지의 HTML 페이로드가 작아지고 페이지 메타데이터를 캐시할 수 있어, 사이트에 많은 페이지가 있을 때 서버 대역폭을 줄일 수 있습니다.

### mpa <Badge type="warning" text="실험적" />

- 타입: `boolean`
- 기본값: `false`

`true`로 설정하면 프로덕션 애플리케이션이 [MPA 모드](../guide/mpa-mode)로 빌드됩니다. MPA 모드는 기본적으로 0kb JavaScript를 제공하지만, 클라이언트 사이드 탐색을 비활성화하고 상호작용을 위한 명시적인 옵트인을 필요로 합니다.

## 테마 {#theming}

### appearance

- 타입: `boolean | 'dark' | 'force-dark' | 'force-auto' | import('@vueuse/core').UseDarkOptions`
- 기본값: `true`

다크 모드를 활성화 여부를 설정합니다 (`.dark` 클래스를 `<html>` 엘리먼트에 추가).

- `true`: 기본 테마는 유저의 선호 색상 설정에 따라 결정됩니다.
- `dark`: 유저가 수동으로 변경하지 않는 한 기본 테마는 다크 모드가 됩니다.
- `false`: 유저는 테마를 전환할 수 없습니다.
- `'force-dark'`: 테마는 항상 다크 모드가 되며 유저는 이를 전환할 수 없습니다.
- `'force-auto'`: 테마는 항상 유저의 선호 색상 설정에 따라 결정되며 유저는 이를 전환할 수 없습니다.

이 옵션은 `vitepress-theme-appearance` 키를 사용하여 로컬 스토리지에서 유저 설정을 복원하는 인라인 스크립트를 삽입합니다. 이는 페이지가 렌더링되기 전에 `.dark` 클래스가 적용되어 깜박임을 방지합니다.

`appearance.initialValue`는 `'dark'` 또는 `undefined`만 가능합니다. Refs 또는 getter는 지원되지 않습니다.

### lastUpdated

- 타입: `boolean`
- 기본값: `false`

각 페이지의 마지막 업데이트 타임스탬프를 Git을 사용하여 가져올지 여부를 설정합니다. 타임스탬프는 각 페이지의 페이지 데이터에 포함되며, [`useData`](./runtime-api#usedata)를 통해 접근할 수 있습니다.

기본 테마를 사용할 때, 이 옵션을 활성화하면 각 페이지의 마지막 업데이트 시간이 표시됩니다. [`themeConfig.lastUpdatedText`](./default-theme-config#lastupdatedtext) 옵션을 통해 텍스트를 커스터마이징할 수 있습니다.

## 커스터마이징 {#customization}

### markdown

- 타입: `MarkdownOption`

마크다운 파서 옵션을 구성합니다. VitePress는 파서로 [Markdown-it](https://github.com/markdown-it/markdown-it)을 사용하고, 언어 구문 강조를 위해 [Shiki](https://github.com/shikijs/shiki)를 사용합니다. 이 옵션 내에서 다양한 마크다운 관련 옵션을 전달하여 필요에 맞게 조정할 수 있습니다.

```js
export default {
  markdown: {...}
}
```

사용 가능한 모든 옵션에 대해서는 [타입 선언 및 jsdocs](https://github.com/vuejs/vitepress/blob/main/src/node/markdown/markdown.ts)를 참고하세요.

### vite

- 타입: `import('vite').UserConfig`

내부 Vite 개발 서버/번들러에 직접 [Vite 구성](https://vitejs.dev/config/)을 전달합니다.

```js
export default {
  vite: {
    // Vite 구성 옵션
  }
}
```

### vue

- 타입: `import('@vitejs/plugin-vue').Options`

내부 플러그인 인스턴스에 직접 [`@vitejs/plugin-vue` 옵션](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#options)을 전달합니다.

```js
export default {
  vue: {
    // @vitejs/plugin-vue 옵션
  }
}
```

## 빌드 훅 {#build-hooks}

VitePress 빌드 훅은 웹사이트에 새로운 기능과 동작을 추가할 수 있게 합니다:

- 사이트맵
- 검색 인덱싱
- PWA
- 텔레포트

### buildEnd

- 타입: `(siteConfig: SiteConfig) => Awaitable<void>`

`buildEnd`는 빌드 CLI 훅으로, 빌드(SSG)가 완료된 후 VitePress CLI 프로세스가 종료되기 전에 실행됩니다.

```ts
export default {
  async buildEnd(siteConfig) {
    // ...
  }
}
```

### postRender

- 타입: `(context: SSGContext) => Awaitable<SSGContext | void>`

`postRender`는 빌드 훅으로, SSG 렌더링이 완료되었을 때 호출됩니다. 이를 통해 SSG 동안 텔레포트 콘텐츠를 핸들링 할 수 있습니다.

```ts
export default {
  async postRender(context) {
    // ...
  }
}
```

```ts
interface SSGContext {
  content: string
  teleports?: Record<string, string>
  [key: string]: any
}
```

### transformHead

- 타입: `(context: TransformContext) => Awaitable<HeadConfig[]>`

`transformHead`는 각 페이지를 생성하기 전에 헤드를 변환하는 빌드 훅입니다. VitePress 구성에 정적으로 추가할 수 없는 헤드 항목을 추가할 수 있습니다. 기존 항목과 자동으로 병합되므로 추가 항목만 반환하면 됩니다.

::: warning
`context` 내부의 어떤 것도 변경하지 마세요.
:::

```ts
export default {
  async transformHead(context) {
    // ...
  }
}
```

```ts
interface TransformContext {
  page: string // 예: index.md (srcDir에 상대적)
  assets: string[] // js/css가 아닌 모든 에셋을 완전히 처리된 public URL로 표시.
  siteConfig: SiteConfig
  siteData: SiteData
  pageData: PageData
  title: string
  description: string
  head: HeadConfig[]
  content: string
}
```

이 훅은 사이트를 정적으로 생성할 때만 호출됩니다. 개발 중에는 호출되지 않습니다. 개발 중에 동적 헤드 항목을 추가해야 하는 경우, [`transformPageData`](#transformpagedata) 훅을 대신 사용할 수 있습니다:

```ts
export default {
  transformPageData(pageData) {
    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push([
      'meta',
      {
        name: 'og:title',
        content:
          pageData.frontmatter.layout === 'home'
            ? `VitePress`
            : `${pageData.title} | VitePress`
      }
    ])
  }
}
```

#### 예제: 표준 URL `<link>` 추가 {#example-adding-a-canonical-url-link}

```ts
export default {
  transformPageData(pageData) {
    const canonicalUrl = `https://example.com/${pageData.relativePath}`
      .replace(/index\.md$/, '')
      .replace(/\.md$/, '.html')

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push([
      'link',
      { rel: 'canonical', href: canonicalUrl }
    ])
  }
}
```

### transformHtml

- 타입: `(code: string, id: string, context: TransformContext) => Awaitable<string | void>`

`transformHtml`은 각 페이지의 내용을 디스크에 저장하기 전에 변환하는 빌드 훅입니다.

::: warning
`context` 내부의 어떤 것도 변경하지 마세요. HTML 내용을 수정하면 런타임에 하이드레이션 문제가 발생할 수 있습니다.
:::

```ts
export default {
  async transformHtml(code, id, context) {
    // ...
  }
}
```

### transformPageData

- 타입: `(pageData: PageData, context: TransformPageContext) => Awaitable<Partial<PageData> | { [key: string]: any } | void>`

`transformPageData`는 각 페이지의 `pageData`를 변환하는 훅입니다. `pageData`를 직접 변경하거나, 변경된 값을 반환하여 페이지 데이터에 병합할 수 있습니다.

::: warning
`context` 내부의 어떤 것도 변경하지 마세요. 이 훅에서 네트워크 요청이나 이미지 생성과 같은 무거운 연산이 있을 경우 개발 서버의 성능에 영향을 줄 수 있으니 주의하세요. 조건부 로직을 위해 `process.env.NODE_ENV === 'production'`을 확인할 수 있습니다.
:::

```ts
export default {
  async transformPageData(pageData, { siteConfig }) {
    pageData.contributors = await getPageContributors(pageData.relativePath)
  }

  // 또는 병합할 데이터 반환
  async transformPageData(pageData, { siteConfig }) {
    return {
      contributors: await getPageContributors(pageData.relativePath)
    }
  }
}
```

```ts
interface TransformPageContext {
  siteConfig: SiteConfig
}
```
