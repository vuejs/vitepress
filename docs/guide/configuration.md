# Configuration

Without any configuration, the page is pretty minimal, and the user has no way to navigate around the site. To customize your site, let’s first create a `.vitepress` directory inside your docs directory. This is where all VitePress-specific files will be placed. Your project structure is probably like this:

```bash
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.js
│  └─ index.md
└─ package.json
````

The essential file for configuring a VitePress site is `.vitepress/config.js`, which should export a JavaScript object:

```js
module.exports = {
  title: 'Hello VitePress',
  description: 'Just playing around.'
}
```

Check out the [Config Reference](/config/basics) for a full list of options.
