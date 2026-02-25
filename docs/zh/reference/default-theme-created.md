# 创建于 {#created}

文档的创建时间会显示在页面右下角。要启用它，请将 `created` 选项添加到配置中。

::: tip
VitePress 通过每个文件第一次 Git 提交的时间戳显示"创建"时间，因此你必须提交 markdown 文件才能看到创建时间。

具体实现上，VitePress 会对每个文件执行`git log -1 --pretty=%at --follow --diff-filter=A`命令以获取时间戳。若所有页面显示相同的创建时间，请参考[最后更新时间](./default-theme-last-updated)页面中的相同段落。
:::

## 全局配置 {#site-level-config}

```js
export default {
  created: true
}
```

## frontmatter 配置 {#frontmatter-config}

可以使用 frontmatter 上的 `created` 选项单独禁用某个页面的最后更新展示：

```yaml
---
created: false
---
```

另请参阅[默认主题：创建时间](./default-theme-config#created) 了解更多详细信息。主题级别的任何 [truthy](https://developer.mozilla.org/zh-CN/docs/Glossary/Truthy) 值也将启用该功能，除非在站点或页面级别明确禁用。
