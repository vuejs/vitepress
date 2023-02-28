# 导航栏 {#nav}

Nav 是显示在页面顶部的导航栏。 它包含站点标题、全局菜单链接等。

## 站点的标题和 logo {#site-title-and-logo}

默认情况下，导航的展示会引用 [`config.title`](../config/app-config#title) 配置的站点标题。如果想更改导航上显示的内容，可以在 `themeConfig.siteTitle` 选项中定义自定义文本。

```js
export default {
  themeConfig: {
    siteTitle: 'My Custom Title'
  }
}
```

可以通过配置 `logo` 来展示站点的 logo，logo 应该直接放在 `public` 中，并定义为绝对路径。

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg'
  }
}
```

添加 logo 后将会与站点标题一起显示。如果只想要展示 logo 而隐藏标题，请将 `siteTitle` 设置为 `false`。

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg',
    siteTitle: false
  }
}
```

如果你想添加 alt 属性或根据黑暗/光明模式定制它，你也可以传递一个对象作为 logo。详情请参见 [`themeConfig.logo`](../config/theme-config#logo)。

## 导航链接 {#navigation-links}

你可以通过定义 `themeConfig.nav` 选项来添加链接到导航。

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide' },
      { text: 'config', link: '/config' },
      { text: 'Changelog', link: 'https://github.com/...' }
    ]
  }
}
```

`text` 是 nav 中显示的实际文本，`link` 是单击文本时将导航到的链接。链接的路径设置为不带 `.md` 前缀的实际文件，并始终以 `/` 开头。

导航链接也可以是下拉菜单。如果要定义为下拉菜单，请在链接选项上设置 `items`。

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

注意，下拉菜单标题 (上例中的 `Dropdown Menu`) 不能配置 `link` 属性，因为它变成了打开下拉对话框的按钮。

你还可以通过传入更多嵌套项来向下拉菜单项添加子项。

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

### 自定义链接的“active”状态 {#customize-link-s-active-state}

当页面位于匹配路径下时，导航菜单项将高亮显示。可以通过定义 `activeMatch`，值为字符串类型的正则表达式。

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

::: warning 警告
`activeMatch` 应为正则表达式字符串，但你必须将其定义为字符串。我们不能在这里使用实际的 RegExp 对象，因为它在构建时不可序列化。
:::

### Customize link's "target" and "rel" attributes

By default, VitePress automatically determines `target` and `rel` attributes based on whether the link is an external link. But if you want, you can customize them too.

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

## 社交链接 {#social-links}

点击这里查看支持的 [`socialLinks`](../config/theme-config#sociallinks).
