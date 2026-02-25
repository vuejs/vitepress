# Footer

VitePress will display a global footer at the bottom of the page when `themeConfig.footer` is present.

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
  // The message shown before the copyright.
  message?: string

  // The actual copyright text.
  copyright?: string
}
```

You can additionally directly embed HTML strings in the configuration if you want to add links or markup to the footer.

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
You can only use inline elements in `message` and `copyright`, as they are rendered inside a `<p>` element. If you want to add block elements, consider using the [`layout-bottom`](../guide/extending-default-theme#layout-slots) slot instead.
:::

Note that footer will not be displayed when the [SideBar](./default-theme-sidebar) is visible.

## Frontmatter Config

This can be disabled per-page using the `footer` option in each individual page's frontmatter:

```yaml
---
footer: false
---
```
