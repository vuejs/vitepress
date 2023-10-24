# Markdown 扩展 {#markdown-extensions}

VitePress 带有内置的 Markdown 扩展。

## 标题锚点 {#header-anchors}

标题会自动应用锚点。可以使用 `markdown.anchor` 选项配置锚点的渲染。

### 自定义锚点 {#custom-anchors}

要为标题指定自定义锚标记，而不是使用自动生成的锚标记，请在标题中添加后缀：

```
# Using custom anchors {#my-anchor}
```

这允许你链接到标题 `#my-anchor` 而不是默认的 `#using-custom-anchors`。

## 链接 {#links}

内部和外部链接都会被特殊处理。

### 内部链接 {#internal-links}

内部链接将转换为单页导航的路由链接。此外，子目录中包含的每个 `index.md` 都会自动转换为 `index.html`，并带有相应的 URL `/`。

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

假设你现在处于 `foo/one.md` 文件中：

```md
[Home](/) <!-- sends the user to the root index.md -->
[foo](/foo/) <!-- sends the user to index.html of directory foo -->
[foo heading](./#heading) <!-- anchors user to a heading in the foo index file -->
[bar - three](../bar/three) <!-- you can omit extension -->
[bar - three](../bar/three.md) <!-- you can append .md -->
[bar - four](../bar/four.html) <!-- or you can append .html -->
```

### 页面后缀 {#page-suffix}

默认情况下，生成的页面和内部链接带有 `.html` 后缀。

### 外部链接 {#external-links}

外部链接带有 `target="_blank" rel="noreferrer"`：

