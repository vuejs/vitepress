# Print Pages

You can control what parts of the pages are printed using the `print` option. VitePress will show the whole page by default, excluding carbon-ads.

Any page with Frontmatter configuration will override the global configuration, for example, the navbar will be hidden when the page containing `navbar: false`.

VitePress has the `screen-only` class to hide elements when printing, you can use it in any component, html or Markdown html content.

```js
export default {
  themeConfig: {
    // or `print: false` to print only the main content  
    print: {
      outline: true,
      navbar: true,
      sidebar: true,
      footer: true
    }
  }
}
```

## navbar

- Type: `boolean`

- Details:

  This flag will control the navbar visibility when printing, and will be overriden by the Frontmatter navbar option if set to `false` (navbar will not be visible).

## sidebar

- Type: `boolean`

- Details:

  This flag will control the left sidebar visibility when printing, and will be overriden by the Frontmatter sidebar option if set to `false` (sidebar will not be visible).

## outline

- Type: `boolean`

- Details:

  This flag will control the aside and outline visibility when printing, and will be overriden by the Frontmatter aside and outline options if any set to `false` (right aside will not be visible).


## footer

- Type: `boolean`

- Details:

  This flag will control the footer visibility when printing, and will be overriden by the Frontmatter footer option if set to `false` (footer will not be visible).
