# 런타임 API {#runtime-api}

VitePress는 앱 데이터에 액세스할 수 있도록 몇 가지 내장 API를 제공합니다. 또한 전역적으로 사용할 수 있는 몇 가지 내장 컴포넌트도 제공합니다.

도우미 메서드는 `vitepress`에서 전역적으로 가져올 수 있으며 일반적으로 사용자 지정 테마 Vue 컴포넌트에서 사용됩니다. 그러나 마크다운 파일이 Vue [단일 파일 컴포넌트](https://vuejs.org/guide/scaling-up/sfc.html)로 컴파일되기 때문에 `.md` 페이지 내에서도 사용할 수 있습니다.

`use*`로 시작하는 메서드는 `setup()` 또는 `<script setup>` 내에서만 사용할 수 있는 [Vue 3 구성 API](https://vuejs.org/guide/introduction.html#composition-api) 함수("컴퍼저블")임을 나타냅니다.

## `useData` <Badge type="info" text="컴퍼저블" />

페이지별 데이터를 반환합니다. 반환된 객체는 다음 유형을 가집니다:

```ts
interface VitePressData<T = any> {
  /**
   * 사이트 수준 메타데이터
   */
  site: Ref<SiteData<T>>
  /**
   * .vitepress/config.js에서의 themeConfig
   */
  theme: Ref<T>
  /**
   * 페이지 수준 메타데이터
   */
  page: Ref<PageData>
  /**
   * 페이지 앞부분 메타데이터
   */
  frontmatter: Ref<PageData['frontmatter']>
  /**
   * 동적 라우트 매개변수
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

**예시:**

```vue
<script setup>
import { useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <h1>{{ theme.footer.copyright }}</h1>
</template>
```

## `useRoute` <Badge type="info" text="컴퍼저블" />

현재 라우트 객체를 다음 유형으로 반환합니다:

```ts
interface Route {
  path: string
  data: PageData
  component: Component | null
}
```

## `useRouter` <Badge type="info" text="컴퍼저블" />

다른 페이지로 프로그래밍 방식으로 이동할 수 있도록 VitePress 라우터 인스턴스를 반환합니다.

```ts
interface Router {
  /**
   * 현재 route.
   */
  route: Route
  /**
   * 새 URL로 이동합니다.
   */
  go: (to?: string) => Promise<void>
  /**
   * 라우트가 변경되기 전에 호출됩니다. 이동을 취소하려면 `false`를 반환하십시오.
   */
  onBeforeRouteChange?: (to: string) => Awaitable<void | boolean>
  /**
   * 페이지 컴포넌트가 로드되기 전(히스토리 상태가 업데이트된 후)에 호출됩니다.
   * 이동을 취소하려면 `false`를 반환하십시오.
   */
  onBeforePageLoad?: (to: string) => Awaitable<void | boolean>
  /**
   * 라우트가 변경된 후 호출됩니다.
   */
  onAfterRouteChanged?: (to: string) => Awaitable<void>
}
```

## `withBase` <Badge type="info" text="도움" />

- **타입**: `(path: string) => string`

설정된 [`base`](./site-config#base)를 주어진 URL 경로에 추가합니다. [Base URL](../guide/asset-handling#base-url)도 참조하십시오.

## `<Content />` <Badge type="info" text="컴포넌트" />

`<Content />` 컴포넌트는 렌더링된 마크다운 내용을 표시합니다. [자신만의 테마를 만들 때](../guide/custom-theme) 유용합니다.

```vue
<template>
  <h1>커스텀 레이아웃!</h1>
  <Content />
</template>
```

## `<ClientOnly />` <Badge type="info" text="컴포넌트" />

`<ClientOnly />` 컴포넌트는 클라이언트 측에서만 슬롯을 렌더링합니다.

VitePress 애플리케이션은 정적 빌드를 생성할 때 Node.js에서 서버 렌더링되므로, 모든 Vue 사용은 범용 코드 요구 사항에 부합해야 합니다. 간단히 말해서, beforeMount 또는 mounted 훅에서만 브라우저 / DOM API에 액세스하십시오.

SSR 친화적이지 않은 컴포넌트(예: 커스텀 지시문이 포함된 경우)를 사용하거나 시연하는 경우 해당 컴포넌트를 `ClientOnly` 컴포넌트 안에 포함시킬 수 있습니다.

```vue-html
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```

- 관련: [SSR 호환성](../guide/ssr-compat)

## `$frontmatter` <Badge type="info" text="템플릿 전역" />

Vue 표현식에서 현재 페이지의 [앞부분 메타데이터](../guide/frontmatter)를 직접 액세스합니다.

```md
---
title: 안녕하세요
---

# {{ $frontmatter.title }}
```

## `$params` <Badge type="info" text="템플릿 전역" />

Vue 표현식에서 현재 페이지의 [동적 라우트 매개변수](../guide/routing#dynamic-routes)를 직접 액세스합니다.

```md
- package name: {{ $params.pkg }}
- version: {{ $params.version }}
```
