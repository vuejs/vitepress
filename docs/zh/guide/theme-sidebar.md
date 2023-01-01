# 侧边栏 {#sidebar}

侧边栏是文档的主要导航块。可以在 `themeConfig.sidebar` 中配置侧边栏菜单。

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

## 基本使用 {#the-basics}

侧边栏菜单的最简单形式是传入一个链接数组。第一级项目定义了侧边栏部分。它应该包含 `text`，即该部分的标题，以及 `items`，即实际的导航链接。

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

每个 `link` 都应该指定以 `/` 开头的实际文件的路径。如果在链接末尾添加斜杠，它将显示相应目录的`index.md`。

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

## 多个侧边栏 {#multiple-sidebars}

你可能会根据页面路径显示不同的侧边栏。例如，如本站点所示，你可能希望在文档中创建单独的内容部分，例如“指南”页面和“配置”页面。

为此，首先将你的页面放到所在的目录中：

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

然后，更新配置以定义每个部分的侧边栏，不同的是，这次配置的是一个对象而不是数组。

```js
export default {
  themeConfig: {
    sidebar: {
      // 当用户在 `指南` 目录页面下将会展示这个侧边栏
      '/guide/': [
        {
          text: 'Guide',
          items: [
            // This shows `/guide/index.md` page.
            { text: 'Index', link: '/guide/' }, // /guide/index.md
            { text: 'One', link: '/guide/one' }, // /guide/one.md
            { text: 'Two', link: '/guide/two' } // /guide/two.md
          ]
        }
      ],

      // 当用户在 `配置` 目录页面下将会展示这个侧边栏
      '/config/': [
        {
          text: 'Config',
          items: [
            // This shows `/config/index.md` page.
            { text: 'Index', link: '/config/' }, // /config/index.md
            { text: 'Three', link: '/config/three' }, // /config/three.md
            { text: 'Four', link: '/config/four' } // /config/four.md
          ]
        }
      ]
    }
  }
}
```

## 可折叠的侧边栏组 {#collapsible-sidebar-groups}

通过向侧边栏组添加 `collapsible` 选项，它会显示一个切换按钮来隐藏或显示子菜单。

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Section Title A',
        collapsible: true,
        items: [...]
      },
      {
        text: 'Section Title B',
        collapsible: true,
        items: [...]
      }
    ]
  }
}
```

默认情况下，所有侧边栏都是展开的。如果你希望它们在初始页面加载时关闭，请将 `collapsed` 选项设置为 `true`。

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Section Title A',
        collapsible: true,
        collapsed: true,
        items: [...]
      }
    ]
  }
}
```
