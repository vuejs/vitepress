---
outline: deep
---

# デフォルトテーマの拡張 {#extending-the-default-theme}

VitePress のデフォルトテーマはドキュメント向けに最適化されており、カスタマイズ可能です。利用できるオプションの一覧は [デフォルトテーマの概要](../reference/default-theme-config) を参照してください。

しかし、設定だけでは不十分なケースもあります。例えば:

1. CSS のスタイルを微調整したい
2. グローバルコンポーネントの登録など、Vue アプリインスタンスを変更したい
3. レイアウトのスロット経由でテーマに独自コンテンツを挿入したい

これらの高度なカスタマイズには、デフォルトテーマを「拡張」するカスタムテーマを使用する必要があります。

::: tip
先に [カスタムテーマの使用](./custom-theme) を読み、カスタムテーマの仕組みを理解してから進めてください。
:::

## CSS のカスタマイズ {#customizing-css}

デフォルトテーマの CSS は、ルートレベルの CSS 変数をオーバーライドすることでカスタマイズできます。

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default DefaultTheme
```

```css
/* .vitepress/theme/custom.css */
:root {
  --vp-c-brand-1: #646cff;
  --vp-c-brand-2: #747bff;
}
```

上書き可能な [デフォルトテーマの CSS 変数](https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/styles/vars.css) を参照してください。

## フォントを変更する {#using-different-fonts}

VitePress はデフォルトフォントとして [Inter](https://rsms.me/inter/) を使用し、ビルド出力にフォントを含めます。プロダクションでは自動でプリロードもされます。しかし、別のメインフォントを使いたい場合には望ましくないことがあります。

Inter をビルド出力に含めたくない場合は、`vitepress/theme-without-fonts` からテーマをインポートします。

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme-without-fonts'
import './my-fonts.css'

export default DefaultTheme
```

```css
/* .vitepress/theme/my-fonts.css */
:root {
  --vp-font-family-base: /* 通常テキスト用フォント */
  --vp-font-family-mono: /* コード用フォント */
}
```

::: warning
[Team Page](../reference/default-theme-team-page) などのオプションコンポーネントを使う場合も、必ず `vitepress/theme-without-fonts` からインポートしてください。
:::

フォントが `@font-face` で参照されるローカルファイルの場合、アセットとして処理され、ハッシュ付きファイル名で `.vitepress/dist/assets` に出力されます。このファイルをプリロードするには、[transformHead](../reference/site-config#transformhead) ビルドフックを使います。

```js [.vitepress/config.js]
export default {
  transformHead({ assets }) {
    // 使うフォントに合わせて正規表現を調整
    const myFontFile = assets.find(file => /font-name\.[\w-]+\.woff2/.test(file))
    if (myFontFile) {
      return [
        [
          'link',
          {
            rel: 'preload',
            href: myFontFile,
            as: 'font',
            type: 'font/woff2',
            crossorigin: ''
          }
        ]
      ]
    }
  }
}
```

## グローバルコンポーネントの登録 {#registering-global-components}

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 独自のグローバルコンポーネントを登録
    app.component('MyGlobalComponent' /* ... */)
  }
}
```

TypeScript を使う場合:

```ts [.vitepress/theme/index.ts]
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 独自のグローバルコンポーネントを登録
    app.component('MyGlobalComponent' /* ... */)
  }
} satisfies Theme
```

Vite を使っているため、Vite の [glob import 機能](https://vitejs.dev/guide/features.html#glob-import) を利用してディレクトリ内のコンポーネントを自動登録することもできます。

## レイアウトスロット {#layout-slots}

デフォルトテーマの `<Layout/>` コンポーネントには、ページ内の特定の位置にコンテンツを挿入するためのスロットがいくつか用意されています。以下は、アウトラインの前にコンポーネントを挿入する例です。

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'
import MyLayout from './MyLayout.vue'

export default {
  extends: DefaultTheme,
  // スロットを注入するラッパーコンポーネントで Layout を上書き
  Layout: MyLayout
}
```

