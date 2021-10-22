---
sidebarDepth: 3
---

# 在 Markdown 中使用 Vue

在VitePress中，每个Markdown文件都会被编译为HTML，然后再通过Vue单文件组件来处理。这意味着你可以在Markdown中使用任何Vue功能，包括动态模板，使用Vue组件，或者通过添加`<script>`标签来实现任意在页面中的Vue组件逻辑。

同样重要的是，VitePress使用Vue 3的编译器来自动检测和优化Markdown的纯静态部分。静态内容会被优化为单个占位符节点，并从页面的JavaScript载荷中删除。它们也会在客户端渲染时被跳过。简而言之，只为页面上的动态部分消耗资源。

## Templating

### Interpolation

每个Markdown文件都会被编译为HTML，然后再通过Vue组件传递给Vite处理流程。这意味着你可以在文本中使用Vue-style插值：

**输入**

```md
{{ 1 + 1 }}
```

**输出**

<div class="language-text"><pre><code>{{ 1 + 1 }}</code></pre></div>

### 指令

指令也可以生效：

**输入**

```md
<span v-for="i in 3">{{ i }} </span>
```

**输出**

<div class="language-text"><pre><code><span v-for="i in 3">{{ i }} </span></code></pre></div>

### 取得站点和页面数据

你可以在`<script>`块中使用[`useData`助手](/guide/api.html#usedata)，并将数据暴露给页面。

**输入**

```md
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

## 逃逸 

默认情况下，标记代码块被自动包裹在`v-pre`。要在行内代码片段或纯文本中显示mustache或Vue特定语法，你需要在段落中包裹`v-pre`自定义容器。

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

## 使用组件

当你需要更高的灵活性时，VitePress允许你通过使用你自己的Vue组件来扩展你的作者工具箱。

### 在markdown中导入组件

如果你的组件只在几处使用，那么推荐的方式是在使用它的文件中导入它们。

```md
<script setup>
import CustomComponent from '../../components/CustomComponent.vue'
</script>

# 文档

这是一个使用自定义组件的.md文件

<CustomComponent />

## 更多文档

...
```

### 为主题注册全局组件

如果组件将被在文档中跨页面使用，那么它们可以在主题（或扩展默认VitePress主题）中注册为全局组件。查看[主题指南](./theming.md)以获取更多信息。

在`.vitepress/theme/index.js`中，`enhanceApp`函数接收Vue`app`实例，因此你可以像在普通Vue应用中一样[注册组件](https://v3.vuejs.org/guide/component-registration.html#component-registration)。

```js
import DefaultTheme from 'vitepress/theme'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('VueClickAwayExample', VueClickAwayExample)
  }
}
```

之后，你的markdown文件中，组件可以在插入在内容之间

```md
# Vue Click Away 

<VueClickAwayExample />
```

::: warning 重点 
确保自定义组件的名称包含一个连字符或是使用首字母大写的单词。否则，它将被视为一个行内元素，并将被包裹在`<p>`标签中，这将导致渲染不匹配，因为`<p>`不允许块元素放在它里面。
:::

### 使用组件在标题中 <ComponentInHeader />

你可以在标题中使用Vue组件，但请注意以下语法的区别：

| Markdown                                                | Output HTML                               | Parsed Header |
| ------------------------------------------------------- | ----------------------------------------- | ------------- |
| <pre v-pre><code> # text &lt;Tag/&gt; </code></pre>     | `<h1>text <Tag/></h1>`                    | `text`        |
| <pre v-pre><code> # text \`&lt;Tag/&gt;\` </code></pre> | `<h1>text <code>&lt;Tag/&gt;</code></h1>` | `text <Tag/>` |

HTML被`<code>`包裹的将被显示为-是；只有不被包裹的HTML将被Vue解析。

::: 提示
输出的HTML是通过[markdown-it](https://github.com/markdown-it/markdown-it)，而解析的标题是由VitePress处理（并且用于侧边栏和文档标题）。
:::

## 使用CSS预处理器

VitePress有[内置支持](https://vitejs.dev/guide/features.html#css-pre-processors)的CSS预处理器：`.scss`, `.sass`, `.less`, `.styl`和`.stylus`文件。没有必要安装Vite特定的插件，但对应的预处理器本身必须安装：

```
# .scss and .sass
npm install -D sass

# .less
npm install -D less

# .styl and .stylus
npm install -D stylus
```

然后，你可以在Markdown和主题组件中使用以下：

```vue
<style lang="sass">
.title
  font-size: 20px
</style>
```

## 代码和样式的提升

有时你可能需要在当前页面应用一些JavaScript或CSS。在这些情况下，你可以直接在Markdown文件中写入根级别的`<script>`或`<style>`块。这些将被提升出来并当做Vue单文件组件的`<script>`和`<style>`块使用：

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

## 内置组件

VitePress提供了内置的Vue组件，如`ClientOnly`和`OutboundLink`，查看[全局组件引导](./global-component.md)以获取更多信息。

**参阅:**

- [在Headers中使用组件](#using-components-in-headers)

## 使用浏览器API的限制

因为VitePress应用在生成静态构建时在Node.js中服务端渲染，所以任何Vue使用必须遵循[通用代码要求](https://ssr.vuejs.org/en/universal.html)。简单地说，在`beforeMount`或`mounted`钩子中只能访问浏览器/DOM API。

如果你使用或演示不是SSR-友好的组件（例如包含自定义指令），你可以在内置的`<ClientOnly>`组件中包裹它们：

```md
<ClientOnly>
  <NonSSRFriendlyComponent/>
</ClientOnly>
```

注意，这不是修复组件或库**在导入时**访问浏览器API的问题。要在导入时假设浏览器环境，你需要在适当的生命周期钩子中动态导入它们：

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

If your module `export default` a Vue component, you can register it dynamically:

```vue
<template>
  <component v-if="dynamicComponent" :is="dynamicComponent"></component>
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

**参阅:**

- [Vue.js > Dynamic Components](https://v3.vuejs.org/guide/component-dynamic-async.html)
