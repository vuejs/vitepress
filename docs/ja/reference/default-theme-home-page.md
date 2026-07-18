---
description: VitePressデフォルトテーマのホームページレイアウトをヒーローセクション、フィーチャー、カスタムコンテンツで設定する方法。
---

# ホームページ {#home-page}

VitePress のデフォルトテーマにはホームページ用レイアウトが用意されています（[このサイトのトップページ](../) でも使われています）。[フロントマター](./frontmatter-config) に `layout: home` を指定すれば、任意のページで利用できます。

```yaml
---
layout: home
---
```

ただし、この指定だけでは多くのことは起きません。`hero` や `features` などの追加オプションを設定して、ホームページにあらかじめ用意された複数の「セクション」を配置できます。

## ヒーローセクション {#hero-section}

ヒーローセクションはホームページの最上部に表示されます。設定例は次のとおりです。

```yaml
---
layout: home

hero:
  name: VitePress
  text: Vite & Vue powered static site generator.
  tagline: 概要テキスト...
  image:
    src: /logo.png
    alt: VitePress
  actions:
    - theme: brand
      text: はじめる
      link: /guide/what-is-vitepress
    - theme: alt
      text: GitHub で見る
      link: https://github.com/vuejs/vitepress
---
```

```ts
interface Hero {
  // `text` の上に表示される短い文字列。ブランドカラーで表示。
  // 製品名のような短い文言を想定。
  name?: string

  // ヒーローセクションのメインテキスト。`h1` として出力。
  text: string

  // `text` の下に表示されるタグライン。
  tagline?: string

  // テキストとタグラインの横に表示する画像。
  image?: ThemeableImage

  // ヒーローに表示するアクションボタン。
  actions?: HeroAction[]
}

type ThemeableImage =
  | string
  | { src: string; alt?: string }
  | { light: string; dark: string; alt?: string }

interface HeroAction {
  // ボタンのカラーテーマ。既定は `brand`。
  theme?: 'brand' | 'alt'

  // ボタンのラベル。
  text: string

  // ボタンのリンク先。
  link: string

  // a 要素の target 属性。
  target?: string

  // a 要素の rel 属性。
  rel?: string
}
```

### name の色をカスタマイズする {#customizing-the-name-color}

`name` にはブランドカラー（`--vp-c-brand-1`）が使われますが、`--vp-home-hero-name-color` 変数を上書きして色を変更できます。

```css
:root {
  --vp-home-hero-name-color: blue;
}
```

さらに、`--vp-home-hero-name-background` を組み合わせると、`name` にグラデーションを適用できます。

```css
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe, #41d1ff);
}
```

## フィーチャーセクション {#features-section}

フィーチャーセクションでは、ヒーロー直下に任意の数の機能説明を並べられます。フロントマターに `features` オプションを指定して設定します。

各フィーチャーにはアイコン（絵文字または画像）を指定できます。アイコンが画像（svg, png, jpeg など）の場合は、**適切な幅・高さ** を指定してください。必要に応じて説明テキストや実サイズ、ライト／ダーク用の差し替えも指定できます。

```yaml
---
layout: home

features:
  - icon: 🛠️
    title: いつでもシンプル＆ミニマル
    details: 概要テキスト...
  - icon:
      src: /cool-feature-icon.svg
    title: もうひとつの便利機能
    details: 概要テキスト...
  - icon:
      dark: /dark-feature-icon.svg
      light: /light-feature-icon.svg
    title: さらに別の機能
    details: 概要テキスト...
---
```

```ts
interface Feature {
  // 各フィーチャーボックスに表示するアイコン。
  icon?: FeatureIcon

  // フィーチャーのタイトル。
  title: string

  // フィーチャーの詳細説明。
  details: string

  // フィーチャーをクリックしたときのリンク（内部・外部どちらも可）。
  //
  // 例: `guide/reference/default-theme-home-page` や `https://example.com`
  link?: string

  // フィーチャー内に表示するリンクテキスト。
  // `link` と併用するのが最適。
  //
  // 例: `Learn more`, `Visit page` など
  linkText?: string

  // `link` 用の rel 属性。
  //
  // 例: `external`
  rel?: string

  // `link` 用の target 属性。
  target?: string
}

type FeatureIcon =
  | string
  | { src: string; alt?: string; width?: string; height: string }
  | {
      light: string
      dark: string
      alt?: string
      width?: string
      height: string
    }
```

## Markdown コンテンツ {#markdown-content}

`---` で区切るフロントマターの下に Markdown を書くだけで、ホームページに追加コンテンツを表示できます。

````md
---
layout: home

hero:
  name: VitePress
  text: Vite & Vue powered static site generator.
---

## はじめに

`npx` を使えば、すぐに VitePress を始められます！

```sh
npm init
npx vitepress init
```
````
