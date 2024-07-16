# 마크다운 확장 {#markdown-extensions}

VitePress는 내장된 마크다운 확장을 제공합니다.

## 헤더 앵커 {#header-anchors}

헤더에는 자동으로 앵커 링크가 적용됩니다. 앵커의 렌더링은 `markdown.anchor` 옵션을 사용하여 구성할 수 있습니다.

### 사용자 정의 앵커 {#custom-anchors}

자동 생성된 것 대신 헤더에 대한 사용자 정의 앵커 태그를 지정하려면, 헤딩에 접미사를 추가하세요:

```
# 사용자 정의 앵커 사용 {#my-anchor}
```

이를 통해 기본값인 `#using-custom-anchors` 대신 `#my-anchor`로 헤딩에 링크할 수 있습니다.

## 링크 {#links}

내부 및 외부 링크는 특별한 처리를 받습니다.

### 내부 링크 {#internal-links}

내부 링크는 SPA 탐색을 위한 라우터 링크로 변환됩니다. 또한, 각 하위 디렉토리에 포함된 모든 `index.md`는 자동으로 `index.html`로 변환되며, 해당 URL은 `/`입니다.

예를 들어, 다음과 같은 디렉토리 구조가 주어져 있습니다:

```
.
├─ index.md
├─ foo
│  ├─ index.md
│  ├─ one.md
│  └─ two.md
└─ bar
   ├─ index.md
   ├─ three.md
   └─ four.md
```

그리고 `foo/one.md`에 있다고 하면:

```md
[홈](/) <!-- 사용자를 루트 index.md로 보냅니다 -->
[foo](/foo/) <!-- foo 디렉토리의 index.html로 보냅니다 -->
[foo 헤딩](./#heading) <!-- foo index 파일의 헤딩으로 앵커링합니다 -->
[bar - three](../bar/three) <!-- 확장자를 생략할 수 있습니다 -->
[bar - three](../bar/three.md) <!-- .md를 추가할 수 있습니다 -->
[bar - four](../bar/four.html) <!-- 또는 .html을 추가할 수 있습니다 -->
```

### 페이지 접미사 {#page-suffix}

기본적으로 페이지와 내부 링크는 `.html` 접미사를 가지고 생성됩니다.

### 외부 링크 {#external-links}

외부 링크는 자동으로 `target="_blank" rel="noreferrer"`를 받습니다:

