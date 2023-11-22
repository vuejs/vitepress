# 构建时数据加载 {#build-time-data-loading}

VitePress 提供了一个叫做**数据加载器**的功能，它允许你加载任意数据并从页面或组件中导入它。数据加载**只在构建时**执行：最终的数据将被序列化为 JavaScript 包中的 JSON。

数据加载器可以被用于获取远程数据，也可以基于本地文件生成元数据。例如，你可以使用数据加载器来解析所有本地 API 页面并自动生成所有 API 入口的索引。

## 基本用法 {#basic-usage}

一个数据加载器文件必须以 `.data.js` 或 `.data.ts` 结尾。该文件应该提供一个默认导出的对象，该对象具有 `load()` 方法：

```js
// example.data.js
export default {
  load() {
    return {
      hello: 'world'
    }
  }
}
```

数据加载器模块只在 Node.js 中执行，因此你可以按需导入 Node API 和 npm 依赖。

然后，你可以在 `.md` 页面和 `.vue` 组件中使用 `data` 命名导出从该文件中导入数据：

```vue
<script setup>
import { data } from './example.data.js'
</script>

<pre>{{ data }}</pre>
```

输出：

```json
{
  "hello": "world"
}
```

你会注意到数据加载器本身并没有导出 `data`。这是因为 VitePress 在后台调用了 `load()` 方法，并通过名为 `data` 的命名导出隐式地暴露了结果。

即使 loader 是异步的，这也是有效的：

```js
export default {
  async load() {
    // fetch remote data
    return (await fetch('...')).json()
  }
}
```

## 使用本地文件生成数据 {#data-from-local-files}

当你需要基于本地文件生成数据时，你应该在数据加载器中使用 `watch` 选项，以便这些文件改动时可以触发热更新。

`watch` 选项也很方便，因为你可以使用 [glob 模式](https://github.com/mrmlnc/fast-glob#pattern-syntax) 匹配多个文件。模式可以相对于加载器文件本身，`load()` 函数将接收匹配文件的绝对路径。

下面的例子展示了如何使用 [csv-parse](https://github.com/adaltas/node-csv/tree/master/packages/csv-parse/) 加载 CSV 文件并将其转换为 JSON。因为此文件仅在构建时执行，因此不会将 CSV 解析器发送到客户端！

```js
import fs from 'node:fs'
import { parse } from 'csv-parse/sync'

export default {
  watch: ['./data/*.csv'],
  load(watchedFiles) {
    // watchedFiles will be an array of absolute paths of the matched files.
    // generate an array of blog post metadata that can be used to render
    // a list in the theme layout
    return watchedFiles.map((file) => {
      return parse(fs.readFileSync(file, 'utf-8'), {
        columns: true,
        skip_empty_lines: true
      })
    })
  }
}
```

## `createContentLoader`

当构建一个内容为主的网站时，我们经常需要创建一个“档案”或“索引”页面：一个我们可以列出内容中的所有可用条目的页面，例如博客文章或 API 页面。我们**可以**直接使用数据加载器 API 实现这一点，但由于这是一个常见的用例，VitePress 还提供了一个 `createContentLoader` 辅助函数来简化这个过程：

```js
// posts.data.js
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', /* options */)
```

该辅助函数接受一个相对于 [项目根目录](./routing#project-root) 的 glob 模式，并返回一个 `{ watch, load }` 数据加载器对象，该对象可以用作数据加载器文件中的默认导出。它还基于文件修改时间戳实现了缓存以提高开发性能。

请注意，加载器仅适用于 Markdown 文件 - 匹配的非 Markdown 文件将被跳过。

加载的数据将是一个类型为 `ContentData[]` 数组：

```ts
interface ContentData {
  // mapped URL for the page. e.g. /posts/hello.html (does not include base)
  // manually iterate or use custom `transform` to normalize the paths
  url: string
  // frontmatter data of the page
  frontmatter: Record<string, any>

  // the following are only present if relevant options are enabled
  // we will discuss them below
  src: string | undefined
  html: string | undefined
  excerpt: string | undefined
}
```

默认情况下只提供 `url` 和 `frontmatter`。这是因为加载的数据将作为 JSON 内联在客户端包中，我们需要谨慎考虑其大小。下面的例子展示了如何使用数据构建最小博客索引页面：

```vue
<script setup>
import { data as posts } from './posts.data.js'
</script>

<template>
  <h1>All Blog Posts</h1>
  <ul>
    <li v-for="post of posts">
      <a :href="post.url">{{ post.frontmatter.title }}</a>
      <span>by {{ post.frontmatter.author }}</span>
    </li>
  </ul>
</template>
```

### Options {#options}

默认数据可能不适合所有需求 - 你可以选择使用选项转换数据：

```js
// posts.data.js
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', {
  includeSrc: true, // include raw markdown source?
  render: true,     // include rendered full page HTML?
  excerpt: true,    // include excerpt?
  transform(rawData) {
    // map, sort, or filter the raw data as you wish.
    // the final result is what will be shipped to the client.
    return rawData.sort((a, b) => {
      return +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date)
    }).map((page) => {
      page.src     // raw markdown source
      page.html    // rendered full page HTML
      page.excerpt // rendered excerpt HTML (content above first `---`)
      return {/* ... */}
    })
  }
})
```

查看它在 [Vue.js 博客](https://github.com/vuejs/blog/blob/main/.vitepress/theme/posts.data.ts) 中是如何使用的。

`createContentLoader` API 也可以在 [构建钩子](/reference/site-config#build-hooks) 中使用：

```js
// .vitepress/config.js
export default {
  async buildEnd() {
    const posts = await createContentLoader('posts/*.md').load()
    // generate files based on posts metadata, e.g. RSS feed
  }
}
```

**类型**

```ts
interface ContentOptions<T = ContentData[]> {
  /**
   * Include src?
   * @default false
   */
  includeSrc?: boolean

  /**
   * Render src to HTML and include in data?
   * @default false
   */
  render?: boolean

  /**
   * If `boolean`, whether to parse and include excerpt? (rendered as HTML)
   *
   * If `function`, control how the excerpt is extracted from the content.
   *
   * If `string`, define a custom separator to be used for extracting the
   * excerpt. Default separator is `---` if `excerpt` is `true`.
   *
   * @see https://github.com/jonschlinkert/gray-matter#optionsexcerpt
   * @see https://github.com/jonschlinkert/gray-matter#optionsexcerpt_separator
   *
   * @default false
   */
  excerpt?:
    | boolean
    | ((file: { data: { [key: string]: any }; content: string; excerpt?: string }, options?: any) => void)
    | string

  /**
   * 转换数据。请注意，如果从组件或 Markdown 文件导入，数据将以 JSON 形式内联到客户端包中。
   */
  transform?: (data: ContentData[]) => T | Promise<T>
}
```

## 为数据加载器导出类型 {#typed-data-loaders}

当使用 TypeScript 时，你可以像这样为加载器和 `data` 导出类型：

```ts
import { defineLoader } from 'vitepress'

export interface Data {
  // data type
}

declare const data: Data
export { data }

export default defineLoader({
  // type checked loader options
  watch: ['...'],
  async load(): Promise<Data> {
    // ...
  }
})
```

## 配置 {#configuration}

要获取加载器中的配置信息，可以使用如下代码：

```ts
import type { SiteConfig } from 'vitepress'

const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG
```
