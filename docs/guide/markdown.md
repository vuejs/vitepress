---
sidebarDepth: 3
---

# Markdown Extensions

## Header Anchors

Headers automatically get anchor links applied. Rendering of anchors can be configured using the `markdown.anchor` option.

## Links

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
[bar - three](../bar/three) <!-- you can omit extention -->
[bar - three](../bar/three.md) <!-- you can append .md -->
[bar - four](../bar/four.html) <!-- or you can append .html -->
```

### Page Suffix

Pages and internal links get generated with the `.html` suffix by default.

### External Links

Outbound links automatically get `target="_blank" rel="noopener noreferrer"`:

- [vuejs.org](https://vuejs.org)
- [VitePress on GitHub](https://github.com/vuejs/vitepress)

## Frontmatter

[YAML frontmatter](https://jekyllrb.com/docs/frontmatter/) is supported out of the box:

```yaml
---
title: Blogging Like a Hacker
lang: en-US
---

```

This data will be available to the rest of the page, along with all custom and theming components.

For more details, see [Frontmatter](./frontmatter.md).

## GitHub-Style Tables

**Input**

```
| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |
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
::: tip
This is a tip
:::

::: warning
This is a warning
:::

::: danger
This is a dangerous warning
:::
```

**Output**

::: tip
This is a tip
:::

::: warning
This is a warning
:::

::: danger
This is a dangerous warning
:::

### Custom Title

**Input**

```md
::: danger STOP
Danger zone, do not proceed
:::
```

**Output**

::: danger STOP
Danger zone, do not proceed
:::

## Syntax Highlighting in Code Blocks

VitePress uses [Prism](https://prismjs.com/) to highlight language syntax in Markdown code blocks, using coloured text. Prism supports a wide variety of programming languages. All you need to do is append a valid language alias to the beginning backticks for the code block:

**Input**

````
```js
export default {
  name: 'MyComponent',
  // ...
}
```
````

**Output**

```js
export default {
  name: 'MyComponent'
  // ...
}
```

**Input**

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

```html
<ul>
  <li v-for="todo in todos" :key="todo.id">{{ todo.text }}</li>
</ul>
```

A [list of valid languages](https://prismjs.com/#languages-list) is available on Prism’s site.

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

## Line Numbers

You can enable line numbers for each code blocks via config:

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

<!--lint disable strong-marker-->

<<< @/snippets/snippet.js

<!--lint enable strong-marker-->

**Output**

<!--lint disable strong-marker-->

<<< @/snippets/snippet.js{2}

<!--lint enable strong-marker-->

::: tip
The value of `@` corresponds to the source root. By default it's the VitePress project root, unless `srcDir` is configured.
:::

You can also use a [VS Code region](https://code.visualstudio.com/docs/editor/codebasics#_folding) to only include the corresponding part of the code file. You can provide a custom region name after a `#` following the filepath (`snippet` by default):

**Input**

```md
<<< @/snippets/snippet-with-region.js{1}
```

**Code file**

<!--lint disable strong-marker-->

<<< @/snippets/snippet-with-region.js

<!--lint enable strong-marker-->

**Output**

<!--lint disable strong-marker-->

<<< @/snippets/snippet-with-region.js#snippet{1}

<!--lint enable strong-marker-->

## Advanced Configuration

VitePress uses [markdown-it](https://github.com/markdown-it/markdown-it) as the Markdown renderer. A lot of the extensions above are implemented via custom plugins. You can further customize the `markdown-it` instance using the `markdown` option in `.vitepress/config.js`:

```js
module.exports = {
  markdown: {
    // options for markdown-it-anchor
    anchor: { permalink: false },

    // options for markdown-it-toc
    toc: { includeLevel: [1, 2] },

    config: (md) => {
      // use more markdown-it plugins!
      md.use(require('markdown-it-xxx'))
    }
  }
}
```
