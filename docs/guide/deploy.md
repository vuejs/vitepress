---
outline: deep
---

# Deploy Your VitePress Site

The following guides are based on some shared assumptions:

- The VitePress site is inside the `docs` directory of your project.
- You are using the default build output directory (`.vitepress/dist`).
- VitePress is installed as a local dependency in your project, and you have set up the following scripts in your `package.json`:

  ```json
  {
    "scripts": {
      "docs:build": "vitepress build docs",
      "docs:preview": "vitepress preview docs"
    }
  }
  ```

## Build and Test Locally

1. Run this command to build the docs:

   ```sh
   $ npm run docs:build
   ```

2. Once built, preview it locally by running:

   ```sh
   $ npm run docs:preview
   ```

   The `preview` command will boot up a local static web server that will serve the output directory `.vitepress/dist` at `http://localhost:4173`. You can use this to make sure everything looks good before pushing to production.

3. You can configure the port of the server by passing `--port` as an argument.

   ```json
   {
     "scripts": {
       "docs:preview": "vitepress preview docs --port 8080"
     }
   }
   ```

   Now the `docs:preview` method will launch the server at `http://localhost:8080`.

## Setting a Public Base Path

By default, we assume the site is going to be deployed at the root path of a domain (`/`). If your site is going to be served at a sub-path, e.g. `https://mywebsite.com/blog/`, then you need to set the [`base`](../reference/site-config#base) option to `'/blog/'` in the VitePress config.

**Example:** If you're using Github (or GitLab) Pages and deploying to `user.github.io/repo/`, then set your `base` to `/repo/`.

## HTTP Cache Headers

If you have control over the HTTP headers on your production server, you can configure `cache-control` headers to achieve better performance on repeated visits.

The production build uses hashed file names for static assets (JavaScript, CSS and other imported assets not in `public`). If you inspect the production preview using your browser devtools' network tab, you will see files like `app.4f283b18.js`.

This `4f283b18` hash is generated from the content of this file. The same hashed URL is guaranteed to serve the same file content - if the contents change, the URLs change too. This means you can safely use the strongest cache headers for these files. All such files will be placed under `assets/` in the output directory, so you can configure the following header for them:

```
Cache-Control: max-age=31536000,immutable
```

::: details Example Netlify `_headers` file

```
/assets/*
  cache-control: max-age=31536000
  cache-control: immutable
```

Note: the `_headers` file should be placed in the [public directory](./asset-handling#the-public-directory) - in our case, `docs/public/_headers` - so that it is copied verbatim to the output directory.

[Netlify custom headers documentation](https://docs.netlify.com/routing/headers/)

:::

::: details Example Vercel config in `vercel.json`

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

Note: the `vercel.json` file should be placed at the root of your **repository**.

[Vercel documentation on headers config](https://vercel.com/docs/concepts/projects/project-configuration#headers)

:::

## Platform Guides

### Netlify / Vercel / Cloudflare Pages / AWS Amplify / Render

Set up a new project and change these settings using your dashboard:

- **Build Command:** `npm run docs:build`
- **Output Directory:** `docs/.vitepress/dist`
- **Node Version:** `18` (or above)

::: warning
Don't enable options like _Auto Minify_ for HTML code. It will remove comments from output which have meaning to Vue. You may see hydration mismatch errors if they get removed.
:::

### GitHub Pages

1. Create a file named `deploy.yml` inside `.github/workflows` directory of your project with some content like this:

   ```yaml
   # Sample workflow for building and deploying a VitePress site to GitHub Pages
   #
   name: Deploy VitePress site to Pages

   on:
     # Runs on pushes targeting the `main` branch. Change this to `master` if you're
     # using the `master` branch as the default branch.
     push:
       branches: [main]

     # Allows you to run this workflow manually from the Actions tab
     workflow_dispatch:

   # Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
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
         - name: Setup Node
           uses: actions/setup-node@v3
           with:
             node-version: 18
             cache: npm # or pnpm / yarn
         - name: Setup Pages
           uses: actions/configure-pages@v3
         - name: Install dependencies
           run: npm ci # or pnpm install / yarn install
         - name: Build with VitePress
           run: |
             npm run docs:build # or pnpm docs:build / yarn docs:build
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

   ::: warning
   Make sure the `base` option in your VitePress is properly configured. See [Setting a Public Base Path](#setting-a-public-base-path) for more details.
   :::

2. In your repository's settings under "Pages" menu item, select "GitHub Actions" in "Build and deployment > Source".

3. Push your changes to the `main` branch and wait for the GitHub Actions workflow to complete. You should see your site deployed to `https://<username>.github.io/[repository]/` or `https://<custom-domain>/` depending on your settings. Your site will automatically be deployed on every push to the `main` branch.

### GitLab Pages

1. Set `outDir` in VitePress config to `../public`. Configure `base` option to `'/<repository>/'` if you want to deploy to `https://<username>.gitlab.io/<repository>/`.

2. Create a file named `.gitlab-ci.yml` in the root of your project with the content below. This will build and deploy your site whenever you make changes to your content:

   ```yaml
   image: node:16
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

### Azure Static Web Apps

1. Follow the [official documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/build-configuration).

2. Set these values in your configuration file (and remove the ones you don't require, like `api_location`):

   - **`app_location`**: `/`
   - **`output_location`**: `docs/.vitepress/dist`
   - **`app_build_command`**: `npm run docs:build`

### Firebase

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

2. After running `npm run docs:build`, run this command to deploy:

   ```sh
   firebase deploy
   ```

### Surge

1. After running `npm run docs:build`, run this command to deploy:

   ```sh
   npx surge docs/.vitepress/dist
   ```

### Heroku

1. Follow documentation and guide given in [`heroku-buildpack-static`](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-static).

2. Create a file called `static.json` in the root of your project with the below content:

   ```json
   {
     "root": "docs/.vitepress/dist"
   }
   ```

### Edgio

Refer [Creating and Deploying a VitePress App To Edgio](https://docs.edg.io/guides/vitepress).
