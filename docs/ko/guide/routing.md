---
개요: 심층
---

# 라우팅 {#routing}

## 파일 기반 라우팅 {#file-based-routing}

VitePress는 파일 기반 라우팅을 사용하므로, 생성된 HTML 페이지는 소스 마크다운 파일의 디렉토리 구조에서 매핑됩니다. 예를 들어, 다음과 같은 디렉토리 구조가 주어진 경우:

```
.
├─ 가이드
│  ├─ 시작하기.md
│  └─ index.md
├─ index.md
└─ 프롤로그.md
```

생성된 HTML 페이지는 다음과 같습니다:

```
index.md                  -->  /index.html (접근 가능 경로 /)
프롤로그.md               -->  /프롤로그.html
가이드/index.md          -->  /가이드/index.html (접근 가능 경로 /가이드/)
가이드/시작하기.md       -->  /가이드/시작하기.html
```

결과적으로 생성된 HTML은 정적 파일을 제공할 수 있는 모든 웹 서버에서 호스팅할 수 있습니다.

## 루트와 소스 디렉토리 {#root-and-source-directory}

VitePress 프로젝트의 파일 구조에서 두 가지 중요한 개념이 있습니다: **프로젝트 루트**와 **소스 디렉토리**.

### 프로젝트 루트 {#project-root}

프로젝트 루트는 VitePress가 `.vitepress` 특수 디렉토리를 찾으려고 시도하는 위치입니다. `.vitepress` 디렉토리는 VitePress의 설정 파일, 개발 서버 캐시, 빌드 출력, 그리고 선택적 테마 커스터마이징 코드를 위한 예약된 위치입니다.

명령 줄에서 `vitepress dev`나 `vitepress build`를 실행할 때, VitePress는 현재 작업 디렉토리를 프로젝트 루트로 사용합니다. 서브 디렉토리를 루트로 지정하려면 상대 경로를 명령에 전달해야 합니다. 예를 들어, VitePress 프로젝트가 `./docs`에 위치한 경우, `vitepress dev docs`를 실행해야 합니다:

```
.
├─ docs                    # 프로젝트 루트
│  ├─ .vitepress           # 설정 디렉토리
│  ├─ 시작하기.md
│  └─ index.md
└─ ...
```

```sh
vitepress dev docs
```

이것은 다음과 같은 소스-HTML 매핑을 결과로 합니다:

```
docs/index.md            -->  /index.html (접근 가능 경로 /)
docs/시작하기.md       -->  /시작하기.html
```

### 소스 디렉토리 {#source-directory}

