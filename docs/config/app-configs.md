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

Title for the site. This will be the suffix for all page titles, and displayed in the nav bar.

```ts
export default {
  title: 'VitePress'
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

## appearance

- Type: `boolean`
- Default: `true`

Whether to enable "Dark Mode" or not. If the option is set to `true`, it adds `.dark` class to the `<html>` tag.

It also injects inline script that tries to read users settings from local storage by `vitepress-theme-appearance` key and restores users preferred color mode.

```ts
export default {
  appearance: true
}
```
