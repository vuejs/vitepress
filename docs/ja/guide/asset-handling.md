# アセットの取り扱い {#asset-handling}

## 静的アセットの参照 {#referencing-static-assets}

すべての Markdown ファイルは Vue コンポーネントにコンパイルされ、[Vite](https://vitejs.dev/guide/assets.html) によって処理されます。Markdown 内では、相対 URL を使ってアセットを参照することが **推奨されます**。

```md
![画像](./image.png)
```

Markdown ファイル内、テーマの `*.vue` コンポーネント内、スタイルや通常の `.css` ファイル内でも、アセットはプロジェクトルートを基準とした絶対パス、またはファイルシステムを基準とした相対パスで参照できます。後者は Vite、Vue CLI、あるいは webpack の `file-loader` を使ったことがある場合に慣れ親しんだ挙動です。

一般的な画像、メディア、フォントファイルタイプは自動的にアセットとして検出され、含まれます。

::: tip リンクされたファイルはアセットとして扱われません
Markdown ファイル内のリンクで参照された PDF やその他のドキュメントは、自動的にアセットとして扱われません。これらのリンクファイルにアクセスできるようにするには、手動でプロジェクトの [`public`](#the-public-directory) ディレクトリに配置する必要があります。
:::

絶対パスを含むすべての参照されたアセットは、プロダクションビルド時にハッシュ化されたファイル名で出力ディレクトリにコピーされます。参照されないアセットはコピーされません。4kb 未満の画像アセットは base64 としてインライン化されます（これは [`vite`](../reference/site-config#vite) 設定オプションで変更可能です）。

すべての **静的な** パス参照（絶対パスを含む）は、作業ディレクトリの構造を基準にする必要があります。

## Public ディレクトリ {#the-public-directory}

Markdown やテーマコンポーネントで直接参照されない静的アセットを提供する必要がある場合や、特定のファイルをオリジナルのファイル名のまま提供したい場合があります。  
例えば `robots.txt`、favicon、PWA 用アイコンなどです。

これらのファイルは [ソースディレクトリ](./routing#source-directory) 配下の `public` ディレクトリに配置できます。たとえばプロジェクトルートが `./docs` で、デフォルトのソースディレクトリを使用している場合、`public` ディレクトリは `./docs/public` になります。

`public` に配置されたアセットは、出力ディレクトリのルートにそのままコピーされます。

なお、`public` 内のファイルはルート絶対パスで参照する必要があります。例えば `public/icon.png` は常に `/icon.png` として参照しなければなりません。

## ベース URL {#base-url}

サイトをルート以外の URL にデプロイする場合、`.vitepress/config.js` で `base` オプションを設定する必要があります。  
例えば `https://foo.github.io/bar/` にデプロイする場合、`base` は `'/bar/'` と設定します（必ずスラッシュで開始・終了する必要があります）。

すべての静的アセットパスは `base` 設定値に応じて自動的に調整されます。  
例えば Markdown 内で `public` 配下のアセットを絶対参照した場合：

```md
![画像](/image-inside-public.png)
```

この場合は `base` の設定値を変更しても、参照を修正する必要はありません。

ただし、テーマコンポーネントで動的にアセットをリンクする場合（例：テーマ設定値に基づいた画像の `src`）は注意が必要です。

```vue
<img :src="theme.logoPath" />
```

この場合は、VitePress が提供する [`withBase` ヘルパー](../reference/runtime-api#withbase) でパスをラップすることを推奨します。

```vue
<script setup>
import { withBase, useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <img :src="withBase(theme.logoPath)" />
</template>
```
