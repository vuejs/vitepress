# カスタムテーマを使う {#using-a-custom-theme}

## テーマの解決 {#theme-resolving}

カスタムテーマを有効にするには、`.vitepress/theme/index.js` または `.vitepress/theme/index.ts` ファイル（「テーマエントリファイル」）を作成します。

```
.
├─ docs                # プロジェクトルート
│  ├─ .vitepress
│  │  ├─ theme
│  │  │  └─ index.js   # テーマエントリ
│  │  └─ config.js     # 設定ファイル
│  └─ index.md
└─ package.json
```

VitePress はテーマエントリファイルを検出すると、常にデフォルトテーマではなくカスタムテーマを使用します。ただし、[デフォルトテーマを拡張](./extending-default-theme) してその上で高度なカスタマイズを行うことも可能です。

## テーマインターフェース {#theme-interface}

VitePress のカスタムテーマは次のインターフェースを持つオブジェクトとして定義されます。

```ts
interface Theme {
/**
  * すべてのページに適用されるルートレイアウトコンポーネント
  * @required
  */
Layout: Component
/**
  * Vue アプリインスタンスを拡張
  * @optional
  */
enhanceApp?: (ctx: EnhanceAppContext) => Awaitable<void>
/**
  * 別のテーマを拡張し、そのテーマの `enhanceApp` を先に実行
  * @optional
  */
extends?: Theme
}

interface EnhanceAppContext {
app: App // Vue アプリインスタンス
router: Router // VitePress のルーターインスタンス
siteData: Ref<SiteData> // サイト全体のメタデータ
}
```

テーマエントリファイルでは、このテーマをデフォルトエクスポートとして公開します。

```js [.vitepress/theme/index.js]

// テーマエントリでは Vue ファイルを直接インポートできます
// VitePress は @vitejs/plugin-vue をあらかじめ設定済みです
import Layout from './Layout.vue'

export default {
Layout,
enhanceApp({ app, router, siteData }) {
  // ...
}
}
```

デフォルトエクスポートはカスタムテーマにおける唯一の契約であり、必須なのは `Layout` プロパティだけです。つまり、VitePress のテーマは単一の Vue コンポーネントでも成り立ちます。

レイアウトコンポーネントの内部は通常の Vite + Vue 3 アプリケーションと同じように動作します。なお、テーマは [SSR 対応](./ssr-compat) である必要があります。

## レイアウトの構築 {#building-a-layout}

最も基本的なレイアウトコンポーネントには [`<Content />`](../reference/runtime-api#content) コンポーネントを含める必要があります。

```vue [.vitepress/theme/Layout.vue]
<template>
<h1>Custom Layout!</h1>

<!-- この部分に markdown コンテンツが描画されます -->
<Content />
</template>
```

上記のレイアウトは、すべてのページの Markdown を単純に HTML として描画します。最初の改善点として 404 エラー処理を追加できます。

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

[`useData()`](../reference/runtime-api#usedata) ヘルパーを使うと、条件によってレイアウトを切り替えるために必要なすべてのランタイムデータを取得できます。アクセスできるデータのひとつにフロントマターがあります。これを利用すると、ページごとにレイアウトを制御できます。例えば、ユーザーが特別なホームページレイアウトを使いたい場合は以下のように記述します。

 ```md
---
layout: home
---
 ```

テーマ側を次のように調整します。

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

もちろんレイアウトをさらにコンポーネントに分割することもできます。

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
<Page v-else /> <!-- <Page /> が <Content /> を描画 -->
</template>
```

利用可能なすべての機能は [Runtime API リファレンス](../reference/runtime-api) を参照してください。さらに [ビルド時データ読み込み](./data-loading) を活用すれば、ブログ記事一覧ページのようなデータ駆動型のレイアウトも実現できます。

## カスタムテーマの配布 {#distributing-a-custom-theme}

最も簡単な配布方法は [GitHub のテンプレートリポジトリ](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository) として提供することです。

npm パッケージとして配布する場合は、次の手順を踏みます。

1. パッケージエントリでテーマオブジェクトをデフォルトエクスポートとして公開する。
2. 必要であればテーマ設定の型定義を `ThemeConfig` として公開する。
3. テーマが VitePress 設定の調整を必要とする場合は、パッケージのサブパス（例：`my-theme/config`）としてその設定を公開し、ユーザーが拡張できるようにする。
4. 設定ファイルやフロントマターを通じて、テーマ設定オプションを文書化する。
5. テーマの利用方法を明確に説明する（以下を参照）。

## カスタムテーマの利用 {#consuming-a-custom-theme}


外部テーマを利用するには、カスタムテーマエントリからインポートして再エクスポートします。

```js [.vitepress/theme/index.js]
import Theme from 'awesome-vitepress-theme'

export default Theme
```

テーマを拡張する必要がある場合:

```js [.vitepress/theme/index.js]
import Theme from 'awesome-vitepress-theme'

export default {
extends: Theme,
enhanceApp(ctx) {
  // ...
}
}
```

テーマが特別な VitePress 設定を必要とする場合は、設定ファイルも拡張する必要があります。

```ts [.vitepress/config.ts]
import baseConfig from 'awesome-vitepress-theme/config'

export default {
// 必要に応じてテーマの基本設定を拡張
extends: baseConfig
}
```

テーマがテーマ設定用の型を提供している場合:

```ts [.vitepress/config.ts]
import baseConfig from 'awesome-vitepress-theme/config'
import { defineConfigWithTheme } from 'vitepress'
import type { ThemeConfig } from 'awesome-vitepress-theme'

export default defineConfigWithTheme<ThemeConfig>({
extends: baseConfig,
themeConfig: {
  // 型は `ThemeConfig`
}
})
```
