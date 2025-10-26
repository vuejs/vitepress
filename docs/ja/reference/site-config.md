---
outline: deep
---

# サイト設定 {#site-config}

サイト設定では、サイト全体のグローバル設定を定義します。アプリ設定オプションは、使用するテーマに関係なく、すべての VitePress サイトに適用されます。たとえば、ベースディレクトリやサイトのタイトルなどです。

## 概要 {#overview}

### 設定ファイルの解決 {#config-resolution}

設定ファイルは常に `<root>/.vitepress/config.[ext]` から解決されます。`<root>` は VitePress の[プロジェクトルート](../guide/routing#root-and-source-directory)で、`[ext]` にはサポートされる拡張子が入ります。TypeScript はそのまま使えます。サポートされる拡張子は `.js`、`.ts`、`.mjs`、`.mts` です。

設定ファイルでは ES Modules 構文の使用を推奨します。設定オブジェクトをデフォルトエクスポートしてください。

```ts
export default {
  // アプリレベルの設定
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',
  ...
}
```

::: details 動的（非同期）設定

設定を動的に生成する必要がある場合は、関数をデフォルトエクスポートすることもできます。例:

```ts
import { defineConfig } from 'vitepress'

export default async () => {
  const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

  return defineConfig({
    // アプリレベル設定
    lang: 'en-US',
    title: 'VitePress',
    description: 'Vite & Vue powered static site generator.',

    // テーマレベル設定
    themeConfig: {
      sidebar: [
        ...posts.map((post) => ({
          text: post.name,
          link: `/posts/${post.name}`
        }))
      ]
    }
  })
}
```

トップレベル `await` も使用できます。例:

```ts
import { defineConfig } from 'vitepress'

const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

export default defineConfig({
  // アプリレベル設定
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',

  // テーマレベル設定
  themeConfig: {
    sidebar: [
      ...posts.map((post) => ({
        text: post.name,
        link: `/posts/${post.name}`
      }))
    ]
  }
})
```

:::

### 設定のインテリセンス {#config-intellisense}

`defineConfig` ヘルパーを使うと、TypeScript による補完が効きます。対応 IDE であれば、JavaScript と TypeScript のどちらでも動作します。

```js
import { defineConfig } from 'vitepress'

export default defineConfig({
  // ...
})
```

### 型付きのテーマ設定 {#typed-theme-config}

デフォルトでは、`defineConfig` はデフォルトテーマのテーマ設定型を想定します。

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    // 型は `DefaultTheme.Config`
  }
})
```

カスタムテーマを使用しており、そのテーマ設定に型チェックを効かせたい場合は、代わりに `defineConfigWithTheme` を使い、ジェネリクスでカスタムテーマの設定型を渡してください。

```ts
import { defineConfigWithTheme } from 'vitepress'
import type { ThemeConfig } from 'your-theme'

export default defineConfigWithTheme<ThemeConfig>({
  themeConfig: {
    // 型は `ThemeConfig`
  }
})
```

### Vite・Vue・Markdown の設定 {#vite-vue-markdown-config}

- **Vite**

  Vite の設定は VitePress 設定の [vite](#vite) オプションで行えます。別途 Vite の設定ファイルを作る必要はありません。

- **Vue**

  VitePress には公式の Vue プラグイン（[@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue)）が同梱されています。オプションは VitePress 設定の [vue](#vue) から指定できます。

- **Markdown**

  既定の [Markdown-It](https://github.com/markdown-it/markdown-it) インスタンスは、VitePress 設定の [markdown](#markdown) オプションでカスタマイズできます。

## サイトメタデータ {#site-metadata}

### title

- 型: `string`
- 既定値: `VitePress`
- ページ単位での上書き: [frontmatter](./frontmatter-config#title)

サイトのタイトル。デフォルトテーマではナビバーに表示されます。

[`titleTemplate`](#titletemplate) を定義していない場合、個々のページタイトルの既定のサフィックスとしても使われます。各ページの最終タイトルは、そのページの最初の `<h1>` 見出しのテキストに、グローバルの `title` をサフィックスとして結合したものになります。次の設定とページ内容の例:

```ts
export default {
  title: 'My Awesome Site'
}
```

```md
# Hello
```

このページのタイトルは `Hello | My Awesome Site` になります。

### titleTemplate

- 型: `string | boolean`
- ページ単位での上書き: [frontmatter](./frontmatter-config#titletemplate)

各ページタイトルのサフィックス、またはタイトル全体のカスタマイズができます。例:

```ts
export default {
  title: 'My Awesome Site',
  titleTemplate: 'Custom Suffix'
}
```

```md
# Hello
```

このページのタイトルは `Hello | Custom Suffix` になります。

タイトルの描画方法を完全にカスタマイズするには、`titleTemplate` 内で `:title` シンボルを使います。

```ts
export default {
  titleTemplate: ':title - Custom Suffix'
}
```

ここで `:title` はページ先頭の `<h1>` から推論されたテキストに置き換えられます。先ほどの例では `Hello - Custom Suffix` になります。

`false` を設定するとタイトルのサフィックスを無効にできます。

### description

- 型: `string`
- 既定値: `A VitePress site`
- ページ単位での上書き: [frontmatter](./frontmatter-config#description)

サイトの説明。ページの HTML に `<meta>` タグとして出力されます。

```ts
export default {
  description: 'A VitePress site'
}
```

### head

- 型: `HeadConfig[]`
- 既定値: `[]`
- ページ単位での追加: [frontmatter](./frontmatter-config#head)

ページ HTML の `<head>` に追加で出力する要素。ユーザーが追加したタグは、VitePress のタグの後、`</head>` の直前にレンダリングされます。

```ts
type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

