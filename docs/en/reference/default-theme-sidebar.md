# Sidebar

The sidebar is the main navigation element for your documentation. You can configure the sidebar menu in [`themeConfig.sidebar`](./default-theme-config#sidebar).

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

The simplest form of the sidebar menu is passing in a single array of links. The first level item defines the "section" for the sidebar. It should contain `text`, which is the title of the section, and `items`, which are the actual navigation links.

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

Each `link` should specify the path to the file starting with `/`. If you add a trailing slash to the end of link, it will show the `index.md` of the corresponding directory (much like HTML).

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

You can further nest the sidebar items up to six levels deep, counting up from the root level. Note that any items deeper than six level of nested items will be ignored and not displayed on the sidebar.

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

You can show different sidebars depending on the page path. For example, as shown on this site, you might want to create separate sections of content in your documentation for the "Guide" pages and "Config" pages.

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

By adding the `collapsed` option to the sidebar group, it shows a toggle button to hide/show each section.

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

All sections are open by default. If you want them to be closed by default instead, set the `collapsed` option to `true`.

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
