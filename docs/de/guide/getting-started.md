---
description: Get up and running mit VitePress. Erfahre how to install, scaffold, and start developing your documentation site.
---

# Erste Schritte

## Online ausprobieren

Du kannst try VitePress directly in your browser on [StackBlitz](https://vitepress.new).

## Installation

### Voraussetzungen

- [Node.js](https://nodejs.org/) version 22 or higher.
- Terminal for accessing VitePress via its command line interface (CLI).
- Text Editor mit [Markdown](https://en.wikipedia.org/wiki/Markdown) syntax Unterstützung.
  - [VSCode](https://code.visualstudio.com/) is recommended, along mit the [official Vue extension](https://marketplace.visualstudio.com/items?itemName=Vue.volar).

VitePress can be verwendet on its own, or be installed in an existing project. In both cases, you can install it mit:

::: code-group

```sh [npm]
$ npm add -D vitepress@next
```

```sh [pnpm]
$ pnpm add -D vitepress@next
```

```sh [yarn]
$ yarn add -D vitepress@next vue
```

```sh [bun]
$ bun add -D vitepress@next
```

```sh [deno]
$ deno add -D vitepress@next
```

:::

::: tip NOTE

VitePress is an ESM-only package. Don't use `require()` to import it, and make sure your nearest `package.json` contains `"type": "module"`, or change the file extension of your relevant files like `.vitepress/config.js` to `.mjs`/`.mts`. Refer to [Vite's troubleshooting guide](http://vite.dev/guide/troubleshooting.html#this-package-is-esm-only) for more details. Also, innerhalb async CJS contexts, you can use `await import('vitepress')` instead.

:::

### Einrichtungsassistent

VitePress ships mit a command line setup wizard that will help you scaffold a basic project. After installation, start the wizard by running:

::: code-group

```sh [npm]
$ npx vitepress init
```

```sh [pnpm]
$ pnpm vitepress init
```

```sh [yarn]
$ yarn vitepress init
```

```sh [bun]
$ bun vitepress init
```

:::

You will be greeted mit a few simple questions:

<<< @/snippets/init.ansi

::: tip Vue as Peer Dependency
Wenn du intend to perform customization that verwendet Vue components or APIs, you should also explicitly install `vue` as a dependency.
:::

## Dateistruktur

Wenn du are building a standalone VitePress site, you can scaffold the site in your current directory (`./`). However, if you are installing VitePress in an existing project alongside other source code, it is recommended to scaffold the site in a nested directory (e.g. `./docs`) so that it is separate von the rest of the project.

Assuming you chose to scaffold the VitePress project in `./docs`, the generated file structure should look like this:

```
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.js
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  └─ index.md
└─ package.json
```

The `docs` directory is considered the **project root** of the VitePress site. The `.vitepress` directory is a reserved location for VitePress' config file, dev server cache, build output, and optional theme customization code.

::: tip
Standardmäßig, VitePress stores its dev server cache in `.vitepress/cache`, and the production build output in `.vitepress/dist`. If Verwendung Git, you should add them to your `.gitignore` file. These locations can also be [konfiguriert](../reference/site-config#outdir).
:::

### Die Konfigurationsdatei

The config file (`.vitepress/config.js`) ermöglicht you to customize various aspects of your VitePress site, mit the most basic options being the title and description of the site:

```js [.vitepress/config.js]
export default {
  // site-level options
  title: 'VitePress',
  description: 'Just playing around.',

  themeConfig: {
    // theme-level options
  }
}
```

Du kannst also configure the behavior of the theme via the `themeConfig` option. Consult the [Config Referenz](../reference/site-config) for full details on all config options.

### Quelldateien

Markdown files außerhalb the `.vitepress` directory are considered **source files**.

VitePress verwendet **file-based routing**: each `.md` file is compiled in a corresponding `.html` file mit the same path. Zum Beispiel, `index.md` will be compiled in `index.html`, and can be visited at the root path `/` of the resulting VitePress site.

VitePress also stellt bereit the ability to generate clean URLs, rewrite paths, and dynamically generate pages. These will be covered in the [Routing Anleitung](./routing).

## Loslegen

The tool should have also injected the following npm scripts to your `package.json` if you allowed it to do so während the setup process:

```json [package.json]
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

The `docs:dev` script will start a local dev server mit instant hot updates. Run it mit the following command:

::: code-group

```sh [npm]
$ npm run docs:dev
```

```sh [pnpm]
$ pnpm run docs:dev
```

```sh [yarn]
$ yarn docs:dev
```

```sh [bun]
$ bun run docs:dev
```

:::

Instead of npm scripts, you can also invoke VitePress directly mit:

::: code-group

```sh [npm]
$ npx vitepress dev docs
```

```sh [pnpm]
$ pnpm vitepress dev docs
```

```sh [yarn]
$ yarn vitepress dev docs
```

```sh [bun]
$ bun vitepress dev docs
```

:::

More command line usage is documented in the [CLI Referenz](../reference/cli).

The dev server should be running at `http://localhost:5173`. Visit the URL in your browser to see your new site in action!

## What's Weiter?

- To better understand how markdown files are mapped to generated HTML, proceed to the [Routing Anleitung](./routing).

- To discover more about what you can do on the page, such as writing markdown content or Verwendung Vue Components, refer to the "Schreiben" section of the guide. A great place to start would be to learn about [Markdown Extensions](./markdown).

- To explore the features provided by the default documentation theme, check out the [Standard-Theme Config Referenz](../reference/default-theme-config).

- Wenn du want to further customize the appearance of your site, explore how to either [Extend the Standard-Theme](./extending-default-theme) or [Build a Eigenes Theme](./custom-theme).

- Once your documentation site takes shape, make sure to read the [Bereitstellung Anleitung](./deploy).
