# Global Computed

In VitePress, some core [computed properties](https://v3.vuejs.org/guide/computed.html#computed-properties) can be used by the default theme or custom themes. Or directly in Markdown pages using vue, for example using `$frontmatter.title` to access the title defined in the frontmatter section of the page.

## $site

This is the `$site` value of the site you're currently reading:

```js
{
  base: '/',
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',
  head: [],
  locales: {},
  themeConfig: $themeConfig
}
```

## $themeConfig

Refers to `$site.themeConfig`.

```js
{
  locales: {},
  repo: 'vuejs/vitepress',
  docsDir: 'docs',
  editLinks: true,
  editLinkText: 'Edit this page on GitHub',
  lastUpdated: 'Last Updated',
  nav: [...],
  sidebar: { ... }
}
```

## $page

This is the `$page` value of the page you're currently reading:

```js
{
  relativePath: 'guide/global-computed.md',
  title: 'Global Computed',
  headers: [
    { level: 2, title: '$site', slug: 'site' },
    { level: 2, title: '$page', slug: '$page' },
    ...
  ],
  frontmatter: $frontmatter,
  lastUpdated: 1606297645000
}
```

## $frontmatter

Reference of `$page.frontmatter`.

```js
{
  title: 'Docs with VitePress',
  editLink: true
}
```

## $lang

The language of the current page. Default: `en-US`.

## $localePath

The locale path prefix for the current page. Default: `/`.

## $title

Value of the `<title>` label used for the current page.

## $description

The content value of the `<meta name= "description" content= "...">` for the current page.

## $withBase

Helper method to generate correct path by prepending the `base` path configured in `.vitepress/config.js`. It's useful when you want to link to [public files with base path](./assets#public-files).

```html
<img :src="$withBase('/foo.png')" alt="foo">
```
