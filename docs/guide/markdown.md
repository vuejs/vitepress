# Markdown Extensions

VitePress comes with built in Markdown Extensions.

## Header Anchors

Headers automatically get anchor links applied. Rendering of anchors can be configured using the `markdown.anchor` option.

## Links

Both internal and external links gets special treatments.

### Internal Links

Internal links are converted to router link for SPA navigation. Also, every `index.md` contained in each sub-directory will automatically be converted to `index.html`, with corresponding URL `/`.

For example, given the following directory structure:

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

And providing you are in `foo/one.md`:

```md
[Home](/) <!-- sends the user to the root index.md -->
[foo](/foo/) <!-- sends the user to index.html of directory foo -->
[foo heading](./#heading) <!-- anchors user to a heading in the foo index file -->
[bar - three](../bar/three) <!-- you can omit extension -->
[bar - three](../bar/three.md) <!-- you can append .md -->
[bar - four](../bar/four.html) <!-- or you can append .html -->
```

### Page Suffix

Pages and internal links get generated with the `.html` suffix by default.

### External Links

Outbound links automatically get `target="_blank" rel="noreferrer"`:

- [vuejs.org](https://vuejs.org)
- [VitePress on GitHub](https://github.com/vuejs/vitepress)

## Frontmatter

[YAML frontmatter](https://jekyllrb.com/docs/front-matter/) is supported out of the box:

```yaml
---
title: Blogging Like a Hacker
lang: en-US
---
```

This data will be available to the rest of the page, along with all custom and theming components.

For more details, see [Frontmatter](./frontmatter).

## GitHub-Style Tables

**Input**

```
| Tables        |      Are      |  Cool |
| ------------- | :-----------: | ----: |
| col 3 is      | right-aligned | $1600 |
| col 2 is      |   centered    |   $12 |
| zebra stripes |   are neat    |    $1 |
```

**Output**

| Tables        |      Are      |   Cool |
| ------------- | :-----------: | -----: |
| col 3 is      | right-aligned | \$1600 |
| col 2 is      |   centered    |   \$12 |
| zebra stripes |   are neat    |    \$1 |

## Emoji :tada:

**Input**

```
:tada: :100:
```

**Output**

:tada: :100:

A [list of all emojis](https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.json) is available.

## Table of Contents

**Input**

```
[[toc]]
```

**Output**

[[toc]]

Rendering of the TOC can be configured using the `markdown.toc` option.

## Custom Containers

Custom containers can be defined by their types, titles, and contents.

### Default Title

**Input**

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

**Output**

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

### Custom Title

You may set custom title by appending the text right after the "type" of the container.

**Input**

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

**Output**

::: danger STOP
Danger zone, do not proceed
:::

::: details Click me to view the code
```js
console.log('Hello, VitePress!')
```
:::

### `raw`

This is a special container that can be used to prevent style and router conflicts with VitePress. This is especially useful when you're documenting component libraries. You might also wanna check out [whyframe](https://whyframe.dev/docs/integrations/vitepress) for better isolation.

**Syntax**

```md
::: raw
Wraps in a <div class="vp-raw">
:::
```

`vp-raw` class can be directly used on elements too. Style isolation is currently opt-in:

::: details

- Install required deps with your preferred package manager:

  ```sh
  $ yarn add -D postcss postcss-prefix-selector
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

## Syntax Highlighting in Code Blocks

VitePress uses [Shiki](https://shiki.matsu.io/) to highlight language syntax in Markdown code blocks, using coloured text. Shiki supports a wide variety of programming languages. All you need to do is append a valid language alias to the beginning backticks for the code block:

**Input**

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

**Output**

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

A [list of valid languages](https://github.com/shikijs/shiki/blob/main/docs/languages.md) is available on Shiki's repository.

You may also customize syntax highlight theme in app config. Please see [`markdown` options](../config/app-configs#markdown) for more details.

## Line Highlighting in Code Blocks

**Input**

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

**Output**

```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

In addition to a single line, you can also specify multiple single lines, ranges, or both:

- Line ranges: for example `{5-8}`, `{3-10}`, `{10-17}`
- Multiple single lines: for example `{4,7,9}`
- Line ranges and single lines: for example `{4,7-13,16,23-27,40}`

**Input**

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

**Output**

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

Alternatively, it's possible to highlight directly in the line by using the `// [!code hl]` comment.

**Input**

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

**Output**

```js
export default {
  data () {
    return {
      msg: 'Highlighted!' // [!code hl]
    }
  }
}
```

## Focus in Code Blocks

Adding the `// [!code focus]` comment on a line will focus it and blur the other parts of the code. 

Additionally, you can define a number of lines to focus using `// [!code focus:<lines>]`.

**Input**

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

**Output**

```js
export default {
  data () {
    return {
      msg: 'Focused!' // [!code focus]
    }
  }
}
```

## Colored diffs in Code Blocks

Adding the `// [!code --]` or `// [!code ++]` comments on a line will create a diff of that line, while keeping the colors of the codeblock. 

**Input**

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

**Output**

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

## Errors and warnings

Adding the `// [!code warning]` or `// [!code error]` comments on a line will color it accordingly.

**Input**

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

**Output**

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


## Line Numbers

You can enable line numbers for each code blocks via config:

```js
export default {
  markdown: {
    lineNumbers: true
  }
}
```

Please see [`markdown` options](../config/app-configs#markdown) for more details.

## Import Code Snippets

You can import code snippets from existing files via following syntax:

```md
<<< @/filepath
```

It also supports [line highlighting](#line-highlighting-in-code-blocks):

```md
<<< @/filepath{highlightLines}
```

**Input**

```md
<<< @/snippets/snippet.js{2}
```

**Code file**

<<< @/snippets/snippet.js

**Output**

<<< @/snippets/snippet.js{2}

::: tip
The value of `@` corresponds to the source root. By default it's the VitePress project root, unless `srcDir` is configured.
:::

You can also use a [VS Code region](https://code.visualstudio.com/docs/editor/codebasics#_folding) to only include the corresponding part of the code file. You can provide a custom region name after a `#` following the filepath:

**Input**

```md
<<< @/snippets/snippet-with-region.js#snippet{1}
```

**Code file**

<<< @/snippets/snippet-with-region.js

**Output**

<<< @/snippets/snippet-with-region.js#snippet{1}

You can also specify the language inside the braces (`{}`) like this:

```md
<<< @/snippets/snippet.cs{c#}

<!-- with line highlighting: -->
<<< @/snippets/snippet.cs{1,2,4-6 c#}
```

This is helpful if source language cannot be inferred from your file extension.

## Markdown File Inclusion

You can include a markdown file in another markdown file like this:

**Input**

```md
# Docs

## Basics

<!--@include: ./parts/basics.md-->
```

**Part file** (`parts/basics.md`)

```md
Some getting started stuff.

### Configuration

Can be created using `.foorc.json`.
```

**Equivalent code**

```md
# Docs

## Basics

Some getting started stuff.

### Configuration

Can be created using `.foorc.json`.
```

::: warning
Note that this does not throw errors if your file is not present. Hence, when using this feature make sure that the contents are being rendered as expected.
:::

## Advanced Configuration

VitePress uses [markdown-it](https://github.com/markdown-it/markdown-it) as the Markdown renderer. A lot of the extensions above are implemented via custom plugins. You can further customize the `markdown-it` instance using the `markdown` option in `.vitepress/config.js`:

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

See full list of configurable properties in [Configs: App Configs](../config/app-configs#markdown).
