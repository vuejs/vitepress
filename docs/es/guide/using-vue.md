---
description: Usa componentes Vue y funciones de plantillas dinámicas directamente dentro de archivos Markdown en VitePress.
---

# Usando Vue en Markdown {#using-vue-in-markdown}

En VitePress, cada archivo Markdown es compilado en HTML y luego procesado como un [Componente de Archivo Único de Vue](https://vuejs.org/guide/scaling-up/sfc.html). Esto significa que puedes usar cualquier funcionalidad de Vue dentro del Markdown, incluyendo plantillas dinámicas, componentes de Vue o lógica arbitraria de componentes de Vue en la página, agregando una etiqueta `<script>`.

Vale resaltar que VitePress aprovecha el compilador de Vue para detectar y optimizar automáticamente las partes puramente estáticas del contenido Markdown. El contenido estático se optimiza en nodos de marcador de posición individuales y se elimina del código JavaScript de la página en las visitas iniciales. También se omite durante la carga del lado del cliente. En resumen, solo se paga por las partes dinámicas de cada página.

::: tip Compatibilidad SSR
Todo uso de Vue necesita ser compatible con SSR. Consulte [Compatibilidad SSR](./ssr-compat) para detalles y soluciones comunes.
:::

## Creación de _Templates_ {#templating}

### Interpolación {#interpolation}

Cada archivo Markdown se compila primero a HTML y luego se pasa como un componente Vue al proceso de Vite. Esto significa que puedes usar la interpolación al estilo Vue en el texto:

**Entrada**

```md
{{ 1 + 1 }}
```

**Salida**

<div class="language-text"><pre><code>{{ 1 + 1 }}</code></pre></div>

### Directivas {#directives}

Las directivas también funcionan (observe que, por diseño, el HTML crudo también es válido en Markdown):

**Entrada**

```html
<span v-for="i in 3">{{ i }}</span>
```

**Salida**

<div class="language-text"><pre><code><span v-for="i in 3">{{ i }} </span></code></pre></div>

## `<script>` y `<style>` {#script-and-style}

Las etiquetas `<script>` y `<style>` de nivel raíz en los archivos Markdown funcionan igual que en los SFC de Vue, incluyendo `<script setup>`, `<style module>`, etc. La principal diferencia es que no hay etiqueta `<template>`: todo el demás contenido de nivel raíz es Markdown. Además, tenga en cuenta que todas las etiquetas deben colocarse **después** del frontmatter:

```html
---
hola: mundo
---

<script setup>
import { ref } from 'vue'

const contador = ref(0)
</script>

## Contenido Markdown

El conteo es: {{ contador }}

<button :class="$style.button" @click="contador++">Incrementar</button>

<style module>
.button {
  color: red;
  font-weight: bold;
}
</style>
```

::: warning Evite `<style scoped>` en el Markdown
Cuando es usado en Markdown, `<style scoped>` requiere agregar atributos especiales a cada elemento de la página actual, lo que aumenta significativamente el tamaño de la página. Se prefiere `<style module>` cuando se necesita un estilo con ámbito local en una página.
:::

También tienes acceso a las API de tiempo de ejecución de VitePress, como el [auxiliar `useData`](../reference/runtime-api#usedata), que proporciona acceso a los metadatos de la página actual:

**Entrada**

```html
<script setup>
import { useData } from 'vitepress'

const { page } = useData()
</script>

<pre>{{ page }}</pre>
```

**Salida**

```json
{
  "path": "/usando-vue.html",
  "title": "Usando Vue en Markdown",
  "frontmatter": {},
  ...
}
```

## Usando Componentes {#using-components}

Puede importar y usar componentes Vue directamente en los archivos Markdown.

### Importando en el Markdown {#importing-in-markdown}

Si un componente es usado apenas por algunas páginas, es recomendable importarlos explícitamente donde son usados. Esto permite que ellos sean divididos adecuadamente y cargados apenas cuando las páginas relevantes son mostradas.

```md
<script setup>
import CustomComponent from '../components/CustomComponent.vue'
</script>

# Documentación

Este es un archivo .md usando un componente personalizado

<CustomComponent />

## Más documentación

...
```

### Registrando Componentes Globalmente {#registering-components-globally}

Si un componente fuera usado en la mayoría de las páginas, ellos pueden ser registrados globalmente personalizando la instancia de la aplicación Vue. Consulte la sección relevante en [Extendiendo el Tema por Defecto](./extending-default-theme#registering-global-components) para un ejemplo.

::: warning IMPORTANTE
Asegúrese de que el nombre de un componente personalizado contenga un guion o esté en formato PascalCase. De lo contrario, se tratará como un elemento en línea y se envolverá dentro de una etiqueta `<p>`, lo que provocará un error de compatibilidad, ya que `<p>` no permite colocar elementos de bloque en su interior.
:::

### Usando Componentes En Headers <ComponentInHeader /> {#using-components-in-headers}

Puede usar componentes Vue en los headers, pero observe la diferencia entre las siguientes sintaxis:

| Markdown                                                 | HTML de Salida                             | Header Procesado |
| -------------------------------------------------------  | -----------------------------------------  | -------------    |
| <pre v-pre><code> # texto &lt;Tag/&gt; </code></pre>     | `<h1>texto <Tag/></h1>`                    | `texto`          |
| <pre v-pre><code> # texto \`&lt;Tag/&gt;\` </code></pre> | `<h1>texto <code>&lt;Tag/&gt;</code></h1>` | `texto <Tag/>`   |

El HTML envuelto por `<code>` será mostrado como es, solamente el HTML que **no** estuviera envuelto será analizado por Vue.

::: tip
La generación del HTML de salida se realiza mediante [Markdown-it](https://github.com/Markdown-it/Markdown-it), mientras que los encabezados analizados son gestionados por VitePress (y se utilizan tanto para la barra lateral como para el título del documento).
:::

## Escapes {#escaping}

Puede escapar de interpolaciones de Vue envolviéndolas en un `<span>` u otros elementos con la directiva `v-pre`:

**Entrada**

```md
Esto <span v-pre>{{ se mostrará como es }}</span>
```

**Salida**

<div class="escape-demo">
  <p>Esto <span v-pre>{{ se mostrará como es }}</span></p>
</div>

Alternativamente, puede envolver todo el párrafo en un contenedor personalizado `v-pre`:

```md
::: v-pre
{{ se mostrará como es }}
:::
```

**Salida**

<div class="escape-demo">

::: v-pre
{{ se mostrará como es }}
:::

</div>

## "Desescape" en bloques de Código {#unescape-in-code-blocks}

Por defecto, todos los bloques de código delimitados se envuelven automáticamente con `v-pre`, por lo que no se procesará ninguna sintaxis de Vue en su interior. Para habilitar la interpolación al estilo Vue dentro de las delimitaciones, puede agregar el sufijo `-vue` al lenguaje, por ejemplo, `js-vue`:

**Entrada**

````md
```js-vue
Hola {{ 1 + 1 }}
```
````

**Salida**

```js-vue
Hola {{ 1 + 1 }}
```

Observe que esto puede impedir que ciertos tokens se resalte la sintaxis correctamente.

## Usando Preprocesadores CSS {#using-css-pre-processors}

VitePress tiene [soporte integrado](https://vite.dev/guide/features.html#css-pre-processors) para preprocesadores CSS: archivos `.scss`, `.sass`, `.less`, `.styl` y `.stylus`. No es necesario instalar complementos específicos de Vite para ellos, pero sí debe instalarse el preprocesador correspondiente.

```
# .scss y .sass
npm install -D sass

# .less
npm install -D less

# .styl y .stylus
npm install -D stylus
```

Entonces puede usar lo siguiente en Markdown y en los componentes del tema:

```vue
<style lang="sass">
.title
  font-size: 20px
</style>
```

## Usando _Teleports_ {#using-teleports}

VitePress actualmente ofrece soporte a SSG para _teleports_ al cuerpo del documento. Para otros objetivos, puede envolverlos dentro del componente `<ClientOnly>` integrado o inyectar el marcado de _teleport_ en la ubicación correcta del HTML de su página final mediante el hook [`postRender`](../reference/site-config#postrender).

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

## Soporte de IntelliSense en VS Code {#vs-code-intellisense-support}

<!-- Based on https://github.com/vuejs/language-tools/pull/4321 -->

Vue ofrece soporte para IntelliSense de forma predeterminada mediante el [Plugin oficial de Vue para VS Code](https://marketplace.visualstudio.com/items?itemName=Vue.volar). Sin embargo, para habilitarlo en archivos `.md`, es necesario realizar algunos ajustes en los archivos de configuración.

1. Agrega el patrón `.md` a las opciones `include` y `vueCompilerOptions.vitePressExtensions` en el archivo tsconfig/jsconfig:

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

2. Agrega `markdown` a la opción `vue.server.includeLanguages` en el archivo de configuración de VS Code

::: code-group
```json [.vscode/settings.json]
{
  "vue.server.includeLanguages": ["vue", "markdown"]
}
```
:::
