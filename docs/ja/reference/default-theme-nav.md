# ナビゲーション {#nav}

ナビはページ上部に表示されるナビゲーションバーです。サイトタイトル、グローバルメニューリンクなどを含みます。

## サイトタイトルとロゴ {#site-title-and-logo}

既定では、ナビには [`config.title`](./site-config#title) の値が表示されます。ナビに表示する文字列を変更したい場合は、`themeConfig.siteTitle` にカスタム文字列を指定します。

```js
export default {
  themeConfig: {
    siteTitle: 'My Custom Title'
  }
}
```

サイトのロゴがある場合は、画像へのパスを渡すと表示できます。ロゴは `public` 直下に配置し、絶対パスで指定してください。

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg'
  }
}
```

ロゴを追加すると、サイトタイトルと並んで表示されます。ロゴだけを表示したい場合は、`siteTitle` を `false` に設定してタイトル文字列を非表示にできます。

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg',
    siteTitle: false
  }
}
```

ダーク／ライトモードでロゴを切り替えたり、`alt` 属性を付けたい場合は、ロゴにオブジェクトを渡すこともできます。詳細は [`themeConfig.logo`](./default-theme-config#logo) を参照してください。

## ナビゲーションリンク {#navigation-links}

`themeConfig.nav` オプションでナビにリンクを追加できます。

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide' },
      { text: 'Config', link: '/config' },
      { text: 'Changelog', link: 'https://github.com/...' }
    ]
  }
}
```

`text` はナビに表示される文字列、`link` はクリック時に遷移するリンクです。内部リンクは `.md` 拡張子を付けず、必ず `/` で始めるようにしてください。

`link` には、[`PageData`](./runtime-api#usedata) を受け取ってパスを返す関数を指定することもできます。

ナビリンクはドロップダウンメニューにもできます。リンクオプションに `items` を設定してください。

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide' },
      {
        text: 'Dropdown Menu',
        items: [
          { text: 'Item A', link: '/item-1' },
          { text: 'Item B', link: '/item-2' },
          { text: 'Item C', link: '/item-3' }
        ]
      }
    ]
  }
}
```

なお、ドロップダウンのタイトル（上の例の `Dropdown Menu`）には `link` は設定できません。ドロップダウンを開くボタンになるためです。

さらに、ドロップダウン内を「セクション」に分けることもできます（入れ子の `items` を使います）。

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide' },
      {
        text: 'Dropdown Menu',
        items: [
          {
            // セクションのタイトル
            text: 'Section A Title',
            items: [
              { text: 'Section A Item A', link: '...' },
              { text: 'Section B Item B', link: '...' }
            ]
          }
        ]
      },
      {
        text: 'Dropdown Menu',
        items: [
          {
            // タイトルは省略することも可能
            items: [
              { text: 'Section A Item A', link: '...' },
              { text: 'Section B Item B', link: '...' }
            ]
          }
        ]
      }
    ]
  }
}
```

### リンクの「アクティブ」状態をカスタマイズ {#customize-link-s-active-state}

現在のページが特定のパス配下にあるとき、該当するナビ項目がハイライトされます。一致させるパスをカスタマイズしたい場合は、`activeMatch` に **正規表現文字列** を指定します。

```js
export default {
  themeConfig: {
    nav: [
      // ユーザーが `/config/` 配下にいるときにアクティブになる
      {
        text: 'Guide',
        link: '/guide',
        activeMatch: '/config/'
      }
    ]
  }
}
```

::: warning
`activeMatch` は正規表現 **オブジェクト** ではなく、**文字列** で指定してください。ビルド時のシリアライズの都合で `RegExp` は使用できません。
:::

### リンクの `target` と `rel` をカスタマイズ {#customize-link-s-target-and-rel-attributes}

既定では、リンクが外部かどうかに応じて VitePress が `target` と `rel` を自動設定します。必要であれば明示的に指定することもできます。

```js
export default {
  themeConfig: {
    nav: [
      {
        text: 'Merchandise',
        link: 'https://www.thegithubshop.com/',
        target: '_self',
        rel: 'sponsored'
      }
    ]
  }
}
```

## ソーシャルリン� {#social-links}

[`socialLinks`](./default-theme-config#sociallinks) を参照してください。

## カスタムコンポーネント {#custom-components}

`component` オプションを使って、ナビゲーションバーにカスタムコンポーネントを配置できます。`component` には Vue コンポーネント名を指定し、[Theme.enhanceApp](../guide/custom-theme#theme-interface) で **グローバル登録** しておく必要があります。

```js [.vitepress/config.js]
export default {
  themeConfig: {
    nav: [
      {
        text: 'My Menu',
        items: [
          {
            component: 'MyCustomComponent',
            // コンポーネントに渡す任意の props
            props: {
              title: 'My Custom Component'
            }
          }
        ]
      },
      {
        component: 'AnotherCustomComponent'
      }
    ]
  }
}
```

次に、コンポーネントをグローバル登録します。

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'

import MyCustomComponent from './components/MyCustomComponent.vue'
import AnotherCustomComponent from './components/AnotherCustomComponent.vue'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MyCustomComponent', MyCustomComponent)
    app.component('AnotherCustomComponent', AnotherCustomComponent)
  }
}
```

コンポーネントはナビゲーションバー内にレンダリングされます。VitePress は次の追加 props をコンポーネントに提供します。

- `screenMenu`: モバイルのナビメニュー内にあるかどうかを示す任意の boolean

e2e テスト内の例は[こちら](https://github.com/vuejs/vitepress/tree/main/__tests__/e2e/.vitepress)を参照してください。
