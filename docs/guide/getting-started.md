# Getting Started

This section will help you build a basic VitePress documentation site from ground up. If you already have an existing project and would like to keep documentation inside the project, start from Step 2.

::: warning
VitePress is currently in `alpha` status. It is already suitable for out-of-the-box documentation use, but the config and theming API may still change between minor releases.
:::

## Step. 1: Create a new project

Create and change into a new directory.

```sh
$ mkdir vitepress-starter && cd vitepress-starter
```

Then, initialize with your preferred package manager.

```sh
$ yarn init
```

## Step. 2: Install VitePress

Add VitePress and Vue as dev dependencies for the project.

```sh
$ yarn add --dev vitepress vue
```

::: details Getting missing peer deps warnings?
`@docsearch/js` has certain issues with its peer dependencies. If you see some commands failing due to them, you can try this workaround for now:

On Yarn v2/v3, add this inside your rc file (`.yarnrc.yml` by default):

```yaml
packageExtensions:
  '@docsearch/react@*':
    peerDependenciesMeta:
      '@types/react':
        optional: true
      'react':
        optional: true
      'react-dom':
        optional: true
```

On PNPM, add this in your `package.json`:

```json
"pnpm": {
  "peerDependencyRules": {
    "ignoreMissing": [
      "@algolia/client-search",
      "@types/react",
      "react",
      "react-dom"
    ]
  }
}
```

:::

Create your first document.

```sh
$ mkdir docs && echo '# Hello VitePress' > docs/index.md
```

## Step. 3: Boot up dev environment

Add some scripts to `package.json`.

```json
{
  ...
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:serve": "vitepress serve docs"
  },
  ...
}
```

Serve the documentation site in the local server.

```sh
$ yarn docs:dev
```

VitePress will start a hot-reloading development server at `http://localhost:3000`.

## Step. 4: Add more pages

Let's add another page to the site. Create a file name `getting-started.md` along with `index.md` you've created in Step. 2. Now your directory structure should look like this.

```
.
├─ docs
│  ├─ getting-started.md
│  └─ index.md
└─ package.json
```

Then, try to access `http://localhost:3000/getting-started` and you should see the content of `getting-started` is shown.

This is how VitePress works basically. The directory structure corresponds with the URL path. You add files, and just try to access it.

## What's next?

By now, you should have a basic but functional VitePress documentation site. But currently, the user has no way to navigate around the site because it's missing for example sidebar menu we have on this site.

To enable those navigations, we must add some configurations to the site. Head to [configuration guide](./configuration) to learn how to configure VitePress.

If you would like to know more about what you can do within the page, for example, writing markdown contents, or using Vue Component, check out the "Writing" section of the docs. [Markdown guide](./markdown) would be a great starting point.

If you want to know how to customize how the site looks (Theme), and find out the features VitePress's default theme provides, visit [Theme: Introduction](./theme-introduction).

When your documentation site starts to take shape, be sure to read the [deployment guide](./deploying).
