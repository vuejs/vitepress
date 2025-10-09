# はじめに {#getting-started}

## オンラインで試す {#try-it-online}

[VitePress](https://vitepress.new) をブラウザ上で直接試すことができます。

## インストール {#installation}

### 前提条件 {#prerequisites}

- [Node.js](https://nodejs.org/) バージョン 18 以上
- VitePress をコマンドラインインターフェース (CLI) で操作するためのターミナル
- [Markdown](https://en.wikipedia.org/wiki/Markdown) 構文に対応したテキストエディタ  
  - 推奨: [VSCode](https://code.visualstudio.com/) と [公式 Vue 拡張](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

VitePress は単独でも利用できますし、既存プロジェクトに組み込むことも可能です。いずれの場合も以下でインストールできます。

::: code-group

```sh [npm]
$ npm add -D vitepress@next
```

```sh [pnpm]
$ pnpm add -D vitepress@next
```

```sh [yarn]
$ yarn add -D vitepress@next vue
```

```sh [bun]
$ bun add -D vitepress@next
```

:::

::: tip 注意
VitePress は ESM 専用パッケージです。`require()` を使ってインポートせず、最も近い `package.json` に `"type": "module"` を含めるか、`.vitepress/config.js` を `.mjs` / `.mts` に変更してください。詳しくは [Vite のトラブルシューティングガイド](http://vitejs.dev/guide/troubleshooting.html#this-package-is-esm-only) を参照してください。また、非同期 CJS コンテキスト内では `await import('vitepress')` を使用できます。
:::

### セットアップウィザード {#setup-wizard}

VitePress にはコマンドラインのセットアップウィザードが付属しており、基本的なプロジェクトを簡単に作成できます。インストール後、以下のコマンドでウィザードを起動します。

::: code-group

```sh [npm]
$ npx vitepress init
```

```sh [pnpm]
$ pnpm vitepress init
```

```sh [yarn]
$ yarn vitepress init
```

```sh [bun]
$ bun vitepress init
```

:::

いくつかの簡単な質問が表示されます。

<<< @/snippets/init.ansi

::: tip Vue をピア依存関係に
Vue コンポーネントや API を使ったカスタマイズを行う場合は、明示的に `vue` を依存関係としてインストールしてください。
:::

## ファイル構成 {#file-structure}

スタンドアロンの VitePress サイトを構築する場合は、現在のディレクトリ (`./`) にサイトを作成できます。しかし、既存プロジェクトに VitePress を追加する場合は、他のソースコードと分離するために `./docs` などのサブディレクトリに作成することをおすすめします。

例えば `./docs` に VitePress プロジェクトを作成した場合、生成されるファイル構成は以下のようになります。

```
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.js
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  └─ index.md
└─ package.json
```

`docs` ディレクトリが VitePress サイトの **プロジェクトルート** とみなされます。`.vitepress` ディレクトリは VitePress の設定ファイル、開発サーバーのキャッシュ、ビルド出力、テーマのカスタマイズコードなどに予約されています。

::: tip
デフォルトでは開発サーバーのキャッシュは `.vitepress/cache` に、本番ビルド出力は `.vitepress/dist` に保存されます。Git を使用している場合は `.gitignore` に追加してください。これらの場所は [設定](../reference/site-config#outdir) で変更可能です。
:::

### 設定ファイル {#the-config-file}

設定ファイル (`.vitepress/config.js`) では、VitePress サイトのさまざまな動作をカスタマイズできます。最も基本的なオプションはサイトのタイトルと説明です。

```js [.vitepress/config.js]
export default {
  // サイトレベルのオプション
  title: 'VitePress',
  description: 'Just playing around.',

  themeConfig: {
    // テーマレベルのオプション
  }
}
```

テーマの動作は `themeConfig` オプションで設定できます。利用可能なすべての設定オプションは [Config Reference](../reference/site-config) を参照してください。

### ソースファイル {#source-files}

`.vitepress` ディレクトリ外の Markdown ファイルは **ソースファイル** とみなされます。

VitePress は **ファイルベースのルーティング** を採用しています。各 `.md` ファイルは同じパスを持つ `.html` ファイルにコンパイルされます。例えば `index.md` は `index.html` にコンパイルされ、サイトのルート `/` で表示されます。

VitePress にはクリーン URL の生成、パスの書き換え、動的なページ生成といった機能もあります。これらは [ルーティングガイド](./routing) で解説します。

## 実行してみる {#up-and-running}

セットアッププロセスで許可した場合、以下の npm スクリプトが `package.json` に追加されています。

```json [package.json]
 {
   ...
   "scripts": {
     "docs:dev": "vitepress dev docs",
     "docs:build": "vitepress build docs",
     "docs:preview": "vitepress preview docs"
   },
   ...
 }
```

`docs:dev` スクリプトを実行すると、即時ホットリロード対応のローカル開発サーバーが起動します。次のコマンドで実行します。

::: code-group

```sh [npm]
$ npm run docs:dev
```

```sh [pnpm]
$ pnpm run docs:dev
```

```sh [yarn]
$ yarn docs:dev
```

```sh [bun]
$ bun run docs:dev
```

:::

npm スクリプトではなく、直接 VitePress を実行することもできます。

::: code-group

```sh [npm]
$ npx vitepress dev docs
```

```sh [pnpm]
$ pnpm vitepress dev docs
```

```sh [yarn]
$ yarn vitepress dev docs
```

```sh [bun]
$ bun vitepress dev docs
```

:::

その他のコマンドラインの使い方は [CLI リファレンス](../reference/cli) に記載されています。

開発サーバーは `http://localhost:5173` で動作します。ブラウザでこの URL にアクセスすると、新しいサイトが確認できます。

## 次のステップ {#what-s-next}

- Markdown ファイルがどのように HTML にマッピングされるかを理解するには、[ルーティングガイド](./routing) を読みましょう。

- ページ内でできること（Markdown コンテンツの記述や Vue コンポーネントの利用など）を知るには、ガイドの「Writing」セクションを参照してください。まずは [Markdown 拡張](./markdown) を学ぶのがおすすめです。

- デフォルトドキュメントテーマの機能を知りたい場合は、[Default Theme Config Reference](../reference/default-theme-config) を確認してください。

- サイトの見た目をさらにカスタマイズしたい場合は、[デフォルトテーマの拡張](./extending-default-theme) や [カスタムテーマの構築](./custom-theme) を検討してください。

- ドキュメントサイトが形になったら、必ず [デプロイガイド](./deploy) を読んでください。
