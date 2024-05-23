# 页脚 {#footer}

配置好 `themeConfig.footer`，VitePress 将在全局页面底部显示页脚。

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
  // 版权前显示的信息
  message?: string

  // 实际的版权文本
  copyright?: string
}
```

上面的配置也支持 HTML 字符串。所以，例如，如果想配置页脚文本有一些链接，可以调整配置如下：

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
只有内联元素可以在 `message` 和 `copyright` 中使用，因为它们渲染在 `<p>` 元素中。如果想添加块元素，请考虑使用 [`layout-bottom`](../guide/extending-default-theme#layout-slots) 插槽。
:::

请注意，当[侧边栏](./default-theme-sidebar)可见时，不会显示页脚。

## frontmatter 配置 {#frontmatter-config}

可以使用 frontmatter 上的 `footer` 选项在单独页面上禁用此功能：

```yaml
---
footer: false
---
```
