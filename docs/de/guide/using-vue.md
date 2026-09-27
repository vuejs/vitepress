---
description: Verwende Vue-Komponenten und dynamische Vorlagen direkt in Markdown-Dateien von VitePress.
---

# Vue in Markdown verwenden

In VitePress wird jede Markdown-Datei in HTML kompiliert und anschließend als [Vue-Single-File-Komponente](https://vuejs.org/guide/scaling-up/sfc.html) behandelt. Das bedeutet, dass du beliebige Vue-Funktionen innerhalb von Markdown verwenden kannst, einschließlich dynamischer Vorlagen, Vue-Komponenten oder beliebiger Vue-Logik innerhalb der Seite, indem du ein `<script>`-Tag hinzufügst.

Beachte, dass VitePress den Vue-Compiler verwendet, um die rein statischen Teile des Markdown-Inhalts automatisch zu erkennen und zu optimieren. Statische Inhalte werden zu einzelnen Platzhalterknoten optimiert und bei ersten Besuchen aus der JavaScript-Nutzlast der Seite entfernt. Sie werden auch während der clientseitigen Hydration übersprungen. Kurz gesagt betrifft der zusätzliche Aufwand nur die dynamischen Teile der jeweiligen Seite.

::: tip SSR-Kompatibilität
Jede Verwendung von Vue muss SSR-kompatibel sein. Einzelheiten und gängige Lösungen findest du unter [SSR-Kompatibilität](./ssr-compat).
:::

## Templating

### Interpolation

Jede Markdown-Datei wird zunächst in HTML kompiliert und anschließend als Vue-Komponente an die Vite-Prozesspipeline übergeben. Das bedeutet, dass du Vue-Interpolation in Text verwenden kannst:

**Input**

```md
{{ 1 + 1 }}
```

**Ausgabe**

<div class="language-text"><pre><code>{{ 1 + 1 }}</code></pre></div>

### Directives

Direktiven funktionieren ebenfalls (beachte, dass rohes HTML absichtlich auch in Markdown gültig ist):

**Input**

```html
<span v-for="i in 3">{{ i }}</span>
```

**Ausgabe**

<div class="language-text"><pre><code><span v-for="i in 3">{{ i }} </span></code></pre></div>

## `<script>` und `<style>`

Auf oberster Ebene verwendete `<script>`- und `<style>`-Tags in Markdown-Dateien funktionieren genauso wie in Vue-SFCs, einschließlich `<script setup>`, `<style module>` usw. Der wichtigste Unterschied besteht darin, dass es kein `<Vorlage>`-Tag gibt: Alle anderen Inhalte auf oberster Ebene sind Markdown. Beachte außerdem, dass alle Tags **nach** dem Frontmatter stehen sollten:

```html
---
hello: world
---

<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

## Markdown-Inhalt

Die Anzahl beträgt: {{ count }}

<button :class="$style.button" @click="count++">Increment</button>

<style module>
.button {
  color: red;
  font-weight: bold;
}
</style>
```

::: warning Avoid `<style scoped>` in Markdown
Bei Verwendung in Markdown erfordert `<style scoped>` das Hinzufügen spezieller Attribute zu jedem Element der aktuellen Seite, wodurch die Seitengröße erheblich zunimmt. `<style module>` wird bevorzugt, wenn eine lokal begrenzte Gestaltung auf einer Seite benötigt wird.
:::

Du hast außerdem Zugriff auf VitePress' Laufzeit-APIs wie den [`useData`-Helper](../reference/runtime-api#usedata), der Zugriff auf die Metadaten der aktuellen Seite bereitstellt:

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
  "title": "Vue in Markdown verwenden",
  "frontmatter": {},
  ...
}
```

## Komponenten verwenden

Du kannst Vue-Komponenten direkt in Markdown-Dateien importieren und verwenden.

### Importing in Markdown

Wenn eine Komponente nur auf wenigen Seiten verwendet wird, empfiehlt es sich, sie dort explizit zu importieren, wo sie verwendet wird. Dadurch kann sie korrekt aufgeteilt und nur geladen werden, wenn die entsprechenden Seiten angezeigt werden:

```md
<script setup>
import CustomComponent from '../components/CustomComponent.vue'
</script>

