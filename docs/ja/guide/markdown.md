# Markdown 拡張 {#markdown-extensions}

VitePress には組み込みの Markdown 拡張機能が用意されています。

## 見出しアンカー {#header-anchors}

見出しには自動的にアンカーリンクが付与されます。アンカーのレンダリングは `markdown.anchor` オプションで設定できます。

### カスタムアンカー {#custom-anchors}

自動生成ではなく任意のアンカーを指定したい場合は、見出しの末尾にサフィックスを追加します。

 ```md
 # カスタムアンカーを使う {#my-anchor}
 ```

これにより、デフォルトの `#using-custom-anchors` ではなく `#my-anchor` でその見出しにリンクできます。

## リンク {#links}

内部リンクと外部リンクは特別に処理されます。

### 内部リンク {#internal-links}

内部リンクは SPA ナビゲーションのためにルーターリンクへ変換されます。また、各サブディレクトリにある `index.md` は自動的に `index.html` に変換され、URL は対応する `/` になります。

次のようなディレクトリ構成があるとします。

 ```
 .
 ├─ index.md
 ├─ foo
 │  ├─ index.md
 │  ├─ one.md
 │  └─ two.md
 └─ bar
    ├─ index.md
    ├─ three.md
    └─ four.md
 ```

そして、現在編集中のファイルが `foo/one.md` の場合:

 ```md
 [Home](/) <!-- ルートの index.md に移動 -->
 [foo](/foo/) <!-- ディレクトリ foo の index.html に移動 -->
 [foo の見出し](./#heading) <!-- foo の index ファイル内の見出しへアンカー -->
 [bar - three](../bar/three) <!-- 拡張子は省略可能 -->
 [bar - three](../bar/three.md) <!-- .md を付けても OK -->
 [bar - four](../bar/four.html) <!-- .html を付けても OK -->
 ```

### ページサフィックス {#page-suffix}

ページと内部リンクはデフォルトで `.html` サフィックス付きで生成されます。

### 外部リンク {#external-links}

外部リンクには自動的に `target="_blank" rel="noreferrer"` が付与されます。

