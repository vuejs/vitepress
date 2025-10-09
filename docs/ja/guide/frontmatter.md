# フロントマター {#frontmatter}

## 使い方 {#usage}

VitePress はすべての Markdown ファイルで YAML フロントマターをサポートしており、[gray-matter](https://github.com/jonschlinkert/gray-matter) で解析します。フロントマターは Markdown ファイルの先頭（`<script>` タグを含むあらゆる要素より前）に配置し、三本のハイフンで囲まれた **有効な YAML** 形式で記述します。例:

```md
 ---
 title: Docs with VitePress
 editLink: true
 ---
```

サイトやデフォルトテーマの多くの設定オプションには、フロントマター上で対応するオプションがあります。フロントマターを使うことで、**そのページに限って** 特定の振る舞いを上書きできます。詳細は [Frontmatter Config Reference](../reference/frontmatter-config) を参照してください。

また、独自のカスタムフロントマターデータを定義し、ページ上の動的な Vue 式で利用することもできます。

## フロントマターデータへのアクセス {#accessing-frontmatter-data}

フロントマターデータは特別なグローバル変数 `$frontmatter` で参照できます。

Markdown ファイル内での使用例:

```md
 ---
 title: Docs with VitePress
 editLink: true
 ---

 # {{ $frontmatter.title }}

 Guide content
```

[`useData()`](../reference/runtime-api#usedata) ヘルパーを使えば、`<script setup>` 内からも現在のページのフロントマターデータにアクセスできます。

## 代替フロントマター形式 {#alternative-frontmatter-formats}

VitePress は JSON フロントマター構文もサポートしています。中括弧で開始・終了する形式です。

```json
 ---
 {
   "title": "Blogging Like a Hacker",
   "editLink": true
 }
 ---
```
