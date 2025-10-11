---
outline: deep
---

# フロントマター設定 {#frontmatter-config}

フロントマターはページ単位の設定を可能にします。各 Markdown ファイルで、サイト全体やテーマレベルの設定を上書きできます。フロントマターでしか定義できない項目もあります。

使用例:

```md
---
title: Docs with VitePress
editLink: true
---
```

Vue の式内では、グローバル `$frontmatter` を介してフロントマターデータにアクセスできます。

```md
{{ $frontmatter.title }}
```

## title

- 型: `string`

ページのタイトルです。[config.title](./site-config#title) と同じ意味で、サイトレベルの設定を上書きします。

```yaml
---
title: VitePress
---
```

## titleTemplate

- 型: `string | boolean`

タイトルのサフィックスです。[config.titleTemplate](./site-config#titletemplate) と同じ意味で、サイトレベルの設定を上書きします。

```yaml
---
title: VitePress
titleTemplate: Vite & Vue powered static site generator
---
```

## description

- 型: `string`

ページの説明です。[config.description](./site-config#description) と同じ意味で、サイトレベルの設定を上書きします。

```yaml
---
description: VitePress
---
```

## head

- 型: `HeadConfig[]`

現在のページに追加で挿入する `<head>` タグを指定します。サイトレベル設定で挿入されたタグの後に追加されます。

```yaml
---
head:
  - - meta
    - name: description
      content: hello
  - - meta
    - name: keywords
      content: super duper SEO
---
```

```ts
type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

## デフォルトテーマ専用 {#default-theme-only}

以下のフロントマター項目は、デフォルトテーマ使用時にのみ適用されます。

### layout

- 型: `doc | home | page`
- 既定値: `doc`

ページのレイアウトを決めます。

- `doc` — Markdown コンテンツにドキュメント向けの既定スタイルを適用します。
- `home` — 「ホームページ」用の特別なレイアウト。`hero` や `features` を追加指定して、ランディングページを素早く構築できます。
- `page` — `doc` と似ていますが、コンテンツにスタイルを適用しません。完全にカスタムなページを作りたい場合に便利です。

```yaml
---
layout: doc
---
```

### hero <Badge type="info" text="home ページ専用" />

`layout: home` のときのヒーローセクションの内容を定義します。詳しくは [デフォルトテーマ: ホームページ](./default-theme-home-page) を参照。

### features <Badge type="info" text="home ページ専用" />

`layout: home` のときのフィーチャーセクションに表示する項目を定義します。詳しくは [デフォルトテーマ: ホームページ](./default-theme-home-page) を参照。

### navbar

- 型: `boolean`
- 既定値: `true`

[ナビゲーションバー](./default-theme-nav) を表示するかどうか。

```yaml
---
navbar: false
---
```

### sidebar

- 型: `boolean`
- 既定値: `true`

[サイドバー](./default-theme-sidebar) を表示するかどうか。

```yaml
---
sidebar: false
---
```

### aside

- 型: `boolean | 'left'`
- 既定値: `true`

`doc` レイアウトでの aside コンポーネントの位置を定義します。

この値を `false` にすると aside コンテナを表示しません。\
`true` にすると右側に表示します。\
`'left'` にすると左側に表示します。

```yaml
---
aside: false
---
```

### outline

- 型: `number | [number, number] | 'deep' | false`
- 既定値: `2`

ページのアウトラインに表示する見出しレベルです。[config.themeConfig.outline.level](./default-theme-config#outline) と同じ意味で、サイトレベルの設定を上書きします。

```yaml
---
outline: [2, 4]
---
```

### lastUpdated

- 型: `boolean | Date`
- 既定値: `true`

現在のページのフッターに[最終更新](./default-theme-last-updated)を表示するかどうか。日時を指定した場合は、その日時が Git の最終更新時刻の代わりに表示されます。

```yaml
---
lastUpdated: false
---
```

### editLink

- 型: `boolean`
- 既定値: `true`

現在のページのフッターに[編集リンク](./default-theme-edit-link)を表示するかどうか。

```yaml
---
editLink: false
---
```

### footer

- 型: `boolean`
- 既定値: `true`

[フッター](./default-theme-footer) を表示するかどうか。

```yaml
---
footer: false
---
```

### pageClass

- 型: `string`

特定のページに追加のクラス名を付与します。

```yaml
---
pageClass: custom-page-class
---
```

その後、`.vitepress/theme/custom.css` でこのページ専用のスタイルを記述できます。

```css
.custom-page-class {
  /* ページ固有のスタイル */
}
```

### isHome

- 型: `boolean`

デフォルトテーマは通常、`frontmatter.layout === 'home'` のチェックに基づいてホームページかどうかを判断します。\
カスタムレイアウトでホームページ用の要素を強制的に表示したい場合に便利です。

```yaml
---
isHome: true
---
```
