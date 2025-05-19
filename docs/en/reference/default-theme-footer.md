# Footer

VitePress will display global footer at the bottom of the page when `themeConfig.footer` is present.

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
  // The message shown right before copyright.
  message?: string

  // The actual copyright text.
  copyright?: string
}
```

The above configuration also supports HTML strings. So, for example, if you want to configure footer text to have some links, you can adjust the configuration as follows:

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
Only inline elements can be used in `message` and `copyright` as they are rendered inside a `<p>` element. If you want to add block elements, consider using [`layout-bottom`](../guide/extending-default-theme#layout-slots) slot instead.
:::

Note that footer will not be displayed when the [SideBar](./default-theme-sidebar) is visible.

## Frontmatter Config

This can be disabled per-page using the `footer` option on frontmatter:

```yaml
---
footer: false
---
```
