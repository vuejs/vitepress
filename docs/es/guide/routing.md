---
outline: deep
---

# Enrutamiento {#routing}

## Enrutamiento basasdo en Archivos {#file-based-routing}

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
prologue.md                -->  /prologue.html
guide/index.md             -->  /guide/index.html (accesible por /guide/)
guide/getting-started.md  -->  /guide/getting-started.html
```

El HTML resultante puede ser hospedado en cualquier servidor web que pueda servir archivos estáticos.

## Diretório Raiz y fuente {#root-and-source-directory}

Existen dos conceptos importantes en la estructura de archivos de un proyecto VitePress: el **directorio raiz** y el **directorio fuente**.

### Directorio Raiz {#project-root}

El directorio raiz es donde VitePress busca por el directorio especial `.vitepress`. El directorio `.vitepress` es un lugar reservado para el archivo de configuración de VitePress, el caché del servidor de desarrollo, el resultado de la compilación y el código de personalización del tema opcional.

Al ejecutar `vitepress dev` o `vitepress build` en el terminal, VitePress usará el directorio actual como directorio raiz del proyecto. Para especificar un subdirectorio como raiz, es necesario pasar el camino relativo para el comando. Por ejemplo, si el proyecto VitePress estuviera localizado en `./docs`, debe ejecutarse `vitepress dev docs`:

```
.
├─ docs                    # directorio raiz
│  ├─ .vitepress           # directorio de configuración
│  ├─ getting-started.md
│  └─ index.md
└─ ...
```

```sh
vitepress dev docs
```

Esto resultará en el siguiente mapeamento de fuente para HTML:

```
docs/index.md            -->  /index.html (accesible como /)
docs/getting-started.md  -->  /getting-started.html
```

### Directorio Fuente {#source-directory}

El directorio fuente es donde sus archivos fuente en Markdown están. Por defecto, es el mismo que el directorio raiz. Sin embargo, puede configurarlo por medio de la opción de configuración [`srcDir`](../reference/site-config#srcdir).

La opción `srcDir` es resuelta en relación al directorio raiz del proyecto. Por ejemplo, con `srcDir: 'src'`, su estructura de archivos quedará así:

```
.                          # directorio raiz
├─ .vitepress              # directorio de configuración
└─ src                     # directorio fuente
   ├─ getting-started.md
   └─ index.md
```

El mapeamente resultante de la fuente para HTML:

```
src/index.md            -->  /index.html (accesible como /)
src/getting-started.md  -->  /getting-started.html
```

## Links Entre Páginas {#linking-between-pages}

Puede usar tanto paths absolutos como relativos al vincular páginas. Note que, incluso si ambas extensiones `.md` y `.html` funcionan, funcionem, la práctica recomendada es omitir las extensiones de archivo para que VitePress pueda generar las URLs finales con base en su configuración.

```md
<!-- Hacer -->
[Getting Started](./getting-started)
[Getting Started](../guide/getting-started)

