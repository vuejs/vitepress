---
outline: deep
---

# SSR 호환성 {#ssr-compatibility}

VitePress는 Vue의 서버 사이드 렌더링(SSR) 기능을 사용하여 프로덕션 빌드 중에 Node.js에서 애플리케이션을 사전 렌더링합니다. 이는 테마 컴포넌트의 모든 커스텀 코드가 SSR 호환성을 준수해야 함을 의미합니다.

공식 Vue 문서의 [SSR 섹션](https://vuejs.org/guide/scaling-up/ssr.html)은 SSR이 무엇인지, SSR / SSG 간의 관계, 그리고 SSR 친화적인 코드를 작성할 때의 일반적인 주의 사항에 대해 더 많은 정보를 제공합니다. 핵심 원칙은 Vue 컴포넌트의 `beforeMount` 또는 `mounted` 훅에서만 브라우저 / DOM API에 접근하는 것입니다.

## `<ClientOnly>`

SSR 친화적이지 않은 컴포넌트(예: 커스텀 디렉티브를 포함한 컴포넌트)를 사용하거나 시연하는 경우, 내장된 `<ClientOnly>` 컴포넌트로 해당 컴포넌트를 래핑할 수 있습니다:

```md
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```

## "import" 시 브라우저 API에 접근하는 라이브러리 {#libraries-that-access-browser-api-on-import}

일부 컴포넌트나 라이브러리는 **"import" 시** 브라우저 API에 접근합니다. "import" 시 브라우저 환경을 가정하는 코드를 사용하려면, 동적 "import"를 사용해야 합니다.

### Mounted 훅에서 가져오기 {#importing-in-mounted-hook}

```vue
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  import('./lib-that-access-window-on-import').then((module) => {
    // 코드 사용하기
  })
})
</script>
```

### 조건부 가져오기 {#conditional-import}

`import.meta.env.SSR` 플래그([Vite 환경 변수](https://vitejs.dev/guide/env-and-mode.html#env-variables)의 일부)를 사용하여 종속성을 조건부로 "import" 할 수도 있습니다:

```js
if (!import.meta.env.SSR) {
  import('./lib-that-access-window-on-import').then((module) => {
    // 코드 사용하기
  })
}
```

[`Theme.enhanceApp`](./custom-theme#theme-interface)은 비동기로 사용할 수 있기 때문에, "import" 시 브라우저 API에 접근하는 Vue 플러그인을 조건부로 "import"하고 등록할 수 있습니다:

```js [.vitepress/theme/index.js]
/** @type {import('vitepress').Theme} */
export default {
  // ...
  async enhanceApp({ app }) {
    if (!import.meta.env.SSR) {
      const plugin = await import('plugin-that-access-window-on-import')
      app.use(plugin.default)
    }
  }
}
```

TypeScript를 사용하는 경우:
```ts [.vitepress/theme/index.ts]
import type { Theme } from 'vitepress'

export default {
  // ...
  async enhanceApp({ app }) {
    if (!import.meta.env.SSR) {
      const plugin = await import('plugin-that-access-window-on-import')
      app.use(plugin.default)
    }
  }
} satisfies Theme
```

### `defineClientComponent`

VitePress는 "import" 시 브라우저 API에 접근하는 Vue 컴포넌트를 "import" 할 수 있는 편리한 헬퍼를 제공합니다.

```vue
<script setup>
import { defineClientComponent } from 'vitepress'

const ClientComp = defineClientComponent(() => {
  return import('component-that-access-window-on-import')
})
</script>

<template>
  <ClientComp />
</template>
```

대상 컴포넌트에 props/children/slots를 전달할 수도 있습니다:

```vue
<script setup>
import { ref } from 'vue'
import { defineClientComponent } from 'vitepress'

const clientCompRef = ref(null)
const ClientComp = defineClientComponent(
  () => import('component-that-access-window-on-import'),

  // h() 에 전달된 인자 - https://vuejs.org/api/render-function.html#h
  [
    {
      ref: clientCompRef
    },
    {
      default: () => '기본 슬롯',
      foo: () => h('div', 'foo'),
      bar: () => [h('span', '하나'), h('span', '둘')]
    }
  ],

  // 컴포넌트가 로드된 후 콜백함수, 비동기일 수 있음
  () => {
    console.log(clientCompRef.value)
  }
)
</script>

<template>
  <ClientComp />
</template>
```

대상 컴포넌트는 래퍼 컴포넌트의 mounted 훅에서만 "import" 됩니다.
