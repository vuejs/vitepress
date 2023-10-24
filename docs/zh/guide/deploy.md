---
outline: deep
---

# 部署你的 VitePress 网站 {#deploy-your-vitepress-site}

以下指南基于一些共设前提：

- VitePress 站点位于项目的 `docs` 目录中。
- 你使用的是默认的生成输出目录 （`.vitepress/dist`）。
- VitePress 作为本地依赖项安装在项目中，并且你已在 `package.json` 中设置以下脚本：

  ```json
  {
  	"scripts": {
  		"docs:build": "vitepress build docs",
  		"docs:preview": "vitepress preview docs"
  	}
  }
  ```

## 本地构建与测试 {#build-and-test-locally}

- 你可以运行以下命令来构建文档：

  ```sh
  yarn docs:build
  ```

- 构建文档后，通过运行以下命令在本地预览它：

  ```sh
  yarn docs:preview
  ```

  `preview` 命令将启动一个本地静态 Web 服务器`http://localhost:4173`，该服务器以 `.vitepress/dist` 作为源文件。这是检查生产版本在本地环境中是否正常的一种简单方法。

- 你可以通过传递`--port`作为参数来配置服务器的端口。

  ```json
  {
  	"scripts": {
  		"docs:preview": "vitepress preview docs --port 8080"
  	}
  }
  ```

  现在`docs:preview`方法将在`http://localhost:8080`启动服务器。

## 设定 public 根目录 {#setting-a-public-base-path}

