# frontmatter

## 用法 {#usage}

VitePress 支持在所有 Markdown 文件中使用 YAML frontmatter，并使用 [gray-matter](https://github.com/jonschlinkert/gray-matter) 解析。frontmatter 必须位于 Markdown 文件的顶部 (在任何元素之前，包括 `<script>` 标签)，并且需要在三条虚线之间采用有效的 YAML 格式。例如：

```md
---
title: Docs with VitePress
editLink: true
---
```

许多站点或默认主题配置选项在 frontmatter 中都有相应的选项。可以使用 frontmatter 来覆盖当前页面的特定行为。详细信息请参见 [frontmatter 配置参考](../reference/frontmatter-config)。

还可以定义自己的 frontmatter 数据，以在页面上的动态 Vue 表达式中使用。

## 访问 frontmatter 数据 {#accessing-frontmatter-data}

frontmatter 数据可以通过特殊的 `$frontmatter` 全局变量来访问：

下面的例子展示了应该如何在 Markdown 文件中使用它：

```md
---
title: Docs with VitePress
editLink: true
---

# {{ $frontmatter.title }}

Guide content
```

还可以使用 [`useData()`](../reference/runtime-api#usedata) 辅助函数在 `<script setup>` 中访问当前页面的 frontmatter。

## 其他 frontmatter 格式 {#alternative-frontmatter-formats}

VitePress 也支持 JSON 格式的 frontmatter，以花括号开始和结束：

```json
---
{
  "title": "Blogging Like a Hacker",
  "editLink": true
}
---
```
