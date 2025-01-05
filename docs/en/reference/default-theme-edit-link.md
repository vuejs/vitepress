# Edit Link

## Site-Level Config

The Edit Link option lets you display a link to edit the page on Git management services such as GitHub, or GitLab. To enable it, add the `themeConfig.editLink` option to your config.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path'
    }
  }
}
```

The `pattern` option defines the URL structure for the link, where `:path` will automatically be replaced with the page path.

You can also create a pure function that accepts [`PageData`](./runtime-api#usedata) as the argument to return the URL string.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: ({ filePath }) => {
        if (filePath.startsWith('packages/')) {
          return `https://github.com/acme/monorepo/edit/main/${filePath}`
        } else {
          return `https://github.com/acme/monorepo/edit/main/docs/${filePath}`
        }
      }
    }
  }
}
```

This option should not have side effects nor access anything outside of its scope, as it is serialized and executed in the browser.

By default, this will add the link text "Edit this page" at the bottom of the doc page. You may customize this text by defining the `text` option.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
}
```

## Frontmatter Config

This can be disabled on a per-page basis using the `editLink` option on frontmatter:

```yaml
---
editLink: false
---
```
