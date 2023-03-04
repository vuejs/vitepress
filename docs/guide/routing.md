# Routing

## File-Based Routing

VitePress uses file-based routing, which means the generated HTML pages are mapped from the directory structure of the source markdown files. For example, given the following directory structure:

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
├─ docs (project root)
│  ├─ .vitepress
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

Source directory is where your markdown source files live. By default, it is the same as the project root. However, you can configure it via the [`srcDir`](/reference/site-config#srcdir) config option.

The `srcDir` option is resolved relative to project root. For example, with `srcDir: 'src'`, your file structure will look like this:

```
. (project root)
├─ .vitepress
└─ src (source directory)
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
[Getting Started](/guide/getting-started)
[Getting Started](../guide/getting-started)

<!-- Don't -->
[Getting Started](/guide/getting-started.md)
[Getting Started](/guide/getting-started.html)
```

Learn more about linking to assets such images in [Asset Handling](asset-handling).

## Generating Clean URL

By default, VitePress resolves inbound links to URLs ending with `.html`. However, some users may prefer "Clean URLs" without the `.html` extension - for example, `example.com/path` instead of `example.com/path.html`.

One way to achieve clean URLs is to structure your files using only `index.md` inside directories:

```
.
├─ getting-started
│  └─ index.md
├─ installation
│  └─ index.md
└─ index.md
```

Some servers or hosting platforms (for example Netlify or Vercel) provide the ability to map a URL like `/foo` to `/foo.html` if it exists. If this feature is available to you, you can use the [`cleanUrls`](/reference/site-config#cleanurls) config option so that inbound links are always generated without the `.html` extension. When this option is enabled, VitePress' client-side router will also redirect to the clean URL when a visited URL ends with `.html`.

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

You can achieve this by configuring the [`rewrites`](/reference/site-config#rewrites) option like this:

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

The rewrite paths are compiled using the `path-to-regexp` package - consult [its documentation](](https://github.com/pillarjs/path-to-regexp#parameters)) for more advanced syntax.

### Relative Link Handling in Page

Note that when enabling rewrites, **relative links in the markdown are resolved relative to the final path**. For example, in order to create relative link from `packages/pkg-a/src/pkg-a-code.md` to `packages/pkg-b/src/pkg-b-code.md`, you should define link as below.

```md
[Link to PKG B](../pkg-b/pkg-b-code)
```

## Dynamic Routes

TODO
