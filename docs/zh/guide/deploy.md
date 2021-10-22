---
sidebarDepth: 3
---

# 部署

下面的指南基于一些共享假设：

- 你正在将你的文档放置在你的项目的`docs`目录中;
- 你正在使用默认的构建输出位置(`.vitepress/dist`);
- VitePress作为一个本地依赖安装在你的项目中，并且你已经设置了以下npm脚本:

```json
{
  "scripts": {
    "docs:build": "vitepress build docs",
    "docs:serve": "vitepress serve docs"
  }
}
```

## 构建文档

你可以运行`yarn docs:build`命令来构建文档。

```bash
$ yarn docs:build
```

默认情况下，构建输出将被放置在`.vitepress/dist`。你可以将这个`dist`文件夹部署到任何你喜欢的平台。

### 在本地测试文档

一旦你构建了文档，你可以通过运行`yarn docs:serve`命令来在本地测试它们。

```bash
$ yarn docs:build
$ yarn docs:serve
```

`serve`命令将启动本地静态web服务器，它将从`.vitepress/dist`目录中提供文件。它是一个简单的方式来检查你的本地环境中的生产构建是否正常。

你可以通过传递`--port`标志作为参数来配置服务器的端口。

```json
{
  "scripts": {
    "docs:serve": "vitepress serve docs --port 8080"
  }
}
```

现在，`docs:serve`方法将在http://localhost:8080启动服务器。

## GitHub Pages

1. 设置正确的`base`在`docs/.vitepress/config.js`。

   如果你正在部署到`https://<USERNAME>.github.io/`，你可以忽略`base`，它默认为`'/'`。

   如果你正在部署到`https://<USERNAME>.github.io/<REPO>/`，例如你的仓库在`https://github.com/<USERNAME>/<REPO>`，那么设置`base`为`'/<REPO>/'`。

2. 在你的项目中，创建`deploy.sh`，并且使用以下内容（突出显示的几行未作适当的注释），然后运行它来部署：

```bash{13,20,23}
#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run docs:build

# navigate into the build output directory
cd docs/.vitepress/dist

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# if you are deploying to https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -
```

::: Tip
你也可以在你的CI设置中运行上面的脚本来启用每次推送的自动部署。
:::

### GitHub Pages and Travis CI

1. 在`docs/.vitepress/config.js`设置正确的`base`。

   如果你正在部署到`https://<USERNAME or GROUP>.github.io/`，你可以忽略`base`，它默认为`'/'`。

   如果你正在部署到`https://<USERNAME or GROUP>.github.io/<REPO>/`，例如你的仓库在`https://github.com/<USERNAME>/<REPO>`,然后设置`base`为`'/<REPO>/'`。

2. 在项目的根目录中创建一个名为`travis.yml`的文件。

3. 在本地运行`yarn`或`npm install`，并且提交生成的锁文件（这是`yarn.lock`或`package-lock.json`）。

4. 使用GitHub Pages部署提供者模板，并且根据[Travis CI文档](https://docs.travis-ci.com/user/deployment/pages/)。

```yaml
language: node_js
node_js:
  - lts/*
install:
  - yarn install # npm ci
script:
  - yarn docs:build # npm run docs:build
deploy:
  provider: pages
  skip_cleanup: true
  local_dir: docs/.vitepress/dist
  # A token generated on GitHub allowing Travis to push code on you repository.
  # Set in the Travis settings page of your repository, as a secure variable.
  github_token: $GITHUB_TOKEN
  keep_history: true
  on:
    branch: master
```

## GitLab Pages and GitLab CI

1. 在`docs/.vitepress/config.js`中设置正确的`base`。

   如果你正在部署到`https://<USERNAME or GROUP>.gitlab.io/`，你可以忽略`base`，它默认为`'/'`。

   如果你正在部署到`https://<USERNAME or GROUP>.gitlab.io/<REPO>/`，例如你的仓库在`https://gitlab.com/<USERNAME>/<REPO>`，那么设置`base`为`'/<REPO>/'`。

2. 在`docs/.vitepress/config.js`为`public`中设置`dest`。

3. 在项目的根目录中创建一个名为`gitlab-ci.yml`的文件，并且使用以下内容。这将在你对内容的更改时自动构建并部署你的网站：

```yaml
image: node:10.22.0
pages:
  cache:
    paths:
      - node_modules/
  script:
    - yarn install # npm install
    - yarn docs:build # npm run docs:build
  artifacts:
    paths:
      - public
  only:
    - master
```

## Netlify

1. 在[Netlify](https://netlify.com)，使用以下设置创建一个新的项目：

- **Build Command:** `vitepress build docs` or `yarn docs:build` or `npm run docs:build`
- **Publish directory:** `docs/.vitepress/dist`

2. 点击部署按钮。

## Google Firebase

1. 确保你已经安装了[firebase-tools](https://www.npmjs.com/package/firebase-tools)。

2. 在项目的根目录中创建`firebase.json`和`firebaserc`，并且使用以下内容：

`firebase.json`:

```json
{
  "hosting": {
    "public": "./docs/.vitepress/dist",
    "ignore": []
  }
}
```

`.firebaserc`:

```js
{
 "projects": {
   "default": "<YOUR_FIREBASE_ID>"
 }
}
```

3. 在运行`yarn docs:build`或`npm run docs:build`后，使用`firebase deploy`命令部署。

## Surge

1. 如果你还没有安装[surge](https://www.npmjs.com/package/surge), 那么先安装。

2. 运行`yarn docs:build`或`npm run docs:build`。

3. 通过输入`surge docs/.vitepress/dist`来部署到surge。

You can also deploy to a [custom domain](https://surge.sh/help/adding-a-custom-domain) by adding `surge docs/.vitepress/dist yourdomain.com`.
你也可以通过添加`surge docs/.vitepress/dist yourdomain.com`来部署到[自定义域名](https://surge.sh/help/adding-a-custom-domain)。

## Heroku

1. 安装[Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)。

2. 创建一个Heroku账户，请[注册](https://signup.heroku.com)。

3. 运行`heroku login`并填写Heroku的账户信息：

```bash
$ heroku login
```

4. 在项目的根目录中创建一个名为`static.json`的文件，并且使用以下内容：

`static.json`:

```json
{
  "root": "./docs/.vitepress/dist"
}
```

这是你的网站的配置，更多信息请参考[heroku-buildpack-static](https://github.com/heroku/heroku-buildpack-static)。

5. 设置你的Heroku git remote:

```bash
# version change
$ git init
$ git add .
$ git commit -m "My site ready for deployment."

# creates a new app with a specified name
$ heroku apps:create example

# set buildpack for static sites
$ heroku buildpacks:set https://github.com/heroku/heroku-buildpack-static.git
```

6. 部署你的网站：

```bash
# publish site
$ git push heroku master

# opens a browser to view the Dashboard version of Heroku CI
$ heroku open
```

## Vercel

为了部署VitePress网站，使用[Vercel for Git](https://vercel.com/docs/git)，请确保它已经被推送到Git仓库。

访问https://vercel.com/import/git 并使用你的Git选择（GitHub、GitLab或BitBucket）导入项目。使用向导来选择项目根目录，并使用`yarn docs:build`或`npm run docs:build`来覆盖构建步骤，输出目录为`./docs/.vitepress/dist`。

![Override Vercel Configuration](../images/vercel-configuration.png)

在项目被导入后，所有后续的推送分支都会生成预览部署，并且所有在生产分支（通常是“main”）上的更改都会生成生产部署。

一旦部署完成，你将会得到一个可以查看你的网站的URL，例如：https://vitepress.vercel.app