#### 例: favicon を追加 {#example-adding-a-favicon}

```ts
export default {
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]]
} // favicon.ico は public に配置。base を設定している場合は /base/favicon.ico を利用

/* 出力結果:
  <link rel="icon" href="/favicon.ico">
*/
```

#### 例: Google Fonts を追加 {#example-adding-google-fonts}

```ts
export default {
  head: [
    [
      'link',
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' }
    ],
    [
      'link',
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
    ],
    [
      'link',
      { href: 'https://fonts.googleapis.com/css2?family=Roboto&display=swap', rel: 'stylesheet' }
    ]
  ]
}

/* 出力結果:
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
*/
```

#### 例: Service Worker を登録 {#example-registering-a-service-worker}

```ts
export default {
  head: [
    [
      'script',
      { id: 'register-sw' },
      `;(() => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js')
        }
      })()`
    ]
  ]
}

/* 出力結果:
  <script id="register-sw">
    ;(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
      }
    })()
  </script>
*/
```

#### 例: Google Analytics を使用 {#example-using-google-analytics}

```ts
export default {
  head: [
    [
      'script',
      { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=TAG_ID' }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'TAG_ID');`
    ]
  ]
}

/* 出力結果:
  <script async src="https://www.googletagmanager.com/gtag/js?id=TAG_ID"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'TAG_ID');
  </script>
*/
```

### lang

- 型: `string`
- 既定値: `en-US`

サイトの言語属性。ページ HTML の `<html lang="en-US">` として出力されます。

```ts
export default {
  lang: 'en-US'
}
```

### base

- 型: `string`
- 既定値: `/`

サイトをデプロイするベース URL。GitHub Pages などサブパス配下にデプロイする場合に設定が必要です。たとえば `https://foo.github.io/bar/` にデプロイする場合、`base` は `'/bar/'` にします。先頭と末尾は必ずスラッシュにしてください。

`/` で始まる他のオプション内の URL には、この `base` が自動的に付与されます。1 回設定すれば十分です。

```ts
export default {
  base: '/base/'
}
```

## ルーティング {#routing}

### cleanUrls

- 型: `boolean`
- 既定値: `false`

