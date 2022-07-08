# Deploying

The following guides are based on some shared assumptions:

- You are placing your docs inside the `docs` directory of your project.
- You are using the default build output location (`.vitepress/dist`).
- VitePress is installed as a local dependency in your project, and you have set up the following scripts in your `package.json`:

  ```json
  {
    "scripts": {
      "docs:build": "vitepress build docs",
      "docs:serve": "vitepress serve docs"
    }
  }
  ```

::: tip

If your site is to be served at a subdirectory (`https://example.com/subdir/`), then you have to set `'/subdir/'` as the [`base`](../config/app-configs#base) in your `docs/.vitepress/config.js`.

:::

## Build and Test Locally

- You may run this command to build the docs:

  ```sh
  $ yarn docs:build
  ```

- Once you've built the docs, you can test them locally by running:

  ```sh
  $ yarn docs:serve
  ```

  The `serve` command will boot up a local static web server that will serve the files from `.vitepress/dist` at `http://localhost:5000`. It's an easy way to check if the production build looks fine in your local environment.

- You can configure the port of the server by passing `--port` as an argument.

  ```json
  {
    "scripts": {
      "docs:serve": "vitepress serve docs --port 8080"
    }
  }
  ```

  Now the `docs:serve` method will launch the server at `http://localhost:8080`.

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

1. Create a file named `deploy.yml` inside `.github/workflows` directory of your project with the following content:

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
         - uses: actions/checkout@v2
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
   ```

   ::: tip
   Please replace the corresponding branch name. For example, if the branch you want to build is `master`, then you should replace `main` with `master` in the above file.
   :::

2. Now commit your code and push it to the `main` branch.

3. Wait for actions to complete. Then select `gh-pages` branch as GitHub Pages source in your repository settings. Now your docs will automatically deploy each time you push.

## GitLab Pages

### Using GitLab CI

1. Set the correct `base` in `docs/.vitepress/config.js`.

   If you are deploying to `https://<USERNAME or GROUP>.gitlab.io/`, you can omit `base` as it defaults to `'/'`.

   If you are deploying to `https://<USERNAME or GROUP>.gitlab.io/<REPO>/` (your repository is at `https://gitlab.com/<USERNAME>/<REPO>`), then set `base` to `'/<REPO>/'`.

2. Set `outDir` in `docs/.vitepress/config.js` to `../public`.

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

## Layer0

Refer [Creating and Deploying a VitePress App with Layer0](https://docs.layer0.co/guides/vitepress).
