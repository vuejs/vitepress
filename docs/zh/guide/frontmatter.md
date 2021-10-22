# 前言

任何包含了YAML前言块的Markdown文件都会被[gray-matter](https://github.com/jonschlinkert/gray-matter)处理。前言必须在Markdown文件的顶部，并且必须是有效的YAML集。例如：


```md
---
title: Docs with VitePress
editLink: true
---
```

在三杠线之间，你可以设置[预定义变量](#predefined-variables)，或者创建自己的变量。这些变量可以通过特殊的<code>$frontmatter</code>变量来使用。

这里是一如何在你的Markdown文件中使用它的例子：

```md
---
title: Docs with VitePress
editLink: true
---

# {{ $frontmatter.title }}

导读内容

```

## 可选的前言格式

VitePress也支持JSON前言格式，开始和结束在花括号中：

```json
---
{
  "title": "Blogging Like a Hacker",
  "editLink": true
}
---
```

## 可预定义的变量

### 题目

- Type: `string`
- Default: `h1_title || siteData.title`

当前页面的标题。

### 标题

- Type: `array`
- Default: `undefined`

指定要注入的额外的head标签：

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

### 导航栏

- Type: `boolean`
- Default: `undefined`

你可以在特定页面上禁用导航栏，使用`navbar: false`

### sidebar 侧边栏

- Type: `boolean|'auto'`
- Default: `undefined`

你可以在特定页面上决定显示侧边栏，使用`sidebar: auto`或者禁用它，使用`sidebar: false`

### editLink 编辑链接

- Type: `boolean`
- Default: `undefined`

定义这个页面是否包含编辑链接。
