# レイアウト {#layout}

ページの [フロントマター](./frontmatter-config) の `layout` オプションでページのレイアウトを選択できます。利用可能なレイアウトは `doc`、`page`、`home` の 3 種類です。何も指定しない場合は `doc` として扱われます。

```yaml
---
layout: doc
---
```

## Doc レイアウト {#doc-layout}

`doc` は既定のレイアウトで、Markdown 全体を「ドキュメント」風にスタイリングします。コンテンツ全体を `vp-doc` という CSS クラスでラップし、その配下の要素にスタイルを適用します。

`p` や `h2` などほぼすべての汎用要素に特別なスタイルが当たります。そのため、Markdown 内にカスタム HTML を追加した場合も、これらのスタイルの影響を受ける点に注意してください。

また、以下のようなドキュメント特有の機能も提供します。これらはこのレイアウトでのみ有効になります。

- 編集リンク（Edit Link）
- 前後リンク（Prev / Next Link）
- アウトライン（Outline）
- [Carbon 広告](./default-theme-carbon-ads)

## Page レイアウト {#page-layout}

`page` は「ブランクページ」として扱われます。Markdown はパースされ、[Markdown 拡張](../guide/markdown) も `doc` と同様に機能しますが、既定のスタイルは適用されません。

このレイアウトでは、VitePress テーマにマークアップを干渉させず、すべてを自分でスタイルできます。独自のカスタムページを作成したい場合に便利です。

なお、このレイアウトでも、ページがサイドバー設定に一致する場合はサイドバーが表示されます。

## Home レイアウト {#home-layout}

`home` はテンプレート化された「ホームページ」を生成します。このレイアウトでは、`hero` や `features` などの追加オプションでコンテンツをさらにカスタマイズできます。詳しくは [デフォルトテーマ: ホームページ](./default-theme-home-page) を参照してください。

## レイアウトなし {#no-layout}

レイアウトを一切適用したくない場合は、フロントマターで `layout: false` を指定します。これは（既定でサイドバー／ナビバー／フッターなしの）完全にカスタマイズ可能なランディングページを作りたい場合に役立ちます。

## カスタムレイアウト {#custom-layout}

カスタムレイアウトを使用することもできます。

```md
---
layout: foo
---
```

これは、コンテキストに登録された `foo` という名前のコンポーネントを探します。たとえば、`.vitepress/theme/index.ts` でグローバル登録できます。

```ts
import DefaultTheme from 'vitepress/theme'
import Foo from './Foo.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('foo', Foo)
  }
}
```
