# Routing

VitePress is built with file system based routing, which means the directory structure of the source file corresponds to the final URL. You may customize the mapping of the directory structure and URL too. Read through this page to learn everything about the VitePress routing system.

## Basic Routing

By default, VitePress assumes your page files are stored in project root. Here you may add markdown files with the name being the URL path. For example, when you have following directory structure:

```
.
├─ guide
│  ├─ getting-started.md
│  └─ index.md
├─ index.md
└─ prologue.md
```

Then you can access the pages by the below URL.

```
index.md           -> /
prologue.md        -> /prologue.html
guide/index.md     -> /guide/
getting-started.md -> /guide/getting-started.html
```

As you can see, the directory structure corresponds to the final URL, as same as hosting plain HTML from a typical web server.

## Changing the Root Directory

To change the root directory for your page files, you may pass the directory name to the `vitepress` command. For example, if you want to store your page files under `docs` directory, then you should run `vitepress dev docs` command.

```
.
├─ docs
│  ├─ getting-started.md
│  └─ index.md
└─ ...
```

```
vitepress dev docs
```

This is going to map the URL as follows.

```
docs/index.md           -> /
docs/getting-started.md -> /getting-started.html
```

You may also customize the root directory in config file via [`srcDir`](/config/app-configs#srcdir) option too. Running `vitepress dev` with the following setting acts same as running `vitepress dev docs` command.

```ts
export default {
  srcDir: './docs'
}
```

## Linking Between Pages

When adding links in pages, omit extension from the path and use either absolute path from the root, or relative path from the page. VitePress will handle the extension according to your configuration setup.

```md
<!-- Do -->
[Getting Started](/guide/getting-started)
[Getting Started](../guide/getting-started)

<!-- Don't -->
[Getting Started](/guide/getting-started.md)
[Getting Started](/guide/getting-started.html)
```

Learn more about page links and links to assets, such as link to images, at [Asset Handling](asset-handling).

## Generate Clean URL

A "Clean URL" is commonly known as URL without `.html` extension, for example, `example.com/path` instead of `example.com/path.html`.

By default, VitePress generates the final static page files by adding `.html` extension to each file. If you would like to have clean URL, you may structure your directory by only using `index.html` file.

```
.
├─ getting-started
│  └─ index.md
├─ installation
│  └─ index.md
└─ index.md
```

However, you may also generate a clean URL by setting up [`cleanUrls`](/config/app-configs#cleanurls) option.

```ts
export default {
  cleanUrls: true
}
```

## Customize the Mappings

You may customize the mapping between directory structure and URL. It's useful when you have complex document structure. For example, let's say you have several packages and would like to place documentations along with the source files like this.

```
.
├─ packages
│  ├─ pkg-a
│  │  └─ src
│  │      ├─ pkg-a-code.ts
│  │      └─ pkg-a-code.md
│  └─ pkg-b
│     └─ src
│         ├─ pkg-b-code.ts
│         └─ pkg-b-code.md
```

And you want the VitePress pages to be generated as follows.

```
packages/pkg-a/src/pkg-a-code.md -> /pkg-a/pkg-a-code.md
packages/pkg-b/src/pkg-b-code.md -> /pkg-b/pkg-b-code.md
```

You may configure the mapping via [`rewrites`](/config/app-configs#rewrites) option like this.

```ts
export default {
  rewrites: {
    'packages/pkg-a/src/pkg-a-code.md': 'pkg-a/pkg-a-code',
    'packages/pkg-b/src/pkg-b-code.md': 'pkg-b/pkg-b-code'
  }
}
```

The `rewrites` option can also have dynamic route parameters. In this example, we have fixed path `packages` and `src` which stays the same on all pages, and it might be verbose to have to list all pages in your config as you add pages. You may configure the above mapping as below and get the same result.

```ts
export default {
  rewrites: {
    'packages/:pkg/src/:page': ':pkg/:page'
  }
}
```

Route parameters are prefixed by `:` (e.g. `:pkg`). The name of the parameter is just a placeholder and can be anything.

In addition, you may add `*` at the end of the parameter to map all sub directories from there on.

```ts
export default {
  rewrites: {
    'packages/:pkg/src/:page*': ':pkg/:page*'
  }
}
```

The above will create mapping as below.

```
packages/pkg-a/src/pkg-a-code.md  -> /pkg-a/pkg-a-code
packages/pkg-b/src/folder/file.md -> /pkg-b/folder/file
```

::: warning You need server restart on page addition
At the moment, VitePress doesn't detect page additions to the mapped directory. You need to restart your server when adding or removing files from the directory during the dev mode. Updating the already existing files gets updated as usual.
:::

### Relative Link Handling in Page

Note that when enabling rewrites, **relative links in the markdown are resolved relative to the final path**. For example, in order to create relative link from `packages/pkg-a/src/pkg-a-code.md` to `packages/pkg-b/src/pkg-b-code.md`, you should define link as below.

```md
[Link to PKG B](../pkg-b/pkg-b-code)
```