```vue [.vitepress/theme/MyLayout.vue]
<script setup>
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #aside-outline-before>
      My custom sidebar top content
    </template>
  </Layout>
</template>
```

レンダーファンクションを使う方法もあります。

```js [.vitepress/theme/index.js]
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import MyComponent from './MyComponent.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'aside-outline-before': () => h(MyComponent)
    })
  }
}
```

デフォルトテーマレイアウトで利用可能なスロットの一覧:

- フロントマターで `layout: 'doc'`（デフォルト）を有効にしているとき:
  - `doc-top`
  - `doc-bottom`
  - `doc-footer-before`
  - `doc-before`
  - `doc-after`
  - `sidebar-nav-before`
  - `sidebar-nav-after`
  - `aside-top`
  - `aside-bottom`
  - `aside-outline-before`
  - `aside-outline-after`
  - `aside-ads-before`
  - `aside-ads-after`
- フロントマターで `layout: 'home'` を有効にしているとき:
  - `home-hero-before`
  - `home-hero-info-before`
  - `home-hero-info`
  - `home-hero-info-after`
  - `home-hero-actions-after`
  - `home-hero-image`
  - `home-hero-after`
  - `home-features-before`
  - `home-features-after`
- フロントマターで `layout: 'page'` を有効にしているとき:
  - `page-top`
  - `page-bottom`
- 404（Not Found）ページ:
  - `not-found`
- 常に利用可能:
  - `layout-top`
  - `layout-bottom`
  - `nav-bar-title-before`
  - `nav-bar-title-after`
  - `nav-bar-content-before`
  - `nav-bar-content-after`
  - `nav-screen-content-before`
  - `nav-screen-content-after`

## View Transitions API の利用

### 外観切り替え時（ライト/ダーク） {#on-appearance-toggle}

カラーモード切り替え時にカスタムトランジションを提供するよう、デフォルトテーマを拡張できます。例:

```vue [.vitepress/theme/Layout.vue]
<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { nextTick, provide } from 'vue'

const { isDark } = useData()

const enableTransitions = () =>
  'startViewTransition' in document &&
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches

provide('toggle-appearance', async ({ clientX: x, clientY: y }: MouseEvent) => {
  if (!enableTransitions()) {
    isDark.value = !isDark.value
    return
  }

  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    )}px at ${x}px ${y}px)`
  ]

  await document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  }).ready

  document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    {
      duration: 300,
      easing: 'ease-in',
      fill: 'forwards',
      pseudoElement: `::view-transition-${isDark.value ? 'old' : 'new'}(root)`
    }
  )
})
</script>

<template>
  <DefaultTheme.Layout />
</template>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root),
.dark::view-transition-new(root) {
  z-index: 1;
}

::view-transition-new(root),
.dark::view-transition-old(root) {
  z-index: 9999;
}

.VPSwitchAppearance {
  width: 22px !important;
}

.VPSwitchAppearance .check {
  transform: none !important;
}
</style>
```

結果（**注意！**：点滅や急な動き、明るい光を含みます）:

<details>
<summary>デモ</summary>

![Appearance Toggle Transition Demo](/appearance-toggle-transition.webp)

</details>

詳細は [Chrome Docs](https://developer.chrome.com/docs/web-platform/view-transitions/) を参照してください。

### ルート遷移時 {#on-route-change}

近日公開。

## 内部コンポーネントの置き換え {#overriding-internal-components}

Vite の [エイリアス](https://vitejs.dev/config/shared-options.html#resolve-alias) を使って、デフォルトテーマのコンポーネントを独自のものに置き換えられます。

```ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

export default defineConfig({
  vite: {
    resolve: {
      alias: [
        {
          find: /^.*\/VPNavBar\.vue$/,
          replacement: fileURLToPath(
            new URL('./theme/components/CustomNavBar.vue', import.meta.url)
          )
        }
      ]
    }
  }
})
```

正確なコンポーネント名は [ソースコード](https://github.com/vuejs/vitepress/tree/main/src/client/theme-default/components) を参照してください。内部コンポーネントであるため、マイナーリリース間で名称が更新される可能性があります。
