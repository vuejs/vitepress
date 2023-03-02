# Getting Started

This section will help you build a basic VitePress documentation site from ground up. If you already have an existing project and would like to keep documentation inside the project, start from Step 2.

You can also try VitePress online on [StackBlitz](https://vitepress.new/). It runs the VitePress-based site directly in the browser, so it is almost identical to the local setup but doesn't require installing anything on your machine.

::: warning
VitePress is currently in `alpha` status. It is already suitable for out-of-the-box documentation use, but the config and theming API may still change between minor releases.
:::

## Step 1: Create a new project

Create and change into a new directory.

```sh
$ mkdir vitepress-starter && cd vitepress-starter
```

Then, initialize with your preferred package manager.

::: code-group

```sh [npm]
$ npm init
```

```sh [yarn]
$ yarn init
```

```sh [pnpm]
$ pnpm init
```

:::

## Step 2: Install VitePress

Add VitePress and Vue as dev dependencies for the project.

::: code-group

```sh [npm]
$ npm install -D vitepress vue
```

```sh [yarn]
$ yarn add -D vitepress vue
```

```sh [pnpm]
$ pnpm add -D vitepress vue
```

:::

::: details Getting missing peer deps warnings?
`@docsearch/js` has certain issues with its peer dependencies. If you see some commands failing due to them, you can try this workaround for now:

If using PNPM, add this in your `package.json`:

```json
"pnpm": {
  "peerDependencyRules": {
    "ignoreMissing": [
      "@algolia/client-search"
    ]
  }
}
```

:::

Create your first document.

```sh
$ mkdir docs && echo '# Hello VitePress' > docs/index.md
```

## Step 3: Boot up dev environment

Add some scripts to `package.json`.

```json
{
  ...
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  },
  ...
}
```

Serve the documentation site in the local server.

::: code-group

```sh [npm]
$ npm run docs:dev
```

```sh [yarn]
$ yarn docs:dev
```

```sh [pnpm]
$ pnpm run docs:dev
```

:::
VitePress will start a hot-reloading development server at `http://localhost:5173`.

## Step 4: Add more pages

Let's add another page to the site. Create a file name `getting-started.md` along with `index.md` you've created in Step 2. Now your directory structure should look like this.

```
.
├─ docs
│  ├─ getting-started.md
│  └─ index.md
└─ package.json
```

Then, try to access `http://localhost:5173/getting-started.html` and you should see the content of `getting-started.md` is shown.

This is how VitePress works basically. The directory structure corresponds with the URL path. You add files, and just try to access it.

## Configuration

Without any configuration, the page is pretty minimal, and the user has no way to navigate around the site. To customize your site, let's first create a `.vitepress` directory inside your docs directory. This is where all VitePress-specific files will be placed. Your project structure is probably like this:

```
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.js
│  └─ index.md
└─ package.json
```

The essential file for configuring a VitePress site is `.vitepress/config.js`, which should export a JavaScript object:

```js
export default {
  title: 'VitePress',
  description: 'Just playing around.'
}
```

In the above example, the site will have the title of `VitePress`, and `Just playing around.` as the description meta tag.

Learn everything about VitePress features at [Theme: Introduction](./custom-theme) to find how to configure specific features within this config file.

You may also find all configuration references at [Config Reference](/reference/site-config).

## What's next?

By now, you should have a basic but functional VitePress documentation site. But currently, the user has no way to navigate around the site because it's missing for example sidebar menu we have on this site.

If you would like to know more about what you can do within the page, for example, writing markdown contents, or using Vue Component, check out the "Writing" section of the docs. [Markdown guide](./markdown) would be a great starting point.

If you want to know how to customize how the site looks (Theme), and find out the features VitePress's default theme provides, check out how to [extend the default theme](./extending-default-theme) or [build a custom theme](./custom-theme).

When your documentation site starts to take shape, be sure to read the [deployment guide](./deploy).