# Docs

Dies ist eine .md-Datei, die eine benutzerdefinierte Komponente verwendet

<CustomComponent />

## Weitere Dokumentation

...
```

### Komponenten global registrieren

Wenn eine Komponente auf den meisten Seiten verwendet werden soll, kann sie durch Anpassen der Vue-App-Instanz global registriert werden. Siehe den entsprechenden Abschnitt unter [Standard-Theme erweitern](./extending-default-theme#registering-global-Komponenten) für ein Beispiel.

::: warning IMPORTANT
Stelle sicher, dass der Name einer benutzerdefinierten Komponente entweder einen Bindestrich enthält oder in PascalCase geschrieben ist. Andernfalls wird sie als Inline-Element behandelt und in ein `<p>`-Tag eingeschlossen, was zu einer Abweichung bei der Hydration führt, da `<p>` keine Block-Elemente enthalten darf.
:::

### Komponenten verwenden In Headers <ComponentInHeader />

Du kannst Vue-Komponenten in Überschriften verwenden, beachte jedoch den Unterschied zwischen den folgenden Syntaxvarianten:

| Markdown                                                | Ausgabe HTML                               | Parsed Header |
| ------------------------------------------------------- | ----------------------------------------- | ------------- |
| <pre v-pre><code> # text &lt;Tag/&gt; </code></pre>     | `<h1>text <Tag/></h1>`                    | `text`        |
| <pre v-pre><code> # text \`&lt;Tag/&gt;\` </code></pre> | `<h1>text <code>&lt;Tag/&gt;</code></h1>` | `text <Tag/>` |

Das von `<code>` umschlossene HTML wird unverändert angezeigt; nur HTML, das **nicht** umschlossen ist, wird von Vue analysiert.

::: tip
Das Ausgabe-HTML wird von [Markdown-it](https://github.com/Markdown-it/Markdown-it) erzeugt, während die analysierten Überschriften von VitePress verarbeitet werden (und sowohl für die Seitenleiste als auch für den Dokumenttitel verwendet werden).
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

Alternativ kannst du den gesamten Absatz in a `v-pre` custom container:

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

Standardmäßig, all fenced code blocks are automatisch wrapped with `v-pre`, so no Vue syntax will be processed inside. To enable Vue-style interpolation inside fences, you can append the language with the `-vue` suffix, e.g. `js-vue`:

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

Beachte, dass this might prevent certain tokens from being syntax highlighted properly.

## CSS-Präprozessoren verwenden

VitePress has [built-in support](https://vite.dev/guide/features.html#css-pre-processors) for CSS pre-processors: `.scss`, `.sass`, `.less`, `.styl` and `.stylus` files. There is no need to install Vite-specific plugins for them, but the corresponding pre-processor itself must be installed:

```
# .scss and .sass
npm install -D sass

# .less
npm install -D less

# .styl and .stylus
npm install -D stylus
```

Then you can use the following in Markdown and theme Komponenten:

```vue
<style lang="sass">
.title
  font-size: 20px
</style>
```

## Teleports verwenden

VitePress currently has SSG support for teleports to body only. For other targets, kannst du sie in die integrierte `<ClientOnly>` Komponente or inject the teleport markup into the correct location in your final page HTML through [`postRender` hook](../reference/site-config#postrender).

<ModalDemo />

::: details
<<< @/Komponenten/ModalDemo.vue
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

<!-- Based on https://github.com/vuejs/language-tools/pull/4321 -->

Vue stellt bereit IntelliSense support out of the box via the [Vue - Official VS Code plugin](https://marketplace.visualstudio.com/items?itemName=Vue.volar). However, to enable it for `.md` files, you need to make some adjustments to the configuration files.


1. Add `.md` pattern to the `include` and `vueCompilerOptions.vitePressExtensions` options in the tsconfig/jsconfig file:

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

2. Add `markdown` to the `vue.server.includeLanguages` option in the VS Code setting:

::: code-group
```json [.vscode/settings.json]
{
  "vue.server.includeLanguages": ["vue", "markdown"]
}
```
:::