- [vuejs.org](https://vuejs.org)
- [VitePress on GitHub](https://github.com/vuejs/vitepress)

## フロントマター {#frontmatter}

[YAML フロントマター](https://jekyllrb.com/docs/front-matter/) をそのままサポートしています。

 ```yaml
 ---
 title: ハッカーのようにブログを書く
 lang: ja-JP
 ---
 ```

このデータはページ内や、カスタム／テーマコンポーネントからも利用できます。詳しくは [Frontmatter](../reference/frontmatter-config) を参照してください。

## GitHub 風テーブル {#github-style-tables}

**入力**

 ```md
 | テーブル       |   は        |  クール |
 | -------------- | :---------: | ------: |
 | 3列目は        | 右寄せ      |  $1600 |
 | 2列目は        |   中央      |    $12 |
 | シマ模様       |  neat です  |     $1 |
 ```

**出力**

| テーブル |   は   |  クール |
| -------- | :----: | ------: |
| 3列目は  | 右寄せ |  \$1600 |
| 2列目は  |  中央  |    \$12 |
| シマ模様 | neatです |     \$1 |

## 絵文字 :tada: {#emoji}

**入力**

 ```
 :tada: :100:
 ```

**出力**

:tada: :100:

すべての絵文字の [一覧はこちら](https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.mjs)。

## 目次 {#table-of-contents}

**入力**

 ```
 [[toc]]
 ```

**出力**

[[toc]]

TOC のレンダリングは `markdown.toc` オプションで設定できます。

## カスタムコンテナ {#custom-containers}

タイプ、タイトル、内容を指定してカスタムコンテナを定義できます。

### デフォルトタイトル {#default-title}

**入力**

 ```md
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
 これは危険の警告です。
 :::

 ::: details
 これは詳細ブロックです。
 :::
 ```

**出力**

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
これは危険の警告です。
:::

::: details
これは詳細ブロックです。
:::

### カスタムタイトル {#custom-title}

コンテナの「タイプ」の直後に文字列を追加することで、タイトルをカスタマイズできます。

**入力**

 ````md
 ::: danger 停止
 危険地帯。先に進まないでください。
 :::

 ::: details クリックしてコードを表示/非表示
 ```js
 console.log('こんにちは、VitePress!')
 ```
 :::
 ````

**出力**

::: danger 停止
危険地帯。先に進まないでください。
:::

::: details クリックしてコードを表示/非表示
 ```js
 console.log('こんにちは、VitePress!')
 ```
:::

また、英語以外で執筆する場合などは、サイト設定に以下を追加してタイトル文字列をグローバルに上書きできます。

 ```ts
 // config.ts
 export default defineConfig({
   // ...
   markdown: {
     container: {
       tipLabel: 'ヒント',
       warningLabel: '警告',
       dangerLabel: '危険',
       infoLabel: '情報',
       detailsLabel: '詳細'
     }
   }
 // ...
 })
 ```

### 追加属性 {#additional-attributes}

カスタムコンテナには追加の属性を付与できます。この機能には [markdown-it-attrs](https://github.com/arve0/markdown-it-attrs) を使用しており、ほぼすべての Markdown 要素でサポートされます。たとえば `open` 属性を付けると、details ブロックをデフォルトで開いた状態にできます。

**入力**

 ````md
 ::: details クリックしてコードを表示/非表示 {open}
 ```js
 console.log('こんにちは、VitePress!')
 ```
 :::
 ````

**出力**

::: details クリックしてコードを表示/非表示 {open}
 ```js
 console.log('こんにちは、VitePress!')
 ```
:::

### `raw`

これは、VitePress でのスタイルやルーターの衝突を防ぐための特別なコンテナです。コンポーネントライブラリのドキュメント化に特に有用です。より強力な分離が必要であれば、[whyframe](https://whyframe.dev/docs/integrations/vitepress) も検討してください。

**構文**

 ```md
 ::: raw
 Wraps in a `<div class="vp-raw">`
 :::
 ```

`vp-raw` クラスは要素に直接付与することも可能です。スタイルの分離は現在オプトインです。

- お好みのパッケージマネージャで `postcss` をインストールします:

  ```sh
  $ npm add -D postcss
  ```

- `docs/postcss.config.mjs` を作成し、次を追加します:

  ```js
  import { postcssIsolateStyles } from 'vitepress'

  export default {
    plugins: [postcssIsolateStyles()]
  }
  ```

  オプションは次のように渡せます:

  ```js
  postcssIsolateStyles({
    includeFiles: [/custom\.css/] // 既定は [/vp-doc\.css/, /base\.css/]
  })
  ```

## GitHub 形式のアラート {#github-flavored-alerts}

VitePress は [GitHub 形式のアラート](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts) をコールアウトとしてレンダリングできます。表示は [カスタムコンテナ](#custom-containers) と同様です。

**入力**


 ```md
 > [!NOTE]
 > 流し読みでも目に留めてほしい情報を強調します。

 > [!TIP]
 > 成功の手助けとなる任意の情報です。

 > [!IMPORTANT]
 > 成功に必須の重要情報です。

 > [!WARNING]
 > 危険性があるため即時の注意が必要な重要情報です。

 > [!CAUTION]
 > 行動による望ましくない結果の可能性です。

```

**出力**


 > [!NOTE]
 > 流し読みでも目に留めてほしい情報を強調します。

 > [!TIP]
 > 成功の手助けとなる任意の情報です。

 > [!IMPORTANT]
 > 成功に必須の重要情報です。

 > [!WARNING]
 > 危険性があるため即時の注意が必要な重要情報です。

 > [!CAUTION]
 > 行動による望ましくない結果の可能性です。


## コードブロックのシンタックスハイライト {#syntax-highlighting-in-code-blocks}

VitePress は [Shiki](https://github.com/shikijs/shiki) を使って、Markdown のコードブロックに色付きのシンタックスハイライトを適用します。Shiki は多くのプログラミング言語をサポートしています。コードブロックの先頭のバッククォートに有効な言語エイリアスを付けるだけで利用できます。

**入力**

 ````
  ```js
  export default {
    name: 'MyComponent',
    // ...
  }
  ```
````
  ````
  ```html
 <ul>
   <li v-for="todo in todos" :key="todo.id">
     {{ todo.text }}
   </li>
 </ul>
 ```
 ````

**出力**

  ```js
  export default {
    name: 'MyComponent',
    // ...
  }
  ```
  ```html
 <ul>
   <li v-for="todo in todos" :key="todo.id">
     {{ todo.text }}
   </li>
 </ul>
 ```

有効な言語の [一覧](https://shiki.style/languages) は Shiki のリポジトリで確認できます。

また、シンタックスハイライトのテーマ変更、言語エイリアスの設定、言語ラベルのカスタマイズなどはアプリ設定の [`markdown` オプション](../reference/site-config#markdown) で行えます。

## コードブロックの行ハイライト {#line-highlighting-in-code-blocks}

**入力**

 ````
  ```js{4}
  export default {
    data () {
      return {
        msg: 'ハイライト！'
      }
    }
  }
  ```
 ````

**出力**

  ```js{4}
  export default {
    data () {
      return {
        msg: 'ハイライト！'
      }
    }
  }
  ```

単一行だけでなく、複数の単一行や範囲、あるいはその組み合わせも指定できます:

- 行範囲の例: `{5-8}`, `{3-10}`, `{10-17}`
- 複数の単一行: `{4,7,9}`
- 行範囲＋単一行: `{4,7-13,16,23-27,40}`

**入力**

 ````
 ```js{1,4,6-8}
 export default { // Highlighted
   data () {
     return {
       msg: `Highlighted!
       This line isn't highlighted,
       but this and the next 2 are.`,
       motd: 'VitePress is awesome',
       lorem: 'ipsum'
     }
   }
 }
 ```
 ````

**出力**


 ```js{1,4,6-8}
 export default { // Highlighted
   data () {
     return {
       msg: `Highlighted!
       This line isn't highlighted,
       but this and the next 2 are.`,
       motd: 'VitePress is awesome',
       lorem: 'ipsum'
     }
   }
 }
 ```

代替案として、`// [!code highlight]` コメントを使って行内を直接ハイライトできます。

**入力**

 ```
 ```js
 export default {
   data () {
     return {
       msg: 'ハイライト！' // [!code highlight]
     }
   }
 }
 ```

**出力**


 ```js
 export default {
   data () {
     return {
       msg: 'ハイライト！' // [!code highlight]
     }
   }
 }
 ```

## コードブロックでのフォーカス {#focus-in-code-blocks}

`// [!code focus]` コメントを行に付けると、その行にフォーカスし、他の部分がぼかされます。

また、`// [!code focus:<lines>]` を使ってフォーカスする行数を指定することもできます。

**入力**

 ````
 ```js
 export default {
   data () {
     return {
       msg: 'フォーカス！' // [!!code focus]
     }
   }
 }
 ```
 ````

**出力**

```js
export default {
  data() {
    return {
      msg: 'フォーカス！' // [!code focus]
    }
  }
}
```

## コードブロックのカラー差分表示 {#colored-diffs-in-code-blocks}

`// [!code --]` または `// [!code ++]` コメントを行に付けると、その行に差分（削除/追加）スタイルを適用できます。コードブロックの色付けは維持されます。

**入力**

 ````
 ```js
 export default {
   data () {
     return {
       msg: 'Removed' // [!!code --]
       msg: 'Added' // [!!code ++]
     }
   }
 }
 ```
 ````

**出力**

```js
export default {
  data () {
    return {
      msg: 'Removed' // [!code --]
      msg: 'Added' // [!code ++]
    }
  }
}
```

## コードブロック内のエラー/警告表示 {#errors-and-warnings-in-code-blocks}

行に `// [!code warning]` または `// [!code error]` コメントを付けると、その行が対応する色で表示されます。

**入力**

 ````
 ```js
 export default {
   data () {
     return {
       msg: 'Error', // [!!code error]
       msg: 'Warning' // [!!code warning]
     }
   }
 }
 ```
 ````

**出力**

```js
export default {
  data() {
    return {
      msg: 'Error', // [!code error]
      msg: 'Warning' // [!code warning]
    }
  }
}
```

## 行番号 {#line-numbers}

設定で、各コードブロックに行番号を表示できます：

 ```js
 export default {
   markdown: {
     lineNumbers: true
   }
 }
 ```

詳しくは [`markdown` オプション](../reference/site-config#markdown) を参照してください。

設定値を上書きするために、フェンス付きコードブロックに `:line-numbers` / `:no-line-numbers` マークを付与できます。

また、`:line-numbers` の後ろに `=` を付けて開始行番号を指定できます。例：`:line-numbers=2` は行番号が `2` から始まることを意味します。

**入力**

 ````
 ```ts {1}
 // 既定では line-numbers は無効
 const line2 = 'This is line 2'
 const line3 = 'This is line 3'
 ```

 ```ts:line-numbers {1}
 // line-numbers が有効
 const line2 = 'This is line 2'
 const line3 = 'This is line 3'
 ```

 ```ts:line-numbers=2 {1}
 // line-numbers が有効で、2 から開始
 const line3 = 'This is line 3'
 const line4 = 'This is line 4'
 ```
 ````

**出力**

 ```ts {1}
 // 既定では line-numbers は無効
 const line2 = 'This is line 2'
 const line3 = 'This is line 3'
 ```

 ```ts:line-numbers {1}
 // line-numbers が有効
 const line2 = 'This is line 2'
 const line3 = 'This is line 3'
 ```

 ```ts:line-numbers=2 {1}
 // line-numbers が有効で、2 から開始
 const line3 = 'This is line 3'
 const line4 = 'This is line 4'
 ```

## コードスニペットのインポート {#import-code-snippets}

既存ファイルから、次の構文でコードスニペットをインポートできます：

 ```md
 <<< @/filepath
 ```

また、[行のハイライト](#line-highlighting-in-code-blocks)にも対応しています：

 ```md
 <<< @/filepath{highlightLines}
 ```

**入力**

 ```md
 <<< @/snippets/snippet.js{2}
 ```

**コードファイル**

<<< @/snippets/snippet.js

**出力**

<<< @/snippets/snippet.js{2}

::: tip
`@` の値はソースルートを表します。既定では VitePress プロジェクトのルートですが、`srcDir` を設定している場合はその値になります。代替として、相対パスからのインポートも可能です：

 ```md
 <<< ../snippets/snippet.js
 ```
:::

また、[VS Code のリージョン](https://code.visualstudio.com/docs/editor/codebasics#_folding)を利用して、コードファイルの該当部分のみを取り込むことができます。ファイルパスの後ろに `#` を付けてカスタムリージョン名を指定します：

**入力**

 ```md
 <<< @/snippets/snippet-with-region.js#snippet{1}
 ```

**コードファイル**

<<< @/snippets/snippet-with-region.js

**出力**

<<< @/snippets/snippet-with-region.js#snippet{1}

中括弧（`{}`）の中で言語を指定することもできます：

 ```md
 <<< @/snippets/snippet.cs{c#}

 <!-- 行のハイライト付き: -->

 <<< @/snippets/snippet.cs{1,2,4-6 c#}

 <!-- 行番号付き: -->

 <<< @/snippets/snippet.cs{1,2,4-6 c#:line-numbers}
 ```

これは、ファイル拡張子からソース言語を推論できない場合に有用です。

## コードグループ {#code-groups}

複数のコードブロックを、次のようにグループ化できます。

**入力**

 ````md
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
 ````

**出力**


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

コードグループ内でも [スニペットのインポート](#import-code-snippets) が可能です：

**入力**

 ```md
 ::: code-group

 <!-- 既定ではファイル名がタイトルとして使われます -->

 <<< @/snippets/snippet.js

 <!-- カスタムタイトルも指定できます -->

 <<< @/snippets/snippet-with-region.js#snippet{1,2 ts:line-numbers} [リージョン付きスニペット]

 :::
 ```

**出力**

::: code-group

<<< @/snippets/snippet.js

<<< @/snippets/snippet-with-region.js#snippet{1,2 ts:line-numbers} [リージョン付きスニペット]

:::

## Markdown ファイルのインクルード {#markdown-file-inclusion}

ある Markdown ファイルの中に、別の Markdown ファイルを取り込めます（入れ子も可能）。

::: tip
Markdown パスの先頭に `@` を付けることもでき、その場合はソースルートとして扱われます。既定では VitePress プロジェクトのルートですが、`srcDir` を設定している場合はその値になります。
:::

例えば、相対パスの Markdown ファイルを次のように取り込めます。

**入力**

 ```md
 # ドキュメント

 ## 基本

 <!--@include: ./parts/basics.md-->
 ```

**パートファイル**（`parts/basics.md`）

 ```md
 はじめに知っておきたいこと。

 ### 設定

 `.foorc.json` を使用して作成できます。
 ```

**等価なコード**

 ```md
 # ドキュメント

 ## 基本

 はじめに知っておきたいこと。

 ### 設定

 `.foorc.json` を使用して作成できます。
 ```

行範囲の選択にも対応しています。

**入力**

 ```md:line-numbers
 # ドキュメント

 ## 基本

 <!--@include: ./parts/basics.md{3,}-->
 ```

**パートファイル**（`parts/basics.md`）

 ```md:line-numbers
 はじめに知っておきたいこと。

 ### 設定

 `.foorc.json` を使って作成できます。
 ```

**等価なコード**

 ```md:line-numbers
 # ドキュメント

 ## 基本

 ### 設定

 `.foorc.json` を使って作成できます。
 ```

選択できる行範囲の書式は、`{3,}`、`{,10}`、`{1,10}` のいずれかです。

[VS Code のリージョン](https://code.visualstudio.com/docs/editor/codebasics#_folding)を使って、コードファイルの該当部分だけを取り込むこともできます。ファイルパスの後ろに `#` を付けて、カスタムリージョン名を指定します。

**入力**

 ```md:line-numbers
 # ドキュメント

 ## 基本

 <!--@include: ./parts/basics.md#basic-usage{,2}-->
 <!--@include: ./parts/basics.md#basic-usage{5,}-->
 ```

**パートファイル**（`parts/basics.md`）

 ```md:line-numbers
 <!-- #region basic-usage -->
 ## 使用例 1

 ## 使用例 2

 ## 使用例 3
 <!-- #endregion basic-usage -->
 ```

**等価なコード**

 ```md:line-numbers
 # ドキュメント

 ## 基本

 ## 使用例 1

 ## 使用例 3
 ```

::: warning
ファイルが存在しない場合でもエラーは発生しません。したがって、この機能を使う際は、期待どおりに内容がレンダリングされているか必ず確認してください。
:::

VS Code のリージョンの代わりに、ヘッダーアンカーを使ってファイル内の特定セクションだけを取り込むこともできます。たとえば、Markdown ファイルに次のようなヘッダーがある場合：

 ```md
 ## ベースのセクション

 ここに本文。

 ### サブセクション

 ここに本文（サブ）。

 ## 別のセクション

 `ベースのセクション` の外側の内容。
 ```

`ベースのセクション` を次のように取り込めます：

 ```md
 ## 拡張セクション
 <!--@include: ./parts/basics.md#my-base-section-->
 ```

**等価なコード**

 ```md
 ## 拡張セクション

 ここに本文。

 ### サブセクション

 ここに本文（サブ）。
 ```

ここで `my-base-section` は見出し要素から生成される ID です。推測しづらい場合は、パートファイルをブラウザで開いて見出しのアンカー（ホバー時に見出しの左に表示される `#` 記号）をクリックし、URL バーで ID を確認してください。あるいはブラウザの開発者ツールで要素を検査して確認できます。別案として、パートファイル側で明示的に ID を指定できます：

 ```md
 ## ベースのセクション {#custom-id}
 ```

そして次のように取り込みます：

 ```md
 <!--@include: ./parts/basics.md#custom-id-->
 ```

## 数式 {#math-equations}

この機能はオプトインです。利用するには `markdown-it-mathjax3` をインストールし、設定ファイルで `markdown.math` を `true` に設定します。

```sh
npm add -D markdown-it-mathjax3@^4
```

 ```ts [.vitepress/config.ts]
 export default {
   markdown: {
     math: true
   }
 }
 ```

**入力**

 ```md
 もし $a \ne 0$ のとき、$(ax^2 + bx + c = 0)$ の解は 2 つ存在し、次式で与えられます
 $$ x = {-b \pm \sqrt{b^2-4ac} \over 2a} $$

 **マクスウェル方程式:**

 | 方程式                                                                                                                                                                   | 説明                                                                                       |
 | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
 | $\nabla \cdot \vec{\mathbf{B}}  = 0$                                                                                                                                     | 磁束密度 $\vec{\mathbf{B}}$ の発散は 0                                                     |
 | $\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t}  = \vec{\mathbf{0}}$                                                         | 電場 $\vec{\mathbf{E}}$ の回転は、磁束密度 $\vec{\mathbf{B}}$ の時間変化に比例              |
 | $\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} = 4 \pi \rho$ | _え？_                                                                                      |
 ```

**出力**

 もし $a \ne 0$ のとき、$(ax^2 + bx + c = 0)$ の解は 2 つ存在し、次式で与えられます
 $$ x = {-b \pm \sqrt{b^2-4ac} \over 2a} $$

 **マクスウェル方程式:**

 | 方程式                                                                                                                                                                   | 説明                                                                                       |
 | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
 | $\nabla \cdot \vec{\mathbf{B}}  = 0$                                                                                                                                     | 磁束密度 $\vec{\mathbf{B}}$ の発散は 0                                                     |
 | $\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t}  = \vec{\mathbf{0}}$                                                         | 電場 $\vec{\mathbf{E}}$ の回転は、磁束密度 $\vec{\mathbf{B}}$ の時間変化に比例              |
 | $\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} = 4 \pi \rho$ | _え？_                                                                                      |

## 画像の遅延読み込み {#image-lazy-loading}

Markdown で追加した各画像に対して遅延読み込みを有効化するには、設定ファイルで `lazyLoading` を `true` にします：

 ```js
 export default {
   markdown: {
     image: {
       // 既定では画像の遅延読み込みは無効
       lazyLoading: true
     }
   }
 }
 ```

## 高度な設定 {#advanced-configuration}

VitePress は Markdown レンダラーとして [markdown-it](https://github.com/markdown-it/markdown-it) を使用しています。上記の多くの拡張はカスタムプラグインとして実装されています。`.vitepress/config.js` の `markdown` オプションを使って、`markdown-it` のインスタンスをさらにカスタマイズできます。

 ```js
 import { defineConfig } from 'vitepress'
 import markdownItAnchor from 'markdown-it-anchor'
 import markdownItFoo from 'markdown-it-foo'

 export default defineConfig({
   markdown: {
     // markdown-it-anchor のオプション
     // https://github.com/valeriangalliat/markdown-it-anchor#usage
     anchor: {
       permalink: markdownItAnchor.permalink.headerLink()
     },

     // @mdit-vue/plugin-toc のオプション
     // https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-toc#options
     toc: { level: [1, 2] },

     config: (md) => {
       // markdown-it のプラグインをもっと使えます！
       md.use(markdownItFoo)
     }
   }
 })
 ```

設定可能なプロパティの完全な一覧は、[設定リファレンス: アプリ設定](../reference/site-config#markdown) を参照してください。
