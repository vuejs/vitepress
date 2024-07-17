---
outline: deep
---

# 기본 테마 확장하기 {#extending-the-default-theme}

VitePress의 기본 테마는 문서화에 최적화되어 있으며, 커스터마이징이 가능합니다. [기본 테마 구성 개요](../reference/default-theme-config)를 참조하여 가능한 옵션의 전체 목록을 확인하세요.

그러나 설정만으로는 충분하지 않은 경우가 여러 번 있을 수 있습니다. 예를 들면:

1. CSS 스타일링을 조정해야 할 때;
2. 전역 컴포넌트 등록과 같이 Vue 앱 인스턴스를 수정해야 할 때;
3. 레이아웃 슬롯을 통해 테마에 사용자 정의 컨텐츠를 삽입해야 할 때.

이러한 고급 커스터마이징은 기본 테마를 "확장하는" 사용자 지정 테마를 사용해야 합니다.

::: tip
진행하기 전에, 사용자 지정 테마가 어떻게 작동하는지 이해하기 위해 [사용자 지정 테마 사용하기](./custom-theme)를 먼저 읽어보세요.
:::

## CSS 커스터마이징하기 {#customizing-css}

기본 테마의 CSS는 루트 레벨 CSS 변수를 오버라이딩하여 커스터마이즈 할 수 있습니다:

```js
// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default DefaultTheme
```

```css
/* .vitepress/theme/custom.css */
:root {
  --vp-c-brand-1: #646cff;
  --vp-c-brand-2: #747bff;
}
```

오버라이딩할 수 있는 [기본 테마 CSS 변수](https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/styles/vars.css)를 확인하세요.

## 다른 폰트 사용하기 {#using-different-fonts}

VitePress는 기본 폰트로 [Inter](https://rsms.me/inter/)를 사용하며, 빌드 출력물에 폰트를 포함합니다. 또한, 이 폰트는 프로덕션 환경에서 자동으로 프리로드됩니다. 하지만, 다른 메인 폰트를 사용하고 싶은 경우에는 바람직하지 않을 수 있습니다.

빌드 출력물에서 Inter를 포함하지 않으려면, 대신 `vitepress/theme-without-fonts`에서 테마를 임포트하세요:

```js
// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme-without-fonts'
import './my-fonts.css'

export default DefaultTheme
```

```css
/* .vitepress/theme/custom.css */
:root {
  --vp-font-family-base: /* 일반 텍스트 폰트 */
  --vp-font-family-mono: /* 코드 폰트 */
}
```

::: warning
[팀 페이지](../reference/default-theme-team-page)와 같은 선택적 컴포넌트를 사용하는 경우, 이들도 `vitepress/theme-without-fonts`에서 가져와야 합니다!
:::

폰트가 `@font-face`를 통해 참조된 로컬 파일이라면, 자산으로 처리되어 해시된 파일명과 함께 `.vitepress/dist/assets` 아래에 포함될 것입니다. 이 파일을 프리로드하려면, [transformHead](../reference/site-config#transformhead) 빌드 훅을 사용하세요:

```js
// .vitepress/config.js
export default {
  transformHead({ assets }) {
    // 폰트를 매칭하기 위해 정규식을 적절히 조정하세요
    const myFontFile = assets.find(file => /font-name\.\w+\.woff2/)
    if (myFontFile) {
      return [
        [
          'link',
          {
            rel: 'preload',
            href: myFontFile,
            as: 'font',
            type: 'font/woff2',
            crossorigin: ''
          }
        ]
      ]
    }
  }
}
```

## 전역 컴포넌트 등록하기 {#registering-global-components}

```js
// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 사용자 지정 전역 컴포넌트를 등록하세요
    app.component('MyGlobalComponent' /* ... */)
  }
}
```

TypeScript를 사용하는 경우:
```ts
// .vitepress/theme/index.ts
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 사용자 지정 전역 컴포넌트를 등록하세요
    app.component('MyGlobalComponent' /* ... */)
  }
} satisfies Theme
```

Vite를 사용하기 때문에, Vite의 [글로브 임포트 기능](https://vitejs.dev/ko/guide/features.html#glob-import)을 활용하여 컴포넌트 디렉터리를 자동으로 등록할 수도 있습니다.

## 레이아웃 슬롯 {#layout-slots}

기본 테마의 `<Layout/>` 컴포넌트는 페이지의 특정 위치에 컨텐츠를 삽입할 수 있도록 몇 개의 슬롯을 제공합니다. 아웃라인 앞에 컴포넌트를 삽입하는 예시입니다:

```js
// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'
import MyLayout from './MyLayout.vue'

export default {
  extends: DefaultTheme,
  // 슬롯을 삽입하는 래퍼 컴포넌트로
  // Layout을 오버라이드합니다
  Layout: MyLayout
}
```

```vue
<!--.vitepress/theme/MyLayout.vue-->
<script setup>
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #aside-outline-before>
      나만의 사용자 사이드바 상단 컨텐츠
    </template>
  </Layout>
</template>
```

렌더 함수를 사용하는 것도 가능합니다.

```js
// .vitepress/theme/index.js
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import MyComponent from './MyComponent.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'aside-outline-before': () => h(MyComponent)
    })
  }
}
```

기본 테마 레이아웃에서 사용할 수 있는 전체 슬롯 목록:

- 프론트매터를 통해 `layout: 'doc'` (기본값)이 활성화될 때:
  - `doc-top`
  - `doc-bottom`
  - `doc-footer-before`
  - `doc-before`
  - `doc-after`
  - `sidebar-nav-before`
  - `sidebar-nav-after`
  - `aside-top`
  - `aside-bottom`
  - `aside-outline-before`
  - `aside-outline-after`
  - `aside-ads-before`
  - `aside-ads-after`
- 프론트매터를 통해 `layout: 'home'`이 활성화될 때:
  - `home-hero-before`
  - `home-hero-info-before`
  - `home-hero-info`
  - `home-hero-info-after`
  - `home-hero-actions-after`
  - `home-hero-image`
  - `home-hero-after`
  - `home-features-before`
  - `home-features-after`
- 프론트매터를 통해 `layout: 'page'`가 활성화될 때:
  - `page-top`
  - `page-bottom`
- 찾을 수 없는 (404) 페이지에서:
  - `not-found`
- 항상:
  - `layout-top`
  - `layout-bottom`
  - `nav-bar-title-before`
  - `nav-bar-title-after`
  - `nav-bar-content-before`
  - `nav-bar-content-after`
  - `nav-screen-content-before`
  - `nav-screen-content-after`

## 뷰 전환 API 사용하기 {#using-view-transitions-api}

### 외형 토글 시 {#on-appearance-toggle}

기본 테마를 확장하여 색상 모드가 토글될 때 사용자 정의 전환을 제공할 수 있습니다. 예시:

```vue
<!-- .vitepress/theme/Layout.vue -->

<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { nextTick, provide } from 'vue'

const { isDark } = useData()

const enableTransitions = () =>
  'startViewTransition' in document &&
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches

provide('toggle-appearance', async ({ clientX: x, clientY: y }: MouseEvent) => {
  if (!enableTransitions()) {
    isDark.value = !isDark.value
    return
  }

  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    )}px at ${x}px ${y}px)`
  ]

  await document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  }).ready

  document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    {
      duration: 300,
      easing: 'ease-in',
      pseudoElement: `::view-transition-${isDark.value ? 'old' : 'new'}(root)`
    }
  )
})
</script>

