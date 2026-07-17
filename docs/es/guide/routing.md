---
outline: deep
description: Comprende el enrutamiento basado en archivos de VitePress, rutas dinámicas, URLs limpias y reescritura de rutas.
---

# Enrutamiento {#routing}

## Enrutamiento basado en Archivos {#file-based-routing}

VitePress utiliza enrutamiento basado en archivos, esto significa que las páginas HTML generadas son mapeadas de la estructura de directorios de los archivos Markdown. Por ejemplo, dada la siguiente estructura de directorio:

```
.
├─ guide
│  ├─ getting-started.md
│  └─ index.md
├─ index.md
└─ prologue.md
```

Las páginas HTML generadas serán:

```
index.md                  -->  /index.html (accesible por /)
prologo.md                -->  /prologo.html
guia/index.md             -->  /guia/index.html (accesible por /guia/)
guia/comenzar.md  -->  /guia/comenzar.html
```

El HTML resultante puede ser hospedado en cualquier servidor web que pueda servir archivos estáticos.

## Directorio Raíz y fuente {#root-and-source-directory}

Existen dos conceptos importantes en la estructura de archivos de un proyecto VitePress: el **directorio raíz** y el **directorio fuente**.

### Raíz del Proyecto {#project-root}

La raíz del proyecto es donde VitePress intentará buscar el directorio especial `.vitepress`. El directorio `.vitepress` es una ubicación reservada para el archivo de configuración de VitePress, la caché del servidor de desarrollo, la salida de la compilación y el código de personalización de temas opcional.

Cuando ejecute `vitepress dev` o `vitepress build` desde la línea de comandos, VitePress utilizará el directorio de trabajo actual como raíz del proyecto. Para especificar un subdirectorio como raíz, es necesario pasar la ruta relativa al comando. Por ejemplo, si su proyecto VitePress se encuentra en `./docs`, deberá ejecutar `vitepress dev docs`:

```
.
├─ docs                    # raíz del proyecto
│  ├─ .vitepress           # directorio de configuración
│  ├─ comenzar.md
│  └─ index.md
└─ ...
```

```sh
vitepress dev docs
```

Esto resultará en el siguiente mapeo de fuente para HTML:

```
docs/index.md            -->  /index.html (accesible como /)
docs/comenzar.md  -->  /comenzar.html
```

### Directorio Fuente {#source-directory}

