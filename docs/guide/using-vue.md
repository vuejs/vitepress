# Using Vue in Markdown

In VitePress, each Markdown file is compiled into HTML and then processed as a [Vue Single-File Component](https://vuejs.org/guide/scaling-up/sfc.html). This means you can use any Vue features inside the Markdown, including dynamic templating, using Vue components, or arbitrary in-page Vue component logic by adding a `<script>` tag.

It's worth noting that VitePress leverages Vue's compiler to automatically detect and optimize the purely static parts of the Markdown content. Static contents are optimized into single placeholder nodes and eliminated from the page's JavaScript payload for initial visits. They are also skipped during client-side hydration. In short, you only pay for the dynamic parts on any given page.

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

Directives also work (note that by design, raw HTML is also valid in Markdown):

**Input**

```html
<span v-for="i in 3">{{ i }}</span>
```

**Output**

<div class="language-text"><pre><code><span v-for="i in 3">{{ i }} </span></code></pre></div>

## `<script>` and `<style>`

Root-level `<script>` and `<style>` tags in Markdown files work just like they do in Vue SFCs, including `<script setup>`, `<style module>`, etc. The main difference here is that there is no `<template>` tag: all other root-level content is Markdown. Also note that all tags should be placed **after** the frontmatter:

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

:::warning Avoid `<style scoped>` in Markdown
When used in Markdown, `<style scoped>` requires adding special attributes to every element on the current page, which will significantly bloat the page size. `<style module>` is preferred when locally-scoped styling is needed in a page.
:::

You also have access to VitePress' runtime APIs such as the [`useData` helper](../reference/runtime-api#usedata), which provides access to current page's metadata:

**Input**

```html
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
  "frontmatter": {},
  ...
}
```

## Using Components

You can import and use Vue components directly in Markdown files.

### Importing in Markdown

If a component is only used by a few pages, it's recommended to explicitly import them where they are used. This allows them to be properly code-split and only loaded when the relevant pages are shown:

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

### Registering Components Globally

If a component is going to be used on most of the pages, they can be registered globally by customizing the Vue app instance. See relevant section in [Extending Default Theme](./extending-default-theme#registering-global-components) for an example.

::: warning IMPORTANT
Make sure a custom component's name either contains a hyphen or is in PascalCase. Otherwise, it will be treated as an inline element and wrapped inside a `<p>` tag, which will lead to hydration mismatch because `<p>` does not allow block elements to be placed inside it.
:::

### Using Components In Headers <ComponentInHeader />

You can use Vue components in the headers, but note the difference between the following syntaxes:

| Markdown                                                | Output HTML                               | Parsed Header |
| ------------------------------------------------------- | ----------------------------------------- | ------------- |
| <pre v-pre><code> # text &lt;Tag/&gt; </code></pre>     | `<h1>text <Tag/></h1>`                    | `text`        |
| <pre v-pre><code> # text \`&lt;Tag/&gt;\` </code></pre> | `<h1>text <code>&lt;Tag/&gt;</code></h1>` | `text <Tag/>` |

The HTML wrapped by `<code>` will be displayed as-is; only the HTML that is **not** wrapped will be parsed by Vue.

::: tip
The output HTML is accomplished by [Markdown-it](https://github.com/Markdown-it/Markdown-it), while the parsed headers are handled by VitePress (and used for both the sidebar and document title).
:::


## Escaping

You can escape Vue interpolations by wrapping them in a `<span>` or other elements with the `v-pre` directive:

**Input**

```md
This <span v-pre>{{ will be displayed as-is }}</span>
```

**Output**

<div class="escape-demo">
  <p>This <span v-pre>{{ will be displayed as-is }}</span></p>
</div>

Alternatively, you can wrap the entire paragraph in a `v-pre` custom container:

```md
::: v-pre
{{ This will be displayed as-is }}`
:::
```

**Output**

<div class="escape-demo">

::: v-pre
{{ This will be displayed as-is }}
:::

</div>

## Unescape in Code Blocks

By default, all fenced code blocks are automatically wrapped with `v-pre`, so no Vue syntax will be processd inside. To enable Vue-style interpolation inside fences, you can append the language with the `-vue` suffix, e.g. `js-vue`:

**Input**

````md
```js-vue
Hello {{ 1 + 1 }}
```
````

**Output**

```js-vue
Hello {{ 1 + 1 }}
```

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

## Using Teleports

Vitepress currently has SSG support for teleports to body only. For other targets, you can wrap them inside the built-in `<ClientOnly>` component or inject the teleport markup into the correct location in your final page HTML through [`postRender` hook](../reference/site-config#postrender).

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
import ModalDemo from '../components/ModalDemo.vue'
</script>

<style>
.escape-demo {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 0 20px;
}
</style>
