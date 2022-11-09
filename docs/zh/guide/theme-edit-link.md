# 编辑链接 {#edit-link}

编辑链接可以显示链接以编辑 Git 管理服务 (例如 GitHub 或 GitLab) 上的页面。 可以通过 `themeConfig.editLink` 选项配置来启用。

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path'
    }
  }
}
```

`pattern` 选项定义了链接的 URL 结构，`:path` 将被页面路径替换。

默认情况下，这将在文档页面底部添加链接文本“编辑此页面”。你可以通过定义 `text` 选项来自定义此文本。

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
