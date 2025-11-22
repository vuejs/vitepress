# Edit Link

## Site-Level Config

You can display a link to edit each documentation page at the bottom of the page. To enable it, add `themeConfig.editLink` options to your config.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path'
    }
  }
}
```

The `pattern` option defines the URL structure for the link, and the `:path` placeholder is replaced with the page path.

You can also use a callback that takes [`PageData`](./runtime-api#usedata) as the argument and returns the URL string for additional customizability. This will be executed in the browser and hence shouldn't have side effects.

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

By default, this option will add the link text "Edit this page" at the bottom of the doc page. You can customize this text by defining the `text` option.

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

This can be disabled per-page using the `editLink` option in each individual page's frontmatter:

```yaml
---
editLink: false
---
```
