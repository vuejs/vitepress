# Getting Started

This section will help you build a basic VitePress documentation site from ground up. If you already have an existing project and would like to keep documentation inside the project, start from Step 3.

## Step. 1

Create and change into a new directory.

```bash
$ mkdir vitepress-starter && cd vitepress-starter
```

## Step. 2

Initialize with your preferred package manager.

```bash
$ yarn init
```

## Step. 3

Install VitePress.

```bash
$ yarn add --dev vitepress
```

## Step. 4

Create your first document.

```bash
$ mkdir docs && echo '# Hello VitePress' > docs/index.md
```

## Step. 5

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

## Step. 6

Serve the documentation site in the local server.

```bash
$ yarn docs:dev
```

VitePress will start a hot-reloading development server at `http://localhost:3000`.

## What's next?

By now, you should have a basic but functional VitePress documentation site.

When your documentation site starts to take shape, be sure to read the [deployment guide](./deploying).
