# Deploying

The following guides are based on some shared assumptions:

- You are placing your docs inside the `docs` directory of your project;
- You are using the default build output location (`.vitepress/dist`);
- VitePress is installed as a local dependency in your project, and you have setup the following npm scripts:

```json
{
  "scripts": {
    "docs:build": "vitepress build docs",
    "docs:serve": "vitepress serve docs"
  }
}
```


::: tip Use pages hosting provided by Git service

Services such as GitHub, GitLab and other git services provide page hosting. (GitHub is used as an example below)

If you deploy a page to a repository that does not match the `<USERNAME>.github.io` name assigned to you by the platform, the page will be deployed under `<USERNAME>.github.io/<REPO>`.

You have to set the [`base`](../config/app-configs.md#base) of `docs/.vitepress/config.js` to your repository name.

In fact once you deploy your site to a subdirectory of your domain you will need to set `base`. It tells vitepress in which directory of the domain it is running. If no `base` is set, it is considered to be running in the root directory.
:::

## Build and test locally

You may run `yarn docs:build` command to build the docs.

```bash
$ yarn docs:build
```

By default, the build output will be placed at `.vitepress/dist`. You may deploy this `dist` folder to any of your preferred platforms.

Once you've built the docs, you may test them locally by running `yarn docs:serve` command.

```bash
$ yarn docs:build
$ yarn docs:serve
```

The `serve` command will boot up local static web server that serves the files from `.vitepress/dist` at `http://localhost:5000`. It's an easy way to check if the production build looks OK in your local environment.

You may configure the port of the server by passing `--port` flag as an argument.

```json
{
  "scripts": {
    "docs:serve": "vitepress serve docs --port 8080"
  }
}
```

Now the `docs:serve` method will launch the server at `http://localhost:8080`.

## GitHub Pages

### Local

Inside your project, create `deploy.sh` with the following content (with highlighted lines uncommented appropriately), and run it to deploy:

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
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git main

# if you are deploying to https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git main:gh-pages

cd -
```

::: tip
You can also run the above script in your CI setup to enable automatic deployment on each push.
:::

### Travis CI

1. Create a file named `.travis.yml` in the root of your project.

2. Run `yarn` or `npm install` locally and commit the generated lockfile (that is `yarn.lock` or `package-lock.json`).

3. Use the GitHub Pages deploy provider template, and follow the [Travis CI documentation](https://docs.travis-ci.com/user/deployment/pages).

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
    branch: main
```

### Actions

1. Select a branch as GitHub pages source in repo settings. (By default you use the `gh-pages` branch below)

2. Create a file named `deploy.yml` in `.github/workflow` of your project with the following content.

```yaml
name: Deploy

on:
  push:
    branches:
      - "master"

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v2

    - name: Set node version to 16.x
      uses: actions/setup-node@v3
      with:
        node-version: 16.x

    - name: Install dependencies
      run: npm install

    - name: Build
      run: npm run docs:build
    
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: docs/.vitepress/dist
```

3. Now push commit to `master`, pages will deploy automaticlly

## GitLab Pages and GitLab CI

1. Set `outDir` in `.vitepress/config.js` to `../public`.

2. Create a file called `.gitlab-ci.yml` in the root of your project with the content below. This will build and deploy your site whenever you make changes to your content:

```yaml
image: node:16
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
    - main
```

## Netlify

1. On [Netlify](https://www.netlify.com/), setup up a new project from GitHub with the following settings:

- **Build Command:** `vitepress build docs` or `yarn docs:build` or `npm run docs:build`
- **Publish directory:** `docs/.vitepress/dist`

2. Hit the deploy button.

## Google Firebase

1. Make sure you have [firebase-tools](https://www.npmjs.com/package/firebase-tools) installed.

2. Create `firebase.json` and `.firebaserc` at the root of your project with the following content:

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

3. After running `yarn docs:build` or `npm run docs:build`, deploy using the command `firebase deploy`.

## Surge

1. First install [surge](https://www.npmjs.com/package/surge), if you haven’t already.

2. Run `yarn docs:build` or `npm run docs:build`.

3. Deploy to surge by typing `surge docs/.vitepress/dist`.

You can also deploy to a [custom domain](https://surge.sh/help/adding-a-custom-domain) by adding `surge docs/.vitepress/dist yourdomain.com`.

## Heroku

1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli).

2. Create a Heroku account by [signing up](https://signup.heroku.com).

3. Run `heroku login` and fill in your Heroku credentials:

```bash
$ heroku login
```

4. Create a file called `static.json` in the root of your project with the below content:

`static.json`:

```json
{
  "root": "./docs/.vitepress/dist"
}
```

This is the configuration of your site; read more at [heroku-buildpack-static](https://github.com/heroku/heroku-buildpack-static).

5. Set up your Heroku git remote:

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

6. Deploy your site:

```bash
# publish site
$ git push heroku main

# opens a browser to view the Dashboard version of Heroku CI
$ heroku open
```

## Vercel

To deploy your VitePress app with a [Vercel for Git](https://vercel.com/docs/concepts/git), make sure it has been pushed to a Git repository.

Go to https://vercel.com/new and import the project into Vercel using your Git of choice (GitHub, GitLab or BitBucket). Follow the wizard to select the project root with the project's `package.json` and override the build step using `yarn docs:build` or `npm run docs:build` and the output dir to be `./docs/.vitepress/dist`

![Override Vercel Configuration](../images/vercel-configuration.png)

After your project has been imported, all subsequent pushes to branches will generate Preview Deployments, and all changes made to the Production Branch (commonly "main") will result in a Production Deployment.

Once deployed, you will get a URL to see your app live, such as the following: https://vitepress.vercel.app

## Layer0

See [Creating and Deploying a VitePress App with Layer0](https://docs.layer0.co/guides/vitepress).
