n# 从 VitePress 0.x 迁移 {#migration-from-vitepress-0-x}

如果你来自 VitePress 0.x 版本，VitePress 有了一些重大更改。请按照本指南了解如何将应用程序迁移到最新的 VitePress。

## 应用配置 {#app-config}

- 国际化功能尚未实现。

## 主题配置 {#theme-config}

- `sidebar` 选项改变了它的结构。
  - `children` 现在命名为 `items`。
  - 顶级侧边栏不包含 `link`。我们打算把它改回来。
- 删除了 `repo`、`repoLabel`、`docsDir`、`docsBranch`、`editLinks`、`editLinkText`，以支持更灵活的api。
  - 要将带有图标的 GitHub 链接添加到导航，请使用 [社交链接](../reference/default-theme-config#nav) 功能。
  - 要添加“编辑此页面”功能，请使用 [编辑链接](../reference/default-theme-edit-link) 功能。
- `lastUpdated` 选项现在分为` config.lastUpdated` 和 `themeConfig.lastUpdatedText`。
- `carbonAds.carbon` 更改为 `carbonAds.code`.

## frontmatter 配置 {#frontmatter-config}

- `home: true` 选项已更改为 `layout: home`。此外，还修改了许多与主页相关的设置以提供附加功能。详情请参阅 [主页指南](../reference/default-theme-home-page)。
- `footer` 选项移至 [`themeConfig.footer`](../reference/default-theme-footer).
