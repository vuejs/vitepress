# 编辑链接 {#edit-link}

## 站点级配置 {#site-level-config}

编辑链接让你可以显示一个链接，以在 GitHub 或 GitLab 等 Git 管理服务上编辑页面。要启用它，请将 `themeConfig.editLink` 选项添加到配置中。

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path'
    }
  }
}
```

`pattern` 选项定义链接的 URL 结构，并且 `:path` 将被替换为页面路径。

你还可以放置一个接受 [`PageData`](./runtime-api#usedata) 作为参数并返回 URL 字符串的纯函数。

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

它不应该有副作用，也不应该访问其范围之外的任何东西，因为它将在浏览器中被序列化和执行。

默认情况下，这将在文档页面底部添加链接文本“Edit this page”。可以通过定义 `text` 选项来自定义此文本。

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

## frontmatter 配置 {#frontmatter-config}

可以使用 frontmatter 上的 `editLink` 选项单独禁用某个页面的编辑链接：

```yaml
---
editLink: false
---
```
