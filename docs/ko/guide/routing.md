---
outline: deep
---

# 라우팅 {#routing}

## 파일 기반 라우팅 {#file-based-routing}

VitePress는 파일 기반 라우팅을 사용하므로, 생성된 HTML 페이지는 소스 마크다운 파일의 디렉토리 구조에서 매핑됩니다. 예를 들어, 다음과 같은 디렉토리 구조가 있다고 가정하면:

```
.
├─ guide
│  ├─ getting-started.md
│  └─ index.md
├─ index.md
└─ prologue.md
```

생성된 HTML 페이지는 다음과 같습니다:

```
index.md                  -->  /index.html (/ 로 접근 가능)
prologue.md               -->  /prologue.html
guide/index.md            -->  /guide/index.html (/guide/ 로 접근 가능)
guide/getting-started.md  -->  /guide/getting-started.html
```

생성된 HTML은 정적 파일을 제공할 수 있는 모든 웹 서버에서 호스팅할 수 있습니다.

## 루트와 소스 디렉토리 {#root-and-source-directory}

VitePress 프로젝트의 파일 구조에는 두 가지 중요한 개념이 있습니다: **프로젝트 루트**와 **소스 디렉토리**입니다.

### 프로젝트 루트 {#project-root}

프로젝트 루트는 VitePress가 `.vitepress` 특수 디렉토리를 찾으려고 하는 위치입니다. `.vitepress` 디렉토리는 VitePress의 구성 파일, 개발 서버 캐시, 빌드 출력물, 그리고 선택적인 커스텀 테마 코드를 위한 예약된 위치입니다.

명령줄에서 `vitepress dev`나 `vitepress build`를 실행하면 VitePress는 현재 작업 디렉토리를 프로젝트 루트로 사용합니다. 서브 디렉토리를 루트로 지정하려면 명령어에 상대 경로를 전달해야 합니다. 예를 들어, VitePress 프로젝트가 `./docs`에 위치한 경우, `vitepress dev docs`를 실행해야 합니다:

```
.
├─ docs                    # 프로젝트 루트
│  ├─ .vitepress           # 구성 폴더
│  ├─ getting-started.md
│  └─ index.md
└─ ...
```

```sh
vitepress dev docs
```

이렇게 하면 다음과 같은 소스에서 HTML로의 매핑이 이루어집니다:

```
docs/index.md            -->  /index.html (/ 로 접근 가능)
docs/getting-started.md  -->  /getting-started.html
```

### 소스 디렉토리 {#source-directory}

