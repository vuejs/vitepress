# Extensiones Markdown {#markdown-extensions}

VitePress viene con Extensiones embutidas.

## Anchors de Header {#header-anchors}

Los Header reciben la aplicación automáticamente de links anchor. La presentación de los anchor puede ser configurada usando la opción `markdown.anchor`.

### Anchor personalizados {#custom-anchors}

Para especificar un _tag_ anchor personalizado para um header en vex de usar la generada automáticamente, adicione un sufijo al header:

```
# Usando anchors personalizados {#mi-anchor}
```

Esto permite que tenga un link del header como `#mi-anchor` en vez del default `#usando-anchors-personalizados`.

## Links {#links}

Ambos links internos y externos reciben tratamiento especial.

### Links Internos {#internal-links}

Los links internos son convertidos en links de enrutador para navegación SPA. Además de eso , todo archivo `index.md` contenido en cada subdirectorio será automáticamente convertido en `index.html`, con la URL correspondiente `/`.

Por ejemplo, dada la siguiente estructura de directorios:

```
.
├─ index.md
├─ foo
│  ├─ index.md
│  ├─ one.md
│  └─ two.md
└─ bar
   ├─ index.md
   ├─ three.md
   └─ four.md
```

Y suponiendo que está en `foo/one.md`:

```md
[Página Inicial](/) <!-- lleva al usuario al index.md raiz -->
[foo](/foo/) <!-- lleva al usuario al index.html del directorio foo -->
[foo heading](./#heading) <!-- ancla al usuario a un header del archivo índice foo -->
[bar - three](../bar/three) <!-- puede omitir la extensión -->
[bar - three](../bar/three.md) <!-- puede adicionar .md -->
[bar - four](../bar/four.html) <!-- o puede adicionar .html -->
```

### Sufijo de Página {#page-suffix}

Páginas y links internos son generados con el sufijo `.html` por defecto.

### Links Externos {#external-links}

Links externos reciben automáticamente `target="_blank" rel="noreferrer"`:

- [vuejs.org](https://vuejs.org)
- [VitePress no GitHub](https://github.com/vuejs/vitepress)

## Frontmatter {#frontmatter}

[YAML frontmatter](https://jekyllrb.com/docs/front-matter/) es soportado por defecto:

```yaml
---
título: Escribiendo como un Hacker
idioma: es-CO
---
```

Esos datos estarán disponibles para el resto de la página, junto con todos los componentes personalizados y de temas.

Para más detalles, vea [Frontmatter](../reference/frontmatter-config).

## Tablas al Estilo GitHub {#github-style-tables}

**Entrada**

```md
| Tablas        |    Son        | Geniales|
| ------------- | :-----------: |   ----: |
| col 3 está    | à direita     |   $1600 |
| col 2 está    | centralizada  |     $12 |
| listras       |   são legais  |      $1 |
```

**Salida**

| Tablas        |    Son        | Geniales |
| ------------- | :-----------: |   -----: |
| col 3 está    | à direita     |   \$1600 |
| col 2 está    | centralizada  |     \$12 |
| listras       |   são legais  |      \$1 |

## Emoji :tada:

**Entrada**

```
:tada: :100:
```

**Salida**

:tada: :100:

Una [lista de todos los emojis](https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.mjs) está disponible.

## Tabla de Contenido (TOC)

**Entrada**

```
[[toc]]
```

**Salida**

[[toc]]

La presentación de TOC (Table of Contents) puede ser configurada usando la opción `markdown.toc`.

## Contenedores Personalizados {#custom-containers}

Contenedores personalizados pueden ser definidos por sus tipos, títulos y contenidos.

### Título por Defecto {#default-title}

**Entrada**

```md
::: info
Este es un bloque de información.
:::

::: tip
Este es un aviso.
:::

::: warning
Esto es una advertencia.
:::

::: danger
Este es un aviso de peligro.
:::

::: details
Este es un bloque de detalles.
:::
```

**Salida**

::: info
Este es un bloque de información.
:::

::: tip
Este es un aviso.
:::

::: warning
Esto es una advertencia.
:::

::: danger
Este es un aviso de peligro.
:::

::: details
Este es un bloque de detalles.
:::

### Título Personalizado {#custom-title}

Puede definir un título personalizado adicionando el texto inmediatamente después del "tipo" del recipiente.

**Entrada**

```md
::: danger STOP
Zona de peligro, no siga
:::

::: details Click para ver el código
```js
console.log('Hola, VitePress!')
```
:::
```
```

**Salida**

::: danger STOP
Zona de peligro, no siga
:::

::: details Click para ver el código
```js
console.log('Hola, VitePress!')
```
:::

Además de eso, puede definir títulos personalizados globalmente adicionando el siguiente contenifo en el archivo de configuración del sitio, útil si no estuviera escribiendo en ingles:

```ts
// config.ts
export default defineConfig({
  // ...
  markdown: {
    container: {
      tipLabel: '提示',
      warningLabel: '警告',
      dangerLabel: '危险',
      infoLabel: '信息',
      detailsLabel: '详细信息'
    }
  }
  // ...
})
```

### `raw`

Este es un recipiente especial que puee ser usado para evitar conflictos de estilo y enrutador con VitePress. Esto es especialmente útil al documentar bibliotecas de componentes. Puede tambien verificar [whyframe](https://whyframe.dev/docs/integrations/vitepress) para mejor aislamiento.

**Sintaxis**

```md
::: raw
Envuelve en un `<div class="vp-raw">`
:::
```

La clase `vp-raw` también puede ser usada directamente en elementos. El aislamiento de estilo es actualmente opcional:

- Instale `postcss` con su gestor de paquetes preferido:

  ```sh
  $ npm add -D postcss
  ```

- Cree un archivo llamado `docs/postcss.config.mjs` y adicione lo siguiente:

  ```js
  import { postcssIsolateStyles } from 'vitepress'

  export default {
    plugins: [postcssIsolateStyles()]
  }
  ```

  El utiliza [`postcss-prefix-selector`](https://github.com/postcss/postcss-load-config) internamente. Puede pasar opciones así:

  ```js
  postcssIsolateStyles({
    includeFiles: [/vp-doc\.css/] // o padrão é /base\.css/
  })
  ```

## Alertas en estilo GitHub {#github-flavored-alerts}

VitePress también soporta [alertas en estilo GitHub](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts) para presentar como un bloque de llamada. Ellos serán presentados de la misma forma que [elementos personalizados](#custom-containers).

```md
> [!NOTE]
> Destaca informaciones que los usuarios deben tener en consideración, incluso leyendo rapidamente.

> [!TIP]
> Informaciones opcionales para ayudar al usuario a tener más éxito.

> [!IMPORTANT]
> Informaciones cruciales necesarias par que los usuarios tengan éxito.

> [!WARNING]
> Contenido critico exigiendo atención inmediata del usuario debido a riesgos potenciales.

> [!CAUTION]
> Potenciales consecuencias negativas de una acción.
```

> [!NOTE]
> Destaca informaciones que los usuarios deben tener en consideración, incluso leyendo rapidamente.

> [!TIP]
> Informaciones opcionales para ayudar al usuario a tener más éxito.

> [!IMPORTANT]
> Informaciones cruciales necesarias par que los usuarios tengan éxito.

> [!WARNING]
> Contenido critico exigiendo atención inmediata del usuario debido a riesgos potenciales.

> [!CAUTION]
> Potenciales consecuencias negativas de una acción.

## Destaque de Sintaxis en Bloques de Código {#syntax-highlighting-in-code-blocks}

VitePress utiliza [Shiki](https://github.com/shikijs/shiki) para destacar la sintaxis del lenguaje en bloques de código Markdown, usando texto coloreado. Shiki soporta una amplia variedad de lenguajes de programación. Todo lo que necesita es adicionar un _alias_ de lenguaje válido después de los backticks iniciales del bloque de código:

**Entrada**

````
```js
export default {
  name: 'MyComponent',
  // ...
}
```
````

````
```html
<ul>
  <li v-for="todo in todos" :key="todo.id">
    {{ todo.text }}
  </li>
</ul>
```
````

**Salida**

```js
export default {
  name: 'MyComponent'
  // ...
}
```

```html
<ul>
  <li v-for="todo in todos" :key="todo.id">
    {{ todo.text }}
  </li>
</ul>
```

Una [lista de lenguajes válidas](https://shiki.style/languages) está disponible en el repositório Shiki.

También puede personalizar el tema de destaque de sintaxis en la configuración de la aplicación. Consulte las [opciones `markdown`](../reference/site-config#markdown) para más detalles.

## Destaque de Linea en Bloques de Código {#line-highlighting-in-code-blocks}

**Entrada**

````
```js{4}
export default {
  data () {
    return {
      msg: 'Destacado!'
    }
  }
}
```
````

**Salida**

```js{4}
export default {
  data () {
    return {
      msg: 'Destacado!'
    }
  }
}
```

Además de una única linea, puede también especificar múltiples lineas únicas, intervalos, o ambos:

- Intervalos de linea: por ejemplo, `{5-8}`, `{3-10}`, `{10-17}`
- Múltiples lineas únicas: por ejemplo, `{4,7,9}`
- Intervalos de linea y lineas únicas: por ejemplo, `{4,7-13,16,23-27,40}`

**Entrada**

````
```js{1,4,6-8}
export default { // Destacado
  data () {
    return {
      msg: `Destacado!
      Esta linea no está destacada,
      pero esta y las próximas están.`,
      motd: 'VitePress es increible',
      lorem: 'ipsum'
    }
  }
}
```
````

**Salida**

```js{1,4,6-8}
export default { // Destacado
  data () {
    return {
      msg: `Destacado!
      Esta linea no está destacada,
      pero esta y las próximas están.`,
      motd: 'VitePress es increible',
      lorem: 'ipsum',
    }
  }
}
```

Alternativamente, es posible destacar directamente en la linea usando el comentario `// [!code highlight]`.

**Entrada**

````
```js
export default {
  data () {
    return {
      msg: 'Destacado!' // [!!code highlight]
    }
  }
}
```
````

**Saída**

```js
export default {
  data() {
    return {
      msg: 'Destacado!' // [!code highlight]
    }
  }
}
```

## Enfoque en Bloques de Código {#focus-in-code-blocks}

Adicionando el comentario `// [!code focus]` en una linea, esta será destacada y desenfocará las otras partes del código.

Además, puede definir el número de lineas para enfocar usando `// [!code focus:<lineas>]`.

**Entrada**

````
```js
export default {
  data () {
    return {
      msg: 'Enfocado!' // [!!code focus]
    }
  }
}
```
````

**Salida**

```js
export default {
  data() {
    return {
      msg: 'Enfocado!' // [!code focus]
    }
  }
}
```

## Diferencias Coloreadas en Bloques de Código {#colored-diffs-in-code-blocks}

Adicionar los comentarios `// [!code --]` o `// [!code ++]` en una linea creará una diferencia en esa linea, manteniendo los colores del bloque de código.

**Entrada**

````
```js
export default {
  data () {
    return {
      msg: 'Borrado' // [!!code --]
      msg: 'Adicionado' // [!!code ++]
    }
  }
}
```
````

**Salida**

```js
export default {
  data () {
    return {
      msg: 'Borrado' // [!code --]
      msg: 'Adicionado' // [!code ++]
    }
  }
}
```

## Errores y Avisos en Bloques de Código {#errors-and-warnings-in-code-blocks}

Adicionar los comentarios `// [!code warning]` o `// [!code error]` en una linea coloreará los bloques conforme necesário.

**Entrada**

````
```js
export default {
  data () {
    return {
      msg: 'Error', // [!!code error]
      msg: 'Aviso' // [!!code warning]
    }
  }
}
```
````

**Salida**

```js
export default {
  data() {
    return {
      msg: 'Error', // [!code error]
      msg: 'Aviso' // [!code warning]
    }
  }
}
```

## Números de Linea {#line-numbers}

Puede habilitar números de linea para cada bloque de código a través del archivo de configuración:

```js
export default {
  markdown: {
    lineNumbers: true
  }
}
```

Consulte las [opciones markdown](../reference/site-config#markdown) para más detalles.

Puede adicionar la marca `:line-numbers` / `:no-line-numbers` en sus bloques de código para substituir el valor definido en la configuración.

También puede personalizar el número inicial de linea adicionando `=` después `:line-numbers`. Por ejemplo, `:line-numbers=2` significa que los números de las lineas en los bloques de código comenzarán a partir de `2`.

**Entrada**

````md
```ts {1}
// números de linea desactivados por defecto
const line2 = 'Esta es la linea 2'
const line3 = 'Esta es la linea 3'
```

```ts:line-numbers {1}
// números de linea activados
const line2 = 'Esta es la linea 2'
const line3 = 'Esta es la linea 3'
```

```ts:line-numbers=2 {1}
// números de linea activados y comienzan en 2
const line3 = 'Esta es la linea 3'
const line4 = 'Esta es la linea 4'
```
````

**Salida**

```ts {1}
// números de linea desactivados por defecto
const line2 = 'Esta es la linea 2'
const line3 = 'Esta es la linea 3'
```

```ts:line-numbers {1}
// números de linea activados
const line2 = 'Esta es la linea 2'
const line3 = 'Esta es la linea 3'
```

```ts:line-numbers=2 {1}
// números de linea activados y comienzan en 2
const line3 = 'Esta es la linea 3'
const line4 = 'Esta es la linea 4'
```

## Importar _Snippets_ de Código {#import-code-snippets}

Puede importar pedazos de código de archivos existentes usando la siguiente sintaxis:

```md
<<< @/filepath
```

También soporta [destaque de linea](#line-highlighting-in-code-blocks):

```md
<<< @/filepath{highlightLines}
```

**Entrada**

```md
<<< @/snippets/snippet.js{2}
```

**Archivo de Código**

<<< @/snippets/snippet.js

**Salida**

<<< @/snippets/snippet.js{2}

::: tip

El valor de `@` corresponde a la raiz del código fuente. Por defecto, es la raiz del proyecto VitePress, a menos que `srcDir` sea configurado. Alternativamente, puede también importar de paths relativos:

```md
<<< ../snippets/snippet.js
```

:::

También puede usar una [región VS Code](https://code.visualstudio.com/docs/editor/codebasics#_folding) para incluir apenas la parte correspondiente del archivo de código. Puede proporcionar un nombre de región personalizado después de `#` siguiendo el path del archivo:

**Entrada**

```md
<<< @/snippets/snippet-with-region.js#snippet{1}
```

**Archivo de Código**

<<< @/snippets/snippet-with-region.js

**Salida**

<<< @/snippets/snippet-with-region.js#snippet{1}

También puede especificar el idioma dentro de llaves (`{}`), así:

```md
<<< @/snippets/snippet.cs{c#}

<!-- con destaque de linea: -->

<<< @/snippets/snippet.cs{1,2,4-6 c#}

<!-- con números de linea: -->

<<< @/snippets/snippet.cs{1,2,4-6 c#:line-numbers}
```

Esto es útil si el lenguaje original no puede ser inferida por la extensión de archivo.

## Grupos de Código {#code-groups}

Puede agrupar varios bloques de código así:

**Entrada**

````md
::: code-group

```js [config.js]
/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
  // ...
}

export default config
```

```ts [config.ts]
import type { UserConfig } from 'vitepress'

const config: UserConfig = {
  // ...
}

export default config
```

:::
````

**Salída**

::: code-group

```js [config.js]
/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
  // ...
}

export default config
```

```ts [config.ts]
import type { UserConfig } from 'vitepress'

const config: UserConfig = {
  // ...
}

export default config
```

:::

También puede [importar _snippets_ de código](#import-code-snippets) en grupos de código:

**Entrada**

```md
::: code-group

<!-- nombre de archivo usado como título por defecto -->

<<< @/snippets/snippet.js

<!-- puede proporcionar uno personalizado también -->

<<< @/snippets/snippet-with-region.js#snippet{1,2 ts:line-numbers} [snippet with region]

:::
```

**Output**

::: code-group

<<< @/snippets/snippet.js

<<< @/snippets/snippet-with-region.js#snippet{1,2 ts:line-numbers} [snippet with region]

:::

## Inclusión de Archivo Markdown {#markdown-file-inclusion}

Puede incluir un archivo markdown en otro archvo markdown, incluso anidado.

::: tip
Puede prefijar el path del markdown con `@`, el actuará como la raiz de origen. Por defecto, es la raiz del projecto VitePress, a menos que `srcDir` sea configurado.
:::

Por ejemplo, puede incluir un archivo markdown relativo usando esto:

**Entrada**

```md
# Documentación

## Conceptos Básicos

<!--@include: ./parts/basics.md-->
```

**Archivo de Parte** (`parts/basics.md`)

```md
Algunas cosas básicas.

### Configuración

Puede ser creada usando `.foorc.json`.
```

**Código Equivalente**

```md
# Documentación

## Conceptos básicos

Algunas cosas básicas

### Configuración

Puede ser creada usando `.foorc.json`.
```

También soporta la selección de un intervalo de lineas:

**Entrada**

```md
# Documentación

## Conceptos Básicos

<!--@include: ./parts/basics.md{3,}-->
```

**Archivo de Parte** (`parts/basics.md`)

```md
Algunas cosas básicas.

### Configuración

Puede ser creada usando `.foorc.json`.
```

**Código Equivalente**

```md
# Documentación

## Conceptos Básicos

### Configuración

Puede ser creada usando `.foorc.json`.
```

El formato del intervalo de lineas seleccionado puede ser: `{3,}`, `{,10}`, `{1,10}`

::: warning
Observe que esto no genera errores si el archivo no está presente. Por lo tanto, al usar este recurso, asegurese de que el contenido está siendo mostrado como se espera.:::

## Ecuaciones Matemáticas {#math-equations}

Esto es actualmente opcional. Para activarlo, necesita instalar `markdown-it-mathjax3` y definir `markdown.math` como `true` en su archivo de configuración:

```sh
npm add -D markdown-it-mathjax3
```

```ts [.vitepress/config.ts]
export default {
  markdown: {
    math: true
  }
}
```

**Entrada**

```md
Cuando $a \ne 0$, existen dos soluciones para $(ax^2 + bx + c = 0)$ y ellas son
$$ x = {-b \pm \sqrt{b^2-4ac} \over 2a} $$

**Ecuaciones de Maxwell:**

| ecuación                                                                                                                                                                  | descripción                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| $\nabla \cdot \vec{\mathbf{B}}  = 0$                                                                                                                                      | la divergencia de $\vec{\mathbf{B}}$ es cero                                               |
| $\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t}  = \vec{\mathbf{0}}$                                                          | la rotacional de $\vec{\mathbf{E}}$ es proporcional a la tasa de variación de $\vec{\mathbf{B}}$ |
| $\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} = 4 \pi \rho$ | _hã?_                                                                                     |

**Salída**

Cuando $a \ne 0$, existen dos soluciones para $(ax^2 + bx + c = 0)$ y ellas son
$$ x = {-b \pm \sqrt{b^2-4ac} \over 2a} $$

**Ecuaciones de Maxwell:**

| ecuación                                                                                                                                                                  | descripción                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| $\nabla \cdot \vec{\mathbf{B}}  = 0$                                                                                                                                      | la divergencia de $\vec{\mathbf{B}}$ es cero                                               |
| $\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t}  = \vec{\mathbf{0}}$                                                          | la rotacional de $\vec{\mathbf{E}}$ es proporcional a la tasa de variación de $\vec{\mathbf{B}}$ |
| $\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} = 4 \pi \rho$ | _hã?_                                                                                     |

## _Lazy Loading_ de Imagenes {#image-lazy-loading}

Puede activar la "carga perezosa" para cada imagen adicionada via markdown definiendo `lazyLoading` como `true` en su archivo de configuración:

```js
export default {
  markdown: {
    image: {
      // la carga perezosa de imagenes está desactivada por defecto
      lazyLoading: true
    }
  }
}
```

## Configuración Avanzada {#advanced-configuration}

VitePress usa [markdown-it](https://github.com/markdown-it/markdown-it) como interprete Markdown. Muchas de las extensiones arriba son implementadas por medio de _plugins_ personalizados. Puede personalizar más la instancia `markdown-it` usando la opción `markdown` en `.vitepress/config.js`:

```js
import { defineConfig } from 'vitepress'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItFoo from 'markdown-it-foo'

export default defineConfig({
  markdown: {
    // opciones para markdown-it-anchor
    // https://github.com/valeriangalliat/markdown-it-anchor#usage
    anchor: {
      permalink: markdownItAnchor.permalink.headerLink()
    },

    // opciones para @mdit-vue/plugin-toc
    // https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-toc#options
    toc: { level: [1, 2] },

    config: (md) => {
      // use más plugins markdown-it!
      md.use(markdownItFoo)
    }
  }
})
```

Consulte la lista completa de propiedades configurables en [Referencia de Configuración: Configuración de la Aplicación](../reference/site-config#markdown).