`true` にすると、URL の末尾の `.html` を削除します。あわせて [クリーン URL の生成](../guide/routing#generating-clean-url) も参照してください。

::: warning サーバ設定が必要
ホスティング環境によっては追加の設定が必要です。`/foo` へのアクセス時に **リダイレクトなしで** `/foo.html` を返せるサーバ設定が必要です。
:::

### rewrites

- 型: `Record<string, string>`

ディレクトリと URL のカスタム対応を定義します。詳しくは [ルーティング: ルートのリライト](../guide/routing#route-rewrites) を参照。

```ts
export default {
  rewrites: {
    'source/:page': 'destination/:page'
  }
}
```

## ビルド {#build}

### srcDir

- 型: `string`
- 既定値: `.`

Markdown ページを置くディレクトリ（プロジェクトルートからの相対パス）。[ルートとソースディレクトリ](../guide/routing#root-and-source-directory) も参照。

```ts
export default {
  srcDir: './src'
}
```

### srcExclude

- 型: `string[]`
- 既定値: `undefined`

ソースとして除外したい Markdown ファイルにマッチする [glob パターン](https://github.com/mrmlnc/fast-glob#pattern-syntax)。

```ts
export default {
  srcExclude: ['**/README.md', '**/TODO.md']
}
```

### outDir

- 型: `string`
- 既定値: `./.vitepress/dist`

ビルド出力先（[プロジェクトルート](../guide/routing#root-and-source-directory) からの相対パス）。

```ts
export default {
  outDir: '../public'
}
```

### assetsDir

- 型: `string`
- 既定値: `assets`

生成されるアセットを配置するサブディレクトリ名。パスは [`outDir`](#outdir) の内部で、相対解決されます。

```ts
export default {
  assetsDir: 'static'
}
```

### cacheDir

- 型: `string`
- 既定値: `./.vitepress/cache`

キャッシュファイル用ディレクトリ（[プロジェクトルート](../guide/routing#root-and-source-directory) からの相対パス）。参考: [cacheDir](https://vitejs.dev/config/shared-options.html#cachedir)

```ts
export default {
  cacheDir: './.vitepress/.vite'
}
```

### ignoreDeadLinks

- 型: `boolean | 'localhostLinks' | (string | RegExp | ((link: string, source: string) => boolean))[]`
- 既定値: `false`

`true` にすると、デッドリンクがあってもビルド失敗にしません。

`'localhostLinks'` にすると、`localhost` へのリンクはチェック対象外にしつつ、その他のデッドリンクではビルドを失敗させます。

```ts
export default {
  ignoreDeadLinks: true
}
```

正確な URL 文字列、正規表現、カスタムフィルタ関数の配列として指定することもできます。

```ts
export default {
  ignoreDeadLinks: [
    // 正確に "/playground" を無視
    '/playground',
    // すべての localhost リンクを無視
    /^https?:\/\/localhost/,
    // パスに "/repl/" を含むリンクを無視
    /\/repl\//,
    // カスタム関数: "ignore" を含むリンクを無視
    (url) => {
      return url.toLowerCase().includes('ignore')
    }
  ]
}
```

### metaChunk <Badge type="warning" text="experimental" />

- 型: `boolean`
- 既定値: `false`

`true` にすると、各ページのメタデータを初期 HTML にインラインせず、別の JavaScript チャンクに抽出します。これにより各ページの HTML ペイロードが小さくなり、メタデータをキャッシュ可能にすることで、多数のページがあるサイトでサーバ帯域を削減できます。

### mpa <Badge type="warning" text="experimental" />

- 型: `boolean`
- 既定値: `false`

`true` にすると、本番アプリは [MPA モード](../guide/mpa-mode) でビルドされます。MPA モードは既定でクライアント JavaScript を 0kb で配信する代わりに、クライアントサイドのナビゲーションを無効にし、相互作用には明示的な opt-in が必要です。

## テーマ関連 {#theming}

### appearance

- 型: `boolean | 'dark' | 'force-dark' | 'force-auto' | import('@vueuse/core').UseDarkOptions`
- 既定値: `true`

ダークモードを有効にするか（`<html>` に `.dark` クラスを付与）。

- `true` の場合、ユーザーの環境設定に従います。
- `dark` の場合、ユーザーが切り替えない限りダークを既定にします。
- `false` の場合、ユーザーはテーマを切り替えできません。
- `'force-dark'` の場合、常にダークで固定（切替不可）。
- `'force-auto'` の場合、常にユーザーの環境設定に従い（切替不可）。

このオプションは、ローカルストレージの `vitepress-theme-appearance` から設定を復元するインラインスクリプトを挿入します。これにより、ページ描画前に `.dark` クラスを適用してフリッカを防ぎます。

`appearance.initialValue` は `'dark' | undefined` のみサポート。Ref や getter は使えません。

### lastUpdated

- 型: `boolean`
- 既定値: `false`

Git を使って各ページの最終更新時刻を取得します。タイムスタンプは各ページのデータに含まれ、[`useData`](./runtime-api#usedata) から参照できます。

デフォルトテーマ使用時にこのオプションを有効にすると、各ページの最終更新時刻が表示されます。テキストは [`themeConfig.lastUpdatedText`](./default-theme-config#lastupdatedtext) でカスタマイズ可能です。

## カスタマイズ {#customization}

### markdown

- 型: `MarkdownOption`

Markdown パーサの設定。VitePress はパーサに [Markdown-it](https://github.com/markdown-it/markdown-it)、構文ハイライトに [Shiki](https://github.com/shikijs/shiki) を使用しています。必要に応じて Markdown 関連の各種オプションを指定できます。

```js
export default {
  markdown: {...}
}
```

利用可能なオプションは [型定義と JSDoc](https://github.com/vuejs/vitepress/blob/main/src/node/markdown/markdown.ts) を参照してください。

### vite

- 型: `import('vite').UserConfig`

内部の Vite 開発サーバ／バンドラへ生の [Vite Config](https://vitejs.dev/config/) を渡します。

```js
export default {
  vite: {
    // Vite の設定
  }
}
```

### vue

- 型: `import('@vitejs/plugin-vue').Options`

内部の `@vitejs/plugin-vue` インスタンスへオプションをそのまま渡します。

```js
export default {
  vue: {
    // @vitejs/plugin-vue のオプション
  }
}
```

## ビルドフック {#build-hooks}

VitePress のビルドフックを使うと、サイトに機能や振る舞いを追加できます。

- サイトマップ
- 検索インデックス
- PWA
- Teleport

### buildEnd

- 型: `(siteConfig: SiteConfig) => Awaitable<void>`

`buildEnd` はビルド CLI フックです。ビルド（SSG）が完了した後、VitePress CLI プロセスが終了する前に実行されます。

```ts
export default {
  async buildEnd(siteConfig) {
    // ...
  }
}
```

### postRender

- 型: `(context: SSGContext) => Awaitable<SSGContext | void>`

`postRender` は SSG のレンダリング完了時に呼ばれるビルドフックです。SSG 中の teleport コンテンツの処理に利用できます。

```ts
export default {
  async postRender(context) {
    // ...
  }
}
```

```ts
interface SSGContext {
  content: string
  teleports?: Record<string, string>
  [key: string]: any
}
```

### transformHead

- 型: `(context: TransformContext) => Awaitable<HeadConfig[]>`

`transformHead` は、各ページを生成する前に head を変換するためのビルドフックです。設定ファイルでは静的に追加できない head 要素を追加できます。追加分のみ返せば、既存のものと自動でマージされます。

::: warning
`context` 内の値は変更しないでください。
:::

```ts
export default {
  async transformHead(context) {
    // ...
  }
}
```

```ts
interface TransformContext {
  page: string // 例: index.md（srcDir からの相対）
  assets: string[] // 解決済みの公開 URL（非 js/css アセット）
  siteConfig: SiteConfig
  siteData: SiteData
  pageData: PageData
  title: string
  description: string
  head: HeadConfig[]
  content: string
}
```

このフックは静的サイト生成時のみ呼ばれ、開発中には呼ばれません。開発中に動的な head 要素を追加したい場合は、代わりに [`transformPageData`](#transformpagedata) を使用できます。

```ts
export default {
  transformPageData(pageData) {
    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push([
      'meta',
      {
        name: 'og:title',
        content:
          pageData.frontmatter.layout === 'home'
            ? `VitePress`
            : `${pageData.title} | VitePress`
      }
    ])
  }
}
```

#### 例: 正規 URL の `<link>` を追加 {#example-adding-a-canonical-url-link}

```ts
export default {
  transformPageData(pageData) {
    const canonicalUrl = `https://example.com/${pageData.relativePath}`
      .replace(/index\.md$/, '')
      .replace(/\.md$/, '.html')

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push([
      'link',
      { rel: 'canonical', href: canonicalUrl }
    ])
  }
}
```

### transformHtml

- 型: `(code: string, id: string, context: TransformContext) => Awaitable<string | void>`

`transformHtml` は、各ページの内容をディスクへ保存する前に変換するためのビルドフックです。

::: warning
`context` 内の値は変更しないでください。また、HTML を変更すると実行時のハイドレーション問題を引き起こす可能性があります。
:::

```ts
export default {
  async transformHtml(code, id, context) {
    // ...
  }
}
```

### transformPageData

- 型: `(pageData: PageData, context: TransformPageContext) => Awaitable<Partial<PageData> | { [key: string]: any } | void>`

`transformPageData` は各ページの `pageData` を変換するためのフックです。`pageData` を直接変更するか、変更値を返してマージさせることができます。

::: warning
`context` 内の値は変更しないでください。ネットワークリクエストや重い計算（画像生成など）を行うと開発サーバのパフォーマンスに影響します。`process.env.NODE_ENV === 'production'` を用いた条件分岐を検討してください。
:::

```ts
export default {
  async transformPageData(pageData, { siteConfig }) {
    pageData.contributors = await getPageContributors(pageData.relativePath)
  }

  // あるいはマージ用の値を返す
  async transformPageData(pageData, { siteConfig }) {
    return {
      contributors: await getPageContributors(pageData.relativePath)
    }
  }
}
```

```ts
interface TransformPageContext {
  siteConfig: SiteConfig
}
```
