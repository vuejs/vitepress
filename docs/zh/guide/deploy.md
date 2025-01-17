---
outline: deep
---

# 部署 VitePress 站点 {#deploy-your-vitepress-site}

以下指南基于一些前提：

- VitePress 站点位于项目的 `docs` 目录中。
- 你使用的是默认的生成输出目录 （`.vitepress/dist`）。
- VitePress 作为本地依赖项安装在项目中，并且你已在 `package.json` 中设置以下脚本：

  ```json [package.json]
  {
    "scripts": {
      "docs:build": "vitepress build docs",
      "docs:preview": "vitepress preview docs"
    }
  }
  ```

## 本地构建与测试 {#build-and-test-locally}

1. 可以运行以下命令来构建文档：

   ```sh
   $ npm run docs:build
   ```

2. 构建文档后，通过运行以下命令可以在本地预览它：

   ```sh
   $ npm run docs:preview
   ```

   `preview` 命令将启动一个本地静态 Web 服务 `http://localhost:4173`，该服务以 `.vitepress/dist` 作为源文件。这是检查生产版本在本地环境中是否正常的一种简单方法。

3. 可以通过传递 `--port` 作为参数来配置服务器的端口。

   ```json
   {
     "scripts": {
       "docs:preview": "vitepress preview docs --port 8080"
     }
   }
   ```

   现在 `docs:preview` 方法将会在 `http://localhost:8080` 启动服务。

## 设定 public 根目录 {#setting-a-public-base-path}

