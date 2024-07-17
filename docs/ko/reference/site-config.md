---
outline: deep
---

# 사이트 설정 {#site-config}

사이트 설정은 사이트의 전역 설정을 정의할 수 있는 곳입니다. 앱 설정 옵션은 사용되는 테마에 상관없이 모든 VitePress 사이트에 적용되는 설정을 정의합니다. 예를 들어, 기본 디렉토리 또는 사이트의 제목 등이 있습니다.

## 개요 {#overview}

### 설정 해석 {#config-resolution}

설정 파일은 항상 `<root>/.vitepress/config.[ext]`에서 해석되며, 여기서 `<root>`는 여러분의 VitePress [프로젝트 루트](../guide/routing#root-and-source-directory), 그리고 `[ext]`는 지원되는 파일 확장명 중 하나입니다. TypeScript는 기본적으로 지원됩니다. 지원되는 확장명에는 `.js`, `.ts`, `.mjs`, 그리고 `.mts`가 포함됩니다.

설정 파일에서는 ES 모듈 문법의 사용을 권장합니다. 설정 파일은 객체를 기본 내보내기해야 합니다:

```ts
export default {
  // 앱 레벨 설정 옵션
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue를 활용한 정적 사이트 생성기.',
  ...
}
```

::: details 동적(비동기) 설정

동적으로 설정을 생성해야 하는 경우, 함수를 기본 내보내기로 사용할 수도 있습니다. 예를 들면:

```ts
import { defineConfig } from 'vitepress'

export default async () => {
  const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

  return defineConfig({
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
}
```

예를 들어 상위 수준의 `await`도 사용할 수 있습니다:

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

### 설정 옵션에 대한 인텔리센스 {#config-intellisense}

`defineConfig` 헬퍼를 사용하면 설정 옵션에 대해 TypeScript로 제공되는 인텔리센스를 활용할 수 있습니다. 여러분의 IDE가 지원한다면, JavaScript와 TypeScript 모두에서 작동할 것입니다.

```js
import { defineConfig } from 'vitepress'

export default defineConfig({
  // ...
})
```

### 타입이 지정된 테마 설정 {#typed-theme-config}

기본적으로, `defineConfig` 헬퍼는 기본 테마에서 테마 설정 유형을 예상합니다:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    // 유형은 `DefaultTheme.Config`
  }
})
```

커스텀 테마를 사용하고 테마 설정에 대한 타입 검사를 원한다면, 대신 `defineConfigWithTheme`을 사용해야 하며, 일반 인수를 통해 귀하의 커스텀 테마에 대한 설정 유형을 전달해야 합니다:

```ts
import { defineConfigWithTheme } from 'vitepress'
import type { ThemeConfig } from 'your-theme'

export default defineConfigWithTheme<ThemeConfig>({
  themeConfig: {
    // 유형은 `ThemeConfig`
  }
})
```

### Vite, Vue & Markdown 설정 {#vite-vue-markdown-config}

- **Vite**

  여러분은 VitePress 설정에서 [vite](#vite) 옵션을 사용하여 기본 Vite 인스턴스를 구성할 수 있습니다. 별도의 Vite 설정 파일을 만들 필요는 없습니다.

- **Vue**

  VitePress는 이미 Vite용 공식 Vue 플러그인([@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue))을 포함하고 있습니다. VitePress 설정에서 [vue](#vue) 옵션을 사용하여 그 옵션을 구성할 수 있습니다.

- **Markdown**

  [Markdown-It](https://github.com/markdown-it/markdown-it) 인스턴스를 VitePress 설정에서 [markdown](#markdown) 옵션을 사용하여 구성할 수 있습니다.

## 사이트 메타데이터 {#site-metadata}

### title

- 유형: `string`
- 기본값: `VitePress`
- 페이지별로 [frontmatter](./frontmatter-config#title)를 통해 재정의 가능

사이트의 제목입니다. 기본 테마를 사용할 경우, 이것은 내비게이션 바에 표시됩니다.

전체 페이지 제목에 기본 접미사로도 사용됩니다. 그렇지 않으면 [`titleTemplate`](#titletemplate)이 정의되어 있습니다. 개별 페이지의 최종 제목은 첫 번째 `<h1>` 헤더의 텍스트 내용과 전역 `title`을 접미사로 결합한 것입니다. 예를 들어 다음과 같은 설정과 페이지 내용을 가진 경우:

```ts
export default {
  title: '나의 멋진 사이트'
}
```

```md
# 안녕하세요
```

페이지의 제목은 `안녕하세요 | 나의 멋진 사이트`가 될 것입니다.

### titleTemplate

- 유형: `string | boolean`
- 페이지별로 [frontmatter](./frontmatter-config#titletemplate)를 통해 재정의 가능

각 페이지의 제목 접미사 또는 전체 제목을 사용자 정의할 수 있습니다. 예를 들면:

```ts
export default {
  title: '나의 멋진 사이트',
  titleTemplate: '커스텀 접미사'
}
```

```md
# 안녕하세요
```

페이지의 제목은 `안녕하세요 | 커스텀 접미사`가 될 것입니다.

`:title` 기호를 `titleTemplate`에 사용하여 제목이 어떻게 렌더링될지 완전히 사용자 정의할 수 있습니다:

```ts
export default {
  titleTemplate: ':title - 커스텀 접미사'
}
```

이 경우 `:title`은 페이지의 첫 번째 `<h1>` 헤더에서 추론된 텍스트로 대체됩니다. 이전 예제 페이지의 제목은 `안녕하세요 - 커스텀 접미사`가 될 것입니다.

이 옵션은 `false`로 설정하여 제목 접미사를 비활성화할 수 있습니다.

### description

- 유형: `string`
- 기본값: `VitePress 사이트`
- 페이지별로 [frontmatter](./frontmatter-config#description)를 통해 재정의 가능

사이트에 대한 설명입니다. 이것은 페이지 HTML의 `<meta>` 태그로 렌더링됩니다.

```ts
export default {
  description: 'VitePress 사이트'
}
```

### head

- 유형: `HeadConfig[]`
- 기본값: `[]`
- 페이지별로 [frontmatter](./frontmatter-config#head)를 통해 추가 가능

페이지 HTML의 `<head>` 태그에 렌더링할 추가 요소들입니다. 사용자가 추가한 태그는 VitePress 태그 뒤, `head` 태그가 닫히기 전에 렌더링됩니다.

```ts
type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

