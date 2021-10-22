# Getting Started起步

这一节将帮助你从零开始建立一个基于VitePress的文档站点。如果你已经有一个现有的项目并且希望将文档保存在项目中，请从第三步开始。

- **Step. 1:** 创建并切换到一个新的目录

  ```bash
  $ mkdir vitepress-starter && cd vitepress-starter
  ```
- **Step. 2:** 使用你喜欢的包管理器初始化

  ```bash
  $ yarn init
  ```

- **Step. 3:** 下载VitePress到本地

  ```bash
  $ yarn add --dev vitepress
  ```

- **Step. 4:** 创建第一个文档

  ```bash
  $ mkdir docs && echo '# Hello VitePress' > docs/index.md
  ```

- **Step. 5:** 添加一些脚本到`package.json`

  ```json
  {
    "scripts": {
      "docs:dev": "vitepress dev docs",
      "docs:build": "vitepress build docs",
      "docs:serve": "vitepress serve docs"
    }
  }
  ```

- **Step. 6:** 启动本地服务器

  ```bash
  $ yarn docs:dev
  ```

  http://localhost:3000.VitePress会在http://localhost:3000上启动一个热重载开发服务器。

现在，你应该已经有一个基本的但是功能的VitePress文档站点。

当你的文档站点开始成型，请阅读[部署指南](./deploy)。
