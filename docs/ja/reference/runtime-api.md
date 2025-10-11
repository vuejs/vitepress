# ランタイム API {#runtime-api}

VitePress には、アプリのデータへアクセスするための組み込み API がいくつか用意されています。さらに、グローバルに使用できる組み込みコンポーネントも提供されています。

ヘルパーメソッドは `vitepress` からグローバルインポートでき、主にカスタムテーマの Vue コンポーネントで使われます。Markdown ファイルは Vue の [Single File Component](https://vuejs.org/guide/scaling-up/sfc.html) にコンパイルされるため、`.md` ファイル内でも使用できます。

`use*` で始まるメソッドは [Vue 3 Composition API](https://vuejs.org/guide/introduction.html#composition-api) の関数（Composable）で、`setup()` または `<script setup>` の中でのみ使用できます。

## `useData` <Badge type="info" text="composable" />

ページ固有のデータを返します。戻り値の型は次のとおりです。

```ts
interface VitePressData<T = any> {
  /**
   * サイト全体のメタデータ
   */
  site: Ref<SiteData<T>>
  /**
   * .vitepress/config.js の themeConfig
   */
  theme: Ref<T>
  /**
   * ページ単位のメタデータ
   */
  page: Ref<PageData>
  /**
   * ページのフロントマター
   */
  frontmatter: Ref<PageData['frontmatter']>
  /**
   * 動的ルートのパラメータ
   */
  params: Ref<PageData['params']>
  title: Ref<string>
  description: Ref<string>
  lang: Ref<string>
  isDark: Ref<boolean>
  dir: Ref<string>
  localeIndex: Ref<string>
  /**
   * 現在の location hash
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

**使用例:**

```vue
<script setup>
import { useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <h1>{{ theme.footer.copyright }}</h1>
</template>
```

## `useRoute` <Badge type="info" text="composable" />

現在のルートオブジェクトを返します。型は次のとおりです。

```ts
interface Route {
  path: string
  data: PageData
  component: Component | null
}
```

## `useRouter` <Badge type="info" text="composable" />

VitePress のルーターインスタンスを返し、プログラムで別ページへ遷移できます。

```ts
interface Router {
  /**
   * 現在のルート
   */
  route: Route
  /**
   * 新しい URL へ遷移
   */
  go: (to?: string) => Promise<void>
  /**
   * ルートが変わる前に呼ばれる。`false` を返すと遷移をキャンセル
   */
  onBeforeRouteChange?: (to: string) => Awaitable<void | boolean>
  /**
   * ページコンポーネントが読み込まれる前（履歴が更新された後）に呼ばれる。
   * `false` を返すと遷移をキャンセル
   */
  onBeforePageLoad?: (to: string) => Awaitable<void | boolean>
  /**
   * ページコンポーネントが読み込まれた後（更新前）に呼ばれる
   */
  onAfterPageLoad?: (to: string) => Awaitable<void>
  /**
   * ルートが変わった後に呼ばれる
   */
  onAfterRouteChange?: (to: string) => Awaitable<void>
}
```

## `withBase` <Badge type="info" text="helper" />

- **型**: `(path: string) => string`

設定された [`base`](./site-config#base) を指定の URL パスに付与します。[Base URL](../guide/asset-handling#base-url) も参照。

## `<Content />` <Badge type="info" text="component" />

レンダリング済みの Markdown コンテンツを表示します。［独自テーマの作成時］(../guide/custom-theme) に便利です。

```vue
<template>
  <h1>Custom Layout!</h1>
  <Content />
</template>
```

## `<ClientOnly />` <Badge type="info" text="component" />

スロット内容をクライアント側でのみレンダリングします。

VitePress アプリは静的ビルド時に Node.js 上でサーバーレンダリングされるため、Vue の使用はユニバーサルコードの要件に従う必要があります。要するに、ブラウザ／DOM API へのアクセスは beforeMount / mounted フック内に限定してください。

SSR 非対応（例: カスタムディレクティブを含む）なコンポーネントを使用・デモする場合は、`ClientOnly` でラップできます。

```vue-html
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```

- 関連: [SSR 互換性](../guide/ssr-compat)

## `$frontmatter` <Badge type="info" text="template global" />

Vue の式内で現在ページの [フロントマター](../guide/frontmatter) に直接アクセスします。

```md
---
title: Hello
---

# {{ $frontmatter.title }}
```

## `$params` <Badge type="info" text="template global" />

Vue の式内で現在ページの [動的ルートのパラメータ](../guide/routing#dynamic-routes) に直接アクセスします。

```md
- package name: {{ $params.pkg }}
- version: {{ $params.version }}
```
