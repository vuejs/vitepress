---
sidebarDepth: 3
---

# Markdown 扩展

## 头部锚点

头部自动生成锚点，锚点的渲染可以通过`markdown.anchor`配置。

## 链接

### 内部链接

内部链接转换为路由链接，以便SPA导航。同时，每个子目录中的`index.md`都会自动转换为`index.html`，对应的URL为`/`。

例如，给定以下目录结构：

```
.
├─ index.md
├─ foo
│  ├─ index.md
│  ├─ one.md
│  └─ two.md
└─ bar
   ├─ index.md
   ├─ three.md
   └─ four.md
```

如果你在`foo/one.md`：

```md
[Home](/) <!-- sends the user to the root index.md -->
[foo](/foo/) <!-- sends the user to index.html of directory foo -->
[foo heading](./#heading) <!-- anchors user to a heading in the foo index file -->
[bar - three](../bar/three) <!-- you can omit extention -->
[bar - three](../bar/three.md) <!-- you can append .md -->
[bar - four](../bar/four.html) <!-- or you can append .html -->
```

### 页面后缀

默认情况下，页面和内部链接会默认以`.html`后缀生成。

### 外部链接

外部链接会自动获得`target="_blank" rel="noopener noreferrer"`：

- [vuejs.org](https://vuejs.org)
- [VitePress on GitHub](https://github.com/vuejs/vitepress)

## 页面配置

[YAML frontmatter](https://jekyllrb.com/docs/frontmatter/) is supported out of the box:
[YAML frontmatter](https://jekyllrb.com/docs/frontmatter/)是默认支持的。

```yaml
---
title: Blogging Like a Hacker
lang: en-US
---
```

这些数据将会在页面的其他部分和主题组件中可用。

更多细节，请参阅[Frontmatter](./frontmatter.md)。

## GitHub风格表格

**输入**

```
| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |
```

**输出**

| Tables        |      Are      |   Cool |
| ------------- | :-----------: | -----: |
| col 3 is      | right-aligned | \$1600 |
| col 2 is      |   centered    |   \$12 |
| zebra stripes |   are neat    |    \$1 |

## Emoji :tada:

**输入**

```
:tada: :100:
```

**输出**

:tada: :100:

可用的[所有表情符号](https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.json)

## 目录

**输入**

```
[[toc]]
```

**输出**

[[toc]]

目录的渲染可以通过`markdown.toc`配置。

## 定制容器

定制容器可以通过其类型、标题和内容来定义。

### 默认标题

**输入**

```md
::: tip
This is a tip
:::

::: info
This is an info box
:::

::: warning
This is a warning
:::

::: danger
This is a dangerous warning
:::
```

**输出**

::: tip
This is a tip
:::

::: info
This is an info box
:::

::: warning
This is a warning
:::

::: danger
This is a dangerous warning
:::

### 自定义标题

**输入**

```md
::: danger STOP
Danger zone, do not proceed
:::
```

**输出**

::: danger STOP
Danger zone, do not proceed
:::

## 代码块语法高亮

VitePress使用[Prism](https://prismjs.com/)来高亮Markdown代码块中的语法，使用彩色文本。Prism支持许多程序语言。你只需要在代码块的开头添加有效的语言别名即可。

**输入**

````
```js
export default {
  name: 'MyComponent',
  // ...
}
```
````

**输出**

```js
export default {
  name: 'MyComponent'
  // ...
}
```

**输入**

````
```html
<ul>
  <li v-for="todo in todos" :key="todo.id">
    {{ todo.text }}
  </li>
</ul>
```
````

**输出**

```html
<ul>
  <li v-for="todo in todos" :key="todo.id">{{ todo.text }}</li>
</ul>
```

Prism上有一个有效[多种语言的列表](https://prismjs.com/#languages-list)

## 代码块行高亮

**输入**

````
```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```
````

**输出**

```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

除了单行，你还可以指定多行、范围或者两者。

- 范围：例如`{5-8}`，`{3-10}`，`{10-17}`
- 多个单行：例如`{4,7,9}`
- 范围和单行：例如`{4,7-13,16,23-27,40}`

**输入**

````
```js{1,4,6-7}
export default { // Highlighted
  data () {
    return {
      msg: `Highlighted!
      This line isn't highlighted,
      but this and the next 2 are.`,
      motd: 'VitePress is awesome',
      lorem: 'ipsum',
    }
  }
}
```
````

**输出**

```js{1,4,6-8}
export default { // Highlighted
  data () {
    return {
      msg: `Highlighted!
      This line isn't highlighted,
      but this and the next 2 are.`,
      motd: 'VitePress is awesome',
      lorem: 'ipsum',
    }
  }
}
```

## 行号

你可以通过配置来启用每个代码块的行号：

```js
module.exports = {
  markdown: {
    lineNumbers: true
  }
}
```

- Demo:

<picture>
  <source srcset="../images/line-numbers-mobile.gif" media="(max-width: 719px)">
  <img class="line-numbers-mobile-snap" src="../images/line-numbers-mobile.gif" alt="Image">
</picture>

<picture>
  <source srcset="../images/line-numbers-desktop.png" media="(min-width: 720px)">
  <img class="line-numbers-desktop-snap" src="../images/line-numbers-desktop.png" alt="Image">
</picture>

<style>
  .line-numbers-mobile-snap {
    margin: 0 -1.5rem;
    width: 100vw;
    max-width: none !important;
  }

  .line-numbers-desktop-snap {
    display: none;
  }

  @media (min-width:  720px) {
    .line-numbers-mobile-snap {
       display: none;
    }

    .line-numbers-desktop-snap {
      display: block;
    }
  }
</style>

## 导入代码片段

你可以通过以下语法来导入代码片段：

```md
<<< @/filepath
```

它也支持[行高亮](#line-highlighting-in-code-blocks)

```md
<<< @/filepath{highlightLines}
```

**输入**

```md
<<< @/snippets/snippet.js{2}
```

**代码文件**

<!--lint disable strong-marker-->

<<< @/snippets/snippet.js

<!--lint enable strong-marker-->

**输出**

<!--lint disable strong-marker-->

<<< @/snippets/snippet.js{2}

<!--lint enable strong-marker-->

::: tip
`@`的值对应于根路径。默认情况下是VitePress项目根路径，除非配置了`srcDir`。
:::

你也可以使用[VS Code region](https://code.visualstudio.com/docs/editor/codebasics#_folding)来只包含对应的代码文件的部分。你可以在`#`后面提供一个自定义的region名称（默认是`snippet`）：

**输入**

```md
<<< @/snippets/snippet-with-region.js{1}
```

**代码文件**

<!--lint disable strong-marker-->

<<< @/snippets/snippet-with-region.js

<!--lint enable strong-marker-->

**输出**

<!--lint disable strong-marker-->

<<< @/snippets/snippet-with-region.js#snippet{1}

<!--lint enable strong-marker-->

## 高级配置选项

VitePress使用[markdown-it](https://github.com/markdown-it/markdown-it) 作为Markdown渲染器。大部分的扩展都是通过自定义插件实现的。你可以通过在`.vitepress/config.js`中的`markdown`选项来自定义`markdown-it`实例：

```js
const anchor = require('markdown-it-anchor')

module.exports = {
  markdown: {
    // options for markdown-it-anchor
    // https://github.com/valeriangalliat/markdown-it-anchor#permalinks
    anchor: {
      permalink: anchor.permalink.headerLink()
    },

    // options for markdown-it-table-of-contents
    toc: { includeLevel: [1, 2] },

    config: (md) => {
      // use more markdown-it plugins!
      md.use(require('markdown-it-xxx'))
    }
  }
}
```