El directorio fuente es donde se encuentran tus archivos fuente de Markdown. Por defecto, coincide con la raíz del proyecto. Sin embargo, puedes configurarlo mediante la opción de configuración `srcDir` (../reference/site-config#srcdir).

La opción `srcDir` se resuelve en relación con la raíz del proyecto. Por ejemplo, con `srcDir: 'src'`, la estructura de archivos será la siguiente:

```
.                          # directorio raíz
├─ .vitepress              # directorio de configuración
└─ src                     # directorio fuente
   ├─ comenzar.md
   └─ index.md
```

El mapeo resultante de código fuente a HTML:

```
src/index.md            -->  /index.html (accesible como /)
src/comenzar.md  -->  /comenzar.html
```

## Enlaces Entre Páginas {#linking-between-pages}

Puedes usar rutas absolutas y relativas para enlazar páginas. Ten en cuenta que, si bien funcionan las extensiones `.md` y `.html`, lo recomendable es omitirlas para que VitePress genere las URL finales según tu configuración.

```md
<!-- Hacer -->
[Comenzar](./comenzar)
[Comenzar](../guide/comenzar)

<!-- No hacer -->
[Comenzar](./comenzar.md)
[Comenzar](./comenzar.html)
```

Obtenga más información sobre cómo vincular recursos como imágenes en [Manejo de Assets](./asset-handling).

### Vinculación de Páginas No VitePress {#linking-to-non-vitepress-pages}

Si desea vincular a una página en su sitio que no es generada por VitePress, será necesario usar la URL completa (abre en una nueva pestaña) o especificar explícitamente el destino:

**Entrada**

```md
[Enlace para pure.html](/pure.html){target="_self"}
```

**Salida**

[Enlace para pure.html](/pure.html){target="_self"}

::: tip Nota

En los enlaces Markdown, la `base` es automáticamente adicionada a la URL. Esto significa que, si desea vincular a una página fuera de su base, será necesario algo como `../../pure.html` en el enlace (resuelto en relación a la página actual por el navegador).

Alternativamente, puede utilizar directamente la sintaxis de la etiqueta de anclaje:

```md
<a href="/pure.html" target="_self">Link to pure.html</a>
```

:::

## Generación de URLs Limpias {#generating-clean-urls}

::: warning Soporte del Servidor Necesario
Para servir URLs limpias con VitePress, es necesario soporte en el lado del servidor.
:::

Por defecto, VitePress resuelve los enlaces entrantes a URLs que terminan en `.html`. Sin embargo, algunos usuarios pueden preferir "URLs limpias" sin la extensión `.html`, por ejemplo, `ejemplo.com/ruta` en vez de `ejemplo.com/ruta.html`.

Algunos servidores o plataformas de hospedaje (por ejemplo, Netlify, Vercel, GitHub Pages) proporcionan la habilidad de mapear una URL como `/foo` para `/foo.html` si existir, sin redireccionamiento:

- Netlify y GitHub Pages soportan esto por defecto.
- Vercel requiere activación de la opción [`cleanUrls` en `vercel.json`](https://vercel.com/docs/concepts/projects/project-configuration#cleanurls).

Si esa funcionalidad está disponible para usted, también se puede activar la propia opción de configuración [`cleanUrls`](../reference/site-config#cleanurls) de VitePress para que:

- Los enlaces entrantes entre páginas se generan sin la extensión `.html`.
- Si la ruta actual termina en `.html`, el enrutador realizará una redirección del lado del cliente a la ruta sin extensión.

Sin embargo, si no puede configurar el servidor con ese soporte, será necesario recorrer manualmente la siguiente estructura de directorio:

```
.
├─ comenzar
│  └─ index.md
├─ instalacion
│  └─ index.md
└─ index.md
```

# Reescritura de Ruta {#route-rewrites}

Puedes personalizar la correspondencia entre la estructura del directorio de origen y las páginas generadas. Esto resulta útil cuando tienes una estructura de proyecto compleja. Por ejemplo, digamos que tienes un monorepo con varios paquetes y le gustaría colocar la documentación junto con los archivos fuente de esta forma:

```
.
└─ packages
   ├─ pkg-a
   │  └─ src
   │     ├─ foo.md
   │     └─ index.md
   └─ pkg-b
      └─ src
         ├─ bar.md
         └─ index.md
```

Y desea que las páginas VitePress sean generadas así:

```
packages/pkg-a/src/index.md  -->  /pkg-a/index.html
packages/pkg-a/src/foo.md    -->  /pkg-a/foo.html
packages/pkg-b/src/index.md  -->  /pkg-b/index.html
packages/pkg-b/src/bar.md    -->  /pkg-b/bar.html
```

Puede realizar esto configurando la opción [`rewrites`](../reference/site-config#rewrites) así:

```ts [.vitepress/config.js]
export default {
  rewrites: {
    'packages/pkg-a/src/index.md': 'pkg-a/index.md',
    'packages/pkg-a/src/foo.md': 'pkg-a/foo.md',
    'packages/pkg-b/src/index.md': 'pkg-b/index.md',
    'packages/pkg-b/src/bar.md': 'pkg-b/bar.md'
  }
}
```

La opción `rewrites` también soporta parámetros de ruta dinámicos. En el ejemplo anterior, sería tedioso enumerar todas las rutas si tienes muchos paquetes. Dado que todos tienen la misma estructura de archivos, puedes simplificar la configuración de esta manera:

```ts
export default {
  rewrites: {
    'packages/:pkg/src/:slug*': ':pkg/:slug*'
  }
}
```

Las rutas de reescritura se compilan utilizando el paquete `path-to-regexp`. Consulte [su documentación](https://github.com/pillarjs/path-to-regexp/tree/6.x#parameters) para obtener una sintaxis más avanzada.

`rewrites` también puede ser una función que recibe la ruta original y devuelve la nueva ruta:

```ts
export default {
  rewrites(id) {
    return id.replace(/^packages\/([^/]+)\/src\//, '$1/')
  }
}
```

::: warning Enlaces Relativos con Reescrituras

Cuando las reescrituras están habilitadas, **los enlaces relativos deben ser basados en las rutas reescritas**. Por ejemplo, para crear un enlace relativo de `packages/pkg-a/src/pkg-a-code.md` a `packages/pkg-b/src/pkg-b-code.md`, debe usar:

```md
[Link para PKG B](../pkg-b/pkg-b-code)
```
:::

## Rutas Dinámicas {#dynamic-routes}

Puedes generar varias páginas usando un único archivo Markdown y datos dinámicos. Por ejemplo, puedes crear un archivo `packages/[pkg].md` que genere una página correspondiente para cada paquete de un proyecto. Aqui, el segmento `[pkg]` es un **parámetro** de ruta que diferencia cada página de las otras.

### Archivo de Carga de Rutas {#paths-loader-file}

Como VitePress es un generador de sitios estáticos, las posibles rutas de página deben determinarse en tiempo de compilación. Por lo tanto, una página de ruta dinámica **debe** estar acompañada de un **archivo de carga de rutas**. Para `packages/[pkg].md`, necesitaremos `packages/[pkg].paths.js` (`.ts` también es soportado):

```
.
└─ packages
   ├─ [pkg].md         # plantilla de ruta
   └─ [pkg].paths.js   # cargador de rutas de ruta
```

El cargador de rutas debe proporcionar un objeto con un método `paths` como su exportación por defecto. El método `paths` debe devolver un _array_ de objetos con una propiedad `params`. Cada uno de estos objetos generará una página correspondiente.

Dado el siguiente _array_ `paths`:

```js
// packages/[pkg].paths.js
export default {
  paths() {
    return [
      { params: { pkg: 'foo' }},
      { params: { pkg: 'bar' }}
    ]
  }
}
```

Las páginas HTML generadas serán:

```
.
└─ packages
   ├─ foo.html
   └─ bar.html
```

### Cargador con tipado seguro mediante `defineRoutes` {type-safe-loader-with-defineroutes}

Si utiliza TypeScript, puede envolver el cargador con `defineRoutes` de `vitepress` para obtener sugerencias de tipo para ganchos de ruta como `paths`, `watch` y `transformPageData`:

```ts
// packages/[pkg].paths.ts
import { defineRoutes } from 'vitepress'

export default defineRoutes({
  watch: ['../data/**/*.json'],
  async paths() {
    return [
      { params: { pkg: 'foo' } },
      { params: { pkg: 'bar' } }
    ]
  },
  async transformPageData(pageData) {
    pageData.title = `${pageData.title} · Packages`
  }
})
```

`defineRoutes` es opcional, pero se recomienda al crear archivos `.paths.ts`.

### Múltiples Parámetros {#multiple-params}

Una ruta dinámica puede contener múltiples parámetros:

**Estructura de Archivo**

```
.
└─ packages
   ├─ [pkg]-[version].md
   └─ [pkg]-[version].paths.js
```

**Cargador de Rutas**

```js
export default {
  paths: () => [
    { params: { pkg: 'foo', version: '1.0.0' }},
    { params: { pkg: 'foo', version: '2.0.0' }},
    { params: { pkg: 'bar', version: '1.0.0' }},
    { params: { pkg: 'bar', version: '2.0.0' }}
  ]
}
```

**Salida**

```
.
└─ packages
   ├─ foo-1.0.0.html
   ├─ foo-2.0.0.html
   ├─ bar-1.0.0.html
   └─ bar-2.0.0.html
```

### Generando Rutas Dinámicamente {#dynamically-generating-paths}

El módulo de carga de rutas se ejecuta en Node.js y solo durante el proceso de compilación. Puedes generar dinámicamente el _array_ de rutas utilizando cualquier dato, ya sea local o remoto.

Generación de rutas a partir de archivos locales:

```js
import fs from 'node:fs'

export default {
  paths() {
    return fs
      .readdirSync('packages')
      .map((pkg) => {
        return { params: { pkg }}
      })
  }
}
```

Generación de rutas a partir de datos remotos:

```js
export default {
  async paths() {
    const pkgs = await (await fetch('https://my-api.com/packages')).json()

    return pkgs.map((pkg) => {
      return {
        params: {
          pkg: pkg.name,
          version: pkg.version
        }
      }
    })
  }
}
```

### Visualización de plantillas y archivos de datos {#watching-template-and-data-files}

Al generar contenido de página a partir de plantillas o fuentes de datos externas, puede utilizar la opción de monitorización para reconstruir automáticamente las páginas cuando esos archivos cambien durante el desarrollo:

```js
// posts/[slug].paths.js
import fs from 'node:fs'
import { renderTemplate } from './templates/renderer.js'

export default {
  // Esta atento a los cambios en los archivos de plantilla y las fuentes de datos.
  watch: [
    './templates/**/*.njk',     // Template files
    '../data/**/*.json'         // Data files
  ],

  paths(watchedFiles) {
    // watchedFiles será un array con las rutas absolutas de los archivos coincidentes.
    // Leer archivos de datos para generar rutas.
    const dataFiles = watchedFiles.filter(file => file.endsWith('.json'))

    return dataFiles.map(file => {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'))

      return {
        params: { slug: data.slug },
        content: renderTemplate(data)  //  Utilice la plantilla para generar contenido.
      }
    })
  }
}
```

La opción `watch` funciona de la misma manera que en [cargadores de datos](./data-loading#data-from-local-files):

- Acepta [patrones glob](https://github.com/mrmlnc/fast-glob#pattern-syntax) para la coincidencia de archivos
- Los patrones son relativos al archivo `.paths.js`
- Los cambios en los archivos monitorizados activan la regeneración de la página y HMR durante el desarrollo.
- En las compilaciones de producción, todas las páginas se generan una sola vez, independientemente de la configuración de monitorización

### Accediendo Parámetros en la Página {#accessing-params-in-page}

Puedes usar los parámetros para pasar datos adicionales a cada página. El archivo de ruta Markdown puede acceder a los parámetros de la página actual en expresiones Vue a través de la propiedad global `$params`:

```md
- nombre del paquete: {{ $params.pkg }}
- versión: {{ $params.version }}
```

También puedes acceder a los parámetros de la página actual a través de la API de tiempo de ejecución [`useData`](../reference/runtime-api#usedata). Esto está disponible tanto en archivos Markdown como en componentes Vue:
```vue
<script setup>
import { useData } from 'vitepress'

// params es una ref Vue
const { params } = useData()

console.log(params.value)
</script>
```

### Renderizado de contenido sin procesar {#rendering-raw-content}

Los parámetros que se pasen a la página se serializarán en la carga útil de JavaScript del cliente, por lo que debe evitar pasar datos pesados ​​en los parámetros, por ejemplo, contenido Markdown o HTML sin procesar obtenido de un CMS remoto.

En lugar de eso, puede pasar dicho contenido a cada página utilizando la propiedad `content` en cada objeto de ruta:

```js
export default {
  async paths() {
    const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

    return posts.map((post) => {
      return {
        params: { id: post.id },
        content: post.content // raw Markdown or HTML
      }
    })
  }
}
```

En seguida, use la siguiente sintaxis especial para mostrar el contenido como parte del propio archivo Markdown:

```md
<!-- @content -->
```
