# Deploying

The following guides are based on some shared assumptions:

- You are placing your docs inside the `docs` directory of your project.
- You are using the default build output location (`.vitepress/dist`).
- VitePress is installed as a local dependency in your project, and you have set up the following scripts in your `package.json`:

  ```json
  {
    "scripts": {
      "docs:build": "vitepress build docs",
      "docs:preview": "vitepress preview docs"
    }
  }
  ```

::: tip

If your site is to be served at a subdirectory (`https://example.com/subdir/`), then you have to set `'/subdir/'` as the [`base`](../config/app-configs#base) in your `docs/.vitepress/config.js`.

**Example:** If you're using Github (or GitLab) Pages and deploying to `user.github.io/repo/`, then set your `base` to `/repo/`.

:::

## Build and Test Locally

- You may run this command to build the docs:

  ```sh
  $ yarn docs:build
  ```

- Once you've built the docs, you can test them locally by running:

  ```sh
  $ yarn docs:preview
  ```

  The `preview` command will boot up a local static web server that will serve the files from `.vitepress/dist` at `http://localhost:4173`. It's an easy way to check if the production build looks fine in your local environment.

- You can configure the port of the server by passing `--port` as an argument.

  ```json
  {
    "scripts": {
      "docs:preview": "vitepress preview docs --port 8080"
    }
  }
  ```

  Now the `docs:preview` method will launch the server at `http://localhost:8080`.

## Netlify, Vercel, AWS Amplify, Cloudflare Pages, Render

Set up a new project and change these settings using your dashboard:

- **Build Command:** `yarn docs:build`
- **Output Directory:** `docs/.vitepress/dist`
- **Node Version:** `14` (or above, by default it usually will be 14 or 16, but on Cloudflare Pages the default is still 12, so you may need to [change that](https://developers.cloudflare.com/pages/platform/build-configuration/))

::: warning
Don't enable options like _Auto Minify_ for HTML code. It will remove comments from output which have meaning to Vue. You may see hydration mismatch errors if they get removed.
:::

## GitHub Pages

### Using GitHub Actions

1. In your theme config file, `docs/.vitepress/config.js`, set the `base` property to the name of your GitHub repository. If you plan to deploy your site to `https://foo.github.io/bar/`, then you should set base to `'/bar/'`. It should always start and end with a slash.

2. Create a file named `deploy.yml` inside `.github/workflows` directory of your project with the following content:

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

   ::: tip
   Please replace the corresponding branch name. For example, if the branch you want to build is `master`, then you should replace `main` with `master` in the above file.
   :::

3. Now commit your code and push it to the `main` branch.

4. Wait for actions to complete.

5. In your repository's Settings under Pages menu item, select `gh-pages` branch as GitHub Pages source. Now your docs will automatically deploy each time you push.

## GitLab Pages

### Using GitLab CI

1. Set `outDir` in `docs/.vitepress/config.js` to `../public`.

2. Still in your config file, `docs/.vitepress/config.js`, set the `base` property to the name of your GitLab repository. If you plan to deploy your site to `https://foo.gitlab.io/bar/`, then you should set base to `'/bar/'`. It should always start and end with a slash.

3. Create a file called `.gitlab-ci.yml` in the root of your project with the content below. This will build and deploy your site whenever you make changes to your content:

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

4. Alternatively, if you want to use an _alpine_ version of node, you have to install `git` manually. In that case, the code above modifies to this:
   ```yaml
   image: node:16-alpine
   pages:
     cache:
       paths:
         - node_modules/
     before_script:
       - apk add git
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

1. Follow the [official documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/build-configuration).

2. Set these values in your configuration file (and remove the ones you don't require, like `api_location`):

   - **`app_location`**: `/`
   - **`output_location`**: `docs/.vitepress/dist`
   - **`app_build_command`**: `yarn docs:build`

## Firebase

1. Create `firebase.json` and `.firebaserc` at the root of your project:

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

2. After running `yarn docs:build`, run this command to deploy:

   ```sh
   firebase deploy
   ```

## Surge

1. After running `yarn docs:build`, run this command to deploy:

   ```sh
   npx surge docs/.vitepress/dist
   ```

## Heroku

1. Follow documentation and guide given in [`heroku-buildpack-static`](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-static).

2. Create a file called `static.json` in the root of your project with the below content:

   ```json
   {
     "root": "docs/.vitepress/dist"
   }
   ```

## Edgio

Refer [Creating and Deploying a VitePress App To Edgio](https://docs.edg.io/guides/vitepress).
