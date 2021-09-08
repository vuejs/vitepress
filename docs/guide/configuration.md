# Configuration

## Basics

Without any configuration, the page is pretty minimal, and the user has no way to navigate around the site. To customize your site, let’s first create a `.vitepress` directory inside your docs directory. This is where all VitePress-specific files will be placed. Your project structure is probably like this:

```bash
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.js
│  └─ index.md
└─ package.json
```

The essential file for configuring a VitePress site is `.vitepress/config.js`, which should export a JavaScript object:

```js
module.exports = {
  title: 'Hello VitePress',
  description: 'Just playing around.'
}
```

## Sidebar

The sidebar is empty by default. You can configure it as part of the theme in the `.vitepress/config` like this:

```js
module.exports = {
  title: 'Hello VitePress',
  // other config here...

  themeConfig: {
    sidebar: {
      '/': [
        {
          text: 'Introduction',
          children: [
            { text: 'What is VitePress?', link: '/' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            // more items...
          ]
        },
        {
          text: 'Advanced',
          children: [
            { text: 'Frontmatter', link: '/guide/frontmatter' },
            // more items...
          ]
        }
      ]
    }
  }
}
```

Notice that this configuration only applies for the route `/`. When the user navigates to `/guide` the sidebar would appear empty. Each route can/must define their own `SidebarItem`.

If you want to display the same sidebar content for different routes, consider creating a function. To share the sidebar content for route `/` and`/guide` see the following example:

```js
// ..
  themeConfig: {
    sidebar: {
      '/guide/': getGuideSidebar(),
      '/': getGuideSidebar()
    }
  }
}

function getGuideSidebar() {
  return [
    {
      text: 'Introduction',
      children: [
        { text: 'What is VitePress?', link: '/' },
        // more items...
      ]
    },
    // like above
  ]
}
```

Even so vitepress does not support all features of Vuepress, you might find the [Vuepress documentation about the sidebar](https://vuepress.vuejs.org/theme/default-theme-config.html#sidebar) helpfull.

## Config Reference

Check out the [Config Reference](/config/basics) for a full list of options.
