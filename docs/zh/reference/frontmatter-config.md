---
outline: deep
---

# frontmatter 配置 {#frontmatter-config}

frontmatter 支持基于页面的配置。在每个 markdown 文件中，可以使用 frontmatter 配置来覆盖站点级别或主题级别的配置选项。此外，还有一些配置选项只能在 frontmatter 中定义。

示例用法：

```md
---
title: Docs with VitePress
editLink: true
---
```

可以通过 Vue 表达式中的 `$frontmatter` 全局变量访问 frontmatter 数据：

```md
{{ $frontmatter.title }}
```

## title

- 类型：`string`

页面的标题。它与 [config.title](./site-config#title) 相同，并且覆盖站点级配置。

```yaml
---
title: VitePress
---
```

## titleTemplate

- 类型：`string | boolean`

标题的后缀。它与 [config.titleTemplate](./site-config#titletemplate) 相同，它会覆盖站点级别的配置。

```yaml
---
title: VitePress
titleTemplate: Vite & Vue powered static site generator
---
```

## description

- 类型：`string`

页面的描述。它与 [config.description](./site-config#description) 相同，它会覆盖站点级别的配置。

```yaml
---
description: VitePress
---
```

## head

- 类型：`HeadConfig[]`

指定要为当前页面注入的额外 head 标签。将附加在站点级配置注入的头部标签之后。

```yaml
---
head:
  - - meta
    - name: description
      content: hello
  - - meta
    - name: keywords
      content: super duper SEO
---
```

```ts
type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

## 仅默认主题 {#default-theme-only}

以下 frontmatter 选项仅在使用默认主题时适用。

### layout

- 类型：`doc | home | page`
- 默认值：`doc`

指定页面的布局。

- `doc`——它将默认文档样式应用于 markdown 内容。
- `home`——“主页”的特殊布局。可以添加额外的选项，例如 `hero` 和 `features`，以快速创建漂亮的落地页。
- `page`——表现类似于 `doc`，但它不对内容应用任何样式。当想创建一个完全自定义的页面时很有用。

```yaml
---
layout: doc
---
```

### hero <Badge type="info" text="home page only" />

当 `layout` 设置为 `home` 时，定义主页 hero 部分的内容。更多详细信息：[默认主题：主页](./default-theme-home-page)。

### features <Badge type="info" text="home page only" />

定义当`layout` 设置为 `home` 时要在 features 部分中显示的项目。更多详细信息：[默认主题：主页](./default-theme-home-page)。

### navbar

- 类型：`boolean`
- 默认值：`true`

是否显示[导航栏](./default-theme-nav)。

```yaml
---
navbar: false
---
```

### sidebar

- 类型：`boolean`
- 默认值：`true`

是否显示 [侧边栏](./default-theme-sidebar).

```yaml
---
sidebar: false
---
```

### aside

- 类型：`boolean | 'left'`
- 默认值：`true`

定义侧边栏组件在 `doc` 布局中的位置。

将此值设置为 `false` 可禁用侧边栏容器。\
将此值设置为 `true` 会将侧边栏渲染到右侧。\
将此值设置为 `left` 会将侧边栏渲染到左侧。

```yaml
---
aside: false
---
```

### outline

- 类型：`number | [number, number] | 'deep' | false`
- 默认值：`2`

大纲中显示的标题级别。它与 [config.themeConfig.outline.level](./default-theme-config#outline) 相同，它会覆盖站点级的配置。

### lastUpdated

- 类型：`boolean | Date`
- 默认值：`true`

是否在当前页面的页脚中显示[最后更新时间](./default-theme-last-updated)的文本。如果指定了日期时间，则会显示该日期时间而不是上次 git 修改的时间戳。

```yaml
---
lastUpdated: false
---
```

### editLink

- 类型：`boolean`
- 默认值：`true`

是否在当前页的页脚显示[编辑链接](./default-theme-edit-link)。

```yaml
---
editLink: false
---
```

### footer

- 类型：`boolean`
- 默认值：`true`

是否显示[页脚](./default-theme-footer)。

```yaml
---
footer: false
---
```

### pageClass

- 类型：`string`

将额外的类名称添加到特定页面。

```yaml
---
pageClass: custom-page-class
---
```

然后可以在 `.vitepress/theme/custom.css` 文件中自定义该特定页面的样式：

```css
.custom-page-class {
  /* 特定页面的样式 */
}
```