#### 예제: 파비콘 추가 {#example-adding-a-favicon}

```ts
export default {
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]]
} // base가 설정된 경우, /base/favicon.ico를 사용하세요

/* 다음을 렌더링할 것입니다:
  <link rel="icon" href="/favicon.ico">
*/
```

#### 예제: Google Fonts 추가 {#example-adding-google-fonts}

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

/* 다음을 렌더링할 것입니다:
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

/* 다음을 렌더링할 것입니다:
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

/* 다음을 렌더링할 것입니다:
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

- 유형: `string`
- 기본값: `en-US`

사이트의 lang 속성입니다. 이것은 페이지 HTML의 `<html lang="en-US">` 태그로 렌더링됩니다.

```ts
export default {
  lang: 'en-US'
}
```

### base

- 유형: `string`
- 기본값: `/`

사이트가 배포될 기본 URL입니다. 여러분이 사이트를 GitHub 페이지와 같은 하위 경로에 배포할 계획이라면 이것을 설정해야 합니다. 예를 들어, 여러분의 사이트를 `https://foo.github.io/bar/`에 배포할 계획이라면 base를 `'/bar/'`로 설정해야 합니다. 항상 슬래시로 시작하고 끝나야 합니다.

base는 자동으로 다른 옵션에서 /로 시작하는 모든 URL에 자동으로 추가되므로 한 번만 지정하면 됩니다.

```ts
export default {
  base: '/base/'
}
```

## 라우팅 {#routing}

### cleanUrls

- 유형: `boolean`
- 기본값: `false`

`true`로 설정하면, VitePress는 URL에서 끝부분 `.html`을 제거합니다. 또한 [클린 URL 생성](../guide/routing#generating-clean-url)을 참조하세요.

::: warning 서버 지원 필요
이를 활성화하려면 호스팅 플랫폼에서 추가 구성이 필요할 수 있습니다. 작동하려면 서버가 `/foo.html`을 방문할 때 `/foo`를 **리디렉션 없이** 제공할 수 있어야 합니다.
:::

### rewrites

- 유형: `Record<string, string>`

사용자 지정 디렉토리 &lt;-&gt; URL 매핑을 정의합니다. 자세한 내용은 [라우팅: 라우트 재작성](../guide/routing#route-rewrites)을 참조하십시오.

```ts
export default {
  rewrites: {
    'source/:page': 'destination/:page'
  }
}
```

## 빌드 {#build}

### srcDir

- 유형: `string`
- 기본값: `.`

프로젝트 루트에 대해 상대적인 마크다운 페이지가 저장되는 디렉토리입니다. 또한 [루트 및 소스 디렉토리](../guide/routing#root-and-source-directory)를 참조하십시오.

```ts
export default {
  srcDir: './src'
}
```

### srcExclude

- 유형: `string`
- 기본값: `undefined`

소스 콘텐츠로 제외해야 하는 마크다운 파일을 일치시키는 [글로브 패턴](https://github.com/mrmlnc/fast-glob#pattern-syntax)입니다.

```ts
export default {
  srcExclude: ['**/README.md', '**/TODO.md']
}
```

### outDir

- 유형: `string`
- 기본값: `./.vitepress/dist`

사이트의 빌드 출력 위치로, [프로젝트 루트](../guide/routing#root-and-source-directory)에 대해 상대적입니다.

```ts
export default {
  outDir: '../public'
}
```

### assetsDir

- 유형: `string`
- 기본값: `assets`

생성된 자산을 중첩할 디렉토리를 지정합니다. 경로는 [`outDir`](#outdir) 내부에 있어야 하며 이에 대해 상대적으로 해결됩니다.

```ts
export default {
  assetsDir: 'static'
}
```

### cacheDir

- 유형: `string`
- 기본값: `./.vitepress/cache`

캐시 파일을 위한 디렉토리로, [프로젝트 루트](../guide/routing#root-and-source-directory)에 대해 상대적입니다. 또한: [cacheDir](https://vitejs.dev/config/shared-options.html#cachedir)을 참조하세요.

```ts
export default {
  cacheDir: './.vitepress/.vite'
}
```

### ignoreDeadLinks

- 유형: `boolean | 'localhostLinks' | (string | RegExp | ((link: string) => boolean))[]`
- 기본값: `false`

`true`로 설정하면, VitePress는 죽은 링크로 인해 빌드가 실패하지 않습니다.

`'localhostLinks'`로 설정하면, 빌드가 죽은 링크로 실패하지만, `localhost` 링크는 확인하지 않습니다.

```ts
export default {
  ignoreDeadLinks: true
}
```

정확한 url 문자열, 정규식 패턴, 또는 사용자 정의 필터 함수의 배열일 수도 있습니다.

```ts
export default {
  ignoreDeadLinks: [
    // 정확한 url "/playground"를 무시
    '/playground',
    // 모든 localhost 링크 무시
    /^https?:\/\/localhost/,
    // 모든 "/repl/" 포함 링크 무시
    /\/repl\//,
    // 사용자 정의 함수, "ignore"를 포함한 모든 링크 무시
    (url) => {
      return url.toLowerCase().includes('ignore')
    }
  ]
}
```

### metaChunk <Badge type="warning" text="실험적" />

- 타입: `boolean`
- 기본값: `false`

`true`로 설정하면, 초기 HTML에 인라인으로 포함되는 대신 별도의 JavaScript 청크로 페이지 메타데이터를 추출합니다. 이렇게 하면 각 페이지의 HTML 페이로드가 줄어들고 페이지 메타데이터 캐싱이 가능해져 사이트에 많은 페이지가 있을 때 서버 대역폭이 줄어듭니다.

### mpa <Badge type="warning" text="실험적" />

- 타입: `boolean`
- 기본값: `false`

`true`로 설정하면, 프로덕션 앱이 [MPA 모드](../guide/mpa-mode)로 빌드됩니다. MPA 모드는 기본적으로 0kb의 JavaScript를 제공하지만, 클라이언트 측 탐색을 비활성화하고 상호작용에 대해 명시적인 동의가 필요합니다.

## 테마 {#theming}

### appearance

- 타입: `boolean | 'dark' | 'force-dark' | 'force-auto' | import('@vueuse/core').UseDarkOptions`
- 기본값: `true`

다크 모드(HTML 요소에 `.dark` 클래스 추가) 활성화 여부입니다.

- 옵션이 `true`로 설정되면, 기본 테마는 사용자의 선호 색상 체계에 따라 결정됩니다.
- 옵션이 `dark`로 설정되면, 테마는 기본적으로 다크 모드가 되며, 사용자가 수동으로 전환할 수 있습니다.
- 옵션이 `false`로 설정되면, 사용자는 테마를 전환할 수 없습니다.
- 옵션이 `'force-dark'`로 설정된 경우, 테마는 항상 어둡게 유지되며 사용자는 이를 변경할 수 없습니다.
- 옵션이 `'force-auto'`로 설정된 경우, 테마는 항상 사용자의 선호 색상에 의해 결정되며 사용자는 이를 변경할 수 없습니다.

이 옵션은 `vitepress-theme-appearance` 키를 사용하여 로컬 스토리지에서 사용자 설정을 복원하는 인라인 스크립트를 삽입합니다. 이는 페이지가 렌더링되기 전에 `.dark` 클래스가 적용되어 깜빡임을 방지합니다.

`appearance.initialValue`는 `'dark' | undefined`만 가능합니다. Refs나 게터는 지원되지 않습니다.

### lastUpdated

- 타입: `boolean`
- 기본값: `false`

Git을 사용하여 각 페이지의 마지막 업데이트 타임스탬프를 가져옵니다. 타임스탬프는 각 페이지의 페이지 데이터에 포함되며, [`useData`](./runtime-api#usedata)를 통해 접근할 수 있습니다.

기본 테마를 사용하는 경우, 이 옵션을 활성화하면 각 페이지의 마지막 업데이트 시간이 표시됩니다. [`themeConfig.lastUpdatedText`](./default-theme-config#lastupdatedtext) 옵션을 통해 텍스트를 사용자 정의할 수 있습니다.

## 사용자 정의 {#customization}

### markdown

- 타입: `MarkdownOption`

Markdown 파서 옵션을 구성합니다. VitePress는 파서로 [Markdown-it](https://github.com/markdown-it/markdown-it)를, 언어 구문을 강조하는 데 [Shiki](https://github.com/shikijs/shiki)를 사용합니다. 이 옵션 안에서 필요에 맞는 다양한 Markdown 관련 옵션을 전달할 수 있습니다.

```js
export default {
  markdown: {...}
}
```

모든 사용 가능한 옵션에 대해서는 [타입 선언과 jsdocs](https://github.com/vuejs/vitepress/blob/main/src/node/markdown/markdown.ts)를 확인하세요.

### vite

- 타입: `import('vite').UserConfig`

내부 Vite 개발 서버/번들러에 직접 [Vite 설정](https://vitejs.dev/config/)을 전달합니다.

```js
export default {
  vite: {
    // Vite 설정 옵션
  }
}
```

### vue

- 타입: `import('@vitejs/plugin-vue').Options`

내부 플러그인 인스턴스에 [`@vitejs/plugin-vue` 옵션](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#options)을 직접 전달합니다.

```js
export default {
  vue: {
    // @vitejs/plugin-vue 옵션
  }
}
```

## 빌드 후크 {#build-hooks}

VitePress 빌드 후크는 웹사이트에 새로운 기능과 동작을 추가할 수 있습니다:

- 사이트맵
- 검색 색인 작성
- PWA
- Teleports

### buildEnd

- 타입: `(siteConfig: SiteConfig) => Awaitable<void>`

`buildEnd`는 빌드 CLI 후크로, 빌드(정적 사이트 생성, SSG) 완료 후 VitePress CLI 프로세스가 종료되기 전에 실행됩니다.

```ts
export default {
  async buildEnd(siteConfig) {
    // ...
  }
}
```

### postRender

- 타입: `(context: SSGContext) => Awaitable<SSGContext | void>`

`postRender`는 SSG 렌더링이 완료되었을 때 호출되는 빌드 후크입니다. SSG 중 Teleports 콘텐츠를 다루는 것을 허용합니다.

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

`transformHead`는 각 페이지를 생성하기 전에 head를 변환하는 빌드 후크입니다. 정적으로 VitePress 설정에 추가할 수 없는 head 항목을 추가할 수 있습니다. 기존 항목과 자동으로 병합되므로 추가 항목만 반환하면 됩니다.

::: warning
`context` 내부에서 어떤 것도 변형하지 마세요.
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
  page: string // 예: index.md (srcDir에 대해 상대적)
  assets: string[] // 모든 비-js/css 자산을 전적으로 해결된 공개 URL로
  siteConfig: SiteConfig
  siteData: SiteData
  pageData: PageData
  title: string
  description: string
  head: HeadConfig[]
  content: string
}
```