- [vuejs.org](https://vuejs.org)
- [VitePress on GitHub](https://github.com/vuejs/vitepress)

## Frontmatter {#frontmatter}

[YAML 格式的 frontmatter](https://jekyllrb.com/docs/front-matter/) 开箱即用：

```yaml
---
title: Blogging Like a Hacker
lang: en-US
---
```

此数据将可用于页面的其余部分，以及所有自定义和主题组件。

更多信息，参见 [Frontmatter](../reference/frontmatter-config)。

## GitHub 风格的表格 {#github-style-tables}

**输入**

```
| Tables        |      Are      |  Cool |
| ------------- | :-----------: | ----: |
| col 3 is      | right-aligned | $1600 |
| col 2 is      |   centered    |   $12 |
| zebra stripes |   are neat    |    $1 |
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

这里你可以找到[所有支持的 emoji 列表](https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.json)。

## 目录表 (TOC) {#table-of-contents}

**输入**

```
[[toc]]
```

**输出**

[[toc]]

可以使用 `markdown.toc` 选项配置 TOC 的呈现效果。

## 自定义容器 {#custom-containers}

自定义容器可以通过它们的类型、标题和内容来定义。

### 默认标题 {#default-title}

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
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::

### 自定义标题 {#custom-title}

可以通过在容器的“类型”之后附加文本来设置自定义标题。

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

此外，你可以通过在站点配置中添加以下内容来全局设置自定义标题，如果不是用英语书写，这会很有帮助：

```ts
// config.ts
export default defineConfig({
	// ...
	markdown: {
		container: {
			tipLabel: '提示',
			warningLabel: '警告',
			dangerLabel: '危险',
			infoLabel: '信息',
			detailsLabel: '详细信息',
		},
	},
	// ...
})
```

### `raw`

这是一个特殊的容器，可以用来防止与 VitePress 的样式和路由冲突。这在记录组件库时特别有用。你可能还想查看 [whyframe](https://whyframe.dev/docs/integrations/vitepress) 以获得更好的隔离。

**语法**

```md
::: raw
Wraps in a <div class="vp-raw">
:::
```

`vp-raw` class 也可以直接用于元素。样式隔离目前是可选的：

- 使用你喜欢的包管理器来安装 `postcss`：

```sh
$ npm add -D postcss
```

- 创建 `docs/postcss.config.mjs` 并将以下内容

```js
import { postcssIsolateStyles } from 'vitepress'

export default {
	plugins: [postcssIsolateStyles()],
}
```

它在底层使用 [`postcss-prefix-selector`](https://github.com/postcss/postcss-load-config)。你可以像这样传递它的选项：

```js
postcssIsolateStyles({
	includeFiles: [/vp-doc\.css/], // 默认 /base\.css/
})
```

## 代码块中的语法高亮 {#syntax-highlighting-in-code-blocks}

VitePress 使用 [Shiki](https://shiki.matsu.io/) 在 Markdown 代码块中使用彩色文本实现语法高亮。Shiki 支持多种编程语言。你需要做的就是将有效的语言别名附加到代码块的开头：

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
	name: 'MyComponent',
	// ...
}
```

```html
<ul>
	<li v-for="todo in todos" :key="todo.id">{{ todo.text }}</li>
</ul>
```

在 Shiki 的代码仓库中，可以找到[合法的编程语言列表](https://github.com/shikijs/shiki/blob/main/docs/languages.md)。

还可以全局配置中自定义语法高亮主题。有关详细信息，参见 [`markdown` 选项](../reference/site-config#markdown)得到更多信息。

## 在代码块中实现行高亮 {#line-highlighting-in-code-blocks}

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

除了单行之外，还可以指定多个单行、多行，或两者均指定：

- 多行：例如 `{5-8}`、`{3-10}`、`{10-17}`
- 多个单行：例如 `{4,7,9}`
- 多行与单行：例如 `{4,7-13,16,23-27,40}`

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

也可以使用 `// [!code hl]` 注释实现行高亮。

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
	data() {
		return {
			msg: 'Highlighted!', // [!code hl]
		}
	},
}
```

## 代码块中聚焦 {#focus-in-code-blocks}

在某一行上添加 `// [!code focus]` 注释将聚焦它并模糊代码的其他部分。

此外，可以使用 `// [!code focus:<lines>]` 定义要聚焦的行数。

**输入**

`!code` 后面只需要一个空格，为了展示原始的代码而不被实际渲染，这里有两个空格：

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
	data() {
		return {
			msg: 'Focused!', // [!code focus]
		}
	},
}
```

## 代码块中的颜色差异 {#colored-diffs-in-code-blocks}

在某一行添加 `// [!code --]` 或 `// [!code ++]` 注释将会为该行创建 diff，同时保留代码块的颜色。

**输入**

`!code` 后面只需要一个空格，为了展示原始的代码而不被实际渲染，这里有两个空格。

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

## 高亮 “错误” 和 “警告” {#errors-and-warnings-in-code-blocks}

在某一行添加 `// [!code warning]` 或 `// [!code error]` 注释将会为该行相应的着色。

**输入**

`!code` 后面只需要一个空格，为了展示原始的代码而不被实际渲染，这里有两个空格。

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
	data() {
		return {
			msg: 'Error', // [!code error]
			msg: 'Warning', // [!code warning]
		}
	},
}
```

## 行号 {#line-numbers}

你可以通过以下配置为每个代码块启用行号：

```js
export default {
	markdown: {
		lineNumbers: true,
	},
}
```

查看 [`markdown` 选项](../reference/site-config#markdown) 获取更多信息。

你可以在你的代码块中添加 `:line-numbers` / `:no-line-numbers` 标记来覆盖在配置中的设置。

你还可以通过在 `:line-numbers` 之后添加 `=` 来自定义起始行号。例如， `:line-numbers=2` 表示代码块中的行号将从“2”开始。

**输入**

````md
```ts {1}
// line-numbers is disabled by default
const line2 = 'This is line 2'
const line3 = 'This is line 3'
```

```ts:line-numbers {1}
// line-numbers is enabled
const line2 = 'This is line 2'
const line3 = 'This is line 3'
```

```ts:line-numbers=2 {1}
// line-numbers is enabled and start from 2
const line3 = 'This is line 3'
const line4 = 'This is line 4'
```
````

**输出**

```ts {1}
// line-numbers is disabled by default
const line2 = 'This is line 2'
const line3 = 'This is line 3'
```

```ts:line-numbers {1}
// line-numbers is enabled
const line2 = 'This is line 2'
const line3 = 'This is line 3'
```

```ts:line-numbers=2 {1}
// line-numbers is enabled and start from 2
const line3 = 'This is line 3'
const line4 = 'This is line 4'
```

## 导入代码片段 {#import-code-snippets}

你可以通过下面的语法来从现有文件中导入代码片段：

```md
<<< @/filepath
```

此语法同时支持[行高亮](#line-highlighting-in-code-blocks)：

```md
<<< @/filepath{highlightLines}
```

**输入**

```md
<<< @/snippets/snippet.js{2}
```

**Code file**

<<< @/snippets/snippet.js

**输出**

<<< @/snippets/snippet.js{2}

::: tip
`@` 的值对应于源代码根目录，默认情况下是 VitePress 项目根目录，除非配置了 `srcDir`。或者，你也可以从相对路径导入：

```md
<<< ../snippets/snippet.js
```

:::

你也可以使用 [VS Code region](https://code.visualstudio.com/docs/editor/codebasics#_folding) 来只包含代码文件的相应部分。你可以在文件目录后面的 `#` 符号后提供一个自定义的区域名：

**输入**

```md
<<< @/snippets/snippet-with-region.js#snippet{1}
```

**Code file**

<<< @/snippets/snippet-with-region.js

**输出**

<<< @/snippets/snippet-with-region.js#snippet{1}

你也可以像这样在大括号内(`{}`)指定语言：

```md
<<< @/snippets/snippet.cs{c#}

<!-- with line highlighting: -->

<<< @/snippets/snippet.cs{1,2,4-6 c#}

<!-- with line numbers: -->

<<< @/snippets/snippet.cs{1,2,4-6 c#:line-numbers}
```

如果无法从文件拓展名推测出源语言，这将会很有帮助

## 代码组 {#code-groups}

你可以像这样对多个代码块进行分组：

**输入**

````md
::: code-group

```js [config.js]
/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
	// ...
}

export default config
```

```ts [config.ts]
import type { UserConfig } from 'vitepress'

const config: UserConfig = {
	// ...
}

export default config
```

:::
````

**输出**

::: code-group

```js [config.js]
/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
	// ...
}

export default config
```

```ts [config.ts]
import type { UserConfig } from 'vitepress'

const config: UserConfig = {
	// ...
}

export default config
```

:::

你也可以在代码组中[导入代码片段](#import-code-snippets)：

**输入**

```md
::: code-group

<!-- filename is used as title by default -->

<<< @/snippets/snippet.js

<!-- you can provide a custom one too -->

<<< @/snippets/snippet-with-region.js#snippet{1,2 ts:line-numbers} [snippet with region]

:::
```

**输出**

::: code-group

<<< @/snippets/snippet.js

<<< @/snippets/snippet-with-region.js#snippet{1,2 ts:line-numbers} [snippet with region]

:::

## 包含 markdown 文件 {#markdown-file-inclusion}

你可以在一个 markdown 文件中包含另一个 markdown 文件，甚至嵌套：

::: tip 提示
你还可以在 markdown 路径前加上 `@` 前缀，它将充当源根目录。默认情况下它是 VitePress 项目根目录，除非配置了 `srcDir`。
:::

例如，你可以使用以下方式包含一个相对路径的 markdown 文件：

**输入**

```md
# Docs {#docs}

## Basics {#basics}

<!-- @include: ./parts/basics.md -->
```

**另一个文件** (`parts/basics.md`)

```md
Some getting started stuff.

### Configuration {#configuration}

可以使用 `.foorc.json` 创建。
```

**等价代码**

```md
# Docs {#docs}

## Basics {#basics}

Some getting started stuff.

### Configuration {#configuration}

可以使用 `.foorc.json` 创建。
```

它还支持选择行范围：

**输入**

```md
# Docs {#docs}

## Basics {#basics}

<!--@include: ./parts/basics.md{3,}-->
```

**另一个文件** (`parts/basics.md`)

```md
Some getting started stuff.

### Configuration {#configuration}

可以使用 `.foorc.json` 创建。
```

**等价代码**

```md
# Docs {#docs}

## Basics {#basics}

### Configuration {#configuration}

可以使用 `.foorc.json` 创建。
```

所选行范围的格式可以是： `{3,}`, `{,10}`, `{1,10}`

::: warning 警告
注意！如果你指定的文件不存在，这将不会产生错误。因此，在使用这个功能的时候请保证内容按预期呈现。
:::

## Math Equations

This is currently opt-in. 要启用它, 你需要安装 `markdown-it-mathjax3`，在配置文件中设置`markdown.math` 为 `true`：

```sh
npm add -D markdown-it-mathjax3
```

```ts
// .vitepress/config.ts
export default {
	markdown: {
		math: true,
	},
}
```

**输入**

```md
当 $a \ne 0$, $(ax^2 + bx + c = 0)$ 有两个解，它们是
$$ x = {-b \pm \sqrt{b^2-4ac} \over 2a} $$

**Maxwell's 方程组:**
| 方程 | 描述 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| $\nabla \cdot \vec{\mathbf{B}}  = 0$ | divergence of $\vec{\mathbf{B}}$ is zero |
| $\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t}  = \vec{\mathbf{0}}$ | curl of $\vec{\mathbf{E}}$ is proportional to the rate of change of $\vec{\mathbf{B}}$ |
| $\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} = 4 \pi \rho$ | _wha?_ |
```

**输出**

当 $a \ne 0$, $(ax^2 + bx + c = 0)$ 有两个解，它们是
$$ x = {-b \pm \sqrt{b^2-4ac} \over 2a} $$

**Maxwell's 方程组:**

| 方程                                                                                                                                                                      | 描述                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| $\nabla \cdot \vec{\mathbf{B}}  = 0$                                                                                                                                      | divergence of $\vec{\mathbf{B}}$ is zero                                               |
| $\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t}  = \vec{\mathbf{0}}$                                                          | curl of $\vec{\mathbf{E}}$ is proportional to the rate of change of $\vec{\mathbf{B}}$ |
| $\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} = 4 \pi \rho$ | _wha?_                                                                                 |

## 高级配置 {#advanced-configuration}

VitePress 使用 [markdown-it](https://github.com/markdown-it/markdown-it) 作为 Markdown 渲染器。上面提到的很多拓展功能都是通过自定义插件实现的。你可以使用 `.vitepress/config.js` 中的 `markdown` 选项来进一步自定义 `markdown-it` 实例。

```js
import markdownItAnchor from 'markdown-it-anchor'
import markdownItFoo from 'markdown-it-foo'

module.exports = {
	markdown: {
		// options for markdown-it-anchor
		// https://github.com/valeriangalliat/markdown-it-anchor#usage
		anchor: {
			permalink: markdownItAnchor.permalink.headerLink(),
		},

		// options for @mdit-vue/plugin-toc
		// https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-toc#options
		toc: { level: [1, 2] },

		config: (md) => {
			// 使用更多 markdown-it 插件
			md.use(markdownItFoo)
		},
	},
}
```

请查看[配置参考：站点配置](../reference/site-config#markdown)来获取完整的可配置属性列表。
