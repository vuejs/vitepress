---
description: Carga datos arbitrarios en tiempo de compilación usando cargadores de datos de VitePress e impórtalo desde páginas o componentes.
---

# Carga de Datos en Tiempo de Compilación {#build-time-data-loading}

VitePress proporciona un recurso llamado **cargadores de datos** que permite cargar datos arbitrarios e importarlos desde páginas o componentes. La carga de datos es ejecutada **solo en el tiempo del compilación** los datos resultantes serán serializados como JSON en el paquete de JavaScript final.

Los cargadores de datos pueden ser usados para obtener datos remotos o generar metadatos a partir de archivos locales. Por ejemplo, puede usar cargadores de datos para analizar todas sus páginas de API locales y generar automáticamente un índice de todas las entradas de la API.

## Uso Básico {#basic-usage}

Un archivo de carga de datos debe terminar con `.data.js` o `.data.ts`. El archivo debe proporcionar una exportación predeterminada de un objeto con el método `load()`:

```js [example.data.js]
export default {
  load() {
    return {
      hello: 'world'
    }
  }
}
```

El módulo de carga se evalúa únicamente en Node.js, por lo que puedes importar las API de Node y las dependencias de npm según sea necesario.

Luego puedes importar datos de este archivo en páginas `.md` y componentes `.vue` usando la exportación llamada `data`:

```vue
<script setup>
import { data } from './example.data.js'
</script>

<pre>{{ data }}</pre>
```

Salida:

```json
{
  "hello": "world"
}
```

Notará que el cargador de datos en sí no exporta el `data`. Es VitePress llamando el método `load()` internamente y expone implícitamente el resultado a través de la exportación llamada `data`.

Esto funciona incluso si el cargador es asíncrono:

```js
export default {
  async load() {
    // buscar datos remotos
    return (await fetch('...')).json()
  }
}
```

## Datos de Archivos Locales {#data-from-local-files}

Cuando necesita generar datos con base en archivos locales, debe usar la opción `watch` en el cargador de datos para que los cambios hechos en esos archivos puedan accionar actualizaciones en caliente.

