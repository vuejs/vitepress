# MarkdownでVueを使う {#using-vue-in-markdown}

VitePress では、各 Markdown ファイルはまず HTML にコンパイルされ、その後 [Vue の単一ファイルコンポーネント（SFC）](https://vuejs.org/guide/scaling-up/sfc.html) として処理されます。つまり、Markdown 内で Vue のあらゆる機能が使えます。動的テンプレート、Vue コンポーネントの利用、`<script>` タグを追加してページ内ロジックを書くことも可能です。

なお、VitePress は Vue のコンパイラを利用して、Markdown コンテンツの**純粋に静的な部分**を自動検出・最適化します。静的コンテンツは単一のプレースホルダノードに最適化され、初回訪問時の JavaScript ペイロードから除外されます。クライアント側のハイドレーションでもスキップされます。要するに、そのページで**動的な部分に対してだけ**コストを支払うことになります。

::: tip SSR 互換性
Vue の使用は SSR 互換である必要があります。詳細と一般的な回避策は [SSR 互換性](./ssr-compat) を参照してください。
:::

## テンプレート記法 {#templating}

### 補間 {#interpolation}

各 Markdown は最初に HTML にコンパイルされ、その後 Vite の処理パイプラインで Vue コンポーネントとして扱われます。つまり、テキスト内で Vue 風の補間が使えます。

**入力**

 ```md
 {{ 1 + 1 }}
 ```

**出力**

 <div class="language-text"><pre><code>{{ 1 + 1 }}</code></pre></div>

### ディレクティブ {#directives}

ディレクティブも動作します（設計上、生の HTML は Markdown でも有効です）。

**入力**

 ```html
 <span v-for="i in 3">{{ i }}</span>
 ```

**出力**

 <div class="language-text"><pre><code><span v-for="i in 3">{{ i }} </span></code></pre></div>

## `<script>` と `<style>` {#script-and-style}

Markdown ファイルのルート直下に置く `<script>` と `<style>` タグは、Vue の SFC と同様に動作します（`<script setup>` や `<style module>` などを含む）。大きな違いは `<template>` タグが無い点で、その他のルート直下のコンテンツは Markdown になることです。すべてのタグはフロントマターの**後**に配置してください。

 ```html
 ---
 hello: world
 ---

 <script setup>
 import { ref } from 'vue'

 const count = ref(0)
 </script>

 ## Markdown コンテンツ

 現在の値: {{ count }}

 <button :class="$style.button" @click="count++">Increment</button>

 <style module>
 .button {
   color: red;
   font-weight: bold;
 }
 </style>
 ```

::: warning Markdown での `<style scoped>` は避ける
Markdown で `<style scoped>` を使うと、そのページ内のすべての要素に特殊な属性を付与する必要があり、ページサイズが大きく膨らみます。ページ単位でローカルスコープが必要な場合は `<style module>` を推奨します。
:::

VitePress のランタイム API（例：現在ページのメタデータにアクセスできる [`useData` ヘルパー](../reference/runtime-api#usedata)）も利用できます。

**入力**

 ```html
 <script setup>
 import { useData } from 'vitepress'

 const { page } = useData()
 </script>

 <pre>{{ page }}</pre>
 ```

**出力**

 ```json
 {
   "path": "/using-vue.html",
   "title": "Using Vue in Markdown",
   "frontmatter": {},
   ...
 }
 ```

## コンポーネントの利用 {#using-components}

Markdown ファイルで、Vue コンポーネントを直接インポートして使用できます。

### Markdown 内でのインポート {#importing-in-markdown}

特定のページでしか使わないコンポーネントは、そのページで明示的にインポートするのがおすすめです。これにより適切にコード分割され、該当ページでのみ読み込まれます。

 ```md
 <script setup>
 import CustomComponent from '../components/CustomComponent.vue'
 </script>

 # ドキュメント

 これはカスタムコンポーネントを使う .md です

 <CustomComponent />

 ## 続き

 ...
 ```

### グローバル登録 {#registering-components-globally}

ほとんどのページで使うコンポーネントは、Vue アプリインスタンスをカスタマイズしてグローバル登録できます。例は [デフォルトテーマの拡張](./extending-default-theme#registering-global-components) を参照してください。

::: warning 重要
カスタムコンポーネント名にはハイフンを含めるか、PascalCase を使用してください。そうでない場合、インライン要素として解釈されて `<p>` タグ内にラップされ、ブロック要素が入れられないためハイドレーション不整合を引き起こします。
:::

### 見出し内でのコンポーネント利用 <ComponentInHeader /> {#using-components-in-headers}

見出し内で Vue コンポーネントを使うこともできますが、次の書き方の違いに注意してください。

| Markdown                                                | 出力 HTML                                   | 解析される見出し |
| ------------------------------------------------------- | ------------------------------------------- | --------------- |
| <pre v-pre><code> # text &lt;Tag/&gt; </code></pre>     | `<h1>text <Tag/></h1>`                      | `text`          |
| <pre v-pre><code> # text \`&lt;Tag/&gt;\` </code></pre> | `<h1>text <code>&lt;Tag/&gt;</code></h1>`   | `text <Tag/>`   |

`<code>` に包まれた HTML はそのまま表示されます。包まれて**いない** HTML だけが Vue によってパースされます。

::: tip
出力 HTML の生成は [Markdown-it](https://github.com/Markdown-it/Markdown-it) が担当し、見出しの解析は VitePress が担当します（サイドバーやドキュメントタイトルに利用）。
:::

## エスケープ {#escaping}

`v-pre` ディレクティブを付けた `<span>` などでラップすることで、Vue の補間をエスケープできます。

**入力**

 ```md
 This <span v-pre>{{ will be displayed as-is }}</span>
 ```

**出力**

 <div class="escape-demo">
   <p>This <span v-pre>{{ will be displayed as-is }}</span></p>
 </div>

段落全体を `v-pre` のカスタムコンテナで囲む方法もあります。

 ```md
 ::: v-pre
 {{ This will be displayed as-is }}
 :::
 ```

**出力**

 <div class="escape-demo">

 ::: v-pre
 {{ This will be displayed as-is }}
 :::

 </div>

## コードブロック内でのアンエスケープ {#unescape-in-code-blocks}

既定では、フェンス付きコードブロックは自動で `v-pre` が付与され、Vue の構文は処理されません。フェンス内で Vue 風の補間を有効にするには、言語に `-vue` サフィックスを付けます（例：`js-vue`）。

**入力**

 ````md
 ```js-vue
 Hello {{ 1 + 1 }}
 ```
 ````

**出力**

 ```js-vue
 Hello {{ 1 + 1 }}
 ```

この方法では、一部のトークンが正しくシンタックスハイライトされない場合があります。

## CSS プリプロセッサの利用 {#using-css-pre-processors}

VitePress は CSS プリプロセッサ（`.scss`、`.sass`、`.less`、`.styl`、`.stylus`）を[標準サポート](https://vitejs.dev/guide/features.html#css-pre-processors)しています。Vite 固有のプラグインは不要ですが、各プリプロセッサ本体のインストールは必要です。

 ```
 # .scss / .sass
 npm install -D sass

 # .less
 npm install -D less

 # .styl / .stylus
 npm install -D stylus
 ```

その後、Markdown やテーマコンポーネントで次のように使えます。

 ```vue
 <style lang="sass">
 .title
   font-size: 20px
 </style>
 ```

## Teleport の利用 {#using-teleports}

現時点で VitePress は、SSG における Teleport を **body** へのみサポートしています。その他のターゲットへ Teleport したい場合は、組み込みの `<ClientOnly>` でラップするか、[`postRender` フック](../reference/site-config#postrender)で最終ページ HTML の適切な位置に Teleport のマークアップを注入してください。

<ModalDemo />

::: details
<<< @/components/ModalDemo.vue
:::

 ```md
 <ClientOnly>
   <Teleport to="#modal">
     <div>
       // ...
     </div>
   </Teleport>
 </ClientOnly>
 ```

<script setup>
import ModalDemo from '../../components/ModalDemo.vue'
import ComponentInHeader from '../../components/ComponentInHeader.vue'
</script>

<style>
.escape-demo {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 0 20px;
}
</style>

## VS Code の IntelliSense サポート {#vs-code-intellisense-support}

<!-- Based on https://github.com/vuejs/language-tools/pull/4321 -->

Vue は [Vue - Official VS Code plugin](https://marketplace.visualstudio.com/items?itemName=Vue.volar) により、標準で IntelliSense を提供します。ただし `.md` ファイルでも有効にするには、設定ファイルをいくつか調整する必要があります。

1. tsconfig/jsconfig の `include` と `vueCompilerOptions.vitePressExtensions` に `.md` パターンを追加します。

 ::: code-group
 ```json [tsconfig.json]
 {
   "include": [
     "docs/**/*.ts",
     "docs/**/*.vue",
     "docs/**/*.md",
   ],
   "vueCompilerOptions": {
     "vitePressExtensions": [".md"],
   },
 }
 ```
 :::

2. VS Code の設定で、`vue.server.includeLanguages` に `markdown` を追加します。

 ::: code-group
 ```json [.vscode/settings.json]
 {
   "vue.server.includeLanguages": ["vue", "markdown"]
 }
 ```
 :::
