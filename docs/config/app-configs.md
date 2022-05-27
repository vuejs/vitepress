# App Configs

App configs are where you can define the global settings of the site. App configs define fundamental settings that are not only limited to the theme configs such as configuration for "base directory", or the "title" of the site.

```ts
export default {
  // These are app level configs.
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',
  ...
}
```

## base

- Type: `string`
- Default: `/`

The base URL the site will be deployed at. You will need to set this if you plan to deploy your site under a sub path, for example, GitHub pages. If you plan to deploy your site to `https://foo.github.io/bar/`, then you should set base to `'/bar/'`. It should always start and end with a slash.

The base is automatically prepended to all the URLs that start with / in other options, so you only need to specify it once.

```ts
export default {
  base: '/base/'
}
```

## lang

- Type: `string`
- Default: `en-US`

The lang attribute for the site. This will render as a `<html lang="en-US">` tag in the page HTML.

```ts
export default {
  lang: 'en-US'
}
```

## title

- Type: `string`
- Default: `VitePress`

Title for the site. This will be displayed in the nav bar. Also used as the suffix for all page titles unless `titleTemplate` is defined.

```ts
export default {
  title: 'VitePress'
}
```

## titleTemplate

- Type: `string | boolean`

The suffix for the title. For example, if you set `title` as `VitePress` and set `titleTemplate` as `My Site`, the html title becomes `VitePress | My Site`.

Set `false` to disable the feature. If the option is `undefined`, then the value of `title` option will be used.

```ts
export default {
  title: 'VitePress',
  titleTemplate: 'Vite & Vue powered static site generator.'
}
```

## description

- Type: `string`
- Default: `A VitePress site`

Description for the site. This will render as a `<meta>` tag in the page HTML.

```ts
export default {
  description: 'A VitePress site'
}
```

## markdown

- Type: `MarkdownOption`

Configre Markdown parser options. VitePress uses [Markdown-it](https://github.com/markdown-it/markdown-it) as the parser, and [Shiki](https://shiki.matsu.io/) to highlight language syntax. Inside this option, you may pass various Markdown related options to fit your needs.

```js
export default {
  markdown: {
    theme: 'material-palenight',
    lineNumbers: true
  }
}
```

Below shows the the full option you may define within this object.

```ts
interface MarkdownOptions extends MarkdownIt.Options {
  // Syntax highlight theme for Shiki.
  // See: https://github.com/shikijs/shiki/blob/main/docs/themes.md#all-themes
  theme?: Shiki.Theme

  // Enable line numbers in code block.
  lineNumbers?: boolean

  // markdown-it-anchor plugin options.
  // See: https://github.com/valeriangalliat/markdown-it-anchor
  anchor?: {
    permalink?: anchor.AnchorOptions['permalink']
  }

  // markdown-it-attrs plugin options.
  // See: https://github.com/arve0/markdown-it-attrs
  attrs?: {
    leftDelimiter?: string
    rightDelimiter?: string
    allowedAttributes?: string[]
    disable?: boolean
  }

  // markdown-it-toc-done-right plugin options
  // https://github.com/nagaozen/markdown-it-toc-done-right
  toc?: any

  // Configure the Markdown-it instance to fully customize
  // how it works.
  config?: (md: MarkdownIt) => void
}
```

## appearance

- Type: `boolean`
- Default: `true`

Whether to enable "Dark Mode" or not. If the option is set to `true`, it adds `.dark` class to the `<html>` tag depending on the users preference.

It also injects inline script that tries to read users settings from local storage by `vitepress-theme-appearance` key and restores users preferred color mode.

```ts
export default {
  appearance: true
}
```
