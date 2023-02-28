# Frontmatter

任何包含 YAML frontmatter 的 Markdown 文件都将由 [gray-matter](https://github.com/jonschlinkert/gray-matter) 处理。 frontmatter 必须位于 Markdown 文件的顶部，并且必须采用在三点划线之间设置的有效 YAML 的形式。例如：

```md
---
title: Docs with VitePress
editLink: true
---
```

在三点虚线之间，你可以设置[预定义变量](../config/frontmatter-config)，甚至可以创建自己的自定义变量。 这些变量可以通过特殊的 <code>$frontmatter</code> 变量来使用。

这是如何在 Markdown 文件中使用的例子：

```md
---
title: Docs with VitePress
editLink: true
---

# {{ $frontmatter.title }}

Guide content
```

## Frontmatter 格式的其他写法 {#alternative-frontmatter-formats}

VitePress 还支持 JSON frontmatter 语法，以花括号开头和结尾：

```json
---
{
  "title": "Blogging Like a Hacker",
  "editLink": true
}
---
```