- [vuejs.org](https://vuejs.org)
- [GitHub에서 VitePress](https://github.com/vuejs/vitepress)

## 프론트매터 {#frontmatter}

[YAML 프론트매터](https://jekyllrb.com/docs/front-matter/)가 기본적으로 지원됩니다:

```yaml
---
title: 해커처럼 블로깅하기
lang: en-US
---
```

이 데이터는 페이지의 나머지 부분, 모든 사용자 정의 및 테마 구성 요소와 함께 사용할 수 있습니다.

자세한 내용은 [프론트매터](../reference/frontmatter-config)를 참조하세요.

## GitHub 스타일 테이블 {#github-style-tables}

**입력**

```md
| 테이블        |      은      |  멋져 |
| ------------- | :-----------: | ----: |
| 3열은      | 오른쪽 정렬입니다 | $1600 |
| 2열은      |   가운데 정렬입니다    |   $12 |
| 얼룩말 줄무늬 |   멋져요    |    $1 |
```

**출력**

| 테이블        |      은      |   멋져 |
| ------------- | :-----------: | -----: |
| 3열은      | 오른쪽 정렬입니다 | \$1600 |
| 2열은      |   가운데 정렬입니다    |   \$12 |
| 얼룩말 줄무늬 |   멋져요    |    \$1 |

## Emoji :tada:

**입력**

```
:tada: :100:
```

**출력**

:tada: :100:

[모든 이모지의 목록](https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.mjs)이 제공됩니다.

## 목차 {#table-of-contents}

**입력**

```
[[toc]]
```

**출력**

[[toc]]

TOC의 렌더링은 `markdown.toc` 옵션을 사용하여 구성할 수 있습니다.

## 사용자 정의 컨테이너 {#custom-containers}

사용자 정의 컨테이너는 그들의 유형, 제목, 그리고 내용에 의해 정의될 수 있습니다.

### 기본 제목 {#default-title}

**입력**

```md
::: info
정보 상자입니다.
:::

::: tip
팁입니다.
:::

::: warning
경고입니다.
:::

::: danger
위험한 경고입니다.
:::

::: details
세부 정보 블록입니다.
:::
```

**출력**

::: info
정보 상자입니다.
:::

::: tip
팁입니다.
:::

::: warning
경고입니다.
:::

::: danger
위험한 경고입니다.
:::

::: details
세부 정보 블록입니다.
:::

### 사용자 정의 제목 {#custom-title}

컨테이너의 "유형" 바로 뒤에 텍스트를 추가하여 사용자 정의 제목을 설정할 수 있습니다.

**입력**

````md
::: danger 정지
위험 지대, 진행하지 마세요
:::

::: details 코드를 보려면 클릭하세요
```js
console.log('Hello, VitePress!')
```
:::
````

**출력**

::: danger 정지
위험 지대, 진행하지 마세요
:::

::: details 코드를 보려면 클릭하세요
```js
console.log('Hello, VitePress!')
```
:::

또한, 사이트 구성에서 다음과 같은 내용을 추가하여 전역적으로 사용자 정의 제목을 설정할 수 있습니다. 영어로 작성하지 않는 경우 유용합니다:

```ts
// config.ts
export default defineConfig({
  // ...
  markdown: {
    container: {
      tipLabel: '팁',
      warningLabel: '경고',
      dangerLabel: '위험',
      infoLabel: '정보',
      detailsLabel: '세부 정보'
    }
  }
  // ...
})
```

### `raw`

VitePress와 스타일 및 라우터 충돌을 방지하기 위해 사용될 수 있는 특수 컨테이너입니다. 이는 특히 컴포넌트 라이브러리를 문서화할 때 유용합니다. 더 나은 격리를 위해 [whyframe](https://whyframe.dev/docs/integrations/vitepress)을 확인해보세요.

**문법**

```md
::: raw
<div class="vp-raw">로 감쌉니다
:::
```

`vp-raw` 클래스는 직접 요소에 사용될 수도 있습니다. 현재 스타일 격리는 선택 사항입니다:

- 원하는 패키지 관리자로 `postcss`를 설치하세요:

  ```sh
  $ npm add -D postcss
  ```

- `docs/postcss.config.mjs`라는 파일을 만들고 이것을 추가하세요:

  ```js
  import { postcssIsolateStyles } from 'vitepress'

  export default {
    plugins: [postcssIsolateStyles()]
  }
  ```

  이것은 내부적으로 [`postcss-prefix-selector`](https://github.com/postcss/postcss-load-config)를 사용합니다. 이렇게 옵션을 전달할 수 있습니다:

  ```js
  postcssIsolateStyles({
    includeFiles: [/vp-doc\.css/] // 기본값은 /base\.css/
  })
  ```

## GitHub 스타일 경고 {#github-flavored-alerts}

VitePress는 [GitHub 스타일 경고](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts)를 콜아웃으로 렌더링하는 것을 지원합니다. 이것은 [사용자 정의 컨테이너](#custom-containers)와 같은 방식으로 렌더링됩니다.

```md
> [!NOTE]
> 사용자가 훑어보더라도 알아야 할 정보를 강조합니다.

> [!TIP]
> 사용자가 더 성공할 수 있도록 도움이 되는 선택적 정보입니다.

> [!IMPORTANT]
> 사용자가 성공하기 위해 필수적인 중요 정보입니다.

> [!WARNING]
> 잠재적인 위험으로 인해 즉각적인 사용자의 주의를 요하는 중요한 내용입니다.

> [!CAUTION]
> 행동의 부정적인 잠재적 결과입니다.
```

> [!NOTE]
> 사용자가 훑어보더라도 알아야 할 정보를 강조합니다.

> [!TIP]
> 사용자가 더 성공할 수 있도록 도움이 되는 선택적 정보입니다.

> [!IMPORTANT]
> 사용자가 성공하기 위해 필수적인 중요 정보입니다.

> [!WARNING]
> 잠재적인 위험으로 인해 즉각적인 사용자의 주의를 요하는 중요한 내용입니다.

> [!CAUTION]
> 행동의 부정적인 잠재적 결과입니다.

## 코드 블록 내 구문 강조 {#syntax-highlighting-in-code-blocks}

VitePress는 마크다운 코드 블록 내 언어 문법을 색상이 있는 텍스트로 강조하는 데 [Shiki](https://github.com/shikijs/shiki)를 사용합니다. Shiki는 다양한 프로그래밍 언어를 지원합니다. 코드 블록의 시작 백틱에 유효한 언어 별칭을 추가하기만 하면 됩니다:

**입력**

````markdown
```js
export default {
  name: 'MyComponent',
  // ...
}
```
````

````markdown
```html
<ul>
  <li v-for="todo in todos" :key="todo.id">
    {{ todo.text }}
  </li>
</ul>
```
````

**출력**

```js
export default {
  name: 'MyComponent',
  // ...
}
```

```html
<ul>
  <li v-for="todo in todos" :key="todo.id">
    {{ todo.text }}
  </li>
</ul>
```

Shiki의 저장소에서 사용 가능한 [유효한 언어 목록](https://shiki.style/languages)이 제공됩니다.

또한 응용 프로그램 구성에서 구문 강조 테마를 사용자 지정할 수 있습니다. 자세한 내용은 [`markdown` 옵션](../reference/site-config#markdown)을 참조하세요.

## 코드 블록에서 라인 강조 {#line-highlighting-in-code-blocks}

**입력**

````markdown
```js{4}
export default {
  data () {
    return {
      msg: '강조됨!'
    }
  }
}
```
````

**출력**

```js{4}
export default {
  data() {
    return {
      msg: '강조됨!'
    }
  }
}
```

단일 라인 뿐만 아니라 여러 개의 단일 라인, 범위 또는 둘 다를 지정할 수도 있습니다:

- 라인 범위: 예를 들어 `{5-8}`, `{3-10}`, `{10-17}`
- 다수의 단일 라인: 예를 들어 `{4,7,9}`
- 라인 범위 및 단일 라인: 예를 들어 `{4,7-13,16,23-27,40}`

**입력**

````markdown
```js{1,4,6-8}
export default { // 강조됨
  data () {
    return {
      msg: `강조됨!
      이 줄은 강조되지 않습니다,
      하지만 이 줄과 다음 2줄은 강조됩니다.`,
      motd: 'VitePress는 멋져요',
      lorem: 'ipsum'
    }
  }
}
```
````

**출력**

```js{1,4,6-8}
export default { // 강조됨
  data () {
    return {
      msg: `강조됨!
      이 줄은 강조되지 않습니다,
      하지만 이 줄과 다음 2줄은 강조됩니다.`,
      motd: 'VitePress는 멋져요',
      lorem: 'ipsum',
    }
  }
}
```

또한, `// [!code highlight]` 주석을 사용하여 직접 라인에 강조를 추가할 수 있습니다.

**입력**

````markdown
```js
export default {
  data () {
    return {
      msg: '강조됨!' // [!!code highlight]
    }
  }
}
```
````

**출력**

```js
export default {
  data () {
    return {
      msg: '강조됨!' // [!code highlight]
    }
  }
}
```

## 코드 블록에서 포커싱 {#focus-in-code-blocks}

`// [!code focus]` 주석을 라인에 추가하면 해당 라인이 포커싱되고 코드의 다른 부분은 흐릿하게 처리됩니다.

추가로, `// [!code focus:<lines>]`를 사용하여 포커싱할 라인 수를 정의할 수 있습니다.

**입력**

````markdown
```js
export default {
  data () {
    return {
      msg: '포커싱됨!' // [!!code focus]
    }
  }
}
```
````

**출력**

```js
export default {
  data () {
    return {
      msg: '포커싱됨!' // [!code focus]
    }
  }
}
```

## 코드 블록 내 컬러 차이점 {#colored-diffs-in-code-blocks}

`// [!code --]` 또는 `// [!code ++]` 주석을 라인에 추가하면 해당 라인의 차이점을 나타내며, 코드 블록의 색상을 유지합니다.

**입력**

````markdown
```js
export default {
  data () {
    return {
      msg: '삭제됨' // [!!code --]
      msg: '추가됨' // [!!code ++]
    }
  }
}
```
````

**출력**

```js
export default {
  data () {
    return {
      msg: '삭제됨' // [!code --]
      msg: '추가됨' // [!code ++]
    }
  }
}
```

## 코드 블록 내 오류 및 경고 {#errors-and-warnings-in-code-blocks}

`// [!code warning]` 또는 `// [!code error]` 주석을 라인에 추가하면 해당 색깔에 따라 라인이 색칠됩니다.

**입력**

````markdown
```js
export default {
  data () {
    return {
      msg: '오류', // [!!code error]
      msg: '경고' // [!!code warning]
    }
  }
}
```
````

**출력**

```js
export default {
  data () {
    return {
      msg: '오류', // [!code error]
      msg: '경고' // [!code warning]
    }
  }
}
```

## 라인 번호 {#line-numbers}

구성을 통해 각 코드 블록에 라인 번호를 활성화할 수 있습니다:

```js
export default {
  markdown: {
    lineNumbers: true
  }
}
```

자세한 내용은 [`markdown` 옵션](../reference/site-config#markdown)을 참조하세요.

또한 울타리 코드 블록에 `:line-numbers` / `:no-line-numbers` 마크를 추가하여 구성에서 설정한 값을 재정의할 수 있습니다.

또한 `:line-numbers` 뒤에 `=`를 추가하여 시작 라인 번호를 사용자 정의할 수 있습니다. 예를 들어, `:

**입력**

````md
```ts {1}
// 줄 번호는 기본적으로 비활성화되어 있음
const line2 = 'This is line 2'
const line3 = 'This is line 3'
```

```ts:line-numbers {1}
// 줄 번호가 활성화됨
const line2 = 'This is line 2'
const line3 = 'This is line 3'
```

```ts:line-numbers=2 {1}
// 줄 번호가 활성화되고 2부터 시작함
const line3 = 'This is line 3'
const line4 = 'This is line 4'
```
````

**출력**

```ts {1}
// 줄 번호는 기본적으로 비활성화되어 있음
const line2 = 'This is line 2'
const line3 = 'This is line 3'
```

```ts:line-numbers {1}
// 줄 번호가 활성화됨
const line2 = 'This is line 2'
const line3 = 'This is line 3'
```

```ts:line-numbers=2 {1}
// 줄 번호가 활성화되고 2부터 시작함
const line3 = 'This is line 3'
const line4 = 'This is line 4'
```

## 코드 스니펫 가져오기 {#import-code-snippets}

다음 문법을 통해 기존 파일에서 코드 스니펫을 가져올 수 있습니다:

```md
<<< @/파일경로
```

다음과 같이 [라인 하이라이팅](#line-highlighting-in-code-blocks)도 지원합니다:

```md
<<< @/파일경로{하이라이트할 라인}
```

**입력**

```md
<<< @/snippets/snippet.js{2}
```

**코드 파일**

<<< @/snippets/snippet.js

**출력**

<<< @/snippets/snippet.js{2}

::: tip
'@'의 값은 소스 루트에 해당합니다. 기본값은 VitePress 프로젝트 루트이지만, `srcDir`이 구성되어 있을 경우가 아니면 다릅니다. 상대 경로에서도 가져올 수 있습니다:

```md
<<< ../snippets/snippet.js
```

:::

특정 부분의 코드 파일만 포함하려면 [VS Code 리전](https://code.visualstudio.com/docs/editor/codebasics#_folding)을 사용할 수 있습니다. 파일 경로 뒤에 `#`을 사용한 다음 커스텀 리전 이름을 제공할 수 있습니다:

**입력**

```md
<<< @/snippets/snippet-with-region.js#snippet{1}
```

**코드 파일**

<<< @/snippets/snippet-with-region.js

**출력**

<<< @/snippets/snippet-with-region.js#snippet{1}

괄호(`{}`) 안에 언어를 지정할 수도 있습니다:

```md
<<< @/snippets/snippet.cs{c#}

<!-- 라인 하이라이팅과 함께: -->

<<< @/snippets/snippet.cs{1,2,4-6 c#}

<!-- 라인 번호와 함께: -->

<<< @/snippets/snippet.cs{1,2,4-6 c#:line-numbers}
```

이는 파일 확장명에서 소스 언어를 유추할 수 없을 때 유용합니다.

## 코드 그룹 {#code-groups}

다음과 같이 여러 코드 블록을 그룹화할 수 있습니다:

**입력**

````md
::: code-group

```js [config.js]
/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
  // ...
}

export default config
```

```ts [config.ts]
import type { UserConfig } from 'vitepress'

const config: UserConfig = {
  // ...
}

export default config
```

:::
````

**출력**

::: code-group

```js [config.js]
/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
  // ...
}

export default config
```

```ts [config.ts]
import type { UserConfig } from 'vitepress'

const config: UserConfig = {
  // ...
}

export default config
```

:::

코드 그룹에서 [스니펫 가져오기](#import-code-snippets)도 할 수 있습니다:

**입력**

```md
::: code-group

<!-- 기본적으로 파일 이름이 제목으로 사용됩니다 -->

<<< @/snippets/snippet.js

<!-- 커스텀 제목도 제공할 수 있습니다 -->

<<< @/snippets/snippet-with-region.js#snippet{1,2 ts:line-numbers} [지역 스니펫]

:::
```

**출력**

::: code-group

<<< @/snippets/snippet.js

<<< @/snippets/snippet-with-region.js#snippet{1,2 ts:line-numbers} [지역 스니펫]

:::

## 마크다운 파일 포함 {#markdown-file-inclusion}

다른 마크다운 파일에 마크다운 파일을 포함시킬 수 있으며, 중첩도 가능합니다.

::: tip
마크다운 경로 앞에 '@'을 붙이면 소스 루트로 작용합니다. 기본값은 VitePress 프로젝트 루트이지만, `srcDir`이 구성되어 있을 경우가 아닙니다.
:::

예를 들어, 다음과 같이 상대적인 마크다운 파일을 포함할 수 있습니다:

**입력**

```md
# 문서

## 기초

<!--@include: ./parts/basics.md-->
```

**부분 파일** (`parts/basics.md`)

```md
일부 시작하는 방법입니다.

### 구성

`.foorc.json`을 사용하여 생성할 수 있습니다.
```

**동일한 코드**

```md
# 문서

## 기초

일부 시작하는 방법입니다.

### 구성

`.foorc.json`을 사용하여 생성할 수 있습니다.
```

라인 범위 선택도 지원합니다:

**입력**

```md
# 문서

## 기초

<!--@include: ./parts/basics.md{3,}-->
```

**부분 파일** (`parts/basics.md`)

```md
일부 시작하는 방법입니다.

### 구성

`.foorc.json`을 사용하여 생성할 수 있습니다.
```

**동일한 코드**

```md
# 문서

## 기초

### 구성

`.foorc.json`을 사용하여 생성할 수 있습니다.
```

선택된 라인 범위의 형식은: `{3,}`, `{,10}`, `{1,10}`이 될 수 있습니다.

VS Code 영역을 사용하여 코드 파일의 해당 부분만 포함할 수도 있습니다. 파일 경로 뒤에 `#`를 붙여 사용자 정의 영역 이름을 제공할 수 있습니다:

**입력**

```md
# Docs

## Basics

<!--@include: ./parts/basics.md#basic-usage{,2}-->
<!--@include: ./parts/basics.md#basic-usage{5,}-->
```

**부분 파일** (`parts/basics.md`)

```md
<!-- #region basic-usage -->
## Usage Line 1

## Usage Line 2

## Usage Line 3
<!-- #endregion basic-usage -->
```

**동등한 코드**

```md
# Docs

## Basics

## Usage Line 1

## Usage Line 3
```

::: warning
파일이 없는 경우 오류를 발생시키지 않으니, 이 기능을 사용할 때는 내용이 예상대로 렌더링되고 있는지 확인해야 합니다.
:::

## 수식 {#math-equations}

현재 선택 사항입니다. 활성화하려면 `markdown-it-mathjax3`를 설치하고 설정 파일에서 `markdown.math`를 `true`로 설정해야 합니다:

```sh
npm add -D markdown-it-mathjax3
```

```ts
// .vitepress/config.ts
export default {
  markdown: {
    math: true
  }
}
```

**입력**

```md
$a \ne 0$일 때, $(ax^2 + bx + c = 0)$의 두 해는
$$ x = {-b \pm \sqrt{b^2-4ac} \over 2a} $$입니다

**맥스웰 방정식:**

| 방정식                                                                                                                                                                  | 설명                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| $\nabla \cdot \vec{\mathbf{B}}  = 0$                                                                                                                                    | $\vec{\mathbf{B}}$의 발산은 0입니다                                                 |
| $\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t}  = \vec{\mathbf{0}}$                                                        | $\vec{\mathbf{E}}$의 회전은 $\vec{\mathbf{B}}$의 시간에 따른 변화율에 비례합니다     |
| $\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} = 4 \pi \rho$ | _wha?_                                                                               |
```

**출력**

$a \ne 0$ 일 때, $(ax^2 + bx + c = 0)$의 두 해는 다음과 같습니다:
$$ x = {-b \pm \sqrt{b^2-4ac} \over 2a} $$

**맥스웰 방정식:**

| 방정식                                                                                                                                                                  | 설명                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| $\nabla \cdot \vec{\mathbf{B}}  = 0$                                                                                                                                    | $\vec{\mathbf{B}}$의 발산은 0입니다                                                 |
| $\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t}  = \vec{\mathbf{0}}$                                                        | $\vec{\mathbf{E}}$의 회전은 $\vec{\mathbf{B}}$의 시간에 따른 변화율에 비례합니다     |
| $\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} = 4 \pi \rho$ | _wha?_                                                                               |

## 이미지 지연 로딩 {#image-lazy-loading}

마크다운을 통해 추가된 각 이미지에 대해 지연 로딩을 활성화하려면 설정 파일에서 `lazyLoading`을 `true`로 설정하세요:

```js
export default {
  markdown: {
    image: {
      // 이미지 지연 로딩은 기본적으로 비활성화 되어 있습니다
      lazyLoading: true
    }
  }
}
```

## 고급 설정 {#advanced-configuration}

VitePress는 마크다운 렌더링을 위해 [markdown-it](https://github.com/markdown-it/markdown-it)을 사용합니다. 위의 확장 프로그램 대부분은 커스텀 플러그인을 통해 구현됩니다. `.vitepress/config.js`의 `markdown` 옵션을 사용하여 `markdown-it` 인스턴스를 더욱 커스터마이징할 수 있습니다:

```js
import { defineConfig } from 'vitepress'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItFoo from 'markdown-it-foo'

export default defineConfig({
  markdown: {
    // markdown-it-anchor의 옵션
    // https://github.com/valeriangalliat/markdown-it-anchor#usage
    anchor: {
      permalink: markdownItAnchor.permalink.headerLink()
    },

    // @mdit-vue/plugin-toc의 옵션
    // https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-toc#options
    toc: { level: [1, 2] },

    config: (md) => {
      // 더 많은 markdown-it 플러그인을 사용!
      md.use(markdownItFoo)
    }
  }
})
```

[설정 참조: 앱 설정](../reference/site-config#markdown)에서 구성 가능한 속성의 전체 목록을 확인할 수 있습니다.
