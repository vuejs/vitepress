# 사용자 정의 테마 사용하기 {#using-a-custom-theme}

## 테마 해결 {#theme-resolving}

`.vitepress/theme/index.js` 또는 `.vitepress/theme/index.ts` 파일(“테마 엔트리 파일”)을 생성하여 사용자 정의 테마를 활성화할 수 있습니다:

```
.
├─ docs                # 프로젝트 루트
│  ├─ .vitepress
│  │  ├─ theme
│  │  │  └─ index.js   # 테마 엔트리
│  │  └─ config.js     # 설정 파일
│  └─ index.md
└─ package.json
```

VitePress는 테마 엔트리 파일의 존재를 감지하면 기본 테마 대신 항상 사용자 정의 테마를 사용합니다. 하지만 [기본 테마를 확장하여](./extending-default-theme) 그 위에 고급 사용자 정의를 수행할 수 있습니다.

## 테마 인터페이스 {#theme-interface}

VitePress 사용자 정의 테마는 다음 인터페이스를 가진 객체로 정의됩니다:

```ts
interface Theme {
  /**
   * 모든 페이지의 루트 레이아웃 컴포넌트
   * @필수
   */
  Layout: Component
  /**
   * Vue 앱 인스턴스 개선
   * @선택적
   */
  enhanceApp?: (ctx: EnhanceAppContext) => Awaitable<void>
  /**
   * 다른 테마 확장, 우리의 `enhanceApp` 전에 호출
   * @선택적
   */
  extends?: Theme
}

interface EnhanceAppContext {
  app: App // Vue 앱 인스턴스
  router: Router // VitePress 라우터 인스턴스
  siteData: Ref<SiteData> // 사이트 수준 메타데이터
}
```

테마 엔트리 파일은 테마를 기본으로 내보내야 합니다:

```js
// .vitepress/theme/index.js

// 테마 엔트리에서 Vue 파일을 직접 가져올 수 있습니다
// VitePress는 @vitejs/plugin-vue로 미리 설정되어 있습니다.
import Layout from './Layout.vue'

export default {
  Layout,
  enhanceApp({ app, router, siteData }) {
    // ...
  }
}
```

기본 내보내기는 사용자 정의 테마에 대한 유일한 계약이며, `Layout` 속성만 필수입니다. 기술적으로, VitePress 테마는 단일 Vue 컴포넌트만큼 간단할 수 있습니다.

레이아웃 컴포넌트 내부에서는 평소처럼 Vite + Vue 3 애플리케이션처럼 작동합니다. 테마도 [SSR-호환성이](./ssr-compat) 있어야 합니다.

## 레이아웃 만들기 {#building-a-layout}

