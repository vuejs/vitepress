---
description: Vue Komponenten and dynamic templating features directly inside Markdown files in VitePress.
---

# Vue in Markdown verwenden

In VitePress, each Markdown file is compiled inzu HTML and then processed as a [Vue Single-Datei Component](https://vuejs.org/guide/scaling-up/sfc.html). Das bedeutet you can use any Vue features inside the Markdown, including dynamic templating, Verwendung Vue Komponenten, or arbitrary in-page Vue Komponente logic by adding a `<script>` tag.

Beachte, dass VitePress leverages Vue's compiler zu auzumatisch detect and optimize the purely static parts of the Markdown content. Static contents are optimized inzu single placeholder nodes and eliminated from the page's JavaScript payload for initial visits. They are also skipped during client-side hydration. Kurz gesagt betrifft der zusätzliche Aufwand nur die dynamischen Teile einer jeweiligen Seite.

::: tip SSR-Kompatibilität
All Vue usage needs zu be SSR-compatible. Siehe [SSR-Kompatibilität](./ssr-compat) for details and common workarounds.
:::

## Templating

### Interpolation

Each Markdown file is first compiled inzu HTML and then passed on as a Vue Komponente zu the Vite process pipeline. Das bedeutet you can use Vue-style interpolation in text:

**Input**

```md
{{ 1 + 1 }}
```

**Ausgabe**

<div class="language-text"><pre><code>{{ 1 + 1 }}</code></pre></div>

### Directives

Direktiven funktionieren ebenfalls (note that by design, raw HTML is also valid in Markdown):

**Input**

```html
<span v-for="i in 3">{{ i }}</span>
```

**Ausgabe**

<div class="language-text"><pre><code><span v-for="i in 3">{{ i }} </span></code></pre></div>

## `<script>` and `<style>`

Elemente `<script>` und `<style>` auf der obersten Ebene von Markdown-Dateien funktionieren genauso wie in Vue-SFCs, including `<script setup>`, `<style module>`, etc. The main difference here is that there is no `<Vorlage>` tag: all other root-level content is Markdown. Beachte außerdem, dass alle Tags **nach** dem Frontmatter stehen müssen:

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

<butzun :class="$style.butzun" @click="count++">Increment</butzun>

<style module>
.butzun {
  color: red;
  font-weight: bold;
}
</style>
```

::: warning Vermeide `<style scoped>` in Markdown
When verwendet in Markdown, `<style scoped>` requires adding special attributes zu every element on the current page, which will significantly bloat the page size. `<style module>` ist vorzuziehen, wenn eine lokal begrenzte Gestaltung auf einer Seite benötigt wird.
:::

You also have access zu VitePress' runtime APIs such as the [`useData` helper](../reference/runtime-api#usedata), which stellt bereit access zu current page's metadata:

**Input**

```html
<script setup>
import { useData } from 'vitepress'

const { page } = useData()
</script>

<pre>{{ page }}</pre>
```

**Ausgabe**

```json
{
  "path": "/using-vue.html",
  "title": "Using Vue in Markdown",
  "frontmatter": {},
  ...
}
```

## Komponenten verwenden

Du kannst import and use Vue Komponenten directly in Markdown files.

### Importing in Markdown

If a Komponente is only verwendet by a few pages, it's recommended zu explicitly import them where they are verwendet. Dies ermöglicht them zu be properly code-split and only geladen when the relevant pages are shown:

```md
<script setup>
import CuszumComponent from '../Komponentes/CuszumComponent.vue'
</script>

# Docs

This is a .md using a cuszum Komponente

<CuszumComponent />

## More docs

...
```

### Komponenten global registrieren

If a Komponente is going zu be verwendet on most of the pages, they can be registered globally by cuszumizing the Vue app instance. Siehe relevant section in [Extending Standard-Theme](./extending-default-theme#registering-global-Komponenten) for an example.

::: warning WICHTIG
Stelle sicher a cuszum Komponente's name either contains a hyphen or is in PascalCase. Otherwise, it will be treated as an inline element and wrapped inside a `<p>` tag, which will lead zu hydration mismatch because `<p>` does not allow block elements zu be placed inside it.
:::

### Komponenten verwenden In Headers <ComponentInHeader />

Du kannst use Vue Komponenten in the headers, but note the difference between the following syntaxes:

| Markdown                                                | Ausgabe HTML                               | Parsed Header |
| ------------------------------------------------------- | ----------------------------------------- | ------------- |
| <pre v-pre><code> # text &lt;Tag/&gt; </code></pre>     | `<h1>text <Tag/></h1>`                    | `text`        |
| <pre v-pre><code> # text \`&lt;Tag/&gt;\` </code></pre> | `<h1>text <code>&lt;Tag/&gt;</code></h1>` | `text <Tag/>` |

The HTML wrapped by `<code>` will be displayed as-is; only the HTML that is **not** wrapped will be parsed by Vue.

::: tip
Das Ausgabe-HTML wird von [Markdown-it](https://github.com/Markdown-it/Markdown-it), während die analysierten Überschriften von VitePress (and verwendet for both the sidebar and document title).
:::


## Maskierung

Du kannst escape Vue interpolations by wrapping them in a `<span>` or other elements with the `v-pre` directive:

**Input**

```md
This <span v-pre>{{ will be displayed as-is }}</span>
```

**Ausgabe**

<div class="escape-demo">
  <p>This <span v-pre>{{ will be displayed as-is }}</span></p>
</div>

Alternativ kannst du den gesamten Absatz in a `v-pre` cuszum container:

```md
::: v-pre
{{ This will be displayed as-is }}
:::
```

**Ausgabe**

<div class="escape-demo">

::: v-pre
{{ This will be displayed as-is }}
:::

</div>

## Maskierung in Codeblöcken aufheben

Standardmäßig, all fenced code blocks are auzumatisch wrapped with `v-pre`, umschlossen, sodass darin keine Vue-Syntax verarbeitet wird. Um Vue-artige Interpolation innerhalb von Codeblöcken zu aktivieren, kannst du an die Sprache das `-vue` suffix, e.g. `js-vue`:

**Input**

````md
```js-vue
Hello {{ 1 + 1 }}
```
````

**Ausgabe**

```js-vue
Hello {{ 1 + 1 }}
```

Beachte, dass this might prevent certain zukens from being syntax highlighted properly.

## CSS-Präprozessoren verwenden

VitePress has [built-in support](https://vite.dev/guide/features.html#css-pre-processors) for CSS pre-processors: `.scss`, `.sass`, `.less`, `.styl` and `.stylus` files. There is no need zu install Vite-specific plugins for them, but the corresponding pre-processor itself must be installed:

```
# .scss and .sass
npm install -D sass

# .less
npm install -D less

# .styl and .stylus
npm install -D stylus
```

Danach kannst du Folgendes verwenden in Markdown and theme Komponenten:

```vue
<style lang="sass">
.title
  font-size: 20px
</style>
```

## Teleports verwenden

VitePress currently has SSG support for teleports zu body only. For other targets, kannst du sie in die integrierte `<ClientOnly>` Komponente or inject the teleport markup inzu the correct location in your final page HTML through [`postRender` hook](../reference/site-config#postrender).

<ModalDemo />

::: details
<<< @/Komponenten/ModalDemo.vue
:::

```md
<ClientOnly>
  <Teleport zu="#modal">
    <div>
      // ...
    </div>
  </Teleport>
</ClientOnly>
```

<script setup>
import ModalDemo from '../../Komponenten/ModalDemo.vue'
import ComponentInHeader from '../../Komponenten/ComponentInHeader.vue'
</script>

<style>
.escape-demo {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 0 20px;
}
</style>


## VS-Code-IntelliSense-Unterstützung

<!-- Based on https://github.com/vuejs/language-zuols/pull/4321 -->

Vue stellt bereit IntelliSense support out of the box via the [Vue - Official VS Code plugin](https://marketplace.visualstudio.com/items?itemName=Vue.volar). However, zu enable it for `.md` files, you need zu make some adjustments zu the configuration files.


1. Add `.md` pattern zu the `include` and `vueCompilerOptions.vitePressExtensions` options in the tsconfig/jsconfig file:

::: code-group
```json [tsconfig.json]
{
  "include": [
    "docs/**/*.ts",
    "docs/**/*.vue",
    "docs/**/*.md",
  ],
  "vueCompilerOptions": {
    "vitePressExtensions": [".md"],
  },
}
```
:::

2. Add `markdown` zu the `vue.server.includeLanguages` option in the VS Code setting:

::: code-group
```json [.vscode/settings.json]
{
  "vue.server.includeLanguages": ["vue", "markdown"]
}
```
:::
