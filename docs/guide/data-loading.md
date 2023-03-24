# Build-Time Data Loading

VitePress provides a feature called **data loaders** that allows you to load arbitrary data and import it from pages or components. The data loading is executed **only at build time**: the resulting data will be serialized as JSON in the final JavaScript bundle.

Data loaders can be used to fetch remote data, or generate metadata based on local files. For example, you can use data loaders to parse all your local API pages and automatically generate an index of all API entries.

## Basic Usage

A data loader file must end with either `.data.js` or `.data.ts`. The file should provide a default export of an object with the `load()` method:

```js
// example.data.js
export default {
  load() {
    return {
      data: 'hello'
    }
  }
}
```

The loader module is evaluated only in Node.js, so you can import Node APIs and npm dependencies as needed.

You can then import data from this file in `.md` pages and `.vue` components using the `data` named export:

```html
<script setup>
import { data } from './example.data.js'
</script>

<pre>{{ data }}</pre>
```

Output:

```json
{
  "data": "hello"
}
```

You'll notice the data loader itself does not export the `data`. It is VitePress calling the `load()` method behind the scenes and implicitly exposing the result via the `data` named export.

This works even if the loader is async:

```js
export default {
  async load() {
    // fetch remote data
    return (await fetch('...')).json()
  }
}
```

## Data from Local Files

When you need to generate data based on local files, you should use the `watch` option in the data loader so that changes made to these files can trigger hot updates.

The `watch` option is also convenient in that you can use [glob patterns](https://github.com/mrmlnc/fast-glob#pattern-syntax) to match multiple files. The patterns can be relative to the loader file itself, and the `load()` function will receive the matched files as absolute paths.

The following example shows loading CSV files and transforming them into JSON using [csv-parse](https://github.com/adaltas/node-csv/tree/master/packages/csv-parse/). Because this file only executes at build time, you will not be shipping the CSV parser to the client!

```js
import fs from 'node:fs'
import { parse } from 'csv-parse/sync'

export default {
  watch: ['./data/*.csv'],
  load(watchedFiles) {
    // watchedFiles will be an array of absolute paths of the matched files.
    // generate an array of blog post metadata that can be used to render
    // a list in the theme layout
    return watchedFiles.map(file => {
      return parse(fs.readFileSync(file, 'utf-8'), {
        columns: true,
        skip_empty_lines: true
      })
    })
  }
}
```

## `createContentLoader`

When building a content focused site, we often need to create an "archive" or "index" page: a page where we list all available entries in our content collection, for example blog posts or API pages. We **can** implement this directly with the data loader API, but since this is such a common use case, VitePress also provides a `createContentLoader` helper to simplify this:

```js
// posts.data.js
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', /* options */)
```

The helper takes a glob pattern relative to [project root](./routing#project-root), and returns a `{ watch, load }` data loader object that can be used as the default export in a data loader file. It also implements caching based on file modified timestamps to improve dev performance.

Note the loader only works with Markdown files - matched non-Markdown files will be skipped.

The loaded data will be an array with the type of `ContentData[]`:

```ts
interface ContentData {
  // mapped absolute URL for the page. e.g. /posts/hello.html
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

By default, only `url` and `frontmatter` are provided. This is because the loaded data will be inlined as JSON in the client bundle, so we need to be cautious about its size. Here's an example using the data to build a minimal blog index page:

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

### Options

The default data may not suit all needs - you can opt-in to transform the data using options:

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
    }).map(page => {
      page.src  // raw markdown source
      page.html // rendered full page HTML
      page.excerpt // rendered excerpt HTML (content above first `---`)
      return {/* ... */}
    })
  }
})
```

Check out how it is used in the [Vue.js blog](https://github.com/vuejs/blog/blob/main/.vitepress/theme/posts.data.ts).

The `createContentLoader` API can also be used inside [build hooks](/reference/site-config#build-hooks):

```js
// .vitepress/config.js
export default {
  async buildEnd() {
    const posts = await createContentLoader('posts/*.md').load()
    // generate files based on posts metadata, e.g. RSS feed
  }
}
```

## Typed Data Loaders

When using TypeScript, you can type your loader and `data` export like so:

```ts
import { defineLoader } from 'vitepress'

export interface Data {
  // data type
}

declare const data: Data
export { data }

export default defineLoader({
  // type checked loader options
  glob: ['...'],
  async load(): Promise<Data> {
    // ...
  }
})
```
