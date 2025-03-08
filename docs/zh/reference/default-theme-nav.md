# 导航栏 {#nav}

Nav 是显示在页面顶部的导航栏。它包含站点标题、全局菜单链接等。

## 站点标题和图标 {#site-title-and-logo}

默认情况下，nav 显示 [`config.title`](./site-config#title) 作为站点的标题。如果想更改导航栏上显示的内容，可以在 `themeConfig.siteTitle` 选项中定义自定义文本。

```js
export default {
  themeConfig: {
    siteTitle: 'My Custom Title'
  }
}
```

如果站点有图标，则可以通过传递图片路径来显示它。应该将图标直接放在 `public` 中，并赋值该绝对路径。

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg'
  }
}
```

添加图标时，它会与站点标题一起显示。如果只需要图标并且想要隐藏站点标题文本，请将 `siteTitle` 选项设置为 `false`。

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg',
    siteTitle: false
  }
}
```

如果想添加 `alt` 属性或根据深色/浅色模式自定义，还可以将图标作为对象传递。有关详细信息，请参阅 [`themeConfig.logo`](./default-theme-config#logo)。

## 导航链接 {#navigation-links}

可以定义 `themeConfig.nav` 选项以将链接添加到导航栏。

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
          { text: 'Item C', link: '/item-3' }
        ]
      }
    ]
  }
}
```

请注意，下拉菜单标题 (上例中的 `Dropdown Menu`) 不能具有 `link` 属性，因为它是打开下拉对话框的按钮。

还可以通过传入更多嵌套项来进一步向下拉菜单项添加“sections”。

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
              { text: 'Section B Item B', link: '...' }
            ]
          }
        ]
      },
      {
        text: 'Dropdown Menu',
        items: [
          {
            // 也可以省略标题
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

### 自定义链接的路由匹配状态 {#customize-link-s-active-state}

当前页面位于匹配路径下时，导航菜单项将突出显示。如果想自定义要匹配的路径，请将 `activeMatch` 属性和正则表达式定义为字符串值。

```js
export default {
  themeConfig: {
    nav: [
      // 当用户位于 `/config/` 路径时，该链接处于激活状态
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
`activeMatch` 应为正则表达式字符串，但必须将其定义为字符串。我们不能在这里使用实际的 RegExp 对象，因为它在构建期间不可序列化。
:::

### 自定义链接的“target”和“rel”属性 {#customize-link-s-target-and-rel-attributes}

默认情况下，VitePress 会根据链接是否为外部链接自动判断 `target` 和 `rel` 属性。但如果愿意，也可以自定义它们。

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

参考 [`socialLinks`](./default-theme-config#sociallinks)。

## 自定义组件

你可以通过使用 `component` 选项在导航栏中包含自定义组件。`component` 键对应的值应为 Vue 组件名，并且必须使用 [Theme.enhanceApp](../guide/custom-theme#theme-interface) 全局注册。

```js [.vitepress/config.js]
export default {
  themeConfig: {
    nav: [
      {
        text: 'My Menu',
        items: [
          {
            component: 'MyCustomComponent',
            // 可选的 props 传递给组件
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

然后，你需要全局注册该组件：

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

你的组件将在导航栏中渲染。 VitePress 会向组件提供以下额外的 props：

- `screenMenu`：一个可选的布尔值，指示组件是否在移动导航菜单内

你可以在端到端测试中查看示例 [这里](https://github.com/vuejs/vitepress/tree/main/__tests__/e2e/.vitepress)。
