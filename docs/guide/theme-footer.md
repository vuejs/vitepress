# Footer

When the [page layout](./theme-layout) is set to either `home` or `page`, VitePress will display global footer at the bottom of the page. Set `themeConfig.footer` to configure footer content.

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
  // The message shown rigth before copyright.
  message?: string

  // The actual copyright text.
  copyright?: string
}
```

Note that footer will not be displayed when the page layout is set to `doc`.
