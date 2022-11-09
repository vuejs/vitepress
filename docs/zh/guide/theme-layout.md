# Layout

你可以通过在页面 [frontmatter](./frontmatter) 中设置 `layout` 选项选择页面布局。有 3 个布局选项，`doc`、`page` 和 `home`。 如果未指定任何内容，则该页面被视为文档页面。

```yaml
---
layout: doc
---
```

## Doc 布局 {#doc-layout}

`doc` 是默认布局，它将整个 Markdown 内容样式化为“文档”外观。它的工作原理是将整个内容包装在 `vp-doc` css 类中，并将样式应用于它下面的元素。

几乎所有通用元素，例如 `p` 或 `h2` 都具有特殊样式。 因此，请记住，如果你在 Markdown 内容中添加任何自定义 HTML，这些元素也会受到这些样式的影响。

同时还提供下面列出的文档特定功能。这些功能仅在此布局中生效。

- 编辑链接
- 上一页/下一页链接
- 概述
- [Carbon Ads](./theme-carbon-ads)

## Page 布局 {#page-layout}

选项 `page` 被视为“空白页”。 Markdown 仍然会被解析，并且所有 [Markdown 扩展](./markdown)与 `doc` 布局同样生效，但它不会有任何默认样式。

page 布局可在 VitePress 主题不会影响标签的情况下让你自行设计所有内容。当你要创建自己的自定义页面时，这很有用。

注意，即使在此布局中，如果页面具有匹配的侧边栏配置，侧边栏仍会显示。

## Home 布局 {#home-layout}

选项 `home` 将生成模板化的“主页”。 在此布局中，你可以设置额外的选项，例如 `hero` 和 `features`，以进一步自定义内容。请访问[主题：主页](./theme-home-page)了解更多详情。

## No 布局 {#home-layout}
如果你不想要任何布局，你可以通过在 frontmatter 中设置 `layout: false`。如果你想要一个完全可定制的登录页面 (默认情况下没有任何侧边栏、导航栏或页脚)，这个选项很有用。