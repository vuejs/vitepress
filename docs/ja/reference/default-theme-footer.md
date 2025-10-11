# フッター {#footer}

`themeConfig.footer` を設定すると、ページ下部にグローバルフッターが表示されます。

```ts
export default {
  themeConfig: {
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present Evan You'
    }
  }
}
```

```ts
export interface Footer {
  // 著作権表示の直前に表示されるメッセージ
  message?: string

  // 実際の著作権表記
  copyright?: string
}
```

上記の設定は HTML 文字列にも対応しています。たとえば、フッター内のテキストにリンクを含めたい場合は、次のように設定できます。

```ts
export default {
  themeConfig: {
    footer: {
      message: 'Released under the <a href="https://github.com/vuejs/vitepress/blob/main/LICENSE">MIT License</a>.',
      copyright: 'Copyright © 2019-present <a href="https://github.com/yyx990803">Evan You</a>'
    }
  }
}
```

::: warning
`message` と `copyright` は `<p>` 要素内にレンダリングされるため、
使用できるのはインライン要素のみです。ブロック要素を追加したい場合は、
[`layout-bottom`](../guide/extending-default-theme#layout-slots) スロットの利用を検討してください。
:::

なお、[SideBar](./default-theme-sidebar) が表示されている場合はフッターは表示されません。

## フロントマターでの設定 {#frontmatter-config}

ページ単位で無効化するには、フロントマターの `footer` オプションを使用します。

```yaml
---
footer: false
---
```
