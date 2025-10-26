# ビルド時のデータの読み込み {#build-time-data-loading}

VitePress には **データローダー (data loaders)** という機能があり、任意のデータを読み込み、ページやコンポーネントからインポートすることができます。データの読み込みは **ビルド時のみ** 実行され、最終的な JavaScript バンドルには JSON としてシリアライズされたデータが含まれます。

データローダーはリモートデータの取得や、ローカルファイルに基づいたメタデータの生成に利用できます。たとえば、ローカルの API ページをすべて解析して API エントリのインデックスを自動生成するといったことが可能です。

## 基本的な使い方 {#basic-usage}

データローダーファイルは `.data.js` または `.data.ts` で終わる必要があります。ファイルは `load()` メソッドを持つオブジェクトをデフォルトエクスポートします。

```js [example.data.js]
export default {
load() {
  return {
    hello: 'world'
  }
}
}
```

ローダーモジュールは Node.js 上でのみ評価されるため、Node API や npm 依存関係を自由に利用できます。

その後、このファイルから `.md` ページや `.vue` コンポーネントで `data` という名前のエクスポートを使ってデータをインポートできます。

```vue
<script setup>
import { data } from './example.data.js'
</script>

<pre>{{ data }}</pre>
```

出力:

```json
{
  "hello": "world"
}
```

データローダー自体は `data` を直接エクスポートしていないことに気づくでしょう。これは VitePress が裏側で `load()` を呼び出し、その結果を暗黙的に `data` として公開しているためです。

ローダーが非同期でも動作します。

```js
export default {
  async load() {
    // リモートデータを取得
    return (await fetch('...')).json()
  }
}
```

## ローカルファイルからのデータ {#data-from-local-files}

ローカルファイルに基づいたデータを生成する必要がある場合は、データローダー内で `watch` オプションを使用し、ファイルの変更をホットリロードに反映させることが推奨されます。

`watch` では [glob パターン](https://github.com/mrmlnc/fast-glob#pattern-syntax) を利用して複数ファイルをマッチさせることができ、パターンはローダーファイルからの相対パスで指定できます。`load()` 関数にはマッチしたファイルの絶対パスが渡されます。

以下は CSV ファイルを読み込み [csv-parse](https://github.com/adaltas/node-csv/tree/master/packages/csv-parse/) を使って JSON に変換する例です。このコードはビルド時にのみ実行されるため、CSV パーサーがクライアントに送られることはありません。

```js
import fs from 'node:fs'
import { parse } from 'csv-parse/sync'

export default {
  watch: ['./data/*.csv'],
  load(watchedFiles) {
    return watchedFiles.map((file) => {
      return parse(fs.readFileSync(file, 'utf-8'), {
        columns: true,
        skip_empty_lines: true
      })
    })
  }
}
```

## `createContentLoader`

コンテンツ中心のサイトを構築する場合、ブログ記事や API ページなどを一覧表示する「アーカイブ」や「インデックス」ページが必要になることがよくあります。これはデータローダー API を使って直接実装できますが、あまりにも一般的なケースなので VitePress では `createContentLoader` というヘルパーが用意されています。

```js [posts.data.js]
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', /* options */)
```

このヘルパーは [ソースディレクトリ](./routing#source-directory) からの相対 glob パターンを受け取り、`{ watch, load }` を返すデータローダーオブジェクトを生成します。これをデータローダーファイルのデフォルトエクスポートにできます。開発時のパフォーマンスを向上させるために、ファイルの更新時刻に基づくキャッシュも行われます。

このローダーは Markdown ファイルにのみ対応し、それ以外のファイルは無視されます。

読み込まれるデータは `ContentData[]` 型の配列です。

```ts
interface ContentData {
  url: string // ページのマッピング URL（例: /posts/hello.html）
  frontmatter: Record<string, any> // ページのフロントマター

  src: string | undefined
  html: string | undefined
  excerpt: string | undefined
}
```

デフォルトでは `url` と `frontmatter` のみが提供されます。これは読み込まれたデータがクライアントバンドルに JSON としてインライン化されるため、サイズに注意する必要があるためです。

以下はデータを使って最小限のブログインデックスページを構築する例です。

```vue
<script setup>
import { data as posts } from './posts.data.js'
</script>

<template>
  <h1>All Blog Posts</h1>
  <ul>
    <li v-for="post of posts">
      <a :href="post.url">{{ post.frontmatter.title }}</a>
      <span>by {{ post.frontmatter.author }}</span>
    </li>
  </ul>
</template>
```

### オプション {#options}

デフォルトデータが要件に合わない場合は、オプションで変換処理を追加できます。

```js [posts.data.js]
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', {
  includeSrc: true, // 生の markdown ソースを含める？
  render: true,     // レンダリングされた HTML を含める？
  excerpt: true,    // 抜粋を含める？

  transform(rawData) {
    return rawData
      .sort((a, b) => {
        return +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date)
      })
      .map((page) => {
        page.src     // 生の markdown ソース
        page.html    // レンダリングされた HTML
        page.excerpt // 抜粋 HTML（最初の `---` までの内容）
        return {/* ... */}
      })
  }
})
```

[Vue.js ブログ](https://github.com/vuejs/blog/blob/main/.vitepress/theme/posts.data.ts) での使用例も参考になります。

`createContentLoader` API は [ビルドフック](../reference/site-config#build-hooks) 内でも利用可能です。

```js [.vitepress/config.js]
export default {
  async buildEnd() {
    const posts = await createContentLoader('posts/*.md').load()
    // メタデータを基にファイルを生成（例: RSS フィード）
  }
}
```

**型定義**

```ts
interface ContentOptions<T = ContentData[]> {
  includeSrc?: boolean
  render?: boolean
  excerpt?:
    | boolean
    | ((file: { data: { [key: string]: any }; content: string; excerpt?: string }, options?: any) => void)
    | string
  transform?: (data: ContentData[]) => T | Promise<T>
}
```

## 型付きデータローダー {#typed-data-loaders}


TypeScript を使用する場合は、ローダーと `data` エクスポートを型付けできます。

```ts
import { defineLoader } from 'vitepress'

export interface Data {
  // データ型
}

declare const data: Data
export { data }

export default defineLoader({
  watch: ['...'],
  async load(): Promise<Data> {
    // ...
  }
})
```

## 設定情報の取得 {#configuration}


ローダー内で設定情報を取得するには次のようにします。

```ts
import type { SiteConfig } from 'vitepress'

const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG
```
