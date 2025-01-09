# 커스텀 테마 사용하기 {#using-a-custom-theme}

## 테마 사용법 {#theme-resolving}

`.vitepress/theme/index.js` 또는 `.vitepress/theme/index.ts` 파일("테마 엔트리 파일")을 생성하여 커스텀 테마를 활성화할 수 있습니다:

```
.
├─ docs                # 프로젝트 루트
│  ├─ .vitepress
│  │  ├─ theme
│  │  │  └─ index.js   # 테마 엔트리
│  │  └─ config.js     # 구성 파일
│  └─ index.md
└─ package.json
```

VitePress는 테마 엔트리 파일이 존재를 감지하면 기본 테마 대신 커스텀 테마를 사용합니다. 아니면 [기본 테마 확장하기](./extending-default-theme)를 통해 이를 기반으로 고급 커스터마이징을 수행할 수 있습니다.

## 테마 인터페이스 {#theme-interface}

VitePress 커스텀 테마는 아래와 같은 인터페이스 객체로 정의됩니다:

```ts
interface Theme {
  /**
   * 모든 페이지의 루트 레이아웃 컴포넌트
   * @required
   */
  Layout: Component
  /**
   * Vue 애플리케이션 인스턴스 추가조작 (의역: "enhance → 추가조작")
   * @optional
   */
  enhanceApp?: (ctx: EnhanceAppContext) => Awaitable<void>
  /**
   * 현재 `enhanceApp`를 호출하기 전, 다른 테마를 먼저 확장
   * @optional
   */
  extends?: Theme
}

interface EnhanceAppContext {
  app: App // Vue 애플리케이션 인스턴스
  router: Router // VitePress 라우터 인스턴스
  siteData: Ref<SiteData> // 사이트 수준 메타데이터
}
```

테마 엔트리 파일은 테마(Theme 객체)를 "export default" 해야 합니다:

```js [.vitepress/theme/index.js]

// 테마 엔트리에서 Vue 파일을 직접 "import" 할 수 있습니다.
// VitePress는 @vitejs/plugin-vue가 사전 구성되어 있습니다.
import Layout from './Layout.vue'

export default {
  Layout,
  enhanceApp({ app, router, siteData }) {
    // ...
  }
}
```

"export default"는 커스텀 테마를 설정하는 유일한 방법이며, `Layout` 프로퍼티만 필수입니다. 따라서 기술적으로 VitePress 테마는 단일 Vue 컴포넌트처럼 간단할 수 있습니다.

레이아웃 컴포넌트 내부에서는 일반적인 Vite + Vue 3 애플리케이션처럼 동작합니다. 또한 테마가 [SSR 호환](./ssr-compat)이 되어야 합니다.

## 레이아웃 만들기 {#building-a-layout}

가장 기본적인 레이아웃 컴포넌트는 [`<Content />`](../reference/runtime-api#content) 컴포넌트가 포함되어야 합니다:

```vue [.vitepress/theme/Layout.vue]
<template>
  <h1>Custom Layout!</h1>

  <!-- 마크다운 내용은 여기에 렌더링됩니다 -->
  <Content />
</template>
```

위의 레이아웃은 각 페이지의 마크다운을 HTML로 렌더링합니다. 첫 번째로 개선 사항은 404 에러를 처리하는 것입니다:

```vue{1-4,9-12}
<script setup>
import { useData } from 'vitepress'
const { page } = useData()
</script>

<template>
  <h1>Custom Layout!</h1>

  <div v-if="page.isNotFound">
    Custom 404 page!
  </div>
  <Content v-else />
</template>
```

[`useData()`](../reference/runtime-api#usedata) 헬퍼는 다양한 레이아웃을 조건부로 렌더링하는 데 필요한 모든 런타임 데이터를 제공합니다. 접근할 수 있는 다른 데이터 중 하나는 현재 페이지의 전문(front-matter)입니다. 이를 활용하여 각 페이지에 맞게 레이아웃을 제어할 수 있습니다. 예를 들어 특정 페이지에서 홈 페이지 레이아웃을 사용하도록 지정할 수 있습니다:

```md
---
layout: home
---
```

그리고 이를 처리하도록 테마를 조정할 수 있습니다:

```vue{3,12-14}
<script setup>
import { useData } from 'vitepress'
const { page, frontmatter } = useData()
</script>

<template>
  <h1>Custom Layout!</h1>

  <div v-if="page.isNotFound">
    Custom 404 page!
  </div>
  <div v-if="frontmatter.layout === 'home'">
    Custom home page!
  </div>
  <Content v-else />
</template>
```

물론 레이아웃을 더 많은 컴포넌트로 나눌 수 있습니다:

```vue{3-5,12-15}
<script setup>
import { useData } from 'vitepress'
import NotFound from './NotFound.vue'
import Home from './Home.vue'
import Page from './Page.vue'

const { page, frontmatter } = useData()
</script>

<template>
  <h1>Custom Layout!</h1>

  <NotFound v-if="page.isNotFound" />
  <Home v-if="frontmatter.layout === 'home'" />
  <Page v-else /> <!-- <Page /> 는 <Content /> 를 렌더링합니다 -->
</template>
```

테마 컴포넌트에서 사용할 수 있는 모든 항목에 대해서는 [런타임 API 레퍼런스](../reference/runtime-api)를 참고하세요. 또한 [빌드할 때 데이터 로딩하기](./data-loading)를 활용하여 데이터 기반의 레이아웃을 생성할 수 있습니다. 예를 들어 현재 프로젝트의 모든 블로그 게시물을 나열하는 페이지를 만들 수 있습니다.

## 사용자 정의 테마 배포하기 {#distributing-a-custom-theme}

커스텀 테마를 배포하는 가장 쉬운 방법은 [GitHub 템플릿 리포지토리](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository)로 제공하는 것입니다.

테마를 npm 패키지로 배포하려면 다음 단계를 따라야 합니다:

1. 패키지 엔트리에서 테마 객체를 "export default" 합니다.

2. 해당되는 경우, 테마 구성 타입 정의를 `ThemeConfig`로 "export" 합니다.

3. 테마에서 VitePress 구성을 조정해야 하는 경우, 사용자가 확장할 수 있도록 패키지 하위 경로(예: `my-theme/config`)에 해당 구성을 "export" 합니다.

4. 테마 구성 옵션을 문서화합니다 (구성 파일과 전문 둘 다).

5. 테마를 사용하는 방법에 대한 명확한 지침을 제공합니다 (아래 참조).

## 커스텀 테마 사용하기 {#consuming-a-custom-theme}

외부 테마를 사용하려면, 커스텀 테마 엔트리에서 테마를 "import" 후 다시 "export"합니다:

```js [.vitepress/theme/index.js]
import Theme from 'awesome-vitepress-theme'

export default Theme
```

테마를 확장해야 하는 경우:

```js [.vitepress/theme/index.js]
import Theme from 'awesome-vitepress-theme'

export default {
  extends: Theme,
  enhanceApp(ctx) {
    // ...
  }
}
```

테마가 특별한 VitePress 구성을 요구하는 경우, 해당 구성을 (외부 커스텀 테마를 사용하는 자신의) 구성 파일에서도 확장해야 합니다:

```ts [.vitepress/config.ts]
import baseConfig from 'awesome-vitepress-theme/config'

export default {
  // 필요한 경우 테마 기본 구성 확장
  extends: baseConfig
}
```

마지막으로 테마가 테마 구성에 대한 타입을 제공하는 경우:

```ts [.vitepress/config.ts]
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
