# 마크다운에서 Vue 사용하기 {#using-vue-in-markdown}

VitePress에서는 각 마크다운 파일이 HTML로 컴파일된 후 [Vue 단일 파일 컴포넌트](https://vuejs.org/guide/scaling-up/sfc.html)로 처리됩니다. 이는 마크다운 내에서 Vue 컴포넌트를 사용하거나 동적 템플릿을 사용하거나 `<script>` 태그를 추가하여 임의의 페이지 내 Vue 컴포넌트 로직을 사용할 수 있다는 것을 의미합니다.

VitePress는 Vue의 컴파일러를 활용하여 마크다운 콘텐츠의 순수 정적 부분을 자동으로 감지하고 최적화합니다. 정적 콘텐츠는 단일 플레이스홀더 노드로 최적화되어 초기 방문 시 페이지의 JavaScript 페이로드에서 제거됩니다. 또한 클라이언트 측 하이드레이션 중에도 건너뜁니다. 요약하자면 특정 페이지에서는 동적 부분에 대해서만 비용을 지불하면 됩니다.

::: tip SSR 호환성
모든 Vue 사용은 SSR과 호환되어야 합니다. 자세한 내용 및 일반적인 해결 방법은 [SSR 호환성](./ssr-compat)을 참고하세요.
:::

## 템플릿 {#templating}

### 보간 문법 {#interpolation}

각 마크다운 파일은 먼저 HTML로 컴파일된 다음 Vue 컴포넌트로 Vite 프로세스 파이프라인에 전달됩니다. 이는 텍스트에서 Vue 스타일 보간 문법을 사용할 수 있음을 의미합니다:

**입력**

```md
{{ 1 + 1 }}
```

**출력**

<div class="language-text"><pre><code>{{ 1 + 1 }}</code></pre></div>

### 디렉티브 {#directives}

디렉티브도 사용할 수 있습니다(원시 HTML도 마크다운에서 작동함):

**입력**

```html
<span v-for="i in 3">{{ i }}</span>
```

**출력**

<div class="language-text"><pre><code><span v-for="i in 3">{{ i }} </span></code></pre></div>

## `<script>` & `<style>` {#script-and-style}

루트 레벨의 `<script>` 및 `<style>` 태그는 마크다운 파일에서 Vue SFCs에서와 마찬가지로 작동하며, `<script setup>`, `<style module>` 등도 포함됩니다. 여기서 주요 차이점은 `<template>` 태그가 없다는 것입니다: 다른 모든 루트 레벨의 컨텐츠는 마크다운입니다. 또한 **모든 태그는 전문 이후에 배치**되어야 합니다:

```html
---
hello: world
---

<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

## 마크다운 컨텐츠

현재 카운트: {{ count }}

<button :class="$style.button" @click="count++">증가</button>

<style module>
.button {
  color: red;
  font-weight: bold;
}
</style>
```

::: warning 마크다운에서 `<style scoped>` 사용을 피하세요
마크다운에서 `<style scoped>`를 사용할 때는 현재 페이지의 모든 엘리먼트에 특수한 어트리뷰트를 추가해야 하므로 페이지 크기를 크게 부풀릴 수 있습니다. 페이지에서 로컬 범위의 스타일링이 필요한 경우 `<style module>`을 사용하는 것이 좋습니다.
:::

또한 현재 페이지의 메타데이터에 접근할 수 있는 [`useData` 헬퍼](../reference/runtime-api#usedata)와 같은 VitePress의 런타임 API에도 접근할 수 있습니다:

**입력**

```html
<script setup>
import { useData } from 'vitepress'

const { page } = useData()
</script>

<pre>{{ page }}</pre>
```

**출력**

```json
{
  "path": "/using-vue.html",
  "title": "마크다운에서 Vue 사용하기",
  "frontmatter": {},
  ...
}
```

## 컴포넌트 사용하기 {#using-components}

마크다운 파일 내에서 Vue 컴포넌트를 직접 가져와서 사용할 수 있습니다.

### 마크다운에서 컴포넌트 가져오기 {#importing-in-markdown}

컴포넌트가 몇 페이지에서만 사용되는 경우, 사용되는 곳에서 명시적으로 가져오는 것이 좋습니다. 이렇게 하면 적절하게 코드를 분할하고 관련 페이지가 표시될 때만 로드할 수 있습니다:

```md
<script setup>
import CustomComponent from '../components/CustomComponent.vue'
</script>

# 문서

이것은 커스텀 컴포넌트를 사용하는 .md입니다

<CustomComponent />

## 더 많은 문서

...
```

### 전역적으로 컴포넌트 등록하기 {#registering-components-globally}

컴포넌트가 대부분의 페이지에서 사용될 경우, Vue 앱 인스턴스를 커스텀하여 전역적으로 등록할 수 있습니다. [기본 테마 확장](./extending-default-theme#registering-global-components)의 관련 섹션을 예제를 참고하세요.

::: warning 중요
커스텀 컴포넌트의 이름에 하이픈이 포함되어 있거나 파스칼케이스(PascalCase)e인지 확인하세요. 그렇지 않으면 인라인 요소로 처리되어 `<p>` 태그 안에 래핑됩니다. `<p>`는 블록 엘리먼트를 내부에 배치할 수 없기 때문에 하이드레이션 불일치가 발생합니다.
:::

### 헤더에 <ComponentInHeader /> 컴포넌트 사용하기  {#using-components-in-headers}

헤더에서 Vue 컴포넌트를 사용할 수 있지만, 다음 문법간 차이점에 주의해야 합니다:

| 마크다운                                                   | 출력 HTML                               | 파싱된 헤더 |
|--------------------------------------------------------| ----------------------------------------- | ------------- |
| <pre v-pre><code> # text &lt;Tag/&gt; </code></pre>     | `<h1>text <Tag/></h1>`                    | `text`        |
| <pre v-pre><code> # text \`&lt;Tag/&gt;\` </code></pre> | `<h1>text <code>&lt;Tag/&gt;</code></h1>` | `text <Tag/>` |

`<code>`로 감싼 HTML은 있는 그대로 표시되며, **감싸지 않은** HTML만 Vue에 의해 파싱됩니다.

::: tip
출력된 HTML은 [Markdown-it](https://github.com/Markdown-it/Markdown-it)에 의해 생성되며, 파싱된 헤더는 VitePress에 의해 처리됩니다(사이드바와 문서 제목 모두에 사용됩니다).
:::


## 이스케이프 {#escaping}

Vue 보간 문법을 회피하려면, `<span>` 또는 다른 엘리먼트에 `v-pre` 디렉티브를 사용하여 감쌀 수 있습니다:

**입력**

```md
이것은 <span v-pre>{{ 그대로 표시됩니다 }}</span>
```

**출력**

<div class="escape-demo">
  <p>이것은 <span v-pre>{{ 그대로 표시됩니다 }}</span></p>
</div>

또는 전체 문단을 `v-pre` 커스텀 컨테이너로 감쌀 수도 있습니다:

```md
::: v-pre
{{ 이것은 그대로 표시됩니다 }}
:::
```

**출력**

<div class="escape-demo">

::: v-pre
{{ 이것은 그대로 표시됩니다 }}
:::

</div>

## 코드 블록에서 이스케이프 해제하기 {#unescape-in-code-blocks}

기본적으로 모든 펜스 코드 블록은 자동으로 `v-pre`로 감싸져 있어, 내부에서는 Vue 문법이 처리되지 않습니다. 펜스 내부에서 Vue 스타일 보간 문법을 사용하려면, `js-vue`처럼 언어에 `-vue` 접미사를 추가할 수 있습니다:

**입력**

````md
```js-vue
안녕하세요 {{ 1 + 1 }}
```
````

**출력**

```js-vue
안녕하세요 {{ 1 + 1 }}
```

이로 인해 특정 토큰이 올바르게 강조 표시되지 않을 수 있습니다.

## CSS 전처리기 사용하기 {#using-css-pre-processors}

VitePress는 CSS 전처리기인 `.scss`, `.sass`, `.less`, `.styl`, `.stylus` 파일에 대해 [기본 지원](https://vitejs.dev/guide/features.html#css-pre-processors)을 제공합니다. 이를 위해 Vite 전용 플러그인을 설치할 필요는 없지만, 해당 전처리기 자체는 설치해야 합니다:

```
# .scss 및 .sass
npm install -D sass

# .less
npm install -D less

# .styl 및 .stylus
npm install -D stylus
```

그런 다음 마크다운 및 테마 컴포넌트에서 다음과 같이 사용할 수 있습니다:

```vue
<style lang="sass">
.title
  font-size: 20px
</style>
```

## 텔레포트 사용하기 {#using-teleports}

VitePress는 현재 body로 텔레포트를 사용하는 SSG만 지원합니다. 다른 대상에 대해 텔레포트를 사용하려면 내장된 `<ClientOnly>` 컴포넌트로 감싸거나 [`postRender` 훅](../reference/site-config#postrender)을 통해 최종 페이지 HTML의 올바른 위치에 텔레포트 마크업을 삽입할 수 있습니다.

<ModalDemo />

::: details
<<< @/components/ModalDemo.vue
:::

```md
<ClientOnly>
  <Teleport to="#modal">
    <div>
      // ...
    </div>
  </Teleport>
</ClientOnly>
```

<script setup>
import ModalDemo from '../../components/ModalDemo.vue'
import ComponentInHeader from '../../components/ComponentInHeader.vue'
</script>

<style>
.escape-demo {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 0 20px;
}
</style>
