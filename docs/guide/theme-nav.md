# Nav

The Nav is the navigation bar displayed on top of the page. It contains the site title, global menu links, etc.

## Site Title and Logo

By default, nav shows the title of the site referencing [`config.title`](../config/app-config#title) value. If you would like to change what's displayed on nav, you may define custom text in `themeConfig.siteTitle` option.

```js
export default {
  themeConfig: {
    siteTitle: 'My Custom Title'
  }
}
```

If you have a logo for your site, you can display it by passing in the path to the image. You should place the logo within `public` directly, and define the absolute path to it.

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg'
  }
}
```

When adding a logo, it gets displayed along with the site title. If your logo is all you need and if you would like to hide the site title text, set `false` to the `siteTitle` option.

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg',
    siteTitle: false
  }
}
```

You can also pass an object as logo if you want to add `alt` attribute or customize it based on dark/light mode. Refer [`themeConfig.logo`](../config/theme-config#logo) for details.

## Navigation Links

You may define `themeConfig.nav` option to add links to your nav.

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide' },
      { text: 'Config', link: '/config' },
      { text: 'Changelog', link: 'https://github.com/...' }
    ]
  }
}
```

The `text` is the actual text displayed in nav, and the `link` is the link that will be navigated to when the text is clicked. For the link, set path to the actual file without `.md` prefix, and always start with `/`.

Nav links can also be dropdown menus. To do this, set `items` key on link option.

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide' },
      {
        text: 'Dropdown Menu',
        items: [
          { text: 'Item A', link: '/item-1' },
          { text: 'Item B', link: '/item-2' },
          { text: 'Item C', link: '/item-3' }
        ]
      }
    ]
  }
}
```

Note that dropdown menu title (`Dropdown Menu` in the above example) can not have `link` property since it becomes a button to open dropdown dialog.

You may further add "sections" to the dropdown menu items as well by passing in more nested items.

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide' },
      {
        text: 'Dropdown Menu',
        items: [
          {
            // Title for the section.
            text: 'Section A Title',
            items: [
              { text: 'Section A Item A', link: '...' },
              { text: 'Section B Item B', link: '...' }
            ]
          }
        ]
      },
      {
        text: 'Dropdown Menu',
        items: [
          {
            // You may also omit the title.
            items: [
              { text: 'Section A Item A', link: '...' },
              { text: 'Section B Item B', link: '...' }
            ]
          }
        ]
      }
    ]
  }
}
```

### Customize link's "active" state

Nav menu items will be highlighted when the current page is under the matching path. if you would like to customize the path to be matched, define `activeMatch` property and regex as a string value.

```js
export default {
  themeConfig: {
    nav: [
      // This link gets active state when the user is
      // on `/config/` path.
      {
        text: 'Guide',
        link: '/guide',
        activeMatch: '/config/'
      }
    ]
  }
}
```

::: warning
`activeMatch` is expected to be a regex string, but you must define it as a string. We can't use actual RegExp object here because it isn't serializable during the build time.
:::

## Social Links

Refer [`socialLinks`](../config/theme-config#sociallinks).