默认情况下，我们假设站点将部署在域名 (`/`) 的根路径上。如果站点在子路径中提供服务，例如 `https://mywebsite.com/blog/`，则需要在 VitePress 配置中将 [`base`](../reference/site-config#base) 选项设置为 `'/blog/'`。

**例**：如果你使用的是 Github（或 GitLab）页面并部署到 `user.github.io/repo/`，请将 `base` 设置为 `/repo/`。

## HTTP 缓存标头 {#http-cache-headers}

如果可以控制生产服务器上的 HTTP 标头，则可以配置 `cache-control` 标头以在重复访问时获得更好的性能。

生产版本对静态资源 (JavaScript、CSS 和其他非 `public` 目录中的导入资源) 使用哈希文件名。如果你使用浏览器开发工具的网络选项卡查看生产预览，你将看到类似 `app.4f283b18.js` 的文件。

此哈希 `4f283b18` 是从此文件的内容生成的。相同的哈希 URL 保证提供相同的文件内容——如果内容更改，URL 也会更改。这意味着你可以安全地为这些文件使用最强的缓存标头。所有此类文件都将放置在输出目录的 `assets/` 中，因此你可以为它们配置以下标头：

```
Cache-Control: max-age=31536000,immutable
```

::: details Netlify 示例 `_headers` 文件

```
/assets/*
  cache-control: max-age=31536000
  cache-control: immutable
```

注意：该 `_headers` 文件应放置在 [public 目录](./asset-handling#the-public-directory)中 (在我们的例子中是 `docs/public/_headers`)，以便将其逐字复制到输出目录。

[Netlify 自定义标头文档](https://docs.netlify.com/routing/headers/)

:::

::: details Vercel 配置示例 `vercel.json`

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

注意：`vercel.json` 文件应放在存储库的根目录中。

[Vercel 关于标头配置的文档](https://vercel.com/docs/concepts/projects/project-configuration#headers)

:::

## 各平台部署指南 {#platform-guides}

### Netlify / Vercel / Cloudflare Pages / AWS Amplify / Render

使用仪表板创建新项目并更改这些设置：

- **构建命令：** `npm run docs:build`
- **输出目录：** `docs/.vitepress/dist`
- **node 版本：** `18` (或更高版本)

::: warning
不要为 HTML 代码启用 _Auto Minify_ 等选项。它将从输出中删除对 Vue 有意义的注释。如果被删除，你可能会看到激活不匹配错误。
:::

### GitHub Pages

1. 在项目的 `.github/workflows` 目录中创建一个名为 `deploy.yml` 的文件，其中包含这样的内容：

   ```yaml [.github/workflows/deploy.yml]
   # 构建 VitePress 站点并将其部署到 GitHub Pages 的示例工作流程
   #
   name: Deploy VitePress site to Pages

   on:
     # 在针对 `main` 分支的推送上运行。如果你
     # 使用 `master` 分支作为默认分支，请将其更改为 `master`
     push:
       branches: [main]

     # 允许你从 Actions 选项卡手动运行此工作流程
     workflow_dispatch:

   # 设置 GITHUB_TOKEN 的权限，以允许部署到 GitHub Pages
   permissions:
     contents: read
     pages: write
     id-token: write

   # 只允许同时进行一次部署，跳过正在运行和最新队列之间的运行队列
   # 但是，不要取消正在进行的运行，因为我们希望允许这些生产部署完成
   concurrency:
     group: pages
     cancel-in-progress: false

   jobs:
     # 构建工作
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4
           with:
             fetch-depth: 0 # 如果未启用 lastUpdated，则不需要
         # - uses: pnpm/action-setup@v3 # 如果使用 pnpm，请取消此区域注释
         #   with:
         #     version: 9
         # - uses: oven-sh/setup-bun@v1 # 如果使用 Bun，请取消注释
         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: npm # 或 pnpm / yarn
         - name: Setup Pages
           uses: actions/configure-pages@v4
         - name: Install dependencies
           run: npm ci # 或 pnpm install / yarn install / bun install
         - name: Build with VitePress
           run: npm run docs:build # 或 pnpm docs:build / yarn docs:build / bun run docs:build
         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: docs/.vitepress/dist

     # 部署工作
     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       needs: build
       runs-on: ubuntu-latest
       name: Deploy
       steps:
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

   ::: warning
   确保 VitePress 中的 `base` 选项配置正确。有关更多详细信息，请参阅[设置根路径](#setting-a-public-base-path)。
   :::

2. 在存储库设置中的“Pages”菜单项下，选择“Build and deployment > Source > GitHub Actions”。

3. 将更改推送到 `main` 分支并等待 GitHub Action 工作流完成。你应该看到站点部署到 `https://<username>.github.io/[repository]/` 或 `https://<custom-domain>/`，这取决于你的设置。你的站点将在每次推送到 `main` 分支时自动部署。

### GitLab Pages

1. 如果你想部署到 `https://<username> .gitlab.io/<repository> /`，将 VitePress 配置中的 `outDir` 设置为 `../public`。将 `base` 选项配置为 `'/<repository>/'`。

2. 在项目的根目录中创建一个名为 `.gitlab-ci.yml` 的文件，其中包含以下内容。每当你更改内容时，这都会构建和部署你的站点：

   ```yaml [.gitlab-ci.yml]
   image: node:18
   pages:
     cache:
       paths:
         - node_modules/
     script:
       # - apk add git # 如果你使用的是像 alpine 这样的小型 docker 镜像，并且启用了 lastUpdated，请取消注释
       - npm install
       - npm run docs:build
     artifacts:
       paths:
         - public
     only:
       - main
   ```

### Azure 静态 web 应用 {#azure-static-web-apps}

1. 参考[官方文档](https://docs.microsoft.com/en-us/azure/static-web-apps/build-configuration)。

2. 在配置文件中设置这些值 (并删除不需要的值，如 `api_location`)：

   - **`app_location`**: `/`
   - **`output_location`**: `docs/.vitepress/dist`
   - **`app_build_command`**: `npm run docs:build`

### Firebase {#firebase}

1. 在项目的根目录下创建 `firebase.json` 和 `.firebaserc`：

   `firebase.json`:

   ```json [firebase.json]
   {
     "hosting": {
       "public": "docs/.vitepress/dist",
       "ignore": []
     }
   }
   ```

   `.firebaserc`:

   ```json [.firebaserc]
   {
     "projects": {
       "default": "<YOUR_FIREBASE_ID>"
     }
   }
   ```

2. 运行 `npm run docs:build` 后，运行此命令进行部署：

   ```sh
   firebase deploy
   ```

### Surge

1. 运行 `npm run docs:build` 后，运行此命令进行部署：

   ```sh
   npx surge docs/.vitepress/dist
   ```

### Heroku

1. 参考 [`heroku-buildpack-static`](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-static) 中给出的文档和指南。

2. 使用以下内容在项目的根目录中创建一个名为 `static.json` 的文件：

   ```json [static.json]
   {
     "root": "docs/.vitepress/dist"
   }
   ```

### Edgio

请参阅[创建并部署 VitePress 应用程序到 Edgio](https://docs.edg.io/guides/vitepress)。

### Kinsta 静态站点托管 {#kinsta-static-site-hosting}

你可以按照这些[说明](https://kinsta.com/docs/vitepress-static-site-example/) 在 [Kinsta](https://kinsta.com/static-site-hosting/) 上部署 VitePress 站点。

### Stormkit

你可以按照这些[说明](https://stormkit.io/blog/how-to-deploy-vitepress)将你的 VitePress 项目部署到 [Stormkit](https://www.stormkit.io)。

### Nginx

下面是一个 Nginx 服务器块配置示例。此配置包括对基于文本的常见资源的 gzip 压缩、使用适当缓存头为 VitePress 站点静态文件提供服务的规则以及处理 `cleanUrls: true` 的方法。

```nginx
server {
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    listen 80;
    server_name _;
    index index.html;

    location / {
        # content location
        root /app;

        # exact matches -> reverse clean urls -> folders -> not found
        try_files $uri $uri.html $uri/ =404;

        # non existent pages
        error_page 404 /404.html;

        # a folder without index.html raises 403 in this setup
        error_page 403 /404.html;

        # adjust caching headers
        # files in the assets folder have hashes filenames
        location ~* ^/assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

本配置默认已构建的 VitePress 站点位于服务器上的 `/app` 目录中。如果站点文件位于其他位置，请相应调整 `root` 指令。

::: warning 不要默认为 index.html
try_files 解析不能像其他 Vue 应用那样默认为 index.html。这会导致页面状态处于无效。
:::

更多信息请参见 [nginx 官方文档](https://nginx.org/en/docs/)、这些 GitHub Issue [#2837](https://github.com/vuejs/vitepress/discussions/2837)、[#3235](https://github.com/vuejs/vitepress/issues/3235)以及 Mehdi Merah 发表的[博客](https://blog.mehdi.cc/articles/vitepress-cleanurls-on-nginx-environment#readings)。
