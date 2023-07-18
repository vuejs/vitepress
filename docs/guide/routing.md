---
outline: deep
---

# Routing

## File-Based Routing

VitePress uses file-based routing, which means the generated HTML pages are mapped from the directory structure of the source Markdown files. For example, given the following directory structure:

```
.
├─ guide
│  ├─ getting-started.md
│  └─ index.md
├─ index.md
└─ prologue.md
```

The generated HTML pages will be:

```
index.md                  -->  /index.html (accessible as /)
prologue.md               -->  /prologue.html
guide/index.md            -->  /guide/index.html (accessible as /guide/)
guide/getting-started.md  -->  /guide/getting-started.html
```

The resulting HTML can be hosted on any web server that can serve static files.

## Root and Source Directory

There are two important concepts in the file structure of a VitePress project: the **project root** and the **source directory**.

### Project Root

Project root is where VitePress will try to look for the `.vitepress` special directory. The `.vitepress` directory is a reserved location for VitePress' config file, dev server cache, build output, and optional theme customization code.

When you run `vitepress dev` or `vitepress build` from the command line, VitePress will use the current working directory as project root. To specify a sub-directory as root, you will need to pass the relative path to the command. For example, if your VitePress project is located in `./docs`, you should run `vitepress dev docs`:

```
.
├─ docs                    # project root
│  ├─ .vitepress           # config dir
│  ├─ getting-started.md
│  └─ index.md
└─ ...
```

```sh
vitepress dev docs
```

This is going to result in the following source-to-HTML mapping:

```
docs/index.md            -->  /index.html (accessible as /)
docs/getting-started.md  -->  /getting-started.html
```

### Source Directory

