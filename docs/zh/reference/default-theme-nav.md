# 导航栏 {#nav}

Nav 是显示在页面顶部的导航栏。它包含站点标题、全局菜单链接等。

## 网站标题和图标 {#site-title-and-logo}

默认情况下，nav 显示 [`config.title`](./site-config#title) 作为站点的标题。如果你想更改导航栏上显示的内容，你可以在 `themeConfig.siteTitle` 选项中定义自定义文本。

```js
export default {
  themeConfig: {
    siteTitle: 'My Custom Title',
  },
}
```

如果你的站点有图标，则可以通过传递图片路径来显示它。你应该将图标直接放在 `public` 中，并赋值该绝对路径。

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg',
  },
}
```

添加图标时，它会与站点标题一起显示。如果你只需要图标并且想要隐藏站点标题文本，请将 `siteTitle` 选项设置为 `false`。

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg',
    siteTitle: false,
  },
}
```

如果你想添加 `alt` 属性或根据暗/亮模式自定义它，你还可以将图标作为对象传递。有关详细信息，请参阅 [`themeConfig.logo`](./default-theme-config#logo)。

## 导航链接 {#navigation-links}

你可以定义 `themeConfig.nav` 选项以将链接添加到你的导航栏。

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide' },
      { text: 'Config', link: '/config' },
      { text: 'Changelog', link: 'https://github.com/...' },
    ],
  },
}
```

`text` 是 nav 中显示的实际文本，而 `link` 是单击文本时将导航到的链接。对于链接，将路径设置为不带 `.md` 后缀的实际文件，并且始终以 `/` 开头。

导航链接也可以是下拉菜单。为此，请替换 `link` 选项，设置 `items` 数组。

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
          { text: 'Item C', link: '/item-3' },
        ],
      },
    ],
  },
}
```

请注意，下拉菜单标题（上例中的 `下拉菜单`）不能具有 `link` 属性，因为它是打开下拉对话框的按钮。

你还可以通过传入更多嵌套项来进一步向下拉菜单项添加“sections”。

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide' },
      {
        text: 'Dropdown Menu',
        items: [
          {
            // 该部分的标题
            text: 'Section A Title',
            items: [
              { text: 'Section A Item A', link: '...' },
              { text: 'Section B Item B', link: '...' },
            ],
          },
        ],
      },
      {
        text: 'Dropdown Menu',
        items: [
          {
            // 你也可以省略标题
            items: [
              { text: 'Section A Item A', link: '...' },
              { text: 'Section B Item B', link: '...' },
            ],
          },
        ],
      },
    ],
  },
}
```

### 自定义链接的路由匹配状态 {#customize-link-s-active-state}

当前页面位于匹配路径下时，导航菜单项将突出显示。如果 你想自定义要匹配的路径，请将 `activeMatch` 属性和正则表达式定义为字符串值。

```js
export default {
  themeConfig: {
    nav: [
      // This link gets active state when the user is
      // on `/config/` path.
      {
        text: 'Guide',
        link: '/guide',
        activeMatch: '/config/',
      },
    ],
  },
}
```

::: warning 警告
`activeMatch` 应为正则表达式字符串，但你必须将其定义为字符串。我们不能在这里使用实际的 RegExp 对象，因为它在构建期间不可序列化。
:::

### 自定义链接的“target”和“rel”属性 {#customize-link-s-target-and-rel-attributes}

默认情况下，VitePress 会根据链接是否为外部链接自动判断 `target` 和 `rel` 属性。但如果你愿意，你也可以自定义它们。

```js
export default {
  themeConfig: {
    nav: [
      {
        text: 'Merchandise',
        link: 'https://www.thegithubshop.com/',
        target: '_self',
        rel: 'sponsored',
      },
    ],
  },
}
```

## 社交链接 {#social-links}

参考 [`社交链接`](./default-theme-config#sociallinks)。
