# Markdown 中使用 Vue {#using-vue-in-markdown}

在 VitePress 中，每个 markdown 文件都被编译成 HTML，然后其作为 Vue 单文件组件处理。这意味着你可以在 markdown 中使用所有的 Vue 功能，包括动态模板、Vue 组件或通过添加 `<script>` 标签使用 Vue 组件逻辑。

同样重要的是要知道 VitePress 利用 Vue 3 的编译器来自动检测 markdown 中的纯静态的部分。静态内容被优化为独立的节点，从而减少页面的 JS 的开销。在客户端渲染数据期间，它们也会被跳过。简而言之，你需要额外处理的只有页面上的动态部分。

## 模板语法 {#templating}

### 插值 {#interpolation}

每个 Markdown 文件首先编译成 HTML，然后作为 Vue 组件传递到 Vite 处理。这意味着你可以在文本中使用 Vue 风格的插值：

**输入**

```md
{{ 1 + 1 }}
```

**输出**

<div class="language-text"><pre><code>{{ 1 + 1 }}</code></pre></div>

### 指令 {#directives}

指令同样可用：

**输入**

```html
<span v-for="i in 3">{{ i }}</span>
```

**输出**

<div class="language-text"><pre><code><span v-for="i in 3">{{ i }} </span></code></pre></div>

### 获取站点和页面数据 {#access-to-site-page-data}