Source directory is where your Markdown source files live. By default, it is the same as the project root. However, you can configure it via the [`srcDir`](../reference/site-config#srcdir) config option.

The `srcDir` option is resolved relative to project root. For example, with `srcDir: 'src'`, your file structure will look like this:

```
.                          # project root
├─ .vitepress              # config dir
└─ src                     # source dir
   ├─ getting-started.md
   └─ index.md
```

The resulting source-to-HTML mapping:

```
src/index.md            -->  /index.html (accessible as /)
src/getting-started.md  -->  /getting-started.html
```

## Linking Between Pages

You can use both absolute and relative paths when linking between pages. Note that although both `.md` and `.html` extensions will work, the best practice is to omit file extensions so that VitePress can generate the final URLs based on your config.

```md
<!-- Do -->
[Getting Started](./getting-started)
[Getting Started](../guide/getting-started)

<!-- Don't -->
[Getting Started](./getting-started.md)
[Getting Started](./getting-started.html)
```

Learn more about linking to assets such images in [Asset Handling](asset-handling).

## Generating Clean URL

:::warning Server Support Required
To serve clean URLs with VitePress, server-side support is required.
:::

By default, VitePress resolves inbound links to URLs ending with `.html`. However, some users may prefer "Clean URLs" without the `.html` extension - for example, `example.com/path` instead of `example.com/path.html`.

Some servers or hosting platforms (for example Netlify or Vercel) provide the ability to map a URL like `/foo` to `/foo.html` if it exists, without a redirect:

- Netlify supports this by default.
- Vercel requires enabling the [`cleanUrls` option in `vercel.json`](https://vercel.com/docs/concepts/projects/project-configuration#cleanurls).

If this feature is available to you, you can then also enable VitePress' own [`cleanUrls`](../reference/site-config#cleanurls) config option so that:

- Inbound links between pages are generated without the `.html` extension.
- If current path ends with `.html`, the router will perform a client-side redirect to the extension-less path.

If, however, you cannot configure your server with such support (e.g. GitHub pages), you will have to manually resort to the following directory structure:

```
.
├─ getting-started
│  └─ index.md
├─ installation
│  └─ index.md
└─ index.md
```

## Route Rewrites

You can customize the mapping between the source directory structure and the generated pages. It's useful when you have a complex project structure. For example, let's say you have a monorepo with multiple packages, and would like to place documentations along with the source files like this:

```
.
├─ packages
│  ├─ pkg-a
│  │  └─ src
│  │      ├─ pkg-a-code.ts
│  │      └─ pkg-a-docs.md
│  └─ pkg-b
│     └─ src
│         ├─ pkg-b-code.ts
│         └─ pkg-b-docs.md
```

And you want the VitePress pages to be generated like this:

```
packages/pkg-a/src/pkg-a-docs.md  -->  /pkg-a/index.html
packages/pkg-b/src/pkg-b-docs.md  -->  /pkg-b/index.html
```

You can achieve this by configuring the [`rewrites`](../reference/site-config#rewrites) option like this:

```ts
// .vitepress/config.js
export default {
  rewrites: {
    'packages/pkg-a/src/pkg-a-docs.md': 'pkg-a/index.md',
    'packages/pkg-b/src/pkg-b-docs.md': 'pkg-b/index.md'
  }
}
```

The `rewrites` option also supports dynamic route parameters. In the above example, it would be verbose to list all the paths if you have many packages. Given that they all have the same file structure, you can simplify the config like this:

```ts
export default {
  rewrites: {
    'packages/:pkg/src/(.*)': ':pkg/index.md'
  }
}
```

The rewrite paths are compiled using the `path-to-regexp` package - consult [its documentation](https://github.com/pillarjs/path-to-regexp#parameters) for more advanced syntax.

:::warning Relative Links with Rewrites

When rewrites are enabled, **relative links should be based on the rewritten paths**. For example, in order to create a relative link from `packages/pkg-a/src/pkg-a-code.md` to `packages/pkg-b/src/pkg-b-code.md`, you should use:

```md
[Link to PKG B](../pkg-b/pkg-b-code)
```
:::

## Dynamic Routes

You can generate many pages using a single Markdown file and dynamic data. For example, you can create a `packages/[pkg].md` file that generates a corresponding page for every package in a project. Here, the `[pkg]` segment is a route **parameter** that differentiates each page from the others.

### Paths Loader File

Since VitePress is a static site generator, the possible page paths must be determined at build time. Therefore, a dynamic route page **must** be accompanied by a **paths loader file**. For `packages/[pkg].md`, we will need `packages/[pkg].paths.js` (`.ts` is also supported):

```
.
└─ packages
   ├─ [pkg].md         # route template
   └─ [pkg].paths.js   # route paths loader
```

The paths loader should provide an object with a `paths` method as its default export. The `paths` method should return an array of objects with a `params` property. Each of these objects will generate a corresponding page.

Given the following `paths` array:

```js
// packages/[pkg].paths.js
export default {
  paths() {
    return [
      { params: { pkg: 'foo' }},
      { params: { pkg: 'bar' }}
    ]
  }
}
```

The generated HTML pages will be:

```
.
└─ packages
   ├─ foo.html
   └─ bar.html
```

### Multiple Params

A dynamic route can contain multiple params:

**File Structure**

```
.
└─ packages
   ├─ [pkg]-[version].md
   └─ [pkg]-[version].paths.js
```

**Paths Loader**

```js
export default {
  paths: () => [
    { params: { pkg: 'foo', version: '1.0.0' }},
    { params: { pkg: 'foo', version: '2.0.0' }},
    { params: { pkg: 'bar', version: '1.0.0' }},
    { params: { pkg: 'bar', version: '2.0.0' }}
  ]
}
```

**Output**

```
.
└─ packages
   ├─ foo-1.0.0.html
   ├─ foo-2.0.0.html
   ├─ bar-1.0.0.html
   └─ bar-2.0.0.html
```

### Dynamically Generating Paths

The paths loader module is run in Node.js and only executed during build time. You can dynamically generate the paths array using any data, either local or remote.

Generating paths from local files:

```js
import fs from 'fs'

export default {
  paths() {
    return fs
      .readdirSync('packages')
      .map((pkg) => {
        return { params: { pkg }}
      })
  }
}
```

Generating paths from remote data:

```js
export default {
  async paths() {
    const pkgs = await (await fetch('https://my-api.com/packages')).json()

    return pkgs.map((pkg) => {
      return {
        params: {
          pkg: pkg.name,
          version: pkg.version
        }
      }
    })
  }
}
```

### Accessing Params in Page

You can use the params to pass additional data to each page. The Markdown route file can access the current page params in Vue expressions via the `$params` global property:

```md
- package name: {{ $params.pkg }}
- version: {{ $params.version }}
```

You can also access the current page's params via the [`useData`](../reference/runtime-api#usedata) runtime API. This is available in both Markdown files and Vue components:

```vue
<script setup>
import { useData } from 'vitepress'

// params is a Vue ref
const { params } = useData()

console.log(params.value)
</script>
```

### Rendering Raw Content

Params passed to the page will be serialized in the client JavaScript payload, so you should avoid passing heavy data in params, for example raw Markdown or HTML content fetched from a remote CMS.

Instead, you can pass such content to each page using the `content` property on each path object:

```js
export default {
  async paths() {
    const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

    return posts.map((post) => {
      return {
        params: { id: post.id },
        content: post.content // raw Markdown or HTML
      }
    })
  }
}
```

Then, use the following special syntax to render the content as part of the Markdown file itself:

```md
<!-- @content -->
```