<template>
  <DefaultTheme.Layout />
</template>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root),
.dark::view-transition-new(root) {
  z-index: 1;
}

::view-transition-new(root),
.dark::view-transition-old(root) {
  z-index: 9999;
}

.VPSwitchAppearance {
  width: 22px !important;
}

.VPSwitchAppearance .check {
  transform: none !important;
}
</style>
```

결과 (**경고!**: 눈부심, 갑작스러운 움직임, 밝은 빛):

<details>
<summary>데모</summary>

![외형 토글 전환 데모](/appearance-toggle-transition.webp)

</details>

뷰 전환에 대한 자세한 정보는 [Chrome 문서](https://developer.chrome.com/docs/web-platform/view-transitions/)를 참고하세요.

### 라우트 변경 시 {#on-route-change}

곧 제공될 예정입니다.

## 내부 컴포넌트 오버라이딩하기 {#overriding-internal-components}

Vite의 [별칭](https://vitejs.dev/config/shared-options.html#resolve-alias)을 사용하여 기본 테마 컴포넌트를 사용자 지정 컴포넌트로 대체할 수 있습니다:

```ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

export default defineConfig({
  vite: {
    resolve: {
      alias: [
        {
          find: /^.*\/VPNavBar\.vue$/,
          replacement: fileURLToPath(
            new URL('./components/CustomNavBar.vue', import.meta.url)
          )
        }
      ]
    }
  }
})
```

컴포넌트의 정확한 이름을 알고 싶다면 [저희 소스 코드](https://github.com/vuejs/vitepress/tree/main/src/client/theme-default/components)를 참조하세요. 컴포넌트가 내부적으로 사용되기 때문에, 소규모 릴리스 사이에 이름이 업데이트될 수 있습니다.