你可以在 `<script>` 里使用 [`useData` 辅助函数](/api/#usedata) 并在页面里绑定数据。

**输入**

```html
<script setup>
import { useData } from 'vitepress'

const { page } = useData()
</script>

<pre>{{ page }}</pre>
```

**输出**

```json
{
  "path": "/using-vue.html",
  "title": "Using Vue in Markdown",
  "frontmatter": {}
}
```

## 转义 {#escaping}

默认情况下，栅栏式代码块会自动使用 `v-pre` 包装。要在内联代码片段或纯文本中展示 mustaches 或特定的 Vue 语法，你需要使用 `v-pre` 自定义容器包装一个段落：

**输入**

```md
::: v-pre
`{{ This will be displayed as-is }}`
:::
```

**输出**

::: v-pre
`{{ This will be displayed as-is }}`
:::

## 使用组件 {#using-components}

当你需要更大的灵活性时，VitePress 支持使用你自己的 Vue 组件扩展你的创作工具箱。

### 在 markdown 中导入组件 {#importing-components-in-markdown}

如果你的组件仅在少数地方使用，推荐的使用方法是在使用它的文件中导入组件。

```md
<script setup>
import CustomComponent from '../components/CustomComponent.vue'
</script>

# Docs

This is a .md using a custom component

<CustomComponent />

## More docs

...
```

### 在主题中注册全局组件 {#registering-global-components-in-the-theme}

如果要在文档中的多个页面中使用组件，则可以在主题中全局注册它们 (或作为默认 VitePress 主题扩展的一部分)。查看[自定义指南](./customization-intro)了解更多信息。

在 `.vitepress/theme/index.js` 中，`enhanceApp` 函数接收 Vue `app` 实例，因此你可以在常规的 Vue 应用程序中 [注册组件](https://vuejs.org/guide/components/registration.html) 。

```js
import DefaultTheme from 'vitepress/theme'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('VueClickAwayExample', VueClickAwayExample)
  }
}
```

然后就可以在 markdown 文件里使用组件：

```md
# Vue Click Away

<VueClickAwayExample />
```

::: warning 重要
确保自定义组件的名称包含连字符或使用 PascalCase (大驼峰拼写)。否则，它将被视为内联元素并包裹在 `<p>` 标签中，这将会导致 HTML 渲染紊乱，因为 HTML 标准规定， `<p>` 标签中不允许放置任何块级元素。
:::

### 在标题中使用组件 <ComponentInHeader /> {#using-components-in-headers}

你可以在标题中使用 Vue 组件，但请注意以下语法之间的区别：

| Markdown                                                | Output HTML                               | Parsed Header |
| ------------------------------------------------------- | ----------------------------------------- | ------------- |
| <pre v-pre><code> # text &lt;Tag/&gt; </code></pre>     | `<h1>text <Tag/></h1>`                    | `text`        |
| <pre v-pre><code> # text \`&lt;Tag/&gt;\` </code></pre> | `<h1>text <code>&lt;Tag/&gt;</code></h1>` | `text <Tag/>` |

`<code>` 包裹的 HTML 将按原样显示；只有**未**包裹 `<code>` 的 HTML 才会被 Vue 解析。

::: tip
输出 HTML 由 [markdown-it](https://github.com/markdown-it/markdown-it) 完成，而解析的标题由 VitePress 处理(并用于侧边栏和文档标题)。
:::

## 使用 CSS 预处理器 {#using-css-pre-processors}

VitePress 对 CSS 预处理器有[内置支持](https://vitejs.dev/guide/features.html#css-pre-processors)：`.scss`、`.sass`、`.less`， `.styl` 和 `.stylus` 文件。 不需要为它们安装 Vite 特定的插件，但必须安装相应的预处理器：

```
# .scss and .sass
npm install -D sass

# .less
npm install -D less

# .styl and .stylus
npm install -D stylus
```

然后就可以在 Markdown 和主题组件中使用：

```vue
<style lang="sass">
.title
  font-size: 20px
</style>
```

## 脚本和样式提升 {#script-style-hoisting}

有时，你可以只想在当前页面应用一些 JavaScript 或者 CSS，在这种情况下，你可以直接在 Markdown 文件中使用原生的 `<script>` 或者 `<style>` 标签，它们将会从编译后的 HTML 文件中提取出来，并作为生成的 Vue 单文件组件的`<script>`和 `<style>` 标签:

<p class="demo" :class="$style.example"></p>

<style module>
.example {
  color: #41b883;
}
</style>

<script>
import ComponentInHeader from '../../components/ComponentInHeader.vue'

export default {
  props: ['slot-key'],
  components: { ComponentInHeader },
  mounted () {
    document.querySelector(`.${this.$style.example}`)
      .textContent = 'This is rendered by inline script and styled by inline CSS'
  }
}
</script>

## 内置的组件 {#built-in-components}

VitePress 提供了内置的 Vue 组件，例如 `ClientOnly` 和 `OutboundLink`，查看[全局组件指南](/api/) 了解更多信息。

**参见：**

- [在标题中使用组件](#using-components-in-headers)

## 浏览器 API 的访问限制 {#browser-api-access-restrictions}

由于 VitePress 应用在生成静态构建时在 Node.js 中进行服务器渲染，因此任何 Vue 使用都必须符合[通用代码要求](https://vuejs.org/guide/scaling-up/ssr.html)。 简而言之，确保只在 `beforeMount` 或 `mounted` 钩子中访问浏览器以及 DOM API。

如果你正在使用不支持 SSR 的组件 (例如，包含自定义指令)，你可以将它们包装在 `ClientOnly` 组件中。

```md
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```

注意，这不会修复**在导入时**访问浏览器 API 的组件或库。 要在导入时使用浏览器环境的代码，你需要在适当的生命周期挂钩中动态导入它们：

```vue
<script>
export default {
  mounted() {
    import('./lib-that-access-window-on-import').then((module) => {
      // use code
    })
  }
}
</script>
```

如果要使用 `export default` 导出的Vue 组件，你可以这样子动态注册：

```vue
<template>
  <component
    v-if="dynamicComponent"
    :is="dynamicComponent">
  </component>
</template>

<script>
export default {
  data() {
    return {
      dynamicComponent: null
    }
  },

  mounted() {
    import('./lib-that-access-window-on-import').then((module) => {
      this.dynamicComponent = module.default
    })
  }
}
</script>
```

**参见：**

- [Vue.js > 动态组件](https://cn.vuejs.org/guide/essentials/component-basics.html#dynamic-components)
