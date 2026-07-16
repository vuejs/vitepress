---
description: 配置 VitePress 默认主题的侧边栏导航，包括分组、可折叠部分和多侧边栏。
---

# 侧边栏 {#sidebar}

侧边栏是文档的主要导航块。可以在 [`themeConfig.sidebar`](./default-theme-config#sidebar) 中配置侧边栏菜单。

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

## 基本用法 {#the-basics}

侧边栏菜单的最简单形式是传入一个链接数组。第一级项目定义侧边栏的“部分”。它应该包含作为小标题的 `text` 和作为实际导航链接的 `items`。

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

每个 `link` 都应指定以 `/` 开头的实际文件的路径。如果在链接末尾添加斜杠，它将显示相应目录的 `index.md`。

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Guide',
        items: [
          // 显示的是 `/guide/index.md` 页面
          { text: 'Introduction', link: '/guide/' }
        ]
      }
    ]
  }
}
```

可以进一步将侧边栏项目嵌入到 6 级深度，从根级别上计数。请注意，深度超过 6 级将被忽略，并且不会在侧边栏上显示。

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

## 多侧边栏 {#multiple-sidebars}

可能会根据页面路径显示不同的侧边栏。例如，如本站点所示，可能希望在文档中创建单独的侧边栏，例如“指南”页面和“配置参考”页面。

为此，首先将你的页面组织到每个所需部分的目录中：

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

然后，更新配置以定义每个部分的侧边栏。这一次，应该传递一个对象而不是数组。

```js
export default {
  themeConfig: {
    sidebar: {
      // 当用户位于 `guide` 目录时，会显示此侧边栏
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

      // 当用户位于 `config` 目录时，会显示此侧边栏
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

## 可折叠的侧边栏组 {#collapsible-sidebar-groups}

通过向侧边栏组添加 `collapsed` 选项，它会显示一个切换按钮来隐藏/显示每个部分。

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

默认情况下，所有部分都是“打开”的。如果希望它们在初始页面加载时“关闭”，请将 `collapsed` 选项设置为 `true`。

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
## 路径前缀 {#path-prefix-base}

当文档结构具有较深的目录，或者多个分组位于同一个子目录下时，可以使用 `base` 选项为该分组下的所有嵌套 `items` 拼接的一个路径前缀。

这样可以避免为每个 `link` 重复书写相同的路径。`base` 选项既支持在多侧边栏配置中使用，也支持在嵌套的侧边栏分组中使用。

**注意：`base` 的值应该以 `/` 开头并以 `/` 结尾。**

### 在多侧边栏中使用 {#in-multiple-sidebars}

可以在多侧边栏配置的根部定义 `base`：

```js {5}
export default {
  themeConfig: {
    sidebar: {
      '/guide/': {
        base: '/guide/',
        items: [
          // 实际解析为 `/guide/introduction`
          { text: 'Introduction', link: 'introduction' },
          // 实际解析为 `/guide/getting-started`
          { text: 'Getting Started', link: 'getting-started' }
        ]
      }
    }
  }
}
```
### 在嵌套分组中使用 {#in-nested-groups}
也可以在嵌套的侧边栏分组内部使用 `base`，它将作用于该分组的直接子项：
```js {6,13}
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Reference',
        base: '/reference/',
        items: [
          // 实际解析为 `/reference/site-config`
          { text: 'Site Config', link: 'site-config' },
          {
            text: 'Default Theme',
            // 嵌套的 base 会覆盖父级的路径前缀
            base: '/reference/default-theme-',
            items: [
              // 实际解析为 `/reference/default-theme-nav`
              { text: 'Nav', link: 'nav' },
              // 实际解析为 `/reference/default-theme-sidebar`
              { text: 'Sidebar', link: 'sidebar' }
            ]
          }
        ]
      }
    ]
  }
}
```