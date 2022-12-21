# Asset Handling

All Markdown files are compiled into Vue components and processed by [Vite](https://github.com/vitejs/vite). You can, **and should**, reference any assets using relative URLs:

```md
![An image](./image.png)
```

You can reference static assets in your markdown files, your `*.vue` components in the theme, styles and plain `.css` files either using absolute public paths (based on project root) or relative paths (based on your file system). The latter is similar to the behavior you are used to if you have used `vue-cli` or webpack's `file-loader`.

Common image, media, and font filetypes are detected and included as assets automatically.

All referenced assets, including those using absolute paths, will be copied to the dist folder with a hashed file name in the production build. Never-referenced assets will not be copied. Similar to `vue-cli`, image assets smaller than 4kb will be base64 inlined.

All **static** path references, including absolute paths, should be based on your working directory structure.

## Public Files

Sometimes you may need to provide static assets that are not directly referenced in any of your Markdown or theme components (for example, favicons and PWA icons). The `public` directory under project root (`docs` folder if you're running `vitepress build docs`) can be used as an escape hatch to provide static assets that either are never referenced in source code (e.g. `robots.txt`), or must retain the exact same file name (without hashing).

Assets placed in `public` will be copied to the root of the dist directory as-is.

Note that you should reference files placed in `public` using root absolute path - for example, `public/icon.png` should always be referenced in source code as `/icon.png`.

There is one exception to this: if you have an HTML page in `public` and link to it from the main site, the router will yield a 404 by default. To get around this, VitePress provides a `pathname://` protocol which allows you to link to another page in the same domain as if the link is external. Contrast these two links:

- [/pure.html](/pure.html)
- <pathname:///pure.html>

## Base URL

If your site is deployed to a non-root URL, you will need to set the `base` option in `.vitepress/config.js`. For example, if you plan to deploy your site to `https://foo.github.io/bar/`, then `base` should be set to `'/bar/'` (it should always start and end with a slash).

All your static asset paths are automatically processed to adjust for different `base` config values. For example, if you have an absolute reference to an asset under `public` in your markdown:

```md
![An image](/image-inside-public.png)
```

You do **not** need to update it when you change the `base` config value in this case.

However, if you are authoring a theme component that links to assets dynamically, e.g. an image whose `src` is based on a theme config value:

```vue
<img :src="theme.logoPath" />
```

In this case it is recommended to wrap the path with the [`withBase` helper](./api#withbase) provided by VitePress:

```vue
<script setup>
import { withBase, useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <img :src="withBase(theme.logoPath)" />
</template>
```
