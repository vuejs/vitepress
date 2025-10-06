# Nav

The Nav is the navigation bar displayed on top of the page. It contains the site title, global menu links, and the theme slider.

## Site Title and Logo

By default, nav shows the title of the site referencing [`config.title`](./site-config#title) value. If you would like to change what's displayed on nav, you may define custom text in `themeConfig.siteTitle` option.

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

When adding a logo, it gets displayed along with the site title. If your logo is all you need and if you would like to hide the site title text, set `siteTitle` to `false`.

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg',
    siteTitle: false
  }
}
```

You can also pass an object as a logo if you want to add an `alt` attribute or customize it based on dark/light mode. Refer to [`themeConfig.logo`](./default-theme-config#logo) for more details.

## Navigation Links

You can define the `themeConfig.nav` option to add links to your navigation bar.

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

The `text` will be the text displayed in nav, and the `link` is where the text will send you. Always start links with `/` and omit the `.md` suffix when linking to pages.

Nav links can also be dropdown menus. To do this, set the `items` key on the given link option. The `link` can also be a function that accepts [`PageData`](./runtime-api#usedata) as the argument and returns the path. 

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

Note that the dropdown menu title (`Dropdown Menu` in the above example) can not have `link` property, since it becomes a button to open the dropdown dialog.

You can add "sections" to the dropdown menu items as well by passing in more nested items.

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
            // You can also omit the title.
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

Navigation menu items will be highlighted when the current page is under the matching path. if you would like to customize the path to be matched, define the `activeMatch` property as a regular expression string.

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
`activeMatch` is expected to be a regular expression, but you must define it as a string. We can't use an actual RegExp object here because it cannot be serialized during the build time.
:::

### Customize the link's "target" and "rel" attributes

By default, VitePress tries to automatically determine the `target` and `rel` attributes based on whether the link is external or not. You can override this behavior by passing the options in directly.

```js
export default {
  themeConfig: {
    nav: [
      {
        text: 'Merchandise',
        link: 'https://www.thegithubshop.com/',
        target: '_self',
        rel: 'sponsored'
      }
    ]
  }
}
```

## Social Links

Refer to [`socialLinks`](./default-theme-config#sociallinks).

## Custom Components

You can include custom components in the navigation bar by using the `component` option. The `component` key should be the Vue component name, and must be registered globally using [Theme.enhanceApp](../guide/custom-theme#theme-interface).

```js [.vitepress/config.js]
export default {
  themeConfig: {
    nav: [
      {
        text: 'My Menu',
        items: [
          {
            component: 'MyCustomComponent',
            // Optional props to pass to the component
            props: {
              title: 'My Custom Component'
            }
          }
        ]
      },
      {
        component: 'AnotherCustomComponent'
      }
    ]
  }
}
```

Then, you need to register the component globally:

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'

import MyCustomComponent from './components/MyCustomComponent.vue'
import AnotherCustomComponent from './components/AnotherCustomComponent.vue'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MyCustomComponent', MyCustomComponent)
    app.component('AnotherCustomComponent', AnotherCustomComponent)
  }
}
```

Your component will be rendered in the navigation bar. VitePress will provide the following additional props to the component:

- `screenMenu`: an optional boolean indicating whether the component is inside the mobile navigation menu

You can check an example in the e2e tests [here](https://github.com/vuejs/vitepress/tree/main/__tests__/e2e/.vitepress).
