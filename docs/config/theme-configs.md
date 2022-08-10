# Theme Configs

Theme configs let you customize your theme. You can define theme configs by adding `themeConfig` key to the config file.

```ts
export default {
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',

  // Theme related configurations.
  themeConfig: {
    logo: '/logo.svg',
    nav: [...],
    sidebar: { ... }
  }
}
```

Here it describes the settings for the VitePress default theme. If you're using a custom theme created by others, these settings may not have any effect, or might behave differently.

## logo

- Type: `ThemeableImage`

Logo file to display in nav bar, right before the site title. Accepts a path string, or an object to set a different logo for light/dark mode.

```ts
export default {
  themeConfig: {
    logo: '/logo.svg'
  }
}
```

```ts
type Image = string | { src: string; alt?: string }
type ThemeableImage = Image | { light: Image; dark: Image }
```

## siteTitle

- Type: `string | false`

You can customize this item to replace the default site title (`title` in app config) in nav. When set to `false`, title in nav will be disabled. Useful when you have `logo` that already contains the site title text.

```ts
export default {
  themeConfig: {
    siteTitle: 'Hello World'
  }
}
```

## nav

- Type: `NavItem`

The configuration for the nav menu item. You may learn more details at [Theme: Nav](../guide/theme-nav#navigation-links).

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

```ts
type NavItem = NavItemWithLink | NavItemWithChildren

type NavItemWithLink = {
  text: string
  link: string
  activeMatch?: string
}

interface NavItemWithChildren {
  text?: string
  items: NavItemWithLink[]
  activeMatch?: string
}
```

## sidebar

- Type: `Sidebar`

The configuration for the sidebar menu item. You may learn more details at [Theme: Sidebar](../guide/theme-sidebar).

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

```ts
type Sidebar = SidebarGroup[] | SidebarMulti

interface SidebarMulti {
  [path: string]: SidebarGroup[]
}

interface SidebarGroup {
  text: string
  items: SidebarItem[]
  collapsible?: boolean
  collapsed?: boolean
}

interface SidebarItem {
  text: string
  link: string
}
```

## outlineTitle

- Type: `string`
- Default: `On this page`

Can be used to customize the title of the right sidebar (on the top of outline links). This is useful when writing documentation in another language.

```js
export default {
  themeConfig: {
    outlineTitle: 'In hac pagina'
  }
}
```

## socialLinks

- Type: `SocialLink[]`

You may define this option to show your social account links with icons in nav.

```js
export default {
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
      { icon: 'twitter', link: '...' },
      // You can also add custom icons by passing SVG as string:
      {
        icon: {
          svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Dribbble</title><path d="M12...6.38z"/></svg>'
        },
        link: '...'
      }
    ]
  }
}
```

```ts
interface SocialLink {
  icon: SocialLinkIcon
  link: string
}

type SocialLinkIcon =
  | 'discord'
  | 'facebook'
  | 'github'
  | 'instagram'
  | 'linkedin'
  | 'slack'
  | 'twitter'
  | 'youtube'
  | { svg: string }
```

## footer

- Type: `Footer`

Footer configuration. You can add a message and copyright. The footer will displayed only when the page doesn't contain sidebar due to design reason.

```ts
export default {
  themeConfig: {
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present Evan You'
    }
  }
}
```

```ts
export interface Footer {
  message?: string
  copyright?: string
}
```

## editLink

- Type: `EditLink`

Edit Link lets you display a link to edit the page on Git management services such as GitHub, or GitLab. See [Theme: Edit Link](../guide/theme-edit-link) for more details.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
}
```

```ts
export interface EditLink {
  pattern: string
  text?: string
}
```

## lastUpdatedText

- Type: `string`
- Default: `Last updated`

The prefix text showing right before the last updated time.

```ts
export default {
  themeConfig: {
    lastUpdatedText: 'Updated Date'
  }
}
```

## carbonAds

- Type: `CarbonAds`

A option to display [Carbon Ads](https://www.carbonads.net/).

```ts
export default {
  themeConfig: {
    carbonAds: {
      code: 'your-carbon-code',
      placement: 'your-carbon-placement'
    }
  }
}
```

```ts
export interface CarbonAds {
  code: string
  placement: string
}
```

Learn more in [Theme: Carbon Ads](../guide/theme-carbon-ads)

## docFooter

- Type: `DocFooter`

Can be used to customize text appearing above previous and next links. Helpful if not writing docs in English.

```js
export default {
  themeConfig: {
    docFooter: {
      prev: 'Pagina prior',
      next: 'Proxima pagina'
    }
  }
}
```

```ts
export interface DocFooter {
  prev?: string
  next?: string
}
```
