# Edit Link

## Site-Level Config

Edit Link lets you display a link to edit the page on Git management services such as GitHub, or GitLab. To enable it, add `themeConfig.editLink` options to your config.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path'
    }
  }
}
```

The `pattern` option defines the URL structure for the link, and `:path` is going to be replaced with the page path.

You can also put a pure function that accepts [`PageData`](./runtime-api#usedata) as the argument and returns the URL string.

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

It should not have side-effects nor access anything outside of its scope since it will be serialized and executed in the browser.

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

This can be disabled per-page using the `editLink` option on frontmatter:

```yaml
---
editLink: false
---
```