이 후크는 웹사이트를 정적으로 생성할 때만 호출됩니다. 개발 중에는 호출되지 않습니다. 개발 중에 동적 head 항목을 추가해야 하는 경우, [`transformPageData`](#transformpagedata) 후크를 사용할 수 있습니다:

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

#### 예시: 정규 URL `<link>` 추가 {#example-adding-a-canonical-url-link}

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

`transformHtml`는 디스크에 저장하기 전 각 페이지의 콘텐츠를 변환하는 빌드 훅입니다.

::: warning
`context` 내에서는 어떠한 것도 변경하지 마세요. 또한, html 콘텐츠를 수정하는 것은 런타임에 수화 문제를 일으킬 수 있습니다.
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

`transformPageData`는 각 페이지의 `pageData`를 변환하는 훅입니다. `pageData`를 직접 변경하거나 변경된 값들을 반환하여 페이지 데이터에 병합할 수 있습니다.

::: warning
`context` 내에서는 어떠한 것도 변경하지 마세요. 또한, 이 작업은 개발 서버의 성능에 영향을 줄 수 있으므로 주의하세요. 특히, 훅에서 네트워크 요청이나 이미지 생성과 같은 무거운 연산을 수행하는 경우에는 조건부 로직을 위해 `process.env.NODE_ENV === 'production'`를 확인할 수 있습니다.
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
