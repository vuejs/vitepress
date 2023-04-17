# 最后更新 {#last-updated}

最近一条内容的更新时间会显示在页面右下角。要启用它，请将 `lastUpdated` 选项添加到你的配置中。

## 全局配置 {#site-level-config}

```js
export default {
  lastUpdated: true
}
```

## Frontmatter 配置 {#frontmatter-config}

可以使用 frontmatter 上的 `lastUpdated` 选项单独禁用某个页面的最后更新展示：

```yaml
---
lastUpdated: false
---
```

