# 布局 {#layout}

可以通过设置页面 [frontmatter](./frontmatter-config) 选项来选择页面布局。有 3 种布局选项 `doc`、`page` 和 `home`。如果未指定任何内容，则该页面将被视为 `doc` 页面。

```yaml
---
layout: doc
---
```

## doc 布局 {#doc-layout}

`doc` 是默认布局，它将整个 Markdown 内容设置为“documentation”外观。它的工作原理是将整个内容包装在 css `vp-doc` 类中，并将样式应用于它下面的元素。

几乎所有通用元素，例如 `p`, 或 `h2` 都有特殊的样式。因此，请记住，如果在 Markdown 内容中添加任何自定义 HTML，这些内容也会受到这些样式的影响。

它还提供下面列出的文档特定功能。这些功能仅在此布局中启用。

- [编辑链接](./default-theme-edit-link)
- [上下页链接](./default-theme-prev-next-links)
- [大纲](./default-theme-config#outline)
- [Carbon Ads](./default-theme-carbon-ads)

## page 布局 {#page-layout}

`page` 被视为“空白页”。Markdown 仍然会被解析，所有的 [Markdown 扩展](../guide/markdown) 都和 `doc` 布局一样运行，但它没有任何默认样式。

`page` 布局将使可以自行设计所有内容，而不会受 VitePress 主题影响。当想要创建自己的自定义页面时，这很有用。

请注意，即使在此布局中，如果页面具有匹配的侧边栏配置，侧边栏仍会显示。

## home 布局 {#home-layout}

`home` 将生成模板化的“主页”。在此布局中，可以设置额外的选项，例如 `hero` 和 `features` 以进一步自定义内容。请访问[默认主题: 主页](./default-theme-home-page)了解更多详情。

## 无布局 {#no-layout}

如果不想要任何布局，可以通过 frontmatter 传递 `layout: false`。如果想要一个完全可自定义的登录页面（默认情况下没有任何侧边栏、导航栏或页脚），此选项很有用。

## 自定义布局 {#custom-layout}

也可以使用自定义布局：

```md
---
layout: foo
---
```

这将在上下文中查找注册名为 `foo` 的组件。例如，可以在 `.vitepress/theme/index.ts`中全局注册组件：

```ts
import DefaultTheme from 'vitepress/theme'
import Foo from './Foo.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('foo', Foo)
  }
}
```
