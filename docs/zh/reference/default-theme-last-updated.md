# 最后更新 {#last-updated}

The update time of the last content will be displayed in the lower right corner of the page. To enable it, add `lastUpdated` options to your config.

## 全局配置 {#site-level-config}

```js
export default {
  lastUpdated: true
}
```

## Frontmatter 配置 {#frontmatter-config}

This can be disabled per-page using the `lastUpdated` option on frontmatter:

```yaml
---
lastUpdated: false
---
```

