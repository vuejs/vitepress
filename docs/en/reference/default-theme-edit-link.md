
---
description: Display an edit link on doc pages to let users suggest changes on GitHub or GitLab.
---

# Edit Link

## Site-Level Config

Edit Link lets you display a link to edit the page on Git management services such as GitHub or GitLab. To enable it, add `themeConfig.editLink` options to your config.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path'
    }
  }
}
```

The `pattern` option defines the URL structure for the link, and `:path` is replaced with the page path.

You can also provide a pure function that accepts [`PageData`](./runtime-api#usedata) as the argument and returns the URL string.

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

It should not have side effects or access anything outside its scope since it will be serialized and executed in the browser.

By default, this adds the link text "Edit this page" at the bottom of the documentation page. You can customize this text by defining the `text` option.

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

### Homepage Edit Link

By default, the edit link is displayed on documentation pages only. To also display an edit link on the homepage (`index.md`), set the `index` option to `true` in `themeConfig.editLink`.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
      index: true
    }
  }
}
```

The `index` option is a boolean and defaults to `false`. When enabled, it displays the edit link on homepage `index.md` pages. The link respects the page-level `editLink: false` frontmatter setting.

## Frontmatter Config

The edit link can be disabled for an individual page using the `editLink` option in its frontmatter:

```yaml
---
editLink: false
---
```
