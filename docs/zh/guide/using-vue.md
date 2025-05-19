# 在 Markdown 使用 Vue {#using-vue-in-markdown}

在 VitePress 中，每个 Markdown 文件都被编译成 HTML，而且将其作为 [Vue 单文件组件](https://cn.vuejs.org/guide/scaling-up/sfc.html)处理。这意味着可以在 Markdown 中使用任何 Vue 功能，包括动态模板、使用 Vue 组件或通过添加 `<script>` 标签为页面的 Vue 组件添加逻辑。

值得注意的是，VitePress 利用 Vue 的编译器自动检测和优化 Markdown 内容的纯静态部分。静态内容被优化为单个占位符节点，并从页面的 JavaScript 负载中删除以供初始访问。在客户端激活期间也会跳过它们。简而言之，只需注意任何给定页面上的动态部分。

::: tip SSR 兼容性
所有的 Vue 用法都需要兼容 SSR。参见 [SSR 兼容性](./ssr-compat)获得更多信息和常见的解决方案。
:::

## 模板化 {#templating}

### 插值语法 {#interpolation}

每个 Markdown 文件首先被编译成 HTML，然后作为 Vue 组件传递给 Vite 流程管道。这意味着可以在文本中使用 Vue 的插值语法：

**输入**

```md
{{ 1 + 1 }}
```

**输出**

<div class="language-text"><pre><code>{{ 1 + 1 }}</code></pre></div>

### 指令 {#directives}

也可以使用指令 (请注意，原始 HTML 在 Markdown 中也有效):

**输入**

```html
<span v-for="i in 3">{{ i }}</span>
```

**输出**

<div class="language-text"><pre><code><span v-for="i in 3">{{ i }} </span></code></pre></div>

## `<script>` 和 `<style>` {#script-and-style}

Markdown 文件中的根级 `<script>` 和 `<style>` 标签与 Vue SFC 中的一样，包括 `<script setup>`、`<style module>` 等。这里的主要区别是没有 `<template>` 标签：所有其他根级内容都是 Markdown。另请注意，所有标签都应放在 frontmatter **之后**：

```html
---
hello: world
---

<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

## Markdown Content

The count is: {{ count }}

<button :class="$style.button" @click="count++">Increment</button>

<style module>
.button {
  color: red;
  font-weight: bold;
}
</style>
```

:::warning 避免在 Markdown 中使用 `<style scoped>`
在 Markdown 中使用时，`<style scoped>` 需要为当前页面的每个元素添加特殊属性，这将显著增加页面的大小。当我们需要局部范围的样式时 `<style module>` 是首选。
:::

还可以访问 VitePress 的运行时 API，例如 [`useData` 辅助函数](../reference/runtime-api#usedata)，它提供了当前页面的元数据：

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
  "frontmatter": {},
  ...
}
```

## 使用组件 {#using-components}

可以直接在 Markdown 文件中导入和使用 Vue 组件。

### 在 Markdown 中导入组件 {#importing-in-markdown}

如果一个组件只被几个页面使用，建议在使用它们的地方显式导入它们。这使它们可以正确地进行代码拆分，并且仅在显示相关页面时才加载：

```md
<script setup>
import CustomComponent from '../../components/CustomComponent.vue'
</script>

# Docs

This is a .md using a custom component

<CustomComponent />

## More docs

...
```

### 注册全局组件 {#registering-components-globally}

如果一个组件要在大多数页面上使用，可以通过自定义 Vue 实例来全局注册它们。有关示例，请参见[扩展默认主题](./extending-default-theme#registering-global-components)中的相关部分。

::: warning 重要
确保自定义组件的名称包含连字符或采用 PascalCase。否则，它将被视为内联元素并包裹在 `<p>` 标签内，这将导致激活不匹配，因为 `<p>` 不允许将块元素放置在其中。
:::

### 在标题中使用组件 <ComponentInHeader /> {#using-components-in-headers}

可以在标题中使用 Vue 组件，但请注意以下语法之间的区别：

| Markdown                                                | 输出的 HTML                               | 被解析的标题 |
| ------------------------------------------------------- | ----------------------------------------- | ------------- |
| <pre v-pre><code> # text &lt;Tag/&gt; </code></pre>     | `<h1>text <Tag/></h1>`                    | `text`        |
| <pre v-pre><code> # text \`&lt;Tag/&gt;\` </code></pre> | `<h1>text <code>&lt;Tag/&gt;</code></h1>` | `text <Tag/>` |

被 `<code>` 包裹的 HTML 将按原样显示，只有未包裹的 HTML 才会被 Vue 解析。

::: tip
输出 HTML 由 [Markdown-it](https://github.com/Markdown-it/Markdown-it) 完成，而解析的标题由 VitePress 处理 (并用于侧边栏和文档标题)。
:::


## 转义 {#escaping}

可以通过使用 `v-pre` 指令将它们包裹在 `<span>` 或其他元素中来转义 Vue 插值：

**输入**

```md
This <span v-pre>{{ will be displayed as-is }}</span>
```

**输出**

<div class="escape-demo">
  <p>This <span v-pre>{{ will be displayed as-is }}</span></p>
</div>

也可以将整个段落包装在 `v-pre` 自定义容器中：

```md
::: v-pre
{{ This will be displayed as-is }}`
:::
```

**输出**

<div class="escape-demo">

::: v-pre
{{ This will be displayed as-is }}
:::

</div>

## 代码块中不转义 {#unescape-in-code-blocks}

默认情况下，代码块是受到保护的，都会自动使用 `v-pre` 包装，因此内部不会处理任何 Vue 语法。要在代码块内启用 Vue 插值语法，可以在代码语言后附加 `-vue` 后缀，例如 `js-vue`：

**输入**

````md
```js-vue
Hello {{ 1 + 1 }}
```
````

**输出**

```js-vue
Hello {{ 1 + 1 }}
```

请注意，这可能会让某些字符不能正确地进行语法高亮显示。

## 使用 CSS 预处理器 {#using-css-pre-processors}

VitePress [内置支持](https://cn.vitejs.dev/guide/features.html#css-pre-processors) CSS 预处理器：`.scss`、`.sass`、.`less`、`.styl` 和 `.stylus` 文件。无需为它们安装 Vite 专用插件，但必须安装相应的预处理器：

```
# .scss and .sass
npm install -D sass

# .less
npm install -D less

# .styl and .stylus
npm install -D stylus
```

然后可以在 Markdown 和主题组件中使用以下内容：

```vue
<style lang="sass">
.title
  font-size: 20px
</style>
```

## 使用 teleport 传递组件内容 {#using-teleports}

VitePress 目前只有使用 teleport 传送到 body 的 SSG 支持。对于其他地方，可以将它们包裹在内置的 `<ClientOnly>` 组件中，或者通过 [postRender 钩子](../reference/site-config#postrender)将 teleport 标签注入到最终页面 HTML 中的正确位置。

<ModalDemo />

::: details
<<< @/components/ModalDemo.vue
:::

```md
<ClientOnly>
  <Teleport to="#modal">
    <div>
      // ...
    </div>
  </Teleport>
</ClientOnly>
```

<script setup>
import ModalDemo from '../../components/ModalDemo.vue'
import ComponentInHeader from '../../components/ComponentInHeader.vue'
</script>

<style>
.escape-demo {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 0 20px;
}
</style>
