# Usando Vue en Markdown {#using-vue-in-markdown}

En VitePress, cada archivo Markdown es compilado para HTML y entonces procesado como un [Componente de Archivo Único de Vue](https://vuejs.org/guide/scaling-up/sfc.html). Esto significa que puede usar cualquier funcionalidad de Vue dentro del Markdown, incluyendo la interpolación dinámica, usar componentes Vue o lógica arbitrária de componentes Vue dentro de la página adicionando una tag `<script>`.

Vale resaltar que VitePress aprovecha el compilador Vue para detectar y optimizar automáticamente las partes puramente estáticas del contenido Markdown. Los contenidos estáticaos son optimizados en nodos de espacio reservado únicos y eliminados de la carga JavaScript de la página para visitas iniciales. Ellos también son ignorados durante la hidratación en el lado del cliente. En resumen, solo paga por las partes dinámicas en cualquier página específica.

::: tip Compatibilidad SSR
Todo uso de Vue necesita ser compatible con SSR. Consulte [Compatibilidad SSR](./ssr-compat) para detalles y soluciones comunes.
:::

## Creación de _Templates_ {#templating}

### Interpolación {#interpolation}

Cada archivo Markdown es primero compilado para HTML y después pasado como un componente Vue para la canalización de procesos Vite. Esto significa que puede usar interpolación en el estilo Vue en el texto:

**Entrada**

```md
{{ 1 + 1 }}
```

**Salida**

<div class="language-text"><pre><code>{{ 1 + 1 }}</code></pre></div>

### Directivas {#directives}

Las Directivas también funcionan (observe que, por definición, HTML crudo también es válido en Markdown):

**Entrada**

```html
<span v-for="i in 3">{{ i }}</span>
```

**Salida**

<div class="language-text"><pre><code><span v-for="i in 3">{{ i }} </span></code></pre></div>

## `<script>` e `<style>`

las tags `<script>` e `<style>` en nivel raiz en los archivos Markdown funcionan igualmente como en los componentes de archivo único Vue, incluyendo `<script setup>`, `<style module>`, y etc. La principal diferencia aquí es que no hay una tag `<template>`: todo contenido en nivel raiz es Markdown. Además, observe que todas las tags deben ser colocadas **después** del frontmatter:

```html
---
hello: world
---

<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

## Contenido Markdown

El conteo es: {{ count }}

<button :class="$style.button" @click="count++">Incrementar</button>

<style module>
.button {
  color: red;
  font-weight: bold;
}
</style>
```

::: warning Evite `<style scoped>` en el Markdown
Cuando es usado en Markdown, `<style scoped>` exige la adición de atributos especiales a cada elemento en la página actual, lo que aumentará significativamente el tamaño de la página. `<style module>` es preferido cuando es necesaria una estilización localizada en una página.
:::

También tiene acceso a los APIs de tiempo de ejecución VitePress, como el [auxiliar `useData`](../reference/runtime-api#usedata), que proporciona acceso a los metadados de la página actual:

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

Si un componente es usado apenas por algunas páginas, es recomendable importarlos explicitamente donde son usados. Esto permite que ellos sean divididos adecuadamente y cargados apenas cuando las páginas relevantes son mostradas.

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

::: warning IMPORTANT
Asegurese de que el nombre de un componente personalizado contenga un hífen o esté en PascalCase. Caso contrario, el será tratado como un elemento alineado y envuelto dentro de una tag `<p>`, lo que llevará a una incompatibilidad de hidratación pues `<p>` no permite que elementos de bloque sean colocados dentro de el.
:::

### Usando Componentes En Headers <ComponenteEnHeader /> {#using-components-in-headers}

Puede usar componentes Vue en los headers, pero observe la diferencia entre las siguientes sintaxis:

| Markdown                                                 | HTML de Salida                             | Header Procesado |
| -------------------------------------------------------  | -----------------------------------------  | -------------    |
| <pre v-pre><code> # texto &lt;Tag/&gt; </code></pre>     | `<h1>texto <Tag/></h1>`                    | `texto`          |
| <pre v-pre><code> # texto \`&lt;Tag/&gt;\` </code></pre> | `<h1>texto <code>&lt;Tag/&gt;</code></h1>` | `texto <Tag/>`   |

El HTML envuelto por `<code>` será mostrado como es, solamente el HTML que **no** estuviera envuelto será analizado por Vue.

::: tip
EL HTML de salida es realizado por [Markdown-it](https://github.com/Markdown-it/Markdown-it), en cuanto los headers procesados son manipulados por VitePress (y usados tanto en la barra lateral como dentro del título del video).
:::

## Escapes {#escaping}

Puede escapar de interpolaciones Vue envolvientdolas en un `<span>` u otros elementos con la directiva `v-pre`:

**Entrada**

```md
Esto <span v-pre>{{ será exibido como es }}</span>
```

**Salida**

<div class="escape-demo">
  <p>Esto <span v-pre>{{ será exibido como es }}</span></p>
</div>

Alternativamente, puede envolver todo el paragrafo en un contenedor personalizadon `v-pre`:

```md
::: v-pre
{{ Esto será exibido como es }}
:::
```

**Output**

<div class="escape-demo">

::: v-pre
{{ Esto será exibido como es }}
:::

</div>

## "Desescape" en bloques de Código {#unescape-in-code-blocks}

Por defecto, todos los bloques de código cercados son automáticamente envueltos con `v-pre`, entonces ninguna sintaxis Vue será procesada dentro de ellos. Para permitir la interpolación en el estilo Vue dentro de la valla, puede adicionar el lenguaje con el sufijo `-vue`, por ejemplo, `js-vue`:

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


Observe que esto puede impedir que ciertos tokens sean realzados correctamente.

## Usando Preprocesadores CSS {#using-css-pre-processors}

VitePress poseé [soporte embutido](https://vitejs.dev/guide/features.html#css-pre-processors) para preprocesadores CSS: archivos `.scss`, `.sass`, `.less`, `.styl` e `.stylus`. No es necesario instalar plugins específicos de Vite para ellos, pero el propio preprocesados correspondiente debe ser instalado:

```
# .scss e .sass
npm install -D sass

# .less
npm install -D less

# .styl e .stylus
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

VitePress actualmente ofrece soporte a SSG para _teleports_ apenas para el cuerpo. Para otros objetivos, puede envolverlos dentro del componente embutido `<ClientOnly>` o inyectar la marcación de _teleport_ en la localización correcta en su página final HTML por medio del [hook `postRender`](../reference/site-config#postrender).

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

## Soporte de IntelliSense en VS Code

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
