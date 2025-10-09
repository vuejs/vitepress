---
outline: deep
---

# ルーティング {#routing}

## ファイルベースのルーティング {#file-based-routing}

VitePress はファイルベースのルーティングを採用しており、生成される HTML はソースの Markdown ファイルのディレクトリ構造に対応します。例えば、次のディレクトリ構造があるとします：

 ```
 .
 ├─ guide
 │  ├─ getting-started.md
 │  └─ index.md
 ├─ index.md
 └─ prologue.md
 ```

生成される HTML は次のとおりです：

 ```
 index.md                  -->  /index.html （/ でアクセス可能）
 prologue.md               -->  /prologue.html
 guide/index.md            -->  /guide/index.html （/guide/ でアクセス可能）
 guide/getting-started.md  -->  /guide/getting-started.html
 ```

生成された HTML は、静的ファイルを配信できる任意の Web サーバーでホストできます。

## ルートディレクトリとソースディレクトリ {#root-and-source-directories}

VitePress プロジェクトのファイル構成には重要な概念が 2 つあります：**プロジェクトルート** と **ソースディレクトリ** です。

### プロジェクトルート {#project-root}

プロジェクトルートは、VitePress が特別なディレクトリである `.vitepress` を探しにいく場所です。`.vitepress` ディレクトリは、VitePress の設定ファイル、開発サーバーのキャッシュ、ビルド出力、任意のテーマカスタマイズコードのための予約場所です。

コマンドラインから `vitepress dev` や `vitepress build` を実行すると、VitePress は現在の作業ディレクトリをプロジェクトルートとして使用します。サブディレクトリをルートとして指定したい場合は、コマンドに相対パスを渡します。例えば、VitePress プロジェクトが `./docs` にある場合、`vitepress dev docs` を実行します：

 ```
 .
 ├─ docs                    # プロジェクトルート
 │  ├─ .vitepress           # 設定ディレクトリ
 │  ├─ getting-started.md
 │  └─ index.md
 └─ ...
 ```

 ```sh
 vitepress dev docs
 ```

これにより、ソースから HTML へのマッピングは次のようになります：

 ```
 docs/index.md            -->  /index.html （/ でアクセス可能）
 docs/getting-started.md  -->  /getting-started.html
 ```

### ソースディレクトリ {#source-directory}

