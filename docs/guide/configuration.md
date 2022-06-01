# Configuration

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
  title: 'Hello VitePress',
  description: 'Just playing around.'
}
```

In the above example, the site will have the title of `VitePress`, and `Just playing around` as description meta tag.

Learn everything about VitePress features at [Theme: Introduction](./theme-introduction) to find how to configure specific features with in this config file.

You may also find all configuration references at [Configs](../config/introduction).
