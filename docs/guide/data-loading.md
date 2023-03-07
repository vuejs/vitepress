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

The `watch` option is also convenient in that you can use [glob patterns](https://github.com/mrmlnc/fast-glob#pattern-syntax) to match multiple files. The patterns can be relative to the loader file itself, and the `load()` function will receive the matched files as absolute paths:

```js
import fs from 'node:fs'
import parseFrontmatter from 'gray-matter'

export default {
  // watch all blog posts
  watch: ['./posts/*.md'],
  load(watchedFiles) {
    // watchedFiles will be an array of absolute paths of the matched files.
    // generate an array of blog post metadata that can be used to render
    // a list in the theme layout
    return watchedFiles.map(file => {
      const content = fs.readFileSync(file, 'utf-8')
      const { data, excerpt } = parseFrontmatter(content)
      return {
        file,
        data,
        excerpt
      }
    })
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
