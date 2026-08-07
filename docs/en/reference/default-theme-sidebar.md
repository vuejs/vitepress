---
description: Configure the sidebar navigation in the VitePress default theme with groups, collapsible sections, and multiple sidebars.
---

# Sidebar

The sidebar is the main navigation block for your documentation. You can configure the sidebar menu in [`themeConfig.sidebar`](./default-theme-config#sidebar).

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Getting Started', link: '/getting-started' },
          ...
        ]
      }
    ]
  }
}
```

## The Basics

The simplest form of the sidebar menu is passing in a single array of links. The first level item defines the "section" for the sidebar. It should contain `text`, which is the title of the section, and `items` which are the actual navigation links.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Section Title A',
        items: [
          { text: 'Item A', link: '/item-a' },
          { text: 'Item B', link: '/item-b' },
          ...
        ]
      },
      {
        text: 'Section Title B',
        items: [
          { text: 'Item C', link: '/item-c' },
          { text: 'Item D', link: '/item-d' },
          ...
        ]
      }
    ]
  }
}
```

Each `link` should specify the path to the actual file starting with `/`. If you add trailing slash to the end of link, it will show `index.md` of the corresponding directory.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Guide',
        items: [
          // This shows `/guide/index.md` page.
          { text: 'Introduction', link: '/guide/' }
        ]
      }
    ]
  }
}
```

You may further nest the sidebar items up to 6 level deep counting up from the root level. Note that deeper than 6 level of nested items gets ignored and will not be displayed on the sidebar.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Level 1',
        items: [
          {
            text: 'Level 2',
            items: [
              {
                text: 'Level 3',
                items: [
                  ...
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

## Multiple Sidebars

You may show different sidebar depending on the page path. For example, as shown on this site, you might want to create a separate sections of content in your documentation like "Guide" page and "Config" page.

To do so, first organize your pages into directories for each desired section:

```
.
├─ guide/
│  ├─ index.md
│  ├─ one.md
│  └─ two.md
└─ config/
   ├─ index.md
   ├─ three.md
   └─ four.md
```

Then, update your configuration to define your sidebar for each section. This time, you should pass an object instead of an array.

```js
export default {
  themeConfig: {
    sidebar: {
      // This sidebar gets displayed when a user
      // is on `guide` directory.
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Index', link: '/guide/' },
            { text: 'One', link: '/guide/one' },
            { text: 'Two', link: '/guide/two' }
          ]
        }
      ],

      // This sidebar gets displayed when a user
      // is on `config` directory.
      '/config/': [
        {
          text: 'Config',
          items: [
            { text: 'Index', link: '/config/' },
            { text: 'Three', link: '/config/three' },
            { text: 'Four', link: '/config/four' }
          ]
        }
      ]
    }
  }
}
```

## Collapsible Sidebar Groups

By adding `collapsed` option to the sidebar group, it shows a toggle button to hide/show each section.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Section Title A',
        collapsed: false,
        items: [...]
      }
    ]
  }
}
```

All sections are "open" by default. If you would like them to be "closed" on initial page load, set `collapsed` option to `true`.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Section Title A',
        collapsed: true,
        items: [...]
      }
    ]
  }
}
```

## Path Prefix

When your documentation structure has deep directories or groups located under the same subdirectory, you can use the `base` option to automatically prepend a path prefix to all nested `items` inside that group. This avoids repeating the same path prefix for every `link`.

The `base` option is supported in both multiple sidebar configurations and nested sidebar groups.

### In Multiple Sidebars

You can define `base` at the root of a sidebar section configuration:

```js {5}
export default {
  themeConfig: {
    sidebar: {
      '/guide/': {
        base: '/guide/',
        items: [
          // This link is resolved to `/guide/introduction`
          { text: 'Introduction', link: 'introduction' },
          // This link is resolved to `/guide/getting-started`
          { text: 'Getting Started', link: 'getting-started' }
        ]
      }
    }
  }
}
```

### In Nested Groups

You can also use `base` inside nested sidebar groups. It will apply to the immediate children of that group:

```js{6,13}
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Reference',
        base: '/reference/',
        items: [
          // This link is resolved to `/reference/site-config`
          { text: 'Site Config', link: 'site-config' },
          {
            text: 'Default Theme',
            // Nested base overrides the parent path prefix
            base: '/reference/default-theme-',
            items: [
              // This link is resolved to `/reference/default-theme-nav`
              { text: 'Nav', link: 'nav' },
              // This link is resolved to `/reference/default-theme-sidebar`
              { text: 'Sidebar', link: 'sidebar' }
            ]
          }
        ]
      }
    ]
  }
}
```