La opción `watch` también es conveniente porque puede usar [patrones glob](https://github.com/mrmlnc/fast-glob#pattern-syntax) para corresponder a varios archivos. Los patrones pueden ser relativos al propio archivo del cargador, y la función `load()` recibirá los archivos correspondientes como directorio absolutos.

El siguiente ejemplo muestra el cargamento de archivos CSV y la transformación de estos en JSON usando [csv-parse](https://github.com/adaltas/node-csv/tree/master/packages/csv-parse/). Como este archivo solo es ejecutado en el tiempo del compilación, usted no enviará el procesador de CSV para el cliente!

```js
import fs from 'node:fs'
import { parse } from 'csv-parse/sync'

export default {
  watch: ['./data/*.csv'],
  load(watchedFiles) {
    // watchedFiles será un array con las rutas absolutas de los archivos coincidentes.
    // Genera un array con los metadatos de las entradas del blog que se pueden usar para renderizar
    // una lista en el diseño del tema.
    return watchedFiles.map((file) => {
      return parse(fs.readFileSync(file, 'utf-8'), {
        columns: true,
        skip_empty_lines: true
      })
    })
  }
}
```

## `createContentLoader`

Al construir un sitio enfocado en contenido, frecuentemente necesitamos crear una página de "archivo" o "índice": una página donde listamos todas las entradas disponibles en nuestra colección de contenido, por ejemplo, artículos de blog o páginas de API. Nosotros **podemos** implementar esto directamente con el API de cargador de datos, pero como este es un caso de uso tan común, VitePress también proporciona un auxiliar `createContentLoader` para simplificar esto:

```js [posts.data.js]
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', /* opciones */)
```

El auxiliar acepta un patrón glob relativo al [directorio fuente](./routing#source-directory) y retorna un objeto de cargador de datos `{ watch, load }` que puede ser usado como exportación por defecto en un archivo de cargador de datos. El también implementa cache con base en las marca de tiempo se datos del archivo para mejorar el desempeño en el desarrollo.

Note que el cargador solo funciona con archivos Markdown - archivos no Markdown encontrados serán ignorados.

Los datos cargados serán un array con el tipo `ContentData[]`:

```ts
interface ContentData {
  // URL mapeada para la página. p. ej.: /posts/hola.html (no incluye la base)
  // itere manualmente o use `transform` personalizado para normalizar los directorios
  url: string
  // datos frontmatter de la página
  frontmatter: Record<string, any>

  // los siguientes están presentes si las opciones relevantes están habilitadas
  // discutiremos sobre eso abajo
  src: string | undefined
  html: string | undefined
  excerpt: string | undefined
}
```

Por defecto, solo se proporcionan `url` y `frontmatter`. Esto se debe a que los datos cargados se insertarán como JSON en el paquete del cliente, por lo que debemos tener cuidado con su tamaño. Aquí hay un ejemplo que utiliza los datos para crear una página de índice de blog mínima:
```vue
<script setup>
import { data as posts } from './posts.data.js'
</script>

<template>
  <h1>Todos los posts del blog</h1>
  <ul>
    <li v-for="post of posts">
      <a :href="post.url">{{ post.frontmatter.title }}</a>
      <span>por {{ post.frontmatter.author }}</span>
    </li>
  </ul>
</template>
```

### Opciones {#options}

Los datos por defecto pueden no atender todas las necesidades - puede optar por transformar los datos usando opciones:

```js [posts.data.js]
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', {
  includeSrc: true, // ¿incluir fuente markdown en crudo?
  render: true,     // ¿incluir HTML completo de la página presentada?
  excerpt: true,    // ¿incluir extracto?
  transform(rawData) {
    // mapee, ordene o filtre los datos en crudo como desee.
    // el resultado final es lo que será enviado al cliente.
    return rawData.sort((a, b) => {
      return +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date)
    }).map((page) => {
      page.src     // fuente markdown en crudo
      page.html    // HTML completo de la página presentada
      page.excerpt // HTML del extracto presentado (contenido encima del primer `---`)
      return {/* ... */}
    })
  }
})
```

Vea cómo es usado en el [blog Vue.js](https://github.com/vuejs/blog/blob/main/.vitepress/theme/posts.data.ts).

El API `createContentLoader` también puede ser usada dentro de los [build hooks](../reference/site-config#build-hooks):

```js [.vitepress/config.js]
export default {
  async buildEnd() {
    const posts = await createContentLoader('posts/*.md').load()
    // generar archivos con base en los metadatos de los posts, por ejemplo, feed RSS
  }
}
```

**Tipos**

```ts
interface ContentOptions<T = ContentData[]> {
  /**
   * ¿Incluir src?
   * @default false
   */
  includeSrc?: boolean

  /**
   * ¿Renderizar src para HTML e incluir en los datos?
   * @default false
   */
  render?: boolean

  /**
   * Si `boolean`, debe procesarse e incluir el resumen? (presentado como HTML)
   *
   * Si `function`, controla como el extracto es extraído del contenido.
   *
   * Si `string`, define un separador personalizado usado para extraer el
   * extracto. El separados por defecto es `---` si `excerpt` fuera `true`.
   *
   * @see https://github.com/jonschlinkert/gray-matter#optionsexcerpt
   * @see https://github.com/jonschlinkert/gray-matter#optionsexcerpt_separator
   *
   * @default false
   */
  excerpt?:
    | boolean
    | ((file: { data: { [key: string]: any }; content: string; excerpt?: string }, options?: any) => void)
    | string

  /**
   * Transforma los datos. Observe que los datos serán incorporados como JSON en el paquete del cliente
   * caso sean importados de componentes o archivos markdown.
   */
  transform?: (data: ContentData[]) => T | Promise<T>
}
```

## Cargadores de datos con Tipos {#typed-data-loaders}

Al usar TypeScript, puede tipar su cargador de datos y exportar `data` de la siguiente forma:

```ts
import { defineLoader } from 'vitepress'

export interface Data {
  // tipo de dato
}

declare const data: Data
export { data }

export default defineLoader({
  // opciones del cargador verificadas por el tipo
  watch: ['...'],
  async load(): Promise<Data> {
    // ...
  }
})
```

## Configuración {#configuration}

Para obtener información de configuración dentro de un cargador, puede usar un código como este:

```ts
import type { SiteConfig } from 'vitepress'

const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG
```
