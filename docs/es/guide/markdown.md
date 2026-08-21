---
description: Extensiones Markdown integradas en VitePress, incluyendo contenedores personalizados, bloques de código con resaltado de sintaxis, resaltado de líneas, grupos de código y más.
outline: deep
---

# Extensiones Markdown {#markdown-extensions}

VitePress viene con extensiones Markdown integradas.

## Anclajes de encabezado {#header-anchors}

Los encabezados obtienen automáticamente enlaces de anclaje. La visualización de los anclajes se puede configurar mediante la opción `markdown.anchor`.

### Anclajes personalizados {#custom-anchors}

Para especificar una etiqueta de anclaje personalizada para un encabezado en lugar de usar la generada automáticamente, agregue un sufijo al encabezado:

```
# Usando anclas personalizadas {#mi-anclajes}
```

Esto permite que tenga un enlace del encabezado como `#mi-anclajes` en vez del default `#usando-anclas-personalizadas`.

## Enlaces {#links}

Tanto los enlaces internos como los externos reciben un trato especial.

### Enlaces Internos {#internal-links}

Los enlaces internos se convierten en enlaces de enrutador para la navegación SPA. Además, cada archivo `index.md` contenido en cada subdirectorio se convertirá automáticamente en `index.html`, con la URL correspondiente `/`.

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
[Página Inicial](/) <!-- lleva al usuario al index.md raíz -->
[foo](/foo/) <!-- lleva al usuario al index.html del directorio foo -->
[foo heading](./#heading) <!-- ancla al usuario a un header del archivo índice foo -->
[bar - three](../bar/three) <!-- puede omitir la extensión -->
[bar - three](../bar/three.md) <!-- puede adicionar .md -->
[bar - four](../bar/four.html) <!-- o puede adicionar .html -->
```

### Sufijo de Página {#page-suffix}

Páginas y enlaces internos son generados con el sufijo `.html` por defecto.

### Enlaces Externos {#external-links}

Enlaces externos reciben automáticamente `target="_blank" rel="noreferrer"`:

- [vuejs.org](https://vuejs.org)
- [VitePress en GitHub](https://github.com/vuejs/vitepress)

## Frontmatter

[YAML frontmatter](https://jekyllrb.com/docs/front-matter/) es soportado por defecto:

```yaml
---
title: Blogueando como un hacker
lang: es-ES
---
```

Estos datos estarán disponibles para el resto de la página, junto con todos los componentes personalizados y de temas.

Para más detalles, vea [Frontmatter](../reference/frontmatter-config).

## Tablas al Estilo GitHub {#github-style-tables}

**Entrada**

```md
| Tablas         |           Son          | Geniales  |
| -------------- | :--------------------: | --------: |
| columna 3 está | alineada a la derecha  | $1600     |
| columna 2 está | centrada               | $12       |
| rayas de cebra | son elegantes          | $1        |
```

**Salida**

| Tablas         |           Son          | Geniales  |
| -------------- | :--------------------: | --------: |
| columna 3 está | alineada a la derecha  | \$1600    |
| columna 2 está | centrada               |  \$12     |
| rayas de cebra | son elegantes          |   \$1     |

## Listas de tareas {#task-lists}

**Entrada**

```md
- [ ] Escribir el comunicado de prensa
- [x] Actualizar el sitio web
```

**Salida**

- [ ] Escribir el comunicado de prensa
- [x] Actualizar el sitio web

## Notas al pie {#footnotes}

**Entrada**

```md
Las notas al pie son compatibles[^1], incluidas las notas en línea^[Esta es una nota al pie en línea.].

[^1]: Las definiciones pueden contener **markdown** y se renderizan al final de la página.
```

**Salida**

Las notas al pie son compatibles[^1], incluidas las notas en línea^[Esta es una nota al pie en línea.].

[^1]: Las definiciones pueden contener **markdown** y se renderizan al final de la página.

## Emoji :tada:

**Entrada**

```
:tada: :100:
```

**Salida**

:tada: :100:

Una [lista de todos los emojis](https://github.com/mdit-plugins/mdit-plugins/blob/main/packages/plugin-emoji/src/data/full.ts) está disponible.

## Tabla de Contenido (TOC) {#table-of-contents}

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
Esta es una advertencia.
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

````md
::: danger ALTO
Zona de peligro, no siga
:::

::: details Click para ver el código
```js
console.log('¡Hola, VitePress!')
```
:::
````

**Salida**

::: danger ALTO
Zona de peligro, no siga
:::

::: details Click para ver el código
```js
console.log('¡Hola, VitePress!')
```
:::

Además, puede definir títulos personalizados globalmente agregando el siguiente contenido en la configuración del sitio, útil si no estuviera escribiendo en ingles:

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

En sitios multilingües, estas etiquetas también se pueden sobrescribir por configuración regional - consulte [Cadenas de Markdown por configuración regional](./i18n#per-locale-markdown-strings).

### Registrar nuevos contenedores {#registering-new-containers}

Más allá de los tipos integrados, puede registrar contenedores adicionales asignando sus nombres a sus títulos predeterminados:

```ts
// config.ts
export default defineConfig({
  // ...
  markdown: {
    container: {
      customContainers: {
        success: 'ÉXITO'
      }
    }
  }
  // ...
})
```

Los nombres registrados funcionan como los integrados, incluyendo títulos personalizados, atributos y la [sintaxis de alertas al estilo de GitHub](#github-flavored-alerts):

```md
::: success
¡Has completado el tutorial!
:::

> [!SUCCESS] Título personalizado
> Esto se renderiza de la misma manera.
```

Los nuevos contenedores se envían sin ningún estilo, así que agregue algunos en su tema usando el nombre del contenedor como clase. Para este ejemplo, la paleta del tema predeterminado ya proporciona colores adecuados:

```css
/* .vitepress/theme/custom.css */
.custom-block.success {
  border-color: transparent;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-success-soft);
}
```

### Anidamiento {#nesting}

Los marcadores `:::` siguen las mismas reglas que los bloques de código delimitados (` ``` `): una delimitación solo se cierra con una delimitación coincidente que sea **al menos tan larga** como la que lo abrió. Para anidar contenedores (o mezclarlos con [grupos de código](#code-groups)) haga que la delimitación externa sea más larga que las que están dentro de ella.

**Entrada**

`````md
:::: info Contenedor externo
Este cuadro contiene otro contenedor.

::: details Contenedor interno
```js
console.log('¡Hola, VitePress!')
```
:::
::::
`````

**Salida**

:::: info Contenedor externo
Este cuadro contiene otro contenedor.

::: details Contenedor interno
```js
console.log('¡Hola, VitePress!')
```
:::
::::

### Atributos adicionales {#additional-attributes}

Puedes añadir atributos adicionales a los contenedores personalizados. Usamos [@mdit/plugin-attrs](https://mdit-plugins.github.io/attrs.html) para esta característica, y es compatible con casi todos los elementos Markdown. Por ejemplo, puede establecer el atributo `open` para que el bloque de detalles se abra por defecto:

**Entrada**

````md
::: details Haz clic aquí para mostrar u ocultar el código  {open}
```js
console.log('¡Hola, VitePress!')
```
:::
````

**Salida**

::: details Haz clic aquí para mostrar u ocultar el código {open}
```js
console.log('¡Hola, VitePress!')
```
:::

El atributo especial `no-title` renderiza un contenedor sin un elemento de título (no tiene ningún efecto en `details`, que siempre necesita su sumario):

**Entrada**

```md
::: tip {no-title}
¿Solo quieres probarlo? Ve a [Comenzar](./getting-started).
:::
```

**Salida**

::: tip {no-title}
¿Solo quieres probarlo? Ve a [Comenzar](./getting-started).
:::

### `raw`

Este es un contenedor especial que se puede utilizar para evitar conflictos de estilo y del enrutador con VitePress. Esto es especialmente útil al documentar bibliotecas de componentes.

**Sintaxis**

```md
::: raw
Envuelve en un `<div class="vp-raw">`
:::
```

La clase `vp-raw` también se puede utilizar directamente en elementos. El aislamiento de estilo es actualmente opcional:

- Instale `postcss` con su gestor de paquetes preferido:

  ```sh
  $ npm add -D postcss
  ```

- Cree un archivo llamado `docs/postcss.config.mjs` y agregue lo siguiente:

  ```js
  import { postcssIsolateStyles } from 'vitepress'

  export default {
    plugins: [postcssIsolateStyles()]
  }
  ```

  Puede pasar opciones así:

  ```js
  postcssIsolateStyles({
    includeFiles: [/custom\.css/] // por defecto [/vp-doc\.css/, /base\.css/]
  })
  ```

## Alertas al estilo de GitHub {#github-flavored-alerts}

VitePress también soporta [alertas al estilo de GitHub](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts) para que se rendericen como recuadros de aviso. Se renderizarán de la misma manera que los [contenedores personalizados](#custom-containers). A diferencia de GitHub, el texto colocado justo después del marcador se convierte en el título de la alerta (`> [!NOTE] Título personalizado`), y los [contenedores que registró usted mismo](#registering-new-containers) también funcionan aquí.

```md
> [!NOTE]
> Destaca informaciones que los usuarios deben tener en consideración, incluso leyendo rápidamente.

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
> Destaca informaciones que los usuarios deben tener en consideración, incluso leyendo rápidamente.

> [!TIP]
> Informaciones opcionales para ayudar al usuario a tener más éxito.

> [!IMPORTANT]
> Informaciones cruciales necesarias par que los usuarios tengan éxito.

> [!WARNING]
> Contenido critico exigiendo atención inmediata del usuario debido a riesgos potenciales.

> [!CAUTION]
> Potenciales consecuencias negativas de una acción.

De forma predeterminada, los colores de las alertas coinciden con los de GitHub, y tanto caution como danger se renderizan en rojo. Habilite [`themeConfig.gradedContainers`](../reference/default-theme-config#gradedcontainers) para utilizar una escala de gravedad gradual: danger (rojo), warning (naranja) y caution (amarillo). Tenga en cuenta que `[!DANGER]` es una extensión de VitePress y se renderizará como una cita de bloque normal en GitHub.

## Resaltado de Sintaxis en Bloques de Código {#syntax-highlighting-in-code-blocks}

VitePress utiliza [Shiki](https://github.com/shikijs/shiki) para el resaltado de la sintaxis del lenguaje en bloques de código Markdown, usando texto coloreado. Shiki es compatible con una amplia variedad de lenguajes de programación. Todo lo que necesita hacer es agregar un alias de lenguaje válido a las comillas invertidas de apertura para el bloque de código:

**Entrada**

````
```js
export default {
  name: 'MiComponente',
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
  name: 'MiComponente'
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

Una [lista de lenguajes válidas](https://shiki.style/languages) está disponible en el repositorio de Shiki.

También puede personalizar el tema del resaltado de sintaxis, configurar alias de idioma y establecer etiquetas de idioma personalizadas en la configuración de la aplicación. Consulte las [opciones `markdown`](../reference/site-config#markdown) para más detalles.

## Resaltado de Líneas en Bloques de código {#line-highlighting-in-code-blocks}

**Entrada**

````
```js{4}
export default {
  data () {
    return {
      msg: '¡Resaltado!'
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
      msg: '¡Resaltado!'
    }
  }
}
```

Además de una única línea, puede también especificar múltiples líneas individuales, intervalos o ambos:

- Intervalos de líneas: por ejemplo `{5-8}`, `{3-10}`, `{10-17}`
- Múltiples líneas individuales: por ejemplo `{4,7,9}`
- Intervalos de líneas y líneas individuales: por ejemplo `{4,7-13,16,23-27,40}`

**Entrada**

````
```js{1,4,6-8}
export default { // Resaltado
  data () {
    return {
      msg: `¡Resaltado!
      Esta línea no está resaltada,
      pero esta y las próximas 2 lo están.`,
      motd: 'VitePress es increíble',
      lorem: 'ipsum'
    }
  }
}
```
````

**Salida**

```js{1,4,6-8}
export default { // Resaltado
  data () {
    return {
      msg: `¡Resaltado!
      Esta línea no está resaltada,
      pero esta y las próximas 2 lo están.`,
      motd: 'VitePress es increíble',
      lorem: 'ipsum',
    }
  }
}
```

Alternativamente, es posible resaltar directamente en la línea utilizando el comentario `// [!code highlight]`.

**Entrada**

````
```js
export default {
  data () {
    return {
      msg: '¡Resaltado!' // [!code highlight]
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
      msg: '¡Resaltado!' // [!code highlight]
    }
  }
}
```

## Enfoque en Bloques de Código {#focus-in-code-blocks}

Agregar el comentario `// [!code focus]` en una línea la enfocará y desenfocará las otras partes del código.

Además, puede definir el número de líneas para enfocar utilizando `// [!code focus:<líneas>]`.

**Entrada**

````
```js
export default {
  data () {
    return {
      msg: '¡Enfocado!' // [!!code focus]
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
      msg: '¡Enfocado!' // [!code focus]
    }
  }
}
```

## Diferencias Coloreadas en Bloques de Código {#colored-diffs-in-code-blocks}

Agregar los comentarios `// [!code --]` o `// [!code ++]` en una línea creará una diferencia (diff) de esa línea, manteniendo los colores del bloque de código.

**Entrada**

````
```js
export default {
  data () {
    return {
      msg: 'Eliminado' // [!code --]
      msg: 'Agregado' // [!code ++]
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
      msg: 'Eliminado' // [!code --]
      msg: 'Agregado' // [!code ++]
    }
  }
}
```

## Errores y Advertencias en Bloques de Código {#errors-and-warnings-in-code-blocks}

Agregar los comentarios `// [!code warning]` o `// [!code error]` en una línea la coloreará en consecuencia.

**Entrada**

````
```js
export default {
  data () {
    return {
      msg: 'Error', // [!!code error]
      msg: 'Advertencia' // [!!code warning]
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
      msg: 'Advertencia' // [!code warning]
    }
  }
}
```

## Números de Línea {#line-numbers}

Puede habilitar números de línea para cada bloque de código a través del archivo de configuración:

```js
export default {
  markdown: {
    lineNumbers: true
  }
}
```

Consulte las [opciones `markdown`](../reference/site-config#markdown) para más detalles.

Puede agregar la marca `:line-numbers` / `:no-line-numbers` en sus bloques de código delimitados para substituir el valor definido en la configuración.

También puede personalizar el número de línea de inicio agregando `=` después de `:line-numbers`. Por ejemplo, `:line-numbers=2` significa que los números de línea en los bloques de código comenzarán a partir de `2`.

**Entrada**

````md
```ts {1}
// números de línea desactivados por defecto
const line2 = 'Esta es la línea 2'
const line3 = 'Esta es la línea 3'
```

```ts:line-numbers {1}
// números de línea activados
const line2 = 'Esta es la línea 2'
const line3 = 'Esta es la línea 3'
```

```ts:line-numbers=2 {1}
// números de línea activados y comienzan en 2
const line3 = 'Esta es la línea 3'
const line4 = 'Esta es la línea 4'
```
````

**Salida**

```ts {1}
// números de línea desactivados por defecto
const line2 = 'Esta es la línea 2'
const line3 = 'Esta es la línea 3'
```

```ts:line-numbers {1}
// números de línea activados
const line2 = 'Esta es la línea 2'
const line3 = 'Esta es la línea 3'
```

```ts:line-numbers=2 {1}
// números de línea activados y comienzan en 2
const line3 = 'Esta es la línea 3'
const line4 = 'Esta es la línea 4'
```

## Importar _Snippets_ de Código {#import-code-snippets}

Puede importar fragmentos (_Snippets_) de código desde archivos existentes usando la siguiente sintaxis:

```md
<<< @/ruta/al/archivo
```

También soporta [resaltado de líneas](#line-highlighting-in-code-blocks):

```md
<<< @/ruta/al/archivo{lineasResaltadas}
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
El valor de `@` corresponde a la raíz del código fuente. Por defecto, es la raíz del proyecto VitePress, a menos que se configure `srcDir`. Alternativamente, también puede importar desde rutas relativas:

```md
<<< ../snippets/snippet.js
```

:::

También puede usar una [región de VS Code](https://code.visualstudio.com/docs/editor/codebasics#_folding) para incluir solo la parte correspondiente del archivo de código. Puede proporcionar un nombre de región personalizado después de un `#` que sigue a la ruta del archivo:

**Entrada**

```md
<<< @/snippets/snippet-with-region.js#snippet{1}
```

**Archivo de Código**

<<< @/snippets/snippet-with-region.js

**Salida**

<<< @/snippets/snippet-with-region.js#snippet{1}

Si un archivo contiene varias regiones con el mismo nombre, todas ellas se importan y concatenan — incluidas las regiones escritas en diferentes estilos de comentarios, como un `<!-- #region -->` en la plantilla y un `// #region` en el script del mismo SFC de Vue. Los comentarios de los marcadores que las delimitan se eliminan de la salida; establezca `markdown.snippet.stripRegionMarkers` en `'all'` para eliminar también los marcadores de otros estilos de comentarios anidados dentro de la región, o en `false` para conservarlos todos.

::: tip
Los nombres de regiones pueden contener letras, dígitos, `_`, `-` y `.`. Dado que el nombre se toma del final de la ruta, un archivo cuyo nombre en sí contenga un `#` necesita una región explícita: escriba `<<< ./mi#archivo.js#region` en lugar de `<<< ./mi#archivo.js`.
:::

::: warning
Importar un archivo o región que no existe arroja un error de compilación. Establezca `markdown.snippet.silent: true` para registrar una advertencia y no mostrar nada en su lugar.
:::

También puede especificar el lenguaje dentro de las llaves (`{}`) de esta manera:

```md
<<< @/snippets/snippet.cs{c#}

<!-- con resaltado de líneas: -->

<<< @/snippets/snippet.cs{1,2,4-6 c#}

<!-- con números de línea: -->

<<< @/snippets/snippet.cs{1,2,4-6 c#:line-numbers}
```

Esto es útil si el lenguaje fuente no se puede inferir a partir de la extensión del archivo. Solo se infieren las extensiones alfanuméricas, por lo que los archivos como `main.c++` o `scss.code-snippets` necesitan que el lenguaje se especifique de esta manera.

Cualquier cosa después del lenguaje dentro de las llaves se pasa al bloque de código como atributos adicionales — por ejemplo, `<<< @/snippets/snippet.ts{ts twoslash}` habilita el procesamiento de twoslash cuando [`@shikijs/vitepress-twoslash`](https://shiki.style/packages/vitepress#twoslash) está configurado. Tenga en cuenta que los atributos no pueden contener corchetes.

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

**Salida**

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

<!-- también puede proporcionar uno personalizado -->

<<< @/snippets/snippet-with-region.js#snippet{1,2 ts:line-numbers} [snippet with region]

:::
```

**Salida**

::: code-group

<<< @/snippets/snippet.js

<<< @/snippets/snippet-with-region.js#snippet{1,2 ts:line-numbers} [snippet with region]

:::

## Inclusión de Archivo Markdown {#markdown-file-inclusion}

Puede incluir un archivo markdown en otro archivo markdown, incluso si están anidados.

::: tip
También puedes prefijar `@` a la ruta de Markdown, y actuará como raíz de origen. Por defecto, la raíz de origen es la raíz del proyecto VitePress, a menos que se configure `srcDir`.
:::

Por ejemplo, puede incluir un archivo markdown relativo usando esto:

**Entrada**

```md
# Documentación

## Conceptos Básicos

<!--@@include: ./partes/conceptos-basicos.md-->
```

**Archivo Parcial** (`partes/conceptos-basicos.md`)

```md
Algunas cosas para empezar.

### Configuración

Puede ser creada usando `.foorc.json`.
```

**Código Equivalente**

```md
# Documentación

## Conceptos Básicos

Algunas cosas para empezar.

### Configuración

Puede ser creada usando `.foorc.json`.
```

También soporta la selección de un intervalo de líneas:

**Entrada**

```md:line-numbers
# Documentación

## Conceptos Básicos

<!--@@include: ./partes/conceptos-basicos.md{3,}-->
```

**Archivo Parcial** (`partes/conceptos-basicos.md`)

```md:line-numbers
Algunas cosas para empezar.

### Configuración

Puede ser creada usando `.foorc.json`.
```

**Código Equivalente**

```md:line-numbers
# Documentación

## Conceptos Básicos

### Configuración

Puede ser creada usando `.foorc.json`.
```

El formato del rango de líneas seleccionado puede ser: `{3,}`, `{,10}`, `{1,10}`

También puedes usar una [región de VS Code](https://code.visualstudio.com/docs/editor/codebasics#_folding) para incluir solo la parte correspondiente del archivo de código. Puedes proporcionar un nombre de región personalizado después de un `#` que sigue a la ruta del archivo:

**Entrada**

```md:line-numbers
# Documentación

## Conceptos Básicos

<!--@@include: ./partes/conceptos-basicos.md#uso-basico{,2}-->
<!--@@include: ./partes/conceptos-basicos.md#uso-basico{5,}-->
```

**Archivo Parcial** (`partes/conceptos-basicos.md`)

```md:line-numbers
<!-- #region uso-basico -->
## Línea de uso 1

## Línea de uso 2

## Línea de uso 3
<!-- #endregion uso-basico -->
```

**Código Equivalente**

```md:line-numbers
# Documentación

## Conceptos Básicos

## Línea de uso 1

## Línea de uso 3
```

::: warning
Incluir un archivo que falta, una región, un anclaje de encabezado o una selección de línea fuera de rango arroja un error de compilación. Establezca `markdown.include.silent: true` para registrar una advertencia y omitir la inclusión en su lugar.
:::

En lugar de regiones de VS Code, también puede usar anclas de encabezado para incluir una sección específica del archivo. Por ejemplo, si tiene un encabezado en su archivo Markdown como este:

```md
## Mi sección base

Aquí hay contenido.

### Mi subsección

Aquí hay más contenido.

## Otra sección

Contenido fuera de `Mi sección base`.
```

Puede incluir la sección `Mi sección base` de esta manera:

```md
## Mi sección extendida
<!--@@include: ./partes/conceptos-basicos.md#mi-seccion-base-->
```

**Código Equivalente**

```md
## Mi sección extendida

Aquí hay contenido.

### Mi subsección

Aquí hay más contenido.
```

Aquí, `mi-seccion-base` es el ID generado del elemento de encabezado. Si no es fácil de adivinar, puede abrir el archivo parcial en su navegador y hacer clic en el ancla del encabezado (el símbolo `#` a la izquierda del encabezado al pasar el cursor sobre él) para ver el ID en la barra de URL. O bien, use las herramientas de desarrollo del navegador para inspeccionar el elemento. Alternativamente, también puede especificar el ID en el archivo parcial de esta manera:

```md
## Mi Sección Base {#id-personalizada}
```

e incluirlo así:

```md
<!--@@include: ./partes/conceptos-basicos.md#id-personalizado-->
```

Los enlaces relativos y las imágenes dentro de los archivos incluidos se resuelven desde la ubicación del archivo *incluido*, por lo que un archivo parcial puede enlazar con sus vecinos sin importar qué página lo incluya. Establezca `markdown.include.rebaseRelativeUrls: false` para que se resuelvan en relación con la página que los incluye en su lugar.

### Incluir archivos de código {#including-code-files}

Dado que la inclusión ocurre antes de que se analicen los bloques de código, la directiva también funciona dentro de los bloques delimitados. Combinado con un rango de líneas, esto le permite mostrar solo una parte de un archivo de código — una alternativa a [importar fragmentos](#import-code-snippets) cuando las regiones no son una opción:

**Entrada**

````md
```js
<!--@@include: @/snippets/snippet-with-region.js{2,4}-->
```
````

**Salida**

```js
<!--@include: @/snippets/snippet-with-region.js{2,4}-->
```

Tenga en cuenta que las líneas incluidas se insertan textualmente (se conserva la sangría) y el contenido que contiene comillas invertidas necesita una delimitación externa más larga.

## Ecuaciones Matemáticas {#math-equations}

Esto es actualmente opcional. Para activarlo, necesita instalar `markdown-it-mathjax3` y definir `markdown.math` como `true` en su archivo de configuración:

```sh
npm add -D markdown-it-mathjax3@^4
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

| ecuación                                                                                                                                                                  | descripción                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| $\nabla \cdot \vec{\mathbf{B}}  = 0$                                                                                                                                      | la divergencia de $\vec{\mathbf{B}}$ es cero                                                     |
| $\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t}  = \vec{\mathbf{0}}$                                                          | la rotacional de $\vec{\mathbf{E}}$ es proporcional a la tasa de variación de $\vec{\mathbf{B}}$ |
| $\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} = 4 \pi \rho$ | _que?_                                                                                           |
```

**Salida**

Cuando $a \ne 0$, existen dos soluciones para $(ax^2 + bx + c = 0)$ y ellas son
$$ x = {-b \pm \sqrt{b^2-4ac} \over 2a} $$

**Ecuaciones de Maxwell:**

| ecuación                                                                                                                                                                  | descripción                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| $\nabla \cdot \vec{\mathbf{B}}  = 0$                                                                                                                                      | la divergencia de $\vec{\mathbf{B}}$ es cero                                                     |
| $\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t}  = \vec{\mathbf{0}}$                                                          | la rotacional de $\vec{\mathbf{E}}$ es proporcional a la tasa de variación de $\vec{\mathbf{B}}$ |
| $\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} = 4 \pi \rho$ | _que?_                                                                                           |

## Carga diferida de imágenes {#image-lazy-loading}

Puedes habilitar la carga diferida (lazy loading) para cada imagen añadida mediante Markdown configurando `lazyLoad` a `true` en tu archivo de configuración:

```js
export default {
  markdown: {
    image: {
      // La carga diferida de imágenes está deshabilitada por defecto.
      lazyLoad: true
    }
  }
}
```

## Configuración Avanzada {#advanced-configuration}

VitePress usa [markdown-it](https://github.com/markdown-it/markdown-it) como interprete Markdown. Muchas de las extensiones arriba son implementadas por medio de _plugins_ personalizados. Puede personalizar más la instancia `markdown-it` usando la opción `markdown` en `.vitepress/config.js`:

```js
import { defineConfig } from 'vitepress'
import { headerLink } from '@mdit/plugin-anchor'
import markdownItFoo from 'markdown-it-foo'

export default defineConfig({
  markdown: {
    // opciones para @mdit/plugin-anchor
    // https://mdit-plugins.github.io/anchor.html
    anchor: {
      permalink: headerLink()
    },

    // opciones para @mdit-vue/plugin-toc
    // https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-toc#options
    toc: { level: [1, 2] },

    config: (md) => {
      // ¡use más complementos de markdown-it!
      md.use(markdownItFoo)
    }
  }
})
```

Consulte la lista completa de propiedades configurables en [Referencia de Configuración: Configuración de la Aplicación](../reference/site-config#markdown).