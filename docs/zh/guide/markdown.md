# Markdown 扩展 {#markdown-extensions}

VitePress 带有内置的 Markdown 扩展。

## 标题锚点 {#header-anchors}

标题会自动获取锚点链接。可以通过 `markdown.anchor` 选项配置锚点的渲染。

## 链接 {#links}

内部链接和外部链接都会特殊处理。

### 内部链接 {#internal-links}

内部链接转换为 SPA 导航的路由链接。此外，每个子目录中包含的每个 `index.md` 都会自动转换为 `index.html`，并带有相应的URL `/`。

举个例子，现在有以下目录结构：

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

在 `foo/one.md` 中:

```md
[Home](/) <!-- 点击跳转到根目录的 index.md -->
[foo](/foo/) <!-- 点击跳转到 foo 目录的 index.html -->
[foo heading](./#heading) <!-- 锚点会定位到 foo 的 heading 标题处 -->
[bar - three](../bar/three) <!-- 你可以不写后缀名 -->
[bar - three](../bar/three.md) <!-- 也可以加 .md -->
[bar - four](../bar/four.html) <!-- 或者加 .html -->
```

### 页面后缀 {#page-suffix}

默认情况下，页面和内部链接会生成带有 `.html` 的后缀。

### 外部链接 {#external-links}

外部的链接会自动识别并生成 `target="_blank" rel="noreferrer"` 的链接，如下：

- [vuejs.org](https://vuejs.org)
- [VitePress github 地址](https://github.com/vuejs/vitepress)

## Frontmatter

[YAML frontmatter](https://jekyllrb.com/docs/front-matter/) 支持开箱即用：

```yaml
---
title: Blogging Like a Hacker
lang: en-US
---
```

该数据可用于页面的其他部分，以及所有自定义和主题化组件中。

了解更多，可以查看 [Frontmatter](./frontmatter)。

## GitHub 风格的表格 {#github-style-tables}

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

## Emoji :tada: {#emoji}

**输入**

```
:tada: :100:
```

**输出**

:tada: :100:

可用的 emoji 可以通过[这里](https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.json)了解。

## 表格内容 {#table-of-contents}

**输入**

```
[[toc]]
```

**输出**

[[toc]]

可以使用 `markdown.toc` 选项配置 TOC 的渲染。

## 自定义容器 {#custom-containers}

自定义容器可以通过其类型、标题和内容来定义。

### 默认标题 

**输入**

```md
::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::
```

**输出**

::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a dangerous warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::

### 自定义标题 {#custom-title}

你可以通过在容器的“类型”后面添加文本来设置自定义标题。

**输入**

````md
::: danger STOP
Danger zone, do not proceed
:::

::: details Click me to view the code
```js
console.log('Hello, VitePress!')
```
:::
````

**输出**

::: danger STOP
Danger zone, do not proceed
:::

::: details Click me to view the code
```js
console.log('Hello, VitePress!')
```
:::

### `raw` {#raw}

这是一个特殊的容器，可以用来防止样式和路由与 VitePress 冲突。当你记录组件库的文档时，这尤其有用。你可能还想查看一下 [whyframe](https://whyframe.dev/docs/integrations/vitepress)，以获得更好的隔离效果。

**语法**

```md
::: raw
Wraps in a <div class="vp-raw">
:::
```

`vp-raw` 类也可以直接用于元素，样式隔离目前是可选择的。

::: details 具体细节

- Install required deps with your preferred package manager:

  ```sh
  $ npm install -D postcss postcss-prefix-selector
  ```

- Create a file named `docs/.postcssrc.cjs` and add this to it:

  ```js
  module.exports = {
    plugins: {
      'postcss-prefix-selector': {
        prefix: ':not(:where(.vp-raw *))',
        includeFiles: [/vp-doc\.css/],
        transform(prefix, _selector) {
          const [selector, pseudo = ''] = _selector.split(/(:\S*)$/)
          return selector + prefix + pseudo
        }
      }
    }
  }
  ```

:::

## 在代码块中高亮语法 {#syntax-highlighting-in-code-blocks}

VitePress 使用 [Shiki](https://shiki.matsu.io/) 的彩色文本来突出 Markdown 代码块中的语言语法。Shiki 支持多种编程语言，需要做的就是将有效的语言别名附加到代码块的开头反引号后：

**输入**

````
```js
export default {
  name: 'MyComponent',
  // ...
}
```
````

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

```js
export default {
  name: 'MyComponent'
  // ...
}
```

```html
<ul>
  <li v-for="todo in todos" :key="todo.id">
    {{ todo.text }}
  </li>
</ul>
```

在 Shiki 的仓库里有对应支持的[语言列表](https://github.com/shikijs/shiki/blob/main/docs/languages.md)。

你还可以在应用全局配置中自定义语法高亮主题。有关详细信息，请参阅 [`markdown` 选项](../config/app-config#markdown)。

## 代码块中定义行高亮 {#line-highlighting-in-code-blocks}

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

除了单行之外，还可以指定多个单行、连续几行或者一起定义：

- 连续几行: 例如 `{5-8}`、`{3-10}`、`{10-17}`
- 多个单行: 例如 `{4,7,9}`
- 连续几行和多个单行: 例如 `{4,7-13,16,23-27,40}`

**输入**

````
```js{1,4,6-8}
export default { // Highlighted
  data () {
    return {
      msg: `Highlighted!
      This line isn't highlighted,
      but this and the next 2 are.`,
      motd: 'VitePress is awesome',
      lorem: 'ipsum'
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

另外，也可以通过使用 `// [!code hl]` 注释直接实现行高亮。

**输入**

````
```js
export default {
  data () {
    return {
      msg: 'Highlighted!' // [!code  hl]
    }
  }
}
```
````

**输出**

```js
export default {
  data () {
    return {
      msg: 'Highlighted!' // [!code hl]
    }
  }
}
```

## 在代码块中聚焦 {#focus-in-code-blocks}

在一行上添加 `// [!code focus]` 注释将聚焦这一行并模糊代码的其他部分。

此外，可以使用 `// [!code focus:<lines>]` 定义聚焦的行数。

**输入**

````
```js
export default {
  data () {
    return {
      msg: 'Focused!' // [!code  focus]
    }
  }
}
```
````

**输出**

```js
export default {
  data () {
    return {
      msg: 'Focused!' // [!code focus]
    }
  }
}
```

## 代码块中的颜色差异 {#colored-diffs-in-code-blocks}

在一行上添加 `// [!code --]` 或者 `// [!code ++]` 注释将实现该行差异的展示，同时保持代码块的颜色。

**输入**

````
```js
export default {
  data () {
    return {
      msg: 'Removed' // [!code  --]
      msg: 'Added' // [!code  ++]
    }
  }
}
```
````

**输出**

```js
export default {
  data () {
    return {
      msg: 'Removed' // [!code --]
      msg: 'Added' // [!code ++]
    }
  }
}
```

## 错误和警告

在一行上添加 `// [!code warning]` 或者 `// [!code error]` 注释将使它变成相应的颜色。

**输入**

````
```js
export default {
  data () {
    return {
      msg: 'Error', // [!code  error]
      msg: 'Warning' // [!code  warning]
    }
  }
}
```
````

**输出**

```js
export default {
  data () {
    return {
      msg: 'Error', // [!code error]
      msg: 'Warning' // [!code warning]
    }
  }
}
```

## 行号 {#line-numbers}

可以通过配置为每个代码块启用行号：

```js
export default {
  markdown: {
    lineNumbers: true
  }
}
```

可以通过 [`markdown` 选项](../config/app-config#markdown)了解更多。

## 导入代码片段 {#import-code-snippets}

你可以通过以下语法从现有文件中导入代码片段：

```md
<<< @/filepath
```

同时也支持[行高亮](#line-highlighting-in-code-blocks)：

```md
<<< @/filepath{highlightLines}
```

**输入**

```md
<<< @/snippets/snippet.js{2}
```

**代码文件**

<<< @/snippets/snippet.js

**输出**

<<< @/snippets/snippet.js{2}

::: tip
`@` 相当于项目指定的源目录。默认情况下，它是 VitePress 项目根目录，当然也可以通过 `srcDir` 配置项配置。
:::

你也可以使用 [VS Code region](https://code.visualstudio.com/docs/editor/codebasics#_folding) 来导入仅包含代码文件的部分。也可以在文件路径后的 `#` 后面提供自定义区域名称：

**输入**

```md
<<< @/snippets/snippet-with-region.js#snippet{1}
```

**代码文件**

<<< @/snippets/snippet-with-region.js

**输出**

<<< @/snippets/snippet-with-region.js#snippet{1}

你还可以在大括号 (`{}`) 中指定语言：

```md
<<< @/snippets/snippet.cs{c#}

<!-- 指定 行高亮: -->
<<< @/snippets/snippet.cs{1,2,4-6 c#}
```

这在无法从文件扩展名中推断出源语言会很有用。

You can also [import snippets](#import-code-snippets) in code groups:

**Input**

```md
::: code-group

<!-- filename is used as title by default -->

<<< @/snippets/snippet.js

<!-- you can provide a custom one too -->

<<< @/snippets/snippet-with-region.js#snippet{1,2 ts:line-numbers} [snippet with region]

:::
```

**Output**

::: code-group

<<< @/snippets/snippet.js

<<< @/snippets/snippet-with-region.js#snippet{1,2 ts:line-numbers} [snippet with region]

:::

## 包含其他 Markdown 文件 {#markdown-file-inclusion}

你可以通过下面的写法在 markdown 文件中引入其他的markdown 文件：

**输入**

```md
# Docs

## Basics

<!--@include: ./parts/basics.md-->
```

**Part 文件** (`parts/basics.md`)

```md
Some getting started stuff.

### Configuration

Can be created using `.foorc.json`.
```

**等同于以下代码**

```md
# Docs

## Basics

Some getting started stuff.

### Configuration

Can be created using `.foorc.json`.
```

::: warning 警告
注意，如果文件不存在，将不会抛出错误。因此，在使用此功能时，请确保按预期呈现内容。
:::

## 高级配置 {#advanced-configuration}

VitePress使用 [markdown-it](https://github.com/markdown-it/markdown-it) 作为Markdown 渲染器。上面的许多扩展是通过自定义插件实现的。你可以使用`vitepress/config.js`中的 `Markdown` 选项进一步自定义 `Markdown-It` 实例：

```js
const anchor = require('markdown-it-anchor')

module.exports = {
  markdown: {
    // options for markdown-it-anchor
    // https://github.com/valeriangalliat/markdown-it-anchor#usage
    anchor: {
      permalink: anchor.permalink.headerLink()
    },

    // options for @mdit-vue/plugin-toc
    // https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-toc#options
    toc: { level: [1, 2] },

    config: (md) => {
      // use more markdown-it plugins!
      md.use(require('markdown-it-xxx'))
    }
  }
}
```

通过[配置：应用全局配置](../config/app-config#markdown)查看可配置属性的完整列表。