ソースディレクトリは、Markdown のソースファイルを置く場所です。既定ではプロジェクトルートと同じです。ただし、[`srcDir`](../reference/site-config#srcdir) 設定オプションで変更できます。

`srcDir` はプロジェクトルートからの相対パスで解決されます。例えば `srcDir: 'src'` の場合、ファイル構成は次のようになります：

 ```
 .                          # プロジェクトルート
 ├─ .vitepress              # 設定ディレクトリ
 └─ src                     # ソースディレクトリ
    ├─ getting-started.md
    └─ index.md
 ```

ソースから HTML へのマッピングは次のとおりです：

 ```
 src/index.md            -->  /index.html （/ でアクセス可能）
 src/getting-started.md  -->  /getting-started.html
 ```

## ページ間リンク {#linking-between-pages}

ページ間のリンクには、絶対パスと相対パスのどちらも使用できます。`.md` と `.html` の拡張子はどちらも機能しますが、最終的な URL を設定に応じて VitePress が生成できるよう、**拡張子は省略する** のがベストプラクティスです。

 ```md
 <!-- 良い例 -->
 [はじめに](./getting-started)
 [はじめに](../guide/getting-started)

 <!-- 悪い例 -->
 [はじめに](./getting-started.md)
 [はじめに](./getting-started.html)
 ```

画像などのアセットへのリンクについては、[アセットの取り扱い](./asset-handling) を参照してください。

### VitePress 管理外のページへのリンク {#linking-to-non-vitepress-pages}

サイト内で VitePress が生成していないページへリンクしたい場合は、フル URL（新しいタブで開く）を使うか、明示的にターゲットを指定します。

**入力**

 ```md
 [pure.html へのリンク](/pure.html){target="_self"}
 ```

**出力**

 [pure.html へのリンク](/pure.html){target="_self"}

::: tip 注意

Markdown のリンクでは、`base` が自動的に URL の先頭に付与されます。つまり、`base` の外にあるページへリンクしたい場合は、ブラウザの相対解決に従って `../../pure.html` のように書く必要があります。

あるいは、アンカータグの構文を直接使うこともできます：

 ```md
 <a href="/pure.html" target="_self">pure.html へのリンク</a>
 ```
:::

## クリーン URL の生成 {#generating-clean-urls}

::: warning サーバー側の対応が必要
VitePress でクリーン URL を提供するには、サーバー側のサポートが必要です。
:::

既定では、VitePress は内部リンクを `.html` で終わる URL に解決します。しかし、`.html` を含まない「クリーン URL」（例：`example.com/path`）を好む場合もあります。

一部のサーバーやホスティング（例：Netlify、Vercel、GitHub Pages）は、リダイレクトなしに `/foo` を `/foo.html` にマッピングできます。

- Netlify と GitHub Pages はデフォルトで対応しています。
- Vercel は [`vercel.json` の `cleanUrls` オプション](https://vercel.com/docs/concepts/projects/project-configuration#cleanurls) を有効にする必要があります。

この機能が利用可能であれば、VitePress 側の [`cleanUrls`](../reference/site-config#cleanurls) 設定も有効化してください。これにより：

- ページ間の内部リンクが `.html` 拡張子なしで生成されます。
- 現在のパスが `.html` で終わっている場合、拡張子なしのパスへクライアントサイドのリダイレクトを行います。

もしサーバーをそのように設定できない場合は、次のようなディレクトリ構造に手動でする必要があります：

 ```
 .
 ├─ getting-started
 │  └─ index.md
 ├─ installation
 │  └─ index.md
 └─ index.md
 ```

## ルートのリライト {#route-rewrites}

ソースディレクトリ構造と生成ページのマッピングをカスタマイズできます。これは複雑なプロジェクト構成で有用です。例えば、複数パッケージを持つモノレポで、ソースファイルと並べてドキュメントを配置したい場合：

 ```
 .
 └─ packages
    ├─ pkg-a
    │  └─ src
    │     ├─ foo.md
    │     └─ index.md
    └─ pkg-b
       └─ src
          ├─ bar.md
          └─ index.md
 ```

生成したいページが次のような場合：

 ```
 packages/pkg-a/src/index.md  -->  /pkg-a/index.html
 packages/pkg-a/src/foo.md    -->  /pkg-a/foo.html
 packages/pkg-b/src/index.md  -->  /pkg-b/index.html
 packages/pkg-b/src/bar.md    -->  /pkg-b/bar.html
 ```

[`rewrites`](../reference/site-config#rewrites) オプションを次のように設定します：

 ```ts [.vitepress/config.js]
 export default {
   rewrites: {
     'packages/pkg-a/src/index.md': 'pkg-a/index.md',
     'packages/pkg-a/src/foo.md': 'pkg-a/foo.md',
     'packages/pkg-b/src/index.md': 'pkg-b/index.md',
     'packages/pkg-b/src/bar.md': 'pkg-b/bar.md'
   }
 }
 ```

`rewrites` は動的なルートパラメータにも対応しています。上記の例で多くのパッケージがある場合、同じ構造なら次のように簡略化できます：

 ```ts
 export default {
   rewrites: {
     'packages/:pkg/src/:slug*': ':pkg/:slug*'
   }
 }
 ```

リライトのパスは `path-to-regexp` パッケージでコンパイルされます。高度な構文は[ドキュメント](https://github.com/pillarjs/path-to-regexp/tree/6.x#parameters)を参照してください。

`rewrites` は、元のパスを受け取って新しいパスを返す **関数** として定義することもできます：

 ```ts
 export default {
   rewrites(id) {
     return id.replace(/^packages\/([^/]+)\/src\//, '$1/')
   }
 }
 ```

::: warning リライト時の相対リンク

リライトを有効にした場合、**相対リンクはリライト後のパスに基づいて** 記述してください。例えば、`packages/pkg-a/src/pkg-a-code.md` から `packages/pkg-b/src/pkg-b-code.md` への相対リンクを作るには、次のように書きます：

 ```md
 [PKG B へのリンク](../pkg-b/pkg-b-code)
 ```
:::

## 動的ルート {#dynamic-routes}

ひとつの Markdown ファイルと動的データから多数のページを生成できます。例えば、`packages/[pkg].md` を作成して、プロジェクト内の各パッケージに対応するページを生成できます。ここで `[pkg]` セグメントは、それぞれのページを区別する **ルートパラメータ** です。

### パスローダーファイル {#path-loader-files}

VitePress は静的サイトジェネレーターなので、生成可能なページパスはビルド時に確定している必要があります。したがって、動的ルートページには **パスローダーファイル** が **必須** です。`packages/[pkg].md` に対しては `packages/[pkg].paths.js`（`.ts` も可）が必要です：

 ```
 .
 └─ packages
    ├─ [pkg].md         # ルートテンプレート
    └─ [pkg].paths.js   # ルートのパスローダー
 ```

パスローダーは、`paths` メソッドを持つオブジェクトをデフォルトエクスポートします。`paths` は `params` プロパティを持つオブジェクトの配列を返します。各オブジェクトが 1 ページに対応します。

例えば次の `paths` 配列を返すと：

 ```js
 // packages/[pkg].paths.js
 export default {
   paths() {
     return [
       { params: { pkg: 'foo' }},
       { params: { pkg: 'bar' }}
     ]
   }
 }
 ```

生成される HTML は次のようになります：

 ```
 .
 └─ packages
    ├─ foo.html
    └─ bar.html
 ```

### 複数パラメータ {#multiple-params}

動的ルートに複数のパラメータを含めることもできます。

**ファイル構成**

 ```
 .
 └─ packages
    ├─ [pkg]-[version].md
    └─ [pkg]-[version].paths.js
 ```

**パスローダー**

 ```js
 export default {
   paths: () => [
     { params: { pkg: 'foo', version: '1.0.0' }},
     { params: { pkg: 'foo', version: '2.0.0' }},
     { params: { pkg: 'bar', version: '1.0.0' }},
     { params: { pkg: 'bar', version: '2.0.0' }}
   ]
 }
 ```

**出力**

 ```
 .
 └─ packages
    ├─ foo-1.0.0.html
    ├─ foo-2.0.0.html
    ├─ bar-1.0.0.html
    └─ bar-2.0.0.html
 ```

### パスを動的に生成する {#dynamically-generating-paths}

パスローダーモジュールは Node.js 上で実行され、ビルド時にのみ評価されます。ローカルまたはリモートの任意のデータから、動的に配列を生成できます。

ローカルファイルから生成する例：

 ```js
 import fs from 'fs'

 export default {
   paths() {
     return fs
       .readdirSync('packages')
       .map((pkg) => {
         return { params: { pkg } }
       })
   }
 }
 ```

リモートデータから生成する例：

 ```js
 export default {
   async paths() {
     const pkgs = await (await fetch('https://my-api.com/packages')).json()

     return pkgs.map((pkg) => {
       return {
         params: {
           pkg: pkg.name,
           version: pkg.version
         }
       }
     })
   }
 }
 ```

### ページ内でパラメータにアクセスする {#accessing-params-in-page}

各ページへ追加データを渡すために、パラメータを利用できます。Markdown のルートファイルでは、Vue 式内で `$params` グローバルプロパティから現在ページのパラメータにアクセスできます：

 ```md
 - パッケージ名: {{ $params.pkg }}
 - バージョン: {{ $params.version }}
 ```

[`useData`](../reference/runtime-api#usedata) ランタイム API からも、現在ページのパラメータにアクセスできます（Markdown と Vue コンポーネントの両方で利用可能）：

 ```vue
 <script setup>
 import { useData } from 'vitepress'

 // params は Vue の ref
 const { params } = useData()

 console.log(params.value)
 </script>
 ```

### 生コンテンツのレンダリング {#rendering-raw-content}

ページに渡したパラメータはクライアント JavaScript のペイロードにシリアライズされます。そのため、リモート CMS から取得した生の Markdown や HTML など、重いデータをパラメータに含めるのは避けてください。

代わりに、各パスオブジェクトの `content` プロパティでコンテンツを渡せます：

 ```js
 export default {
   async paths() {
     const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

     return posts.map((post) => {
       return {
         params: { id: post.id },
         content: post.content // 生の Markdown または HTML
       }
     })
   }
 }
 ```

そのうえで、Markdown ファイル内で次の特別な構文を使って、そのコンテンツを埋め込みます：

 ```md
 <!-- @content -->
 ```