가장 기본적인 레이아웃 컴포넌트는 [`<Content />`](../reference/runtime-api#content) 컴포넌트를 포함해야 합니다:

```vue
<!-- .vitepress/theme/Layout.vue -->
<template>
  <h1>사용자 정의 레이아웃!</h1>

  <!-- 마크다운 내용이 여기에 렌더링됩니다 -->
  <Content />
</template>
```

위의 레이아웃은 각 페이지의 마크다운을 HTML로 단순히 렌더링합니다. 우리가 추가할 수 있는 첫 번째 개선 사항은 404 오류를 처리하는 것입니다:

```vue{1-4,9-12}
<script setup>
import { useData } from 'vitepress'
const { page } = useData()
</script>

<template>
  <h1>사용자 정의 레이아웃!</h1>

  <div v-if="page.isNotFound">
    사용자 정의 404 페이지!
  </div>
  <Content v-else />
</template>
```

[`useData()`](../reference/runtime-api#usedata) 헬퍼는 우리가 필요로 하는 모든 런타임 데이터를 제공하여, 다른 레이아웃을 조건부로 렌더링할 수 있습니다. 우리가 접근할 수 있는 또 다른 데이터는 현재 페이지의 프론트매터입니다. 이를 활용하여 사용자가 각 페이지의 레이아웃을 제어할 수 있도록 합니다. 예를 들어, 사용자는 특별한 홈페이지 레이아웃을 사용해야 한다고 지정할 수 있습니다:

```md
---
layout: home
---
```

그리고 우리는 이를 처리하기 위해 테마를 조정할 수 있습니다:

```vue{3,12-14}
<script setup>
import { useData } from 'vitepress'
const { page, frontmatter } = useData()
</script>

<template>
  <h1>사용자 정의 레이아웃!</h1>

  <div v-if="page.isNotFound">
    사용자 정의 404 페이지!
  </div>
  <div v-if="frontmatter.layout === 'home'">
    사용자 정의 홈 페이지!
  </div>
  <Content v-else />
</template>
```

물론, 레이아웃을 더 많은 컴포넌트로 나눌 수 있습니다:

```vue{3-5,12-15}
<script setup>
import { useData } from 'vitepress'
import NotFound from './NotFound.vue'
import Home from './Home.vue'
import Page from './Page.vue'

const { page, frontmatter } = useData()
</script>

<template>
  <h1>사용자 정의 레이아웃!</h1>

  <NotFound v-if="page.isNotFound" />
  <Home v-if="frontmatter.layout === 'home'" />
  <Page v-else /> <!-- <Page />는 <Content />를 렌더링합니다 -->
</template>
```

테마 컴포넌트에서 사용할 수 있는 모든 것에 대한 [런타임 API 참조](../reference/runtime-api)를 참조하세요. 또한, [빌드할 때 데이터 로딩](./data-loading)을 활용하여 데이터 기반 레이아웃을 생성할 수 있습니다 - 예를 들어, 현재 프로젝트 내 모든 블로그 포스트를 나열하는 페이지 등.

## 사용자 정의 테마 배포하기 {#distributing-a-custom-theme}

사용자 정의 테마를 배포하는 가장 쉬운 방법은 [GitHub에서 템플릿 저장소로 제공하는 것입니다](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository).

npm 패키지로 테마를 배포하려면 다음 단계를 따르세요:

1. 패키지 엔트리에서 테마 객체를 기본 내보내기로 내보냅니다.

2. 적용된다면, 테마 설정 타입 정의를 `ThemeConfig`로 내보냅니다.

3. 테마가 VitePress 설정을 조정해야 하는 경우, 사용자가 확장할 수 있도록 패키지 하위 경로(예: `my-theme/config`)에 해당 설정을 내보냅니다.

4. 설정 파일 및 프론트매터를 통한 테마 설정 옵션을 문서화합니다.

5. 테마를 소비하는 방법에 대한 명확한 지침을 제공합니다(아래 참조).

## 사용자 정의 테마 소비하기 {#consuming-a-custom-theme}

외부 테마를 소비하려면 사용자 정의 테마 엔트리에서 가져와서 다시 내보냅니다:

```js
// .vitepress/theme/index.js
import Theme from 'awesome-vitepress-theme'

export default Theme
```

테마를 확장해야 하는 경우:

```js
// .vitepress/theme/index.js
import Theme from 'awesome-vitepress-theme'

export default {
  extends: Theme,
  enhanceApp(ctx) {
    // ...
  }
}
```

테마가 특별한 VitePress 설정을 요구하는 경우, 자신의 설정에서도 그 설정을 확장해야 합니다:

```ts
// .vitepress/config.ts
import baseConfig from 'awesome-vitepress-theme/config'

export default {
  // 필요한 경우 테마 기본 설정 확장
  extends: baseConfig
}
```

마지막으로, 테마가 테마 설정에 대한 타입을 제공하는 경우:

```ts
// .vitepress/config.ts
import baseConfig from 'awesome-vitepress-theme/config'
import { defineConfigWithTheme } from 'vitepress'
import type { ThemeConfig } from 'awesome-vitepress-theme'

export default defineConfigWithTheme<ThemeConfig>({
  extends: baseConfig,
  themeConfig: {
    // 타입은 `ThemeConfig`입니다.
  }
})
```