소스 디렉토리는 마크다운 소스 파일이 위치하는 곳입니다. 기본적으로, 이는 프로젝트 루트와 동일합니다. 하지만, [`srcDir`](../reference/site-config#srcdir) 설정 옵션을 통해 이를 구성할 수 있습니다.

`srcDir` 옵션은 프로젝트 루트에 상대적으로 해결됩니다. 예를 들어, `srcDir: 'src'`로 설정하면, 파일 구조는 다음과 같아질 것입니다:

```
.                          # 프로젝트 루트
├─ .vitepress              # 설정 디렉토리
└─ src                     # 소스 디렉토리
   ├─ 시작하기.md
   └─ index.md
```

결과적으로 생성된 소스-HTML 매핑:

```
src/index.md            -->  /index.html (접근 가능 경로 /)
src/시작하기.md        -->  /시작하기.html
```

## 페이지 간 연결 {#linking-between-pages}

페이지 간 연결 시 절대 경로와 상대 경로를 모두 사용할 수 있습니다. `.md` 및 `.html` 확장자 모두 작동하더라도, 파일 확장자를 생략하여 VitePress가 설정에 기반한 최종 URL을 생성하도록 하는 것이 좋은 방법입니다.

```md
<!-- 수행 -->
[시작하기](./getting-started)
[시작하기](../guide/getting-started)

<!-- 수행하지 말 것 -->
[시작하기](./getting-started.md)
[시작하기](./getting-started.html)
```

[Asset Handling](./asset-handling)에서 이미지와 같은 에셋에 연결하는 방법에 대해 자세히 알아보세요.

### VitePress 페이지가 아닌 페이지로 연결 {#linking-to-non-vitepress-pages}

VitePress에서 생성하지 않은 사이트의 페이지에 연결하려면, 전체 URL을 사용해야 합니다(새 탭에서 열림) 또는 명시적으로 대상을 지정해야 합니다:

**입력**

```md
[Link to pure.html](/pure.html){target="_self"}
```

**출력**

[Link to pure.html](/pure.html){target="_self"}

::: tip 참고

마크다운 링크에서 `base`는 자동으로 URL에 추가됩니다. 즉, base 외부의 페이지에 연결하려면 링크에 `../../pure.html`와 같은 것이 필요합니다(브라우저에 의해 현재 페이지에 상대적으로 해결됨).

또는, 앵커 태그 구문을 직접 사용할 수 있습니다:

```md
<a href="/pure.html" target="_self">Link to pure.html</a>
```

:::

## 깨끗한 URL 생성 {#generating-clean-url}

::: warning 서버 지원 필요
VitePress로 깨끗한 URL을 제공하려면 서버 측 지원이 필요합니다.
:::

기본적으로, VitePress는 `.html`로 끝나는 URL로 들어오는 링크를 해결합니다. 그러나, 일부 사용자는 `.html` 확장자 없이 "깨끗한 URL"을 선호할 수 있습니다 - 예를 들어, `example.com/path` 대신 `example.com/path.html`.

일부 서버나 호스팅 플랫폼(예: Netlify, Vercel, GitHub 페이지)은 `/foo`와 같은 URL을 `/foo.html`로 매핑할 수 있는 기능을 제공합니다(리다이렉트 없이):

- Netlify와 GitHub 페이지는 기본적으로 이 기능을 지원합니다.
- Vercel은 [`vercel.json`에서 `cleanUrls` 옵션을 활성화](https://vercel.com/docs/concepts/projects/project-configuration#cleanurls)해야 합니다.

이 기능을 사용할 수 있다면, VitePress의 자체 [`cleanUrls`](../reference/site-config#cleanurls) 설정 옵션을 활성화해서:

- 페이지 간의 들어오는 링크가 `.html` 확장자 없이 생성됩니다.
- 현재 경로가 `.html`로 끝나면, 라우터가 클라이언트 측에서 확장자가 없는 경로로 리다이렉트를 수행합니다.

그러나, 서버를 이러한 지원으로 구성할 수 없다면, 다음과 같은 디렉토리 구조를 수동으로 활용해야 합니다:

```
.
├─ 시작하기
│  └─ index.md
├─ 설치
│  └─ index.md
└─ index.md
```

## 라우트 재작성 {#route-rewrites}

소스 디렉토리 구조와 생성된 페이지 간의 매핑을 커스터마이즈할 수 있습니다. 복잡한 프로젝트 구조를 가지고 있을 때 유용합니다. 예를 들어, 여러 패키지가 있는 모노레포를 가지고 있고, 소스 파일과 함께 문서를 배치하고 싶다고 가정해 봅시다:

```
.
├─ 패키지
│  ├─ pkg-a
│  │  └─ src
│  │      ├─ pkg-a-code.ts
│  │      └─ pkg-a-docs.md
│  └─ pkg-b
│     └─ src
│         ├─ pkg-b-code.ts
│         └─ pkg-b-docs.md
```

그리고 VitePress 페이지가 다음과 같이 생성되기를 원합니다:

```
packages/pkg-a/src/pkg-a-docs.md  -->  /pkg-a/index.html
packages/pkg-b/src/pkg-b-docs.md  -->  /pkg-b/index.html
```

이것은 다음과 같이 [`rewrites`](../reference/site-config#rewrites) 옵션을 구성하여 달성할 수 있습니다:

```ts
// .vitepress/config.js
export default {
  rewrites: {
    '패키지/pkg-a/src/pkg-a-docs.md': 'pkg-a/index.md',
    '패키지/pkg-b/src/pkg-b-docs.md': 'pkg-b/index.md'
  }
}
```

`rewrites` 옵션은 동적 라우트 매개변수도 지원합니다. 위의 예제에서, 많은 패키지를 가지고 있다면 모든 경로를 나열하는 것은 장황할 것입니다. 모두 같은 파일 구조를 가지고 있다면, 설정을 다음과 같이 간단하게 할 수 있습니다:

```ts
export default {
  rewrites: {
    '패키지/:pkg/src/(.*)': ':pkg/index.md'
  }
}
```

재작성 경로는 `path-to-regexp` 패키지를 사용하여 컴파일됩니다 - 보다 고급 구문에 대해서는 [해당 문서](https://github.com/pillarjs/path-to-regexp#parameters)를 참조하십시오.

::: warning 재작성과 상대 링크

재작성이 활성화된 경우, **상대 링크는 재작성된 경로를 기반으로 해야 합니다**. 예를 들어, `패키지/pkg-a/src/pkg-a-code.md`에서 `패키지/pkg-b/src/pkg-b-code.md`로 상대 링크를 생성하려면 다음을 사용해야 합니다:

```md
[PKG B로의 링크](../pkg-b/pkg-b-code)
```
:::

## 동적 라우트 {#dynamic-routes}

단일 마크다운 파일과 동적 데이터를 사용하여 많은 페이지를 생성할 수 있습니다. 예를 들어, 프로젝트의 모든 패키지에 해당하는 페이지를 생성하는 `패키지/[pkg].md` 파일을 만들 수 있습니다. 여기서 `[pkg]` 세그먼트는 각 페이지를 다른 페이지와 구별하는 라우트 **매개변수**입니다.

### 경로 로더 파일 {#paths-loader-file}

VitePress는 정적 사이트 생성기이므로, 가능한 페이지 경로는 빌드 시간에 결정되어야 합니다. 따라서 동적 라우트 페이지는 **경로 로더 파일**을 동반해야 합니다. `패키지/[pkg].md`의 경우, `패키지/[pkg].paths.js`(`.ts`도 지원)가 필요합니다:

```
.
└─ 패키지
   ├─ [pkg].md         # 라우트 템플릿
   └─ [pkg].paths.js   # 라우트 경로 로더
```

경로 로더는 `params` 속성을 가진 객체의 배열을 반환하는 `paths` 메서드를 기본 export로 제공하는 객체여야 합니다. 이러한 객체 각각은 해당하는 페이지를 생성할 것입니다.

다음 `paths` 배열이 주어진 경우:

```js
// 패키지/[pkg].paths.js
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
└─ 패키지
   ├─ foo.html
   └─ bar.html
```

### 여러 매개변수 {#multiple-params}

동적 라우트는 여러 매개변수를 포함할 수 있습니다:

**파일 구조**

```
.
└─ 패키지
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

**출력**

```
.
└─ 패키지
   ├─ foo-1.0.0.html
   ├─ foo-2.0.0.html
   ├─ bar-1.0.0.html
   └─ bar-2.0.0.html
```

### 동적으로 경로 생성 {#dynamically-generating-paths}

경로 로더 모듈은 Node.js에서 실행되며 빌드 시간에만 실행됩니다. 로컬 또는 원격 데이터를 사용하여 경로 배열을 동적으로 생성할 수 있습니다.

로컬 파일에서 경로 생성:

```js
import fs from 'fs'

export default {
  paths() {
    return fs
      .readdirSync('패키지')
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

### 페이지에서 매개변수 접근 {#accessing-params-in-page}

각 페이지에 추가 데이터를 전달하기 위해 매개변수를 사용할 수 있습니다. 마크다운 라우트 파일은 `$params` 전역 속성을 통해 현재 페이지 매개변수에 Vue 표현식에서 접근할 수 있습니다:

```md
- 패키지 이름: {{ $params.pkg }}
- 버전: {{ $params.version }}
```

[`useData`](../reference/runtime-api#usedata) 런타임 API를 통해 마크다운 파일과 Vue 컴포넌트에서 현재 페이지의 매개변수에도 접근할 수 있습니다:

```vue
<script setup>
import { useData } from 'vitepress'

// params는 Vue ref입니다
const { params } = useData()

console.log(params.value)
</script>
```

### 원시 콘텐츠 렌더링 {#rendering-raw-content}

페이지로 전달된 매개변수는 클라이언트 JavaScript 페이로드에 직렬화되므로, 예를 들어 원격 CMS에서 가져온 원시 마크다운이나 HTML 콘텐츠와 같이 무거운 데이터를 매개변수로 전달하지 마십시오.

대신, 각 경로 객체의 `content` 속성을 사용하여 각 페이지에 이러한 콘텐츠를 전달할 수 있습니다:

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

그런 다음 다음 특수 구문을 사용하여 마크다운 파일 자체의 일부로 콘텐츠를 렌더링하세요:

```md
<!-- @content -->
```
