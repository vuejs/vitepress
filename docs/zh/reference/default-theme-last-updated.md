# 最后更新于 {#last-updated}

最近一条内容的更新时间会显示在页面右下角。要启用它，请将 `lastUpdated` 选项添加到配置中。

::: tip
VitePress 通过每个文件最近一次 Git 提交的时间戳显示"最后更新"时间，因此你必须提交 markdown 文件才能看到最后更新时间。

具体实现上，VitePress 会对每个文件执行`git log -1 --pretty="%ai"`命令以获取时间戳。若所有页面显示相同的更新时间，可能是由于浅克隆（常见于 CI 环境）导致 Git 历史记录受限所致。

在 **GitHub Actions** 中修复此问题，请在工作流中添加以下配置：

```yaml{4}
- name: Checkout
  uses: actions/checkout@v5
  with:
    fetch-depth: 0
```

其他 CI/CD 平台也有类似设置。

若上述选项不可用，可在 `package.json` 中的 `docs:build` 命令后手动添加获取操作：

```json
"docs:build": "git fetch --unshallow && vitepress build docs"
```
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
