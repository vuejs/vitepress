# 部署 {#deploying}

指南基于以下前置环境：

- 文档放在项目的 `docs` 目录中。
- 使用默认的构建输出位置 (`.vitepress/dist`)。
- VitePress 作为本地依赖安装在项目中，并且在 `package.json` 中设置了以下脚本：

  ```json
  {
    "scripts": {
      "docs:build": "vitepress build docs",
      "docs:serve": "vitepress serve docs"
    }
  }
  ```

::: tip 提示

如果使用子目录(`https://example.com/subdir/`)作为部署站点，则必须在 `docs/.vitepress/config.js` 中将 `'/subdir/'` 设置为 [`base`](../config/app-configs#base) 的值。

**示例：** 如果你使用 Github (或 GitLab) 页面并部署到 `user.github.io/repo/`，则将 `base` 设置为 `/repo/`。

:::

## 本地打包和测试 {#build-and-test-locally}

- 运行此命令来打包文档：

  ```sh
  $ yarn docs:build
  ```

- 打包文档后，你可以通过运行命令在本地进行调试：

  ```sh
  $ yarn docs:serve
  ```

`serve` 命令将启动一个本地静态 Web 服务，该服务将在 `http://localhost:4173` 输出来自 `.vitepress/dist` 的文件。 这是检查生产版本在你的本地环境中是否正常的简易方法。

- 可以通过传递 `--port` 作为参数来配置服务器运行的端口。

  ```json
  {
    "scripts": {
      "docs:serve": "vitepress serve docs --port 8080"
    }
  }
  ```

  现在 `docs:serve` 方法将在 `http://localhost:8080` 启动服务器。

## 在 Netlify, Vercel, AWS Amplify, Cloudflare Pages 里部署 {#netlify-vercel-aws-amplify-cloudflare-pages-render}

创建一个新项目并改成以下这些设置：

- **Build Command:** `yarn docs:build`
- **Output Directory:** `docs/.vitepress/dist`
- **Node Version:** `14` (或者更高，默认值通常是 14 或 16，但在 Cloudflare Pages 上，默认值仍然是 12，所以你可能需要[修改](https://developers.cloudflare.com/pages/platform/build-configuration/))。

::: warning 警告
不要为 HTML 代码启用 _Auto Minify_ 之类的选项。 它将从输出中删除对 Vue 有意义的注释。如果它们被删除，可能会出现页面 hydration 不正确的问题。
:::

## GitHub Pages

### 使用 GitHub Actions {#using-github-actions}

1. 在你的主题配置文件 `docs/.vitepress/config.js` 中，将 `base` 属性设置为你的 GitHub 仓库的名称。 如果你打算将你的站点部署到`https://foo.github.io/bar/`，那么你应该将base设置为`'/bar/'`。 它应该始终以斜线开头和结尾。

2. 在项目的 `.github/workflows` 目录中创建一个名为 `deploy.yml` 的文件，内容如下：

   ```yaml
   name: Deploy

   on:
     push:
       branches:
         - main

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
           with:
             fetch-depth: 0
         - uses: actions/setup-node@v3
           with:
             node-version: 16
             cache: yarn
         - run: yarn install --frozen-lockfile

         - name: Build
           run: yarn docs:build

         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: docs/.vitepress/dist
             # cname: example.com # if wanna deploy to custom domain
   ```

   ::: tip 提示
   请替换对应的分支名称。例如，如果你要构建的分支是 `master`，则应将上述文件中的 `main` 替换为 `master`。
   :::

3. 现在提交你的代码并将其推送到 `main` 分支。

4. 等待 action 完成。

5. 在 git 仓库的 Setting 选项里，选择 `gh-pages` 分支作为 GitHub Pages 的来源。现在，你的文档将在每次推送时自动部署。

## GitLab Pages

### 使用 GitLab CI {#using-gitlab-ci}

1. 将 `docs/.vitepress/config.js` 中的 `outDir` 设置为 `../public`。

2. 在项目的根目录中创建一个名为 `.gitlab-ci.yml` 的文件，内容如下。每更改内容时，将会构建和部署你的站点：

   ```yaml
   image: node:16
   pages:
     cache:
       paths:
         - node_modules/
     script:
       - yarn install
       - yarn docs:build
     artifacts:
       paths:
         - public
     only:
       - main
   ```

## Azure Static Web Apps

1. 参照[官方文档](https://docs.microsoft.com/en-us/azure/static-web-apps/build-configuration)。

2. 在配置文件中设置这些值(并删除不需要的值，例如 `api_location`)：

   - **`app_location`**: `/`
   - **`output_location`**: `docs/.vitepress/dist`
   - **`app_build_command`**: `yarn docs:build`

## Firebase

1. 在项目根目录下创建 `firebase.json` 和 `.firebaserc`

   `firebase.json`:

   ```json
   {
     "hosting": {
       "public": "docs/.vitepress/dist",
       "ignore": []
     }
   }
   ```

   `.firebaserc`:

   ```json
   {
     "projects": {
       "default": "<YOUR_FIREBASE_ID>"
     }
   }
   ```

2. 执行 `yarn docs:build` 打包命令以后, 执行以下脚本进行部署:

   ```sh
   firebase deploy
   ```

## Surge

1. 执行 `yarn docs:build` 打包命令以后，执行以下脚本进行部署:

   ```sh
   npx surge docs/.vitepress/dist
   ```

## Heroku

1. 参照 [`heroku-buildpack-static`](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-static) 的文档和指南。

2. 在项目根目录下创建一个叫 `static.json` 的文件，内容如下:

   ```json
   {
     "root": "docs/.vitepress/dist"
   }
   ```

## Layer0

参考[在 Layer0 里创建和部署 VitePress 应用](https://docs.layer0.co/guides/vitepress)。
