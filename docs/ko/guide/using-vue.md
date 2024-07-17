# Markdown에서 Vue 사용하기 {#using-vue-in-markdown}

VitePress에서 각 Markdown 파일은 HTML로 컴파일된 다음 [Vue 단일 파일 컴포넌트](https://vuejs.org/guide/scaling-up/sfc.html)로 처리됩니다. 이는 Markdown 내에서 동적 템플릿, Vue 컴포넌트 사용 또는 `<script>` 태그를 추가하여 임의의 페이지 내 Vue 컴포넌트 로직을 사용할 수 있음을 의미합니다.

VitePress가 Vue의 컴파일러를 활용하여 Markdown 콘텐츠의 순수 정적 부분을 자동으로 감지하고 최적화한다는 점에 주목할 가치가 있습니다. 정적 콘텐츠는 단일 자리표시자 노드로 최적화되어 초기 방문시 페이지의 JavaScript 페이로드에서 제거됩니다. 또한 클라이언트 측 하이드레이션 중에도 건너뜁니다. 간단히 말해서, 주어진 페이지에서 동적 부분에 대해서만 비용을 지불합니다.

::: tip SSR 호환성
모든 Vue 사용은 SSR과 호환되어야 합니다. 자세한 내용과 일반적인 해결 방법은 [SSR 호환성](./ssr-compat)을 참조하십시오.
:::

## 템플릿 {#templating}

### 보간(interpolation) {#interpolation}

각 Markdown 파일은 먼저 HTML로 컴파일되고 나서 Vite 프로세스 파이프라인으로 Vue 컴포넌트로 전달됩니다. 이는 텍스트에서 Vue 스타일 보간을 사용할 수 있음을 의미합니다:

**입력**

```md
{{ 1 + 1 }}
```

**출력**

<div class="language-text"><pre><code>{{ 1 + 1 }}</code></pre></div>

### 지시문 {#directives}

디자인상 원시 HTML도 마크다운에서 유효하기 때문에 지시문도 동작합니다:

**입력**

```html
<span v-for="i in 3">{{ i }}</span>
```

**출력**

<div class="language-text"><pre><code><span v-for="i in 3">{{ i }} </span></code></pre></div>

## `<script>`와 `<style>` {#script-and-style}

Markdown 파일의 최상위 `<script>` 및 `<style>` 태그는 Vue SFC에서와 마찬가지로 작동합니다. `<script setup>`, `<style module>` 등을 포함합니다. 여기서 주된 차이점은 `<template>` 태그가 없다는 것입니다: 다른 모든 최상위 콘텐츠는 Markdown입니다. 또한 모든 태그는 frontmatter **이후에** 위치해야 함을 유의하십시오:

```html
---
hello: world
---

<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

## Markdown 콘텐츠

현재 카운트: {{ count }}

<button :class="$style.button" @click="count++">증가</button>

<style module>
.button {
  color: red;
  font-weight: bold;
}
</style>
```

::: warning Markdown에서 `<style scoped>` 사용을 피하세요
Markdown에서 `<style scoped>`를 사용할 경우, 현재 페이지의 모든 요소에 특별한 속성을 추가해야 하므로 페이지 크기가 현저하게 증가할 수 있습니다. 페이지 내에서 지역적으로 범위가 지정된 스타일링이 필요할 때는 `<style module>`이 선호됩니다.
:::

현재 페이지의 메타데이터에 접근할 수 있는 [`useData` 도우미](../reference/runtime-api#usedata)와 같은 VitePress의 런타임 API에도 접근할 수 있습니다:

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
  "title": "Markdown에서 Vue 사용하기",
  "frontmatter": {},
  ...
}
```

## 컴포넌트 사용하기 {#using-components}

Markdown 파일 내에서 Vue 컴포넌트를 직접 가져오고 사용할 수 있습니다.

### Markdown에서 가져오기 {#importing-in-markdown}

컴포넌트가 몇 페이지에서만 사용되는 경우, 해당되는 곳에서 명시적으로 가져오는 것이 좋습니다. 이를 통해 적절하게 코드를 분할하고 관련 페이지가 표시될 때만 로드할 수 있습니다:

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

컴포넌트가 대부분의 페이지에서 사용될 것인 경우, Vue 앱 인스턴스를 사용자 지정하여 전역적으로 등록할 수 있습니다. 예제는 [기본 테마 확장](./extending-default-theme#registering-global-components) 관련 섹션을 참조하십시오.

::: warning 중요
커스텀 컴포넌트의 이름이 하이픈을 포함하거나 파스칼케이스(PascalCase)인지 확인하십시오. 그렇지 않으면 인라인 요소로 처리되어 `<p>` 태그 내에 포함되어 하이드레이션 불일치가 발생할 수 있습니다. `<p>`는 내부에 블록 요소를 포함할 수 없기 때문입니다.
:::

### 헤더에 컴포넌트 사용하기 <ComponentInHeader /> {#using-components-in-headers}

헤더에서 Vue 컴포넌트를 사용할 수 있지만, 다음 구문 사이의 차이를 유의하십시오:

| Markdown                                                | 출력 HTML                               | 파싱된 헤더 |
| ------------------------------------------------------- | ----------------------------------------- | ------------- |
| <pre v-pre><code> # 텍스트 &lt;Tag/&gt; </code></pre>     | `<h1>텍스트 <Tag/></h1>`                    | `텍스트`        |
| <pre v-pre><code> # 텍스트 \`&lt;Tag/&gt;\` </code></pre> | `<h1>텍스트 <code>&lt;Tag/&gt;</code></h1>` | `텍스트 <Tag/>` |

`<code>`로 둘러싸인 HTML은 그대로 표시됩니다; **아니면** `<code>`로 둘러싸이지 않은 HTML만 Vue에 의해 파싱됩니다.

::: tip
출력 HTML은 [Markdown-it](https://github.com/Markdown-it/Markdown-it)에 의해 이루어지며, 파싱된 헤더는 VitePress(사이드바와 문서 제목 모두에 사용됨)에 의해 처리됩니다.
:::


## 이스케이프 {#escaping}

`v-pre` 지시문을 사용하여 `<span>`이나 다른 요소에 Vue 보간을 이스케이프할 수 있습니다:

**입력**

```md
이것은 <span v-pre>{{ 그대로 표시됩니다 }}</span>
```

**출력**

<div class="escape-demo">
  <p>이것은 <span v-pre>{{ 그대로 표시됩니다 }}</span></p>
</div>

또한, 전체 단락을 `v-pre` 커스텀 컨테이너로 둘러싸도록 선택할 수 있습니다:

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

기본적으로 모든 fenced 코드 블록은 자동으로 `v-pre`로 둘러싸입니다. 따라서 내부에서 Vue 구문을 처리하지 않습니다. 펜스 내에서 Vue 스타일 보간을 활성화하려면, 예를 들어 `js-vue`처럼 언어에 `-vue` 접미사를 추가할 수 있습니다:

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

이는 일부 토큰이 제대로 구문 강조되지 않을 수 있음을 의미합니다.

## CSS 전처리기 사용하기 {#using-css-pre-processors}

VitePress는 CSS 전처리기에 대한 [내장 지원](https://vitejs.dev/ko/guide/features.html#css-pre-processors)을 가지고 있습니다: `.scss`, `.sass`, `.less`, `.styl` 및 `.stylus` 파일. 이것들을 위한 Vite 특정 플러그인을 설치할 필요는 없지만, 해당 전처리기 자체는 설치해야 합니다:

```
# .scss 및 .sass
npm install -D sass

# .less
npm install -D less

# .styl 및 .stylus
npm install -D stylus
```

그런 다음 다음을 Markdown 및 테마 컴포넌트에서 사용할 수 있습니다:

```vue
<style lang="sass">
.title
  font-size: 20px
</style>
```

## Teleports 사용하기 {#using-teleports}

현재 VitePress는 본문으로만 teleport에 대한 SSG 지원을 가지고 있습니다. 다른 대상을 위해서는, 내장된 `<ClientOnly>` 컴포넌트 내에 감싸거나 텔레포트 마크업을 최종 페이지 HTML의 올바른 위치에 주입할 수 있습니다 [`postRender` 훅](../reference/site-config#postrender)을 통해.

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
