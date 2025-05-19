# 最后更新于 {#last-updated}

最近一条内容的更新时间会显示在页面右下角。要启用它，请将 `lastUpdated` 选项添加到配置中。

::: tip
你必须提交 markdown 文件才能看到最后更新时间。
:::

## 全局配置 {#site-level-config}

```js
export default {
  lastUpdated: true
}
```

## frontmatter 配置 {#frontmatter-config}

可以使用 frontmatter 上的 `lastUpdated` 选项单独禁用某个页面的最后更新展示：

```yaml
---
lastUpdated: false
---
```

另请参阅[默认主题：最后更新时间](./default-theme-config#lastupdated) 了解更多详细信息。主题级别的任何 [truthy](https://developer.mozilla.org/zh-CN/docs/Glossary/Truthy) 值也将启用该功能，除非在站点或页面级别明确禁用。