<!-- No hacer -->
[Getting Started](./getting-started.md)
[Getting Started](./getting-started.html)
```

Averigue más sobre la vinculación de assets, como imagenes, en [Manipulación de Assets](./asset-handling).

### Vinculación de Páginas No VitePress {#linking-to-non-vitepress-pages}

Si desea vincular a una página en su sitio que no es generada por VitePress, será necesario usar la URL completa (abre en una nueva pestaña) o especificar explícitamente el destino:

**Entrada**

```md
[Link para pure.html](/pure.html){target="_self"}
```

**Salida**

[Link para pure.html](/pure.html){target="_self"}

::: tip Nota

En los links Markdown, la `base` es automáticamente adicionada a la URL. Esto significa que, si desea vincular a una página fuera de su base, será necesario algo como `../../pure.html` en el link (resuelto en relación a la página actual por el navegador).

Alternativamente, puede usarse directamente la sintaxis de tag anchor:

```md
<a href="/pure.html" target="_self">Link para pure.html</a>
```

:::

## Generación de URL Limpia {#generating-clean-url}

::: warning Soporte del Servidor Necesario
Para servir URLs limpias con VitePress, es necesario soporte en el lado del servidor.
:::

Por defecto, VitePress resuelve links de entrada para URLs que terminan con `.html`. Sin embargo, algunos usuarios pueden preferir "URLs limpias" sin la extensión `.html`, por ejemplo, `example.com/path` en vez de `example.com/path.html`.

Algunos servidores o plataformas de hospedaje (por ejemplo, Netlify, Vercel, GitHub Pages) proporcionan la habilidad de mapear una URL como `/foo` para `/foo.html` si existir, sin redireccionamiento:

- Netlify y GitHub Pages soportan esto por defecto.
- Vercel requiere activación de la opción [`cleanUrls` en `vercel.json`](https://vercel.com/docs/concepts/projects/project-configuration#cleanurls).

Si esa funcionalidad está disponible para usted, también se puede activar la propia opción de configuración [`cleanUrls`](../reference/site-config#cleanurls) de VitePress para que:

- Links de entrada entre páginas sean generados sin la extensión `.html`.
- Si el path actual termina con `.html`, el enrutador realizará un redireccionamiento en el lado del cliente para el path sin extensión.

Sin embargo, si no puede configurar el servidor con ese soporte, será necesario recorrer manualmente la siguiente estructura de directorio:

```
.
├─ getting-started
│  └─ index.md
├─ installation
│  └─ index.md
└─ index.md
```
# Reescritura de Ruta {#route-rewrites}

Puede personalizar el mapeamento entre la estructura de directorios fuente y las páginas generadas. Esto es útil cuando tiene una estructura de proyecto compleja. Por ejemplo, digamos que tiene un monorepo con varios paquetes y le gustaría colocar la documentación junto con los archivos fuente de esta forma:

```
.
├─ packages
│  ├─ pkg-a
│  │  └─ src
│  │      ├─ pkg-a-code.ts
│  │      └─ pkg-a-docs.md
│  └─ pkg-b
│     └─ src
│         ├─ pkg-b-code.ts
│         └─ pkg-b-docs.md
```

Y desea que las páginas VitePress sean generadas así:

```
packages/pkg-a/src/pkg-a-docs.md  -->  /pkg-a/index.html
packages/pkg-b/src/pkg-b-docs.md  -->  /pkg-b/index.html
```

Puede realizar esto configurando la opción [`rewrites`](../reference/site-config#rewrites) así:

```ts [.vitepress/config.js]
export default {
  rewrites: {
    'packages/pkg-a/src/pkg-a-docs.md': 'pkg-a/index.md',
    'packages/pkg-b/src/pkg-b-docs.md': 'pkg-b/index.md'
  }
}
```

La opción `rewrites` también soporta parametros de ruta dinámicos. En el ejemplo arriba, sería tedioso listar todos los paths si tiene muchos paquetes. Dado que todos ellos tienen la misma estructura de archivo, puede simplificar la configuración así:

```ts
export default {
  rewrites: {
    'packages/:pkg/src/(.*)': ':pkg/index.md'
  }
}
```

Los paths reesctritos son compilados usando el paquete `path-to-regexp` - consulte [su documentación](https://github.com/pillarjs/path-to-regexp#parameters) para una sintaxis más avanzada.

::: warning Links Relativos con Reescrituras

Cuando las reescrituras están habilitadas, **links relativos deben ser basados en los paths reescritos**. Por ejemplo, para crear un link relativo de `packages/pkg-a/src/pkg-a-code.md` para `packages/pkg-b/src/pkg-b-code.md`, debe usarse:

```md
[Link para PKG B](../pkg-b/pkg-b-code)
```
:::

## Rutas Dinámicas {#dynamic-routes}

Puede generar muchas páginas usando un único archivo Markdown y datos dinámicos. Por ejemplo, puede crear un archivo `packages/[pkg].md` que genera una página correspondiente para cáda paquete en un proyecto. Aqui, el segmento `[pkg]` es un **parámetro** de ruta que diferencia cada página de las otras.

### Archivo de Carga de Paths {#paths-loader-file}

Como VitePress es un generador de sitios estáticos, los paths posibles de las páginas deben ser determinados en el momento de la compilación. Por lo tanto, una página de ruta dinámica **debe** estar acompañada por un **archivo de carga de paths**. Para `packages/[pkg].md`, necesitaremos de `packages/[pkg].paths.js` (`.ts` también es soportado):

```
.
└─ packages
   ├─ [pkg].md         # modelo de ruta
   └─ [pkg].paths.js   # cargador de paths de la ruta
```

El cargador de paths debe proporcionar un objeto con un método `paths` como su exportación por defecto. El método `paths` debe retornar un _array_ de objetos con una propiedad `params`. Cada uno de esos objetos generará una página correspondiente.

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

### Múltiples Parámetros {#multiple-params}

Una ruta dinámica puede contener múltiples parámetros:

**Estrutura de Archivo**

```
.
└─ packages
   ├─ [pkg]-[version].md
   └─ [pkg]-[version].paths.js
```

**Cargador de Paths**

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

### Generando Paths Dinámicamente {#dynamically-generating-paths}

El módulo de carga de paths es ejecutado en Node.js y apenas durante el momento de la compilación. Puede generar dinámicamente el _array_ de paths usando cualquier dato, sea local o remoto.

Generando paths a partir de archivos locales:

```js
import fs from 'fs'

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

Generando paths a partir de datos remotos:

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

### Accediendo Parámetros en la Página {#accessing-params-in-page}

Puede usar los parámetros para pasar datos adicionales para cada página. El archivo de ruta Markdown puede acceder a los parámetros de la página actual en expresiones Vue a través de la propiedad global `$params`:

```md
- nombre del paquete: {{ $params.pkg }}
- versión: {{ $params.version }}
```

También puede acceder los parámetros de la página actual a través del API de tiempo de ejecución [`useData`](../reference/runtime-api#usedata). Esto está disponible tanto en archivos Markdown así como en componentes Vue:

```vue
<script setup>
import { useData } from 'vitepress'

// params es una ref Vue
const { params } = useData()

console.log(params.value)
</script>
```

### Presentando Contenido Crudo {#rendering-raw-content}

Parámetros pasados para una página serán serializados en la carga JavaScript del cliente, por lo tanto, evite pasar datos pesados en los parámetros, como Markdown crudo o contenido HTML obtenido de un CSS remoto.

En lugar de eso, puede pasar tal contenido para cada página usando la propiedad `content` en cada objeto de path:

```js
export default {
  async paths() {
    const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

    return posts.map((post) => {
      return {
        params: { id: post.id },
        content: post.content // Markdown o HTML crudo
      }
    })
  }
}
```

En seguida, use la siguiente sintaxis especial para presentar el contenido como parte del propio archivo Markdown:

```md
<!-- @content -->
```
