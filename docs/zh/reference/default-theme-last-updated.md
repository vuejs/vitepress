# 最后更新 {#last-updated}

最近一条内容的更新时间会显示在页面右下角。要启用它，请将 `lastUpdated` 选项添加到你的配置中。

::: tip 提示
你需要 commit markdown 文件以查看更新的时间。
:::

## 全局配置 {#site-level-config}

```js
export default {
	lastUpdated: true,
}
```

## Frontmatter 配置 {#frontmatter-config}

可以使用 frontmatter 上的 `lastUpdated` 选项单独禁用某个页面的最后更新展示：

```yaml
---
lastUpdated: false
---
```

另请参阅[默认主题：上次更新](./default-theme-last-updated#last-updated) 了解更多详细信息。主题级别的任何真值也将启用该功能，除非在站点或页面级别明确禁用。
