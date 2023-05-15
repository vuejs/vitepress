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

:::details Netlify 示例 `_headers` 文件

```
/assets/*
  cache-control: max-age=31536000
  cache-control: immutable
```

注意：该 `_headers` 文件应放置在[public 目录](/guide/asset-handling#the-public-directory)中（在我们的例子中是 `docs/public/_headers`），以便将其逐字复制到输出目录。

[Netlify 自定义标头文档](https://docs.netlify.com/routing/headers/)

:::

:::details Vercel 配置示例 `vercel.json`

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
- **node 版本：** `16` (或更高版本，默认情况下通常为 14 或 16，但在 Cloudflare 页面上，默认值仍然是 12，因此你可能需要[更改该版本](https://developers.cloudflare.com/pages/platform/build-configuration/))

::: warning 警告
不要为 HTML 代码启用 _Auto Minify_ 等选项。它将从输出中删除对 Vue 有意义的注释。如果被删除，你可能会看到 hydration mismatch 错误。
:::

### GitHub Pages

1. 在你的 theme 配置文件中, `docs/.vitepress/config.js`, 设置 `base` 为 GitHub 仓库的名称。如果你打算把站点部署到 `https://foo.github.io/bar/`，那你就需要把 `base` 设置为 `'/bar/'`。它始终以 `/` 开头结尾。

2. 在项目目录 `.github/workflows` 下创建一个名为 `deploy.yml` 的文件，包含以下内容：

   ```yaml
   name: Deploy
   on:
     workflow_dispatch: {}
     push:
       branches:
         - main
   jobs:
     deploy:
       runs-on: ubuntu-latest
       permissions:
         pages: write
         id-token: write
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       steps:
         - uses: actions/checkout@v3
           with:
             fetch-depth: 0
         - uses: actions/setup-node@v3
           with:
             node-version: 16
             cache: npm
         - run: npm ci
         - name: Build
           run: npm run docs:build
         - uses: actions/configure-pages@v2
         - uses: actions/upload-pages-artifact@v1
           with:
             path: docs/.vitepress/dist
         - name: Deploy
           id: deployment
           uses: actions/deploy-pages@v1
   ```

   ::: tip 提示
   请替换相应的分支名称。比如你要建的分支是 `master` ，那么你要把上面文件中的 `main` 换成 `master`。
   :::

3. 在仓库设置中找到 `Pages` 选项，在 `Build and deployment` 下的 `Source` 中选择 `GitHub Actions`。

4. 现在提交你的代码并将其推送到 `main` 分支。

5. 等待 Actions 完成。

6. 在仓库设置中找到 `Pages` 选项，点击 `Visit site` 就可以看到你的网站。现在，你的文档将在你每次推送时自动部署。

### GitLab Pages

1. 将 `docs/.vitepress/config.js` 中的 `outDir` 设置为 `../public`。

2. 在 `docs/.vitepress/config.js` 配置文件中，将 `base` 属性设置为 GitLab 存储库的名称。如果计划将站点部署到 `https://foo.gitlab.io/bar/`，则应将 `base` 设置为 `'/bar/'`。它应始终以 `/`开头和结尾。

3. 使用以下内容在项目的根目录中创建一个名为 `.gitlab-ci.yml` 的文件。每当你更改内容时，会自动构建和部署你的站点：

   ```yaml
   image: node:16
   pages:
     cache:
       paths:
         - node_modules/
     script:
       - npm install
       - npm run docs:build
     artifacts:
       paths:
         - public
     only:
       - main
   ```

4. 或者，如果要使用 _alpine_ 版本的 node，则必须手动安装 `git`。在这种情况下，上面的代码修改为：
   ```yaml
   image: node:16-alpine
   pages:
     cache:
       paths:
         - node_modules/
     before_script:
       - apk add git
     script:
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
