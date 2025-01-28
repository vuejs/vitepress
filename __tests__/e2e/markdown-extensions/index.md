# Markdown拡張機能

## リンク

### 内部リンク

- [home](/)
- [markdown拡張機能](/markdown-extensions/)
- [heading](./#internal-links)
- [省略拡張子](./foo)
- [.md 拡張機能](./foo.md)
- [.html 拡張機能](./foo.html)

### 外部リンク

[VitePress on GitHub](https://github.com/vuejs/vitepress)

## GitHub-Styleテーブル

| Tables        |      Are      |   Cool |
| ------------- | :-----------: | -----: |
| col 3 is      | right-aligned | \$1600 |
| col 2 is      |   centered    |   \$12 |
| zebra stripes |   are neat    |    \$1 |

## 絵文字

- :tada:
- :100:

## 目次

[[toc]]

## カスタム・コンテナ

### デフォルトのタイトル

::: info
これは情報ボックスです。
:::

::: tip
これはヒントです。
:::

::: warning
これは警告です。
:::

::: danger
これは危険な警告です。
:::

::: details
これは詳細ブロックです。
:::

### カスタム・タイトル

::: danger STOP
危険ゾーン、進めてはいけません。
:::

::: details Click me to view the code
```js
console.log('Hello, VitePress!')
```
:::

## コード・ブロック内の行のハイライト

### 一つの行

```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

### 複数の行、範囲

```js{1,4,6-8}
export default {
  data () {
    return {
      msg: `ハイライト！
      この行はハイライトされていない、
      しかし、この行と次の二行はハイライトされている。`,
      motd: 'VitePressは素晴らしい',
      lorem: 'ipsum',
    }
  }
}
```

### コメントのハイライト

```js
export default { // [!code focus]
  data() { // [!code hl]
    return {
      msg: '削除済み' // [!code --]
      msg: '追加済み' // [!code ++]
      msg: 'エラー', // [!code error]
      msg: '警告' // [!code warning]
    }
  }
}
```

## 行番号

```ts:line-numbers
const line1 = '一行目です'
const line2 = '二行目です'
```

## コード・スニペットのインポート

### 基本的なコード・スニペット

<<< @/markdown-extensions/foo.md

### 範囲を指定する

<<< @/markdown-extensions/foo.md#snippet

### その他の機能

<<< @/markdown-extensions/foo.md#snippet{1 ts:line-numbers} [snippet with region]

## コード・グループ

### 基本的なコード・グループ

::: code-group

```js [config.js]
/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
  // ...
}

export default config
```

```ts [config.ts]
import type { UserConfig } from 'vitepress'

const config: UserConfig = {
  // ...
}

export default config
```

:::

### その他の機能

::: code-group

<<< @/markdown-extensions/foo.md

<<< @/markdown-extensions/foo.md#snippet{1 ts:line-numbers} [snippet with region]

:::

## Markdownファイルのインクルード

<!--@include: ./foo.md-->

## ファイルのインクルード時のmarkdown

<!--@include: @/markdown-extensions/bar.md-->

## Markdownのネストされたファイルのインクルード

<!--@include: ./nested-include.md-->

## 範囲指定によるMarkdownファイルのインクルード

<!--@include: ./foo.md{6,8}-->

## Markdownファイルのインクルードと開始しない範囲

<!--@include: ./foo.md{,8}-->

## 範囲指定の終端なしのMarkdownファイルのインクルード

<!--@include: ./foo.md{6,}-->

## ファイル領域でのMarkdownスニペット

<!--@include: ./region-include.md#snippet-->

## Markdownファイル内の範囲指定スニペット

<!--@include: ./region-include.md#range-region{3,4}-->

## 開始位置を指定しないファイル範囲のMarkdownスニペット

<!--@include: ./region-include.md#range-region{,2}-->

## ファイル最後まで範囲指定可能なMarkdownスニペット

<!--@include: ./region-include.md#range-region{5,}-->

## 画像の遅延読み込み

![vitepress logo](/vitepress.png)