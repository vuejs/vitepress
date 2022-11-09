# 最后更新 {#last-updated}

最后内容的更新时间将显示在页面的右下角。要启用它，请在你的配置中添加 `lastUpdated` 选项。
## 页面配置 {#page-configuration}

添加 `lastUpdated` 选项到配置中去。
```js
export default {
  lastUpdated: true
}
```

## Frontmatter 配置 {#frontmatter-configuration}
如果你想隐藏最后更新的文本，请对 `lastUpdated` 选项设置为 false。

```yaml
---
lastUpdated: false
---
```
