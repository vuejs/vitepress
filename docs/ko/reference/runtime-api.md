# 런타임 API {#runtime-api}

VitePress는 애플리케이션 데이터를 액세스할 수 있는 여러 내장 API를 제공합니다. 그리고 전역적으로 사용할 수 있는 몇 가지 내장 컴포넌트도 제공합니다.

헬퍼 메서드는 `vitepress`에서 전역적으로 사용할 수 있으며, 주로 커스텀 테마의 Vue 컴포넌트에서 사용됩니다. 또한 마크다운 파일이 Vue [단일 파일 컴포넌트](https://vuejs.org/guide/scaling-up/sfc.html)로 컴파일되기 때문에 `.md` 페이지 내에서도 사용할 수 있습니다.

`use*`로 시작하는 메서드는 [Vue 3 Composition API](https://vuejs.org/guide/introduction.html#composition-api) 함수("컴포저블")를 나타내며, 이는 `setup()` 또는 `<script setup>` 내부에서만 사용할 수 있습니다.

## `useData` <Badge type="info" text="컴포저블" />

페이지별 데이터를 반환합니다. 반환된 객체는 다음과 같은 타입을 가집니다:

```ts
interface VitePressData<T = any> {
  /**
   * 사이트 레벨 메타데이터
   */
  site: Ref<SiteData<T>>
  /**
   * .vitepress/config.js 의 themeConfig
   */
  theme: Ref<T>
  /**
   * 페이지 레벨 메타데이터
   */
  page: Ref<PageData>
  /**
   * 페이지 전문 메타데이터
   */
  frontmatter: Ref<PageData['frontmatter']>
  /**
   * 동적 라우트 파라미터
   */
  params: Ref<PageData['params']>
  title: Ref<string>
  description: Ref<string>
  lang: Ref<string>
  isDark: Ref<boolean>
  dir: Ref<string>
  localeIndex: Ref<string>
  /**
   * 현재 위치 해시
   */
  hash: Ref<string>
}

interface PageData {
  title: string
  titleTemplate?: string | boolean
  description: string
  relativePath: string
  filePath: string,
  headers: Header[]
  frontmatter: Record<string, any>
  params?: Record<string, any>
  isNotFound?: boolean
  lastUpdated?: number
}
```

**예제:**

```vue
<script setup>
import { useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <h1>{{ theme.footer.copyright }}</h1>
</template>
```

## `useRoute` <Badge type="info" text="컴포저블" />

다음과 같은 타입으로 현재 라우트 객체를 반환합니다:

```ts
interface Route {
  path: string
  data: PageData
  component: Component | null
}
```

## `useRouter` <Badge type="info" text="컴포저블" />

프로그래밍 방식으로 다른 페이지로 이동할 수 있도록 VitePress 라우터 인스턴스를 반환합니다.

```ts
interface Router {
  /**
   * 현재 route.
   */
  route: Route
  /**
   * 새 URL로 이동.
   */
  go: (to?: string) => Promise<void>
  /**
   * 라우트가 변경되기 전에 호출. 탐색을 취소하려면 `false`를 반환.
   */
  onBeforeRouteChange?: (to: string) => Awaitable<void | boolean>
  /**
   * 페이지 컴포넌트가 로드되기 전(히스토리 상태가 업데이트된 후)에 호출.
   * 탐색을 취소하려면 `false`를 반환.
   */
  onBeforePageLoad?: (to: string) => Awaitable<void | boolean>
  /**
   * 라우트가 변경된 후 호출.
   */
  onAfterRouteChange?: (to: string) => Awaitable<void>
}
```

## `withBase` <Badge type="info" text="헬퍼" />

- **타입**: `(path: string) => string`

구성된 [`base`](./site-config#base)를 지정된 URL 경로에 추가합니다. [Base URL](../guide/asset-handling#base-url)을 참고하세요.

## `<Content />` <Badge type="info" text="컴포넌트" />

`<Content />` 컴포넌트는 렌더링된 마크다운 내용을 표시합니다. [커스텀 테마를 만들 때](../guide/custom-theme) 유용합니다.

```vue
<template>
  <h1>Custom Layout!</h1>
  <Content />
</template>
```

## `<ClientOnly />` <Badge type="info" text="컴포넌트" />

`<ClientOnly />` 컴포넌트는 클라이언트 측에서만 슬롯을 렌더링합니다.

VitePress 애플리케이션은 정적 빌드를 생성할 때 Node.js에서 서버 렌더링되므로 모든 Vue 사용은 범용 코드 요구 사항을 준수해야 합니다. 간단히 말해서, 브라우저 / DOM API는 반드시 beforeMount 또는 mounted 훅에서만 접근해야 합니다.

SSR 친화적이지 않은(예: 커스텀 디렉티브를 포함하는) 컴포넌트를 사용하는 경우, 이를 `ClientOnly` 컴포넌트 내부에 래핑할 수 있습니다.

```vue-html
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```

- 참고: [SSR 호환성](../guide/ssr-compat)

## `$frontmatter` <Badge type="info" text="템플릿 전역" />

Vue 표현식에서 현재 페이지의 [전문](../guide/frontmatter) 데이터에 직접 접근합니다.

```md
---
title: Hello
---

# {{ $frontmatter.title }}
```

## `$params` <Badge type="info" text="템플릿 전역" />

Vue 표현식에서 현재 페이지의 [동적 라우트 파라미터](../guide/routing#dynamic-routes)에 직접 접근합니다.

```md
- package name: {{ $params.pkg }}
- version: {{ $params.version }}
```
