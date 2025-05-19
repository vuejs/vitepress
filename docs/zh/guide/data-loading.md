# 构建时数据加载 {#build-time-data-loading}

VitePress 提供了**数据加载**的功能，它允许加载任意数据并从页面或组件中导入它。数据加载**只在构建时**执行：最终的数据将被序列化为 JavaScript 包中的 JSON。

数据加载可以被用于获取远程数据，也可以基于本地文件生成元数据。例如，可以使用数据加载来解析所有本地 API 页面并自动生成所有 API 入口的索引。

## 基本用法 {#basic-usage}

一个用于数据加载的文件必须以 `.data.js` 或 `.data.ts` 结尾。该文件应该提供一个默认导出的对象，该对象具有 `load()` 方法：

```js [example.data.js]
export default {
  load() {
    return {
      hello: 'world'
    }
  }
}
```

数据加载模块只在 Node.js 中执行，因此可以按需导入 Node API 和 npm 依赖。

然后，可以在 `.md` 页面和 `.vue` 组件中使用 `data` 具名导出从该文件中导入数据：

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

你会注意到 data loader 本身并没有导出 `data`。这是因为 VitePress 在后台调用了 `load()` 方法，并通过名为 `data` 的具名导出隐式地暴露了结果。

即使它是异步的，这也是有效的：

```js
export default {
  async load() {
    // 获取远程数据
    return (await fetch('...')).json()
  }
}
```

## 使用本地文件生成数据 {#data-from-local-files}

当需要基于本地文件生成数据时，需要在 data loader 中使用 `watch` 选项，以便这些文件改动时可以触发热更新。

`watch` 选项也很方便，因为可以使用 [glob 模式](https://github.com/mrmlnc/fast-glob#pattern-syntax) 匹配多个文件。模式可以相对于数据加载文件本身，`load()` 函数将接收匹配文件的绝对路径。

下面的例子展示了如何使用 [csv-parse](https://github.com/adaltas/node-csv/tree/master/packages/csv-parse/) 加载 CSV 文件并将其转换为 JSON。因为此文件仅在构建时执行，因此不会将 CSV 解析器发送到客户端。

```js
import fs from 'node:fs'
import { parse } from 'csv-parse/sync'

export default {
  watch: ['./data/*.csv'],
  load(watchedFiles) {
    // watchFiles 是一个所匹配文件的绝对路径的数组。
    // 生成一个博客文章元数据数组
    // 可用于在主题布局中呈现列表。
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

当构建一个内容为主的站点时，我们经常需要创建一个“归档”或“索引”页面：一个我们可以列出内容中的所有可用条目的页面，例如博客文章或 API 页面。我们**可以**直接使用数据加载 API 实现这一点，但由于这会经常使用，VitePress 还提供了一个 `createContentLoader` 辅助函数来简化这个过程：

```js [posts.data.js]
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', /* options */)
```

该辅助函数接受一个相对于[源目录](./routing#source-directory)的 glob 模式，并返回一个 `{ watch, load }` 数据加载对象，该对象可以用作数据加载文件中的默认导出。它还基于文件修改时间戳实现了缓存以提高开发性能。

请注意，数据加载仅适用于 Markdown 文件——匹配的非 Markdown 文件将被跳过。

加载的数据将是一个类型为 `ContentData[]` 的数组：

```ts
interface ContentData {
  // 页面的映射 URL，如 /posts/hello.html（不包括 base）
  // 手动迭代或使用自定义 `transform` 来标准化路径
  url: string
  // 页面的 frontmatter 数据
  frontmatter: Record<string, any>

  // 只有启用了相关选项，才会出现以下内容
  // 我们将在下面讨论它们
  src: string | undefined
  html: string | undefined
  excerpt: string | undefined
}
```

默认情况下只提供 `url` 和 `frontmatter`。这是因为加载的数据将作为 JSON 内联在客户端 bundle 中，我们需要谨慎考虑其大小。下面的例子展示了如何使用数据构建最小的博客索引页面：

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

### 选项 {#options}

默认数据可能不适合所有需求——可以选择使用选项转换数据：

```js [posts.data.js]
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', {
  includeSrc: true, // 包含原始 markdown 源?
  render: true,     // 包含渲染的整页 HTML?
  excerpt: true,    // 包含摘录?
  transform(rawData) {
    // 根据需要对原始数据进行 map、sort 或 filter
    // 最终的结果是将发送给客户端的内容
    return rawData.sort((a, b) => {
      return +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date)
    }).map((page) => {
      page.src     // 原始 markdown 源
      page.html    // 渲染的整页 HTML
      page.excerpt // 渲染的摘录 HTML（第一个 `---` 上面的内容）
      return {/* ... */}
    })
  }
})
```

查看它在 [Vue.js 博客](https://github.com/vuejs/blog/blob/main/.vitepress/theme/posts.data.ts)中是如何使用的。

`createContentLoader` API 也可以在[构建钩子](../reference/site-config#build-hooks)中使用：

```js [.vitepress/config.js]
export default {
  async buildEnd() {
    const posts = await createContentLoader('posts/*.md').load()
    // 根据 posts 元数据生成文件，如 RSS 订阅源
  }
}
```

**类型**

```ts
interface ContentOptions<T = ContentData[]> {
  /**
   * 包含 src?
   * @default false
   */
  includeSrc?: boolean

  /**
   * 将 src 渲染为 HTML 并包含在数据中?
   * @default false
   */
  render?: boolean

  /**
   * 如果为 `boolean`，是否解析并包含摘录? (呈现为 HTML)
   *
   * 如果为 `function`，则控制如何从内容中提取摘录
   *
   * 如果为 `string`，则定义用于提取摘录的自定义分隔符
   * 如果 `excerpt` 为 `true`，则默认分隔符为 `---`
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
   * 转换数据。请注意，如果从组件或 Markdown 文件导入，数据将以 JSON 形式内联到客户端包中
   */
  transform?: (data: ContentData[]) => T | Promise<T>
}
```

## 为 data loader 导出类型 {#typed-data-loaders}

当使用 TypeScript 时，可以像这样为 loader 和 `data` 导出类型：

```ts
import { defineLoader } from 'vitepress'

export interface Data {
  // data 类型
}

declare const data: Data
export { data }

export default defineLoader({
  // 类型检查加载器选项
  watch: ['...'],
  async load(): Promise<Data> {
    // ...
  }
})
```

## 配置 {#configuration}

要获取 data loader 中的配置信息，可以使用如下代码：

```ts
import type { SiteConfig } from 'vitepress'

const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG
```