默认情况下，我们假设站点将部署在域名 （`/`） 的根路径上。如果你的网站将在子路径中提供服务，例如 `https://mywebsite.com/blog/`，则需要在 VitePress 配置中将 [`base`](../reference/site-config#base)选项设置为 `'/blog/'`。

**例：**如果你使用的是 Github（或 GitLab）页面并部署到 `user.github.io/repo/`，请将你的 `base` 设置为 `/repo/`。

## HTTP 缓存标头 {#http-cache-headers}

如果可以控制生产服务器上的 HTTP 标头，则可以配置 `cache-control` 标头以在重复访问时获得更好的性能。

生产版本对静态资源（JavaScript、CSS 和其他非 `public` 目录中的导入资源）使用哈希文件名。如果你使用浏览器开发工具的网络选项卡检查生产预览，你将看到类似 `app.4f283b18.js` 的文件。

此哈希 `4f283b18` 是从此文件的内容生成的。相同的哈希 URL 保证提供相同的文件内容 —— 如果内容更改，URL 也会更改。这意味着你可以安全地为这些文件使用最强的缓存标头。所有此类文件都将放置在输出目录的 `assets/` 中，因此你可以为它们配置以下标头：

```
Cache-Control: max-age=31536000,immutable
```

::: details Netlify 示例 `_headers` 文件

```
/assets/*
  cache-control: max-age=31536000
  cache-control: immutable
```

注意：该 `_headers` 文件应放置在[public 目录](./asset-handling#the-public-directory)中（在我们的例子中是 `docs/public/_headers`），以便将其逐字复制到输出目录。

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

::: warning 警告
不要为 HTML 代码启用 _Auto Minify_ 等选项。它将从输出中删除对 Vue 有意义的注释。如果被删除，你可能会看到 [hydration(HTML 添加交互的过程)](https://blog.csdn.net/qq_41800366/article/details/117738916) mismatch 错误。
:::

### GitHub Pages

1. 在项目的 `.github/workflows` 目录中创建一个名为 `deploy.yml` 的文件，其中包含如下内容：
<!-- 在你的 theme 配置文件中, `docs/.vitepress/config.js`, 设置 `base` 为 GitHub 仓库的名称。如果你打算把站点部署到 `https://foo.github.io/bar/`，那你就需要把 `base` 设置为 `'/bar/'`。它始终以 `/` 开头结尾。 -->

```yaml
# 用于构建 VitePress 站点并将其部署到 GitHub Pages 的示例工作流
#
name: Deploy VitePress site to Pages

on:
  #  在针对“main”分支的推送上运行。如果你使用 `master` 分支作为默认分支，请将其更改为“master”
  push:
    branches: [main]

  # 允许你从 Action 选项卡手动运行此工作流程
  workflow_dispatch:

# 设置 GITHUB_TOKEN 的权限以允许部署到 GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
# However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
     # Build job
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v3
           with:
             fetch-depth: 0 # Not needed if lastUpdated is not enabled
         # - uses: pnpm/action-setup@v2 # Uncomment this if you're using pnpm
         # - uses: oven-sh/setup-bun@v1 # Uncomment this if you're using Bun
         - name: Setup Node
           uses: actions/setup-node@v3
           with:
             node-version: 18
             cache: npm # or pnpm / yarn
         - name: Setup Pages
           uses: actions/configure-pages@v3
         - name: Install dependencies
           run: npm ci # or pnpm install / yarn install / bun install
         - name: Build with VitePress
           run: |
             npm run docs:build # or pnpm docs:build / yarn docs:build / bun run docs:build
             touch docs/.vitepress/dist/.nojekyll
         - name: Upload artifact
           uses: actions/upload-pages-artifact@v2
           with:
             path: docs/.vitepress/dist

  # Deployment job
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
        uses: actions/deploy-pages@v2
```

::: warning 警告
确保 VitePress 中的 `base` 选项配置正确。有关更多详细信息，请参阅[设置 Public Base Path](#setting-a-public-base-path)。
:::

2. 在存储库设置中的 `Pages` 菜单项下，选择 `Build and deployment > Source` 中的 `GitHub Actions`。

3. 将更改推送到 `main` 分支并等待 GitHub Actions 工作流完成。你应该看到你的站点部署到 `https://”<username>.github.io/[repository]/` 或 `https://<custom-domain>/`，这取决于你的设置。你的网站将在每次推送到 `main` 分支时自动部署。

### GitLab Pages

1. 将 `docs/.vitepress/config.js` 中的 `outDir` 设置为 `../public`。如果你想部署到 `https://<username> .gitlab.io/<repository> /`，将 `base` 选项配置为 `'/<repository> /'`。

2. 在项目的根目录中创建一个名为 `.gitlab-ci.yml` 的文件，其中包含以下内容。每当你更改内容时，都会自动构建和部署你的网站：

   ```yaml
   image: node:18
   pages:
     cache:
       paths:
         - node_modules/
     script:
       # - apk add git # Uncomment this if you're using small docker images like alpine and have lastUpdated enabled
       - npm install
       - npm run docs:build
     artifacts:
       paths:
         - public
     only:
       - main
   ```

### Azure Static Web Apps {#azure-static-web-apps}

1. 遵循[官方文档](https://docs.microsoft.com/en-us/azure/static-web-apps/build-configuration)。

2. 在配置文件中设置这些值（并删除不需要的值，如 `api_location`）：

   - **`app_location`**: `/`
   - **`output_location`**: `docs/.vitepress/dist`
   - **`app_build_command`**: `npm run docs:build`

### Firebase {#firebase}

1. 在项目的根目录下创建 `firebase.json` 和 `.firebaserc`：

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

2. 运行 `yarn docs:build` 后，运行此命令进行部署：

   ```sh
   firebase deploy
   ```

### Surge

1. 运行 `yarn docs:build` 后，运行此命令进行部署：

   ```sh
   npx surge docs/.vitepress/dist
   ```

### Heroku

1. 遵循 [`heroku-buildpack-static`](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-static) 中给出的文档和指南。

2. 使用以下内容在项目的根目录中创建一个名为 `static.json` 的文件：

   ```json
   {
   	"root": "docs/.vitepress/dist"
   }
   ```

### Edgio

请参阅[创建并部署 VitePress 应用程序到 Edgio](https://docs.edg.io/guides/vitepress)。
