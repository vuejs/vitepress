# 快速上手 {#getting-started}

本节将帮助你从头开始构建一个基本的 VitePress 文档站点。如果你已经有一个现有项目并希望将文档保留在项目中，请从步骤2开始。

你也可以在 [StackBlitz](https://vitepress.new/) 上在线尝试 VitePress，它直接在浏览器里运行基于 Vite 的站点。所以和你在本地构建的效果几乎是一样的，但是这种方式不需要在你的机器上安装任何东西。

::: warning
VitePress 目前处于 `alpha` 状态。它已经适合开箱即用地组织文档，但是具体配置以及和主题相关的 API 仍然可能在小的版本之间发生变化。
:::

## 步骤 1：创建一个项目 {#step-1-create-a-new-project}

创建并进入新项目的目录。


```sh
$ mkdir vitepress-starter && cd vitepress-starter
```

用你喜欢的包管理工具初始化项目。

::: code-group

```sh [npm]
$ npm init
```

```sh [yarn]
$ yarn init
```

```sh [pnpm]
$ pnpm init
```

:::

## 步骤 2：安装 VitePress {#step-2-install-vitepress}

添加 VitePress 和 Vue 作为项目的开发依赖项。

::: code-group

```sh [npm]
$ npm install -D vitepress vue
```

```sh [yarn]
$ yarn add -D vitepress vue
```

```sh [pnpm]
$ pnpm add -D vitepress vue
```

:::

::: details 得到了 peer dependencies 警告？
`@docsearch/js` 的 peer dependencies 存在某些问题。如果你看到某些命令由于它们而失败，你现在可以尝试以下解决方案：

如果使用 pnpm，在 `package.json` 添加以下代码：

```json
"pnpm": {
  "peerDependencyRules": {
    "ignoreMissing": [
      "@algolia/client-search"
    ]
  }
}
```

:::

创建你的第一篇文档。

```sh
$ mkdir docs && echo '# Hello VitePress' > docs/index.md
```

## 步骤 3：启动本地开发环境 {#step-3-boot-up-dev-environment}

在 `package.json` 里添加一些脚本。

```json
{
  ...
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:serve": "vitepress serve docs"
  },
  ...
}
```

在本地启动文档服务。

::: code-group

```sh [npm]
$ npm run docs:dev
```

```sh [yarn]
$ yarn docs:dev
```

```sh [pnpm]
$ pnpm run docs:dev
```

:::

VitePress 将在 `http://localhost:5173` 启动一个支持热部署的本地开发服务环境。

## 步骤 4：添加更多文档 {#step-4-add-more-pages}

让我们再添加一个页面，创建一个名为 `getting-started.md` 的文件，与前面创建的 `index.md` 放在同一目录下。现在你的目录结构应该是这样的。

```
.
├─ docs
│  ├─ getting-started.md
│  └─ index.md
└─ package.json
```

接下来，访问 `http://localhost:5173/getting-started.html`，可以看到 `getting-started.md` 的内容。

这就是 VitePress 的基本工作方式。目录结构与 URL 路径相对应。你可以添加文件，然后尝试访问它。

## 下一步? {#what-s-next}

到目前为止，你应该拥有一个基本但功能强大的 VitePress 文档站点。但现在用户还无法浏览该站点，因为它缺少菜单，类似于这个站点上的侧边栏。

要启用这些导航，我们必须向站点添加一些配置。前往[配置指南](./configuration)了解如何配置 VitePress。

如果你想了解更多关于可以在页面中执行的操作，例如编写 Markdown 或使用 Vue 组件，请查看文档的“编写”部分。[Markdown 指南](./markdown)将是一个很好的起点。

如果你想了解如何自定义站点外观(主题)，并了解 VitePress 默认主题提供的功能，请访问[主题：简介](./theme-introduction)。

当你的文档站点已经成形准备部署时，请务必阅读[部署指南](./deploying)。
