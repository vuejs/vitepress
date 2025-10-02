# VuePress からの移行

## 設定

### サイドバー

サイドバーはフロントマターから自動生成されなくなりました。サイドバーを動的に生成するには、[自分でフロントマターを読み取り](https://github.com/vuejs/vitepress/issues/572#issuecomment-1170116225)、項目を構築してください。将来的に、[この用途のユーティリティ](https://github.com/vuejs/vitepress/issues/96) が提供される可能性があります。

## Markdown

### 画像

VuePress と異なり、VitePress では静的画像を使用する場合、設定の [`base`](./asset-handling#base-url) を自動的に処理します。

そのため、`img` タグを使わずに画像をレンダリングできます。

 ```diff
 - <img :src="$withBase('/foo.png')" alt="foo">
 + ![foo](/foo.png)
 ```

::: warning
動的な画像については、[ベース URL のガイド](./asset-handling#base-url) にあるとおり、引き続き `withBase` が必要です。
:::

すべての `img` タグを `![](...)` 構文へ置換するには、次の正規表現を使って `![$2]($1)` に置き換えてください。

- 検索：`<img.*withBase\('(.*)'\).*alt="([^"]*)".*>`
- 置換：`![$2]($1)`

---

続きは今後追加予定です…
