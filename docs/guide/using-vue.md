# Using Vue in Markdown

In VitePress, each markdown file is compiled into HTML and then processed as a Vue Single-File Component. This means you can use any Vue features inside the markdown, including dynamic templating, using Vue components, or arbitrary in-page Vue component logic by adding a `<script>` tag.

It is also important to know that VitePress leverages Vue 3's compiler to automatically detect and optimize the purely static parts of the markdown. Static contents are optimized into single placeholder nodes and eliminated from the page's JavaScript payload. They are also skipped during client-side hydration. In short, you only pay for the dynamic parts on any given page.

## Templating

### Interpolation

Each Markdown file is first compiled into HTML and then passed on as a Vue component to the Vite process pipeline. This means you can use Vue-style interpolation in text:

**Input**

```md
{{ 1 + 1 }}
```

**Output**

<div class="language-text"><pre><code>{{ 1 + 1 }}</code></pre></div>

### Directives

Directives also work:

**Input**

```md
<span v-for="i in 3">{{ i }} </span>
```

**Output**

<div class="language-text"><pre><code><span v-for="i in 3">{{ i }} </span></code></pre></div>

### Access to Site & Page Data

You can use the [`useData` helper](./api#usedata) in a `<script>` block and expose the data to the page.

**Input**

```md
<script setup>
import { useData } from 'vitepress'

const { page } = useData()
</script>

<pre>{{ page }}</pre>
```

**Output**

```json
{
  "path": "/using-vue.html",
  "title": "Using Vue in Markdown",
  "frontmatter": {}
}
```

## Escaping

By default, fenced code blocks are automatically wrapped with `v-pre`. To display raw mustaches or Vue-specific syntax inside inline code snippets or plain text, you need to wrap a paragraph with the `v-pre` custom container:

**Input**

```md
::: v-pre
`{{ This will be displayed as-is }}`
:::
```

**Output**

::: v-pre
`{{ This will be displayed as-is }}`
:::

## Using Components

When you need to have more flexibility, VitePress allows you to extend your authoring toolbox with your own Vue Components.

### Importing components in markdown

If your components are going to be used in only a few places, the recommended way to use them is to importing the components in the file where it is used.

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

### Registering global components in the theme

If the components are going to be used across several pages in the docs, they can be registered globally in the theme (or as part of extending the default VitePress theme). Check out the [Theming Guide](./theme-introduction) for more information.

In `.vitepress/theme/index.js`, the `enhanceApp` function receives the Vue `app` instance so you can [register components](https://vuejs.org/guide/components/registration.html) as you would do in a regular Vue application.

```js
import DefaultTheme from 'vitepress/theme'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('VueClickAwayExample', VueClickAwayExample)
  }
}
```

Later in your markdown files, the component can be interleaved between the content

```md
# Vue Click Away

<VueClickAwayExample />
```

::: warning IMPORTANT
Make sure a custom component’s name either contains a hyphen or is in PascalCase. Otherwise, it will be treated as an inline element and wrapped inside a `<p>` tag, which will lead to hydration mismatch because `<p>` does not allow block elements to be placed inside it.
:::

### Using Components In Headers <ComponentInHeader />

You can use Vue components in the headers, but note the difference between the following syntaxes:

| Markdown                                                | Output HTML                               | Parsed Header |
| ------------------------------------------------------- | ----------------------------------------- | ------------- |
| <pre v-pre><code> # text &lt;Tag/&gt; </code></pre>     | `<h1>text <Tag/></h1>`                    | `text`        |
| <pre v-pre><code> # text \`&lt;Tag/&gt;\` </code></pre> | `<h1>text <code>&lt;Tag/&gt;</code></h1>` | `text <Tag/>` |

The HTML wrapped by `<code>` will be displayed as-is; only the HTML that is **not** wrapped will be parsed by Vue.

::: tip
The output HTML is accomplished by [markdown-it](https://github.com/markdown-it/markdown-it), while the parsed headers are handled by VitePress (and used for both the sidebar and document title).
:::

## Using CSS Pre-processors

VitePress has [built-in support](https://vitejs.dev/guide/features.html#css-pre-processors) for CSS pre-processors: `.scss`, `.sass`, `.less`, `.styl` and `.stylus` files. There is no need to install Vite-specific plugins for them, but the corresponding pre-processor itself must be installed:

```
# .scss and .sass
npm install -D sass

# .less
npm install -D less

# .styl and .stylus
npm install -D stylus
```

Then you can use the following in Markdown and theme components:

```vue
<style lang="sass">
.title
  font-size: 20px
</style>
```

## Script & Style Hoisting

Sometimes you may need to apply some JavaScript or CSS only to the current page. In those cases, you can directly write root-level `<script>` or `<style>` blocks in the Markdown file. These will be hoisted out of the compiled HTML and used as the `<script>` and `<style>` blocks for the resulting Vue single-file component:

<p class="demo" :class="$style.example"></p>

<style module>
.example {
  color: #41b883;
}
</style>

<script>
import ComponentInHeader from '../components/ComponentInHeader.vue'

export default {
  props: ['slot-key'],
  components: { ComponentInHeader },
  mounted () {
    document.querySelector(`.${this.$style.example}`)
      .textContent = 'This is rendered by inline script and styled by inline CSS'
  }
}
</script>

## Built-In Components

VitePress provides Built-In Vue Components like `ClientOnly` and `OutboundLink`, check out the [Global Component Guide](./api) for more information.

**Also see:**

- [Using Components In Headers](#using-components-in-headers)

## Browser API Access Restrictions

Because VitePress applications are server-rendered in Node.js when generating static builds, any Vue usage must conform to the [universal code requirements](https://vuejs.org/guide/scaling-up/ssr.html). In short, make sure to only access Browser / DOM APIs in `beforeMount` or `mounted` hooks.

If you are using or demoing components that are not SSR-friendly (for example, contain custom directives), you can wrap them inside the built-in `<ClientOnly>` component:

```md
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```

Note this does not fix components or libraries that access Browser APIs **on import**. To use code that assumes a browser environment on import, you need to dynamically import them in proper lifecycle hooks:

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

**Also see:**

- [Vue.js > Dynamic Components](https://vuejs.org/guide/essentials/component-basics.html#dynamic-components)