소스 디렉터리는 마크다운 소스 파일이 저장되는 위치입니다. 기본적으로 프로젝트 루트와 동일합니다. 그러나 [`srcDir`](../reference/site-config#srcdir) 구성 옵션으로 설정할 수 있습니다.

`srcDir` 옵션은 프로젝트 루트를 기준으로 해석됩니다. 예를 들어, `srcDir: 'src'`로 설정하면 파일 구조는 다음과 같이 됩니다:

```
.                          # 프로젝트 루트
├─ .vitepress              # 구성 디렉터리
└─ src                     # 소스 디렉터리
   ├─ getting-started.md
   └─ index.md
```

소스에서 HTML로 매핑된 결과:

```
src/index.md            -->  /index.html (/ 로 접근 가능)
src/getting-started.md  -->  /getting-started.html
```

## 페이지 간 연결 {#linking-between-pages}

페이지 간 링크를 만들 때 절대 경로와 상대 경로 모두 사용할 수 있습니다. `.md`와 `.html` 확장자 모두 작동하지만, VitePress가 구성에 따라 최종 URL을 생성할 수 있도록 파일 확장자를 생략하는 것이 좋은 방법입니다.

```md
<!-- Do -->
[시작하기](./getting-started)
[시작하기](../guide/getting-started)

<!-- Don't -->
[시작하기](./getting-started.md)
[시작하기](./getting-started.html)
```

이미지와 같은 에셋에 링크하는 방법에 대해 더 알아보려면 [에셋 처리](./asset-handling)를 참고하세요.

### VitePress 페이지가 아닌 페이지로 연결 {#linking-to-non-vitepress-pages}

VitePress로 생성되지 않은 페이지에 연결하려면 전체 URL(새 탭에서 열림)을 사용하거나 명시적으로 target을 지정해야 합니다:

**입력**

```md
[Link to pure.html](/pure.html){target="_self"}
```

**출력**

[Link to pure.html](/pure.html){target="_self"}

::: tip 참고

마크다운 링크에서 `base`는 URL 앞에 자동으로 추가됩니다. 이는 기본 경로 외부의 페이지에 링크하려면 링크에 `../../pure.html`과 같은 내용이 필요하다는 것을 의미합니다(브라우저에서 현재 페이지를 기준으로 해석됨).

또는 앵커 태그 문법을 직접 사용할 수도 있습니다:

```md
<a href="/pure.html" target="_self">Link to pure.html</a>
```

:::

## 간결한 URL 생성 {#generating-clean-url}

::: warning 서버 지원 필요
VitePress가 간결한 URL을 제공하려면 서버 측 지원이 필요합니다.
:::

기본적으로 VitePress는 `.html`로 끝나는 URL로 들어오는 링크를 처리합니다. 하지만 일부 사용자는 `.html` 확장자가 없는 "간결한 URL"을 선호할 수 있습니다. 예를 들어, `example.com/path.html` 대신 `example.com/path`.

일부 서버 또는 호스팅 플랫폼(예: Netlify, Vercel, GitHub Pages)은 리다이렉션 없이 `/foo`와 같은 URL을 `/foo.html`로 매핑할 수 있는 기능을 제공합니다:

- Netlify와 GitHub Pages는 기본적으로 이 기능을 지원합니다.
- Vercel은 [`vercel.json`에서 `cleanUrls` 옵션을 활성화](https://vercel.com/docs/concepts/projects/project-configuration#cleanurls)해야 합니다.

이 기능을 사용할 수 있는 경우, VitePress의 자체 [`cleanUrls`](../reference/site-config#cleanurls) 구성 옵션을 활성화해서:

- 페이지 간의 들어오는 링크가 `.html` 확장자 없이 생성됩니다.
- 현재 경로가 `.html`로 끝나는 경우, 라우터가 확장자 없는 경로로 클라이언트 리다이렉션을 수행합니다.

하지만 서버가 이러한 구성을 지원하지 않는 경우, 다음과 같은 디렉토리 구조를 수동으로 사용해야 합니다:

```
.
├─ getting-started
│  └─ index.md
├─ installation
│  └─ index.md
└─ index.md
```

## 라우트 재작성 {#route-rewrites}

프로젝트의 소스 디렉토리 구조와 생성된 페이지 간의 매핑을 사용자 정의할 수 있습니다. 이는 복잡한 프로젝트 구조를 가질 때 유용합니다. 예를 들어, 여러 패키지가 있는 모노레포를 가지고 있고, 소스 파일과 함께 문서를 다음과 같이 배치하고 싶다고 가정해 봅시다:

```
.
├─ packages
│  ├─ pkg-a
│  │  └─ src
│  │      ├─ pkg-a-code.ts
│  │      └─ pkg-a-docs.md
│  └─ pkg-b
│     └─ src
│         ├─ pkg-b-code.ts
│         └─ pkg-b-docs.md
```

그리고 VitePress 페이지를 다음과 같이 생성하고 싶다고 가정해 봅시다:

```
packages/pkg-a/src/pkg-a-docs.md  -->  /pkg-a/index.html
packages/pkg-b/src/pkg-b-docs.md  -->  /pkg-b/index.html
```

이것은 [`rewrites`](../reference/site-config#rewrites) 옵션을 구성하여 구현할 수 있습니다:

```ts [.vitepress/config.js]
export default {
  rewrites: {
    'packages/pkg-a/src/pkg-a-docs.md': 'pkg-a/index.md',
    'packages/pkg-b/src/pkg-b-docs.md': 'pkg-b/index.md'
  }
}
```

`rewrites` 옵션은 동적 라우트 파라미터도 지원합니다. 위 예에서 많은 패키지를 가지고 있다면 모든 경로를 나열하는 것이 번거로울 것입니다. 동일한 파일 구조를 가지고 있는 경우, 구성은 다음과 같이 간단하게 만들 수 있습니다:

```ts
export default {
  rewrites: {
    'packages/:pkg/src/(.*)': ':pkg/index.md'
  }
}
```

라우트 재작성은 `path-to-regexp` 패키지를 사용하여 컴파일됩니다. 보다 고급 문법에 대해서는 [여기](https://github.com/pillarjs/path-to-regexp#parameters)를 참고하십시오.

::: warning 재작성과 상대 링크

재작성 기능이 활성화되면, **상대 링크는 재작성된 경로를 기준으로 해야 합니다**. 예를 들어, `packages/pkg-a/src/pkg-a-code.md`에서 `packages/pkg-b/src/pkg-b-code.md`로 상대 링크를 생성하려면, 다음과 같이 사용해야 합니다:

```md
[Link to PKG B](../pkg-b/pkg-b-code)
```
:::

## 동적 라우트 {#dynamic-routes}

단일 마크다운 파일과 동적 데이터를 사용하여 여러 페이지를 생성할 수 있습니다. 예를 들어, 프로젝트의 모든 패키지에 해당하는 페이지를 생성하는 `packages/[pkg].md` 파일을 만들 수 있습니다. 여기서 `[pkg]` 세그먼트는 각 페이지를 구분하는 라우트 **파라미터**입니다.

### 경로 로더 파일 {#paths-loader-file}

VitePress는 정적 사이트 생성기이므로, 가능한 페이지 경로는 빌드 시에 결정되어야 합니다. 따라서 동적 라우트 페이지는 반드시 **경로 로더 파일**과 함께 제공되어야 합니다. `packages/[pkg].md`의 경우, `packages/[pkg].paths.js` (`.ts`도 지원됩니다) 파일이 필요합니다:

```
.
└─ packages
   ├─ [pkg].md         # route template
   └─ [pkg].paths.js   # route paths loader
```

경로 로더는 `paths` 메서드를 기본 내보내기로 제공하는 객체를 포함해야 합니다. `paths` 메서드는 `params` 객체 프로퍼티를 가진 배열을 반환해야 합니다. 이 객체들 각각이 해당하는 페이지를 생성하게 됩니다.

다음과 같이 `paths` 배열이 주어진 경우:

```js
// packages/[pkg].paths.js
export default {
  paths() {
    return [
      { params: { pkg: 'foo' }},
      { params: { pkg: 'bar' }}
    ]
  }
}
```

생성된 HTML 페이지는 다음과 같습니다:

```
.
└─ packages
   ├─ foo.html
   └─ bar.html
```

### 여러 파라미터 {#multiple-params}

동적 라우트는 여러 파라미터를 포함할 수 있습니다:

**파일 구조**

```
.
└─ packages
   ├─ [pkg]-[version].md
   └─ [pkg]-[version].paths.js
```

**경로 로더**

```js
export default {
  paths: () => [
    { params: { pkg: 'foo', version: '1.0.0' }},
    { params: { pkg: 'foo', version: '2.0.0' }},
    { params: { pkg: 'bar', version: '1.0.0' }},
    { params: { pkg: 'bar', version: '2.0.0' }}
  ]
}
```

**결과물**

```
.
└─ packages
   ├─ foo-1.0.0.html
   ├─ foo-2.0.0.html
   ├─ bar-1.0.0.html
   └─ bar-2.0.0.html
```

### 동적으로 경로 생성 {#dynamically-generating-paths}

경로 로더 모듈은 Node.js에서 실행되며 빌드 시에만 실행됩니다. 로컬 또는 원격 데이터를 사용하여 동적으로 경로 배열을 생성할 수 있습니다.

로컬 파일에서 경로 생성:

```js
import fs from 'fs'

export default {
  paths() {
    return fs
      .readdirSync('packages')
      .map((pkg) => {
        return { params: { pkg }}
      })
  }
}
```

원격 데이터에서 경로 생성:

```js
export default {
  async paths() {
    const pkgs = await (await fetch('https://my-api.com/packages')).json()

    return pkgs.map((pkg) => {
      return {
        params: {
          pkg: pkg.name,
          version: pkg.version
        }
      }
    })
  }
}
```

### 페이지에서 파라미터에 접근 {#accessing-params-in-page}

파라미터를 사용하여 각 페이지에 추가 데이터를 전달할 수 있습니다. 마크다운 라우트 파일은 `$params` 전역 프로퍼티를 통해 Vue 표현식에서 현재 페이지 파라미터에 접근할 수 있습니다:

```md
- 패키지 이름: {{ $params.pkg }}
- 버전: {{ $params.version }}
```

또는 [`useData`](../reference/runtime-api#usedata) 런타임 API를 통해 현재 페이지의 파라미터에 접근할 수 있습니다. 이는 마크다운 파일과 Vue 컴포넌트 모두에서 사용할 수 있습니다:

```vue
<script setup>
import { useData } from 'vitepress'

// params는 Vue ref입니다
const { params } = useData()

console.log(params.value)
</script>
```

### 원시 콘텐츠 렌더링 {#rendering-raw-content}

페이지에 전달되는 파라미터는 클라이언트 JavaScript 페이로드에서 직렬화되므로, 원격 CMS에서 가져온 원시 Markdown이나 HTML 콘텐츠와 같은 무거운 데이터를 파라미터로 전달하지 마십시오.

대신, 각 경로 객체의 `content` 프로퍼티를 사용하여 이러한 콘텐츠를 각 페이지에 전달할 수 있습니다:

```js
export default {
  async paths() {
    const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

    return posts.map((post) => {
      return {
        params: { id: post.id },
        content: post.content // 원시 마크다운 또는 HTML
      }
    })
  }
}
```

그런 다음 특수 문법을 사용하여 마크다운 파일 자체의 일부로 콘텐츠를 렌더링할 수 있습니다:

```md
<!-- @content -->
```
