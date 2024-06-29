# Markdown Extensions

## Links

### Internal Links

- [home](/)
- [markdown-extensions](/markdown-extensions/)
- [heading](./#internal-links)
- [omit extension](./foo)
- [.md extension](./foo.md)
- [.html extension](./foo.html)

### External Links

[VitePress on GitHub](https://github.com/vuejs/vitepress)

## GitHub-Style Tables

| Tables        |      Are      |   Cool |
| ------------- | :-----------: | -----: |
| col 3 is      | right-aligned | \$1600 |
| col 2 is      |   centered    |   \$12 |
| zebra stripes |   are neat    |    \$1 |

## Emoji

- :tada:
- :100:

## Table of Contents

[[toc]]

## Custom Containers

### Default Title

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

::: danger STOP
Danger zone, do not proceed
:::

::: details Click me to view the code
```js
console.log('Hello, VitePress!')
```
:::

## Line Highlighting in Code Blocks

### Single Line

```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

### Multiple single lines, ranges

```js{1,4,6-8}
export default {
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

### Comment Highlight

```js
export default { // [!code focus]
  data() { // [!code hl]
    return {
      msg: 'Removed' // [!code --]
      msg: 'Added' // [!code ++]
      msg: 'Error', // [!code error]
      msg: 'Warning' // [!code warning]
    }
  }
}
```

## Line Numbers

```ts:line-numbers
const line1 = 'This is line 1'
const line2 = 'This is line 2'
```

## Import Code Snippets

### Basic Code Snippet

<<< @/markdown-extensions/foo.md

### Specify Region

<<< @/markdown-extensions/foo.md#snippet

### With Other Features

<<< @/markdown-extensions/foo.md#snippet{1 ts:line-numbers} [snippet with region]

## Code Groups

### Basic Code Group

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

### With Other Features

::: code-group

<<< @/markdown-extensions/foo.md

<<< @/markdown-extensions/foo.md#snippet{1 ts:line-numbers} [snippet with region]

:::

## Markdown File Inclusion

<!--@include: ./foo.md-->

## Markdown At File Inclusion

<!--@include: @/markdown-extensions/bar.md-->

## Markdown Nested File Inclusion

<!--@include: ./nested-include.md-->

## Markdown File Inclusion with Range

<!--@include: ./foo.md{6,8}-->

## Markdown File Inclusion with Range without Start

<!--@include: ./foo.md{,8}-->

## Markdown File Inclusion with Range without End

<!--@include: ./foo.md{6,}-->

## Markdown At File Region Snippet

<!--@include: ./region-include.md#snippet-->

## Markdown At File Range Region Snippet

<!--@include: ./region-include.md#range-region{3,4}-->

## Markdown At File Range Region Snippet without start

<!--@include: ./region-include.md#range-region{,2}-->

## Markdown At File Range Region Snippet without end

<!--@include: ./region-include.md#range-region{5,}-->

## Image Lazy Loading

![vitepress logo](/vitepress.png)