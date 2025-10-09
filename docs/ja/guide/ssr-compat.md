---
outline: deep
---

# SSR 互換性 {#ssr-compatibility}

VitePress は本番ビルド時に、Node.js 上で Vue のサーバーサイドレンダリング（SSR）機能を使ってアプリを事前レンダリングします。つまり、テーマコンポーネント内のすべてのカスタムコードは SSR 互換性の対象になります。

[公式 Vue ドキュメントの SSR セクション](https://vuejs.org/guide/scaling-up/ssr.html)では、SSR とは何か、SSR と SSG の関係、そして SSR に優しいコードを書く際の一般的な注意点が解説されています。経験則としては、**ブラウザ / DOM API へのアクセスは Vue コンポーネントの `beforeMount` または `mounted` フック内に限定** するのが安全です。

## `<ClientOnly>` {#clientonly}

SSR に適さないコンポーネント（例：カスタムディレクティブを含むなど）を使用・デモする場合は、組み込みの `<ClientOnly>` コンポーネントでラップできます。

 ```md
 <ClientOnly>
   <NonSSRFriendlyComponent />
 </ClientOnly>
 ```

## インポート時に Browser API にアクセスするライブラリ {#libraries-that-access-browser-api-on-import}

一部のコンポーネントやライブラリは **インポート時に** ブラウザ API にアクセスします。インポート時にブラウザ環境を前提とするコードを使うには、動的インポートが必要です。

### mounted フック内でのインポート {#importing-in-mounted-hook}

 ```vue
 <script setup>
 import { onMounted } from 'vue'

 onMounted(() => {
   import('./lib-that-access-window-on-import').then((module) => {
     // ここでコードを利用
   })
 })
 </script>
 ```

### 条件付きインポート {#conditional-import}

[`import.meta.env.SSR`](https://vitejs.dev/guide/env-and-mode.html#env-variables) フラグ（Vite の環境変数の一部）を使って、依存関係を条件付きでインポートすることもできます。

 ```js
 if (!import.meta.env.SSR) {
   import('./lib-that-access-window-on-import').then((module) => {
     // ここでコードを利用
   })
 }
 ```

[`Theme.enhanceApp`](./custom-theme#theme-interface) は非同期にできるため、**インポート時に Browser API に触れる Vue プラグイン** を条件付きでインポート・登録できます。

 ```js [.vitepress/theme/index.js]
 /** @type {import('vitepress').Theme} */
 export default {
   // ...
   async enhanceApp({ app }) {
     if (!import.meta.env.SSR) {
       const plugin = await import('plugin-that-access-window-on-import')
       app.use(plugin.default)
     }
   }
 }
 ```

TypeScript を使う場合：

 ```ts [.vitepress/theme/index.ts]
 import type { Theme } from 'vitepress'

 export default {
   // ...
   async enhanceApp({ app }) {
     if (!import.meta.env.SSR) {
       const plugin = await import('plugin-that-access-window-on-import')
       app.use(plugin.default)
     }
   }
 } satisfies Theme
 ```

### `defineClientComponent`

VitePress は、**インポート時に Browser API にアクセスする Vue コンポーネント** を読み込むためのユーティリティを提供します。

 ```vue
 <script setup>
 import { defineClientComponent } from 'vitepress'

 const ClientComp = defineClientComponent(() => {
   return import('component-that-access-window-on-import')
 })
 </script>

 <template>
   <ClientComp />
 </template>
 ```

ターゲットコンポーネントに props / children / slots を渡すこともできます。

 ```vue
 <script setup>
 import { ref } from 'vue'
 import { defineClientComponent } from 'vitepress'

 const clientCompRef = ref(null)
 const ClientComp = defineClientComponent(
   () => import('component-that-access-window-on-import'),

   // 引数は h() に渡されます - https://vuejs.org/api/render-function.html#h
   [
     {
       ref: clientCompRef
     },
     {
       default: () => 'default slot',
       foo: () => h('div', 'foo'),
       bar: () => [h('span', 'one'), h('span', 'two')]
     }
   ],

   // コンポーネント読み込み後のコールバック（非同期可）
   () => {
     console.log(clientCompRef.value)
   }
 )
 </script>

 <template>
   <ClientComp />
 </template>
 ```

ターゲットコンポーネントは、ラッパーコンポーネントの mounted フックで初めてインポートされます。
