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

The above configuration also supports strings of DOM structure. if we want to configure footer text to jump to other links a website, we can adjust the configuration as follows:

```ts
export default {
  themeConfig: {
    footer: {
      message:
        '<a href="https://github.com/vuejs/vitepress">Released under the MIT License.</a>',
      copyright:
        '<a href="https://github.com/yyx990803">Copyright © 2019-present Evan You</a>'
    }
  }
}
```

Note that footer will not be displayed when the [SideBar](./theme-sidebar) is visible.
