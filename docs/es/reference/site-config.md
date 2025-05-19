---
outline: deep
---

# Configuración de site {#site-config}

La configuración del site es donde puede configurar los ajustes globales del site. Las opciones de configuración de la aplicación definen las configuraciones que se aplican a todos los sites de VitePress, independientemente del tema que estén utilizando. Por ejemplo, el directorio base o el título del site.

## Vista general {#overview}

### Resolución de configuración {#config-resolution}

El archivo de configuración siempre se resuelve desde `<root>/.vitepress/config.[ext]`, donde `<root>` es la [raiz del proyecto](../guide/routing#root-and-source-directory) VitePress y `[ext]` es una de las extensiones de archivo compatibles. TypeScript es compatible desde el primer momento. Las extensiones compatibles incluyen `.js`, `.ts`, `.mjs` y `.mts`.

Recuerde usar la sintaxis de módulos ES en los archivos de configuración. El archivo de configuración debe exportar por defecto un objeto:

```ts
export default {
  // opciones de configuración a nivel de aplicación
  lang: 'pt-BR',
  title: 'VitePress',
  description: 'Generador de site estático Vite & Vue.',
  ...
}
```

:::details Configuración dinámica (Assíncrona)

Si necesitas generar dinamicamente la configuración, también puedes exportar por defecto una función. Por ejemplo:

```ts
import { defineConfig } from 'vitepress'

export default async () => {
  const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

  return defineConfig({
  // opciones de configuración a nivel de aplicación
    lang: 'pt-BR',
    title: 'VitePress',
    description: 'Generador de site estático Vite & Vue.',

    // opciones de configuración a nivel de tema
    themeConfig: {
      sidebar: [
        ...posts.map((post) => ({
          text: post.name,
          link: `/posts/${post.name}`
        }))
      ]
    }
  })
}
```

También puedes utilizar `await` en el nivel superior. Como:

```ts
import { defineConfig } from 'vitepress'

const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

export default defineConfig({
  // opciones de configuración a nivel de aplicación
    lang: 'pt-BR',
    title: 'VitePress',
    description: 'Generador de site estático Vite & Vue.',

  // opciones de configuración a nivel de tema
  themeConfig: {
    sidebar: [
      ...posts.map((post) => ({
        text: post.name,
        link: `/posts/${post.name}`
      }))
    ]
  }
})
```

:::

### Configuración Intellisense {#config-intellisense}

Usar el auxiliar `defineConfig` proporcionará Intellisense con tecnología TypeScript para las opciones de configuración. Suponiendo que su IDE lo admita, esto debería funcionar tanto en JavaScript como en TypeScript.

```js
import { defineConfig } from 'vitepress'

export default defineConfig({
  // ...
})
```

### Configuración de Tema Escrito {#typed-theme-config}

Por defecto, el auxiliar `defineConfig` espera el tipo de configuración del tema por defecto:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    // El tipo es `DefaultTheme.Config`
  }
})
```

Si usa un tema personalizado y desea realizar comprobaciones de tipo para la configuración del tema, deberá usar `defineConfigWithTheme` en su lugar, y pase el tipo de configuración para su tema personalizado a través de un argumento genérico:

```ts
import { defineConfigWithTheme } from 'vitepress'
import type { ThemeConfig } from 'your-theme'

export default defineConfigWithTheme<ThemeConfig>({
  themeConfig: {
    // El tipo es `ThemeConfig`
  }
})
```

### Configuración Vite, Vue & Markdown

- **Vite**

  Puede configurar la instancia de Vite subyacente usando la opción [vite](#vite) en su configuración de VitePress. No es necesario crear un archivo de configuración de Vite por separado.

- **Vue**

  VitePress ya incluye el plugin oficial de Vue para Vite ([@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue)). Puede configurar sus opciones usando la opción [vue](#vue) en su configuración VitePress.

- **Markdown**

  Puede configurar la instancia subyacente de [Markdown-It](https://github.com/markdown-it/markdown-it) usando la opción [markdown](#markdown) en su configuración VitePress.

## Metadatos de Site {#site-metadata}

### title

- Tipo: `string`
- Predeterminado: `VitePress`
- Puede ser reemplazado por página a través de [frontmatter](./frontmatter-config#title)

Título de site. Al usar el tema por defecto, este será mostrado en la barra de navegación.

También se utilizará como sufijo predeterminado para todos los títulos de páginas individuales a menos que [`titleTemplate`](#titletemplate) definirse. El título final de una página individual será el contenido textual de su primer encabezado. `<h1>`, combinado con el título global como sufijo. Por ejemplo, con la siguiente configuración y contenido de página:

```ts
export default {
  title: 'Mi increible sitio web'
}
```

```md
# Hola
```

El título de la página será `Hola | Mi increible sitio web`.

### titleTemplate

- Tipo: `string | boolean`
- Puede ser reemplazado por página a través de [frontmatter](./frontmatter-config#titletemplate)

Le permite personalizar el sufijo del título de cada página o el título completo. Por ejemplo:

```ts
export default {
  title: 'Mi increible sitio web',
  titleTemplate: 'Sufijo Personalizado'
}
```

```md
# Hola
```

El título de la página será `Hola | Sufijo Personalizado`.

Para personalizar completamente cómo se debe representar el título, puedes usar el símbolo `:title` en `titleTemplate`:

```ts
export default {
  titleTemplate: ':title - Sufijo Personalizado'
}
```

Aqui, `:title` será reemplazado por el texto que se deduce del primer título `<h1>` de la página. El título del ejemplo de la página anterior será `Hola - Sufijo Personalizado`.

Una opción puede ser definida como `false` para desactivar sufijos del título.

### description

- Tipo: `string`
- Predeterminado: `Um site VitePress`
- Puede ser sustituído por página a través de [frontmatter](./frontmatter-config#descrição)

Descripción del sitio web. Esto se presentará como una etiqueta. `<meta>` en la página HTML.

```ts
export default {
  descripción: 'Un site VitePress'
}
```

### head

- Tipo: `HeadConfig[]`
- Predeterminado: `[]`
- Se puede agregar por página a través de [frontmatter](./frontmatter-config#head)

Elementos adicionales para agregar a la etiqueta `<head>` de la página HTML. Las etiquetas agregadas por los usuarios son mostradas antes de la etiqueta `head` de cierre, despues de las etiquetas VitePress.

```ts
type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

#### Ejemplo: Agregando un favicon {#example-adding-a-favicon}

```ts
export default {
  cabecera: [['link', { rel: 'icon', href: '/favicon.ico' }]]
} // coloque favicon.ico en el directorio público, si la base está definida, use /base/favicon.ico

/* Mostraría:
  <link rel="icon" href="/favicon.ico">
*/
```

#### Ejemplo: Agregando Fuentes de Google {#example-adding-google-fonts}

```ts
export default {
  head: [
    [
      'link',
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' }
    ],
    [
      'link',
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
    ],
    [
      'link',
      { href: 'https://fonts.googleapis.com/css2?family=Roboto&display=swap', rel: 'stylesheet' }
    ]
  ]
}

/* Mostraría:
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
*/
```

#### Ejemplo: Registrando un _service worker_ {#example-registering-a-service-worker}

```ts
export default {
  head: [
    [
      'script',
      { id: 'register-sw' },
      `;(() => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js')
        }
      })()`
    ]
  ]
}

/* Mostraría:
  <script id="register-sw">
    ;(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
      }
    })()
  </script>
*/
```

#### Ejemplo: Usando Google Analytics {#example-using-google-analytics}

```ts
export default {
  head: [
    [
      'script',
      { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=TAG_ID' }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'TAG_ID');`
    ]
  ]
}

/* Mostraría:
  <script async src="https://www.googletagmanager.com/gtag/js?id=TAG_ID"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'TAG_ID');
  </script>
*/
```

### lang

- Tipo: `string`
- Predeterminado: `en-US`

El atributo de idioma del sitio. Esto se mostrará como una etiqueta. `<html lang="en-US">` en la página HTML.

```ts
export default {
  lang: 'en-US'
}
```

### base

- Tipo: `string`
- Predeterminado: `/`

La URL base donde se implementará el sitio. Deberá configurar esto si planea implementar su sitio en un subdirectorio, por ejemplo, en páginas de GitHub. Si planea implementar su sitio web en `https://foo.github.io/bar/` entonces deberías definir la base como `'/bar/'`. Siempre debe comenzar y terminar con una barra.

La base se agrega automáticamente a todas las URL que comienzan con / en otras opciones, por lo que solo necesitas especificarla una vez.

```ts
export default {
  base: '/base/'
}
```

## Roteamento {#routing}

### cleanUrls

- Tipo: `boolean`
- Predeterminado: `false`

Cuando se establece en `true`, VitePress eliminará el `.html` al final de las URLs. Consulte también [Generar URL Limpia](../guide/routing#generating-clean-url).

::: warning Soporte de Servidor Requerido
Habilitar esto puede requerir configurar adicional en su plataforma de alojamiento. Para funcionar, su servidor debe poder servir `/foo.html` cuando visite `/foo` **sin redirección**.
:::

### rewrites

- Tipo: `Record<string, string>`

Define asignaciones de directorios personalizados &lt;-&gt; URL. Visite [Rutas: Reescribir Rutas](../guide/routing#route-rewrites) para obtener más detalles.

```ts
export default {
  rewrites: {
    'source/:page': 'destination/:page'
  }
}
```

## Construcción {#build}

### srcDir

- Tipo: `string`
- Predeterminado: `.`

El directorio donde se almacenan tus páginas de rebajas, en relación con la raíz del proyecto. vea también [Directorio Raiz y de origen](../guide/routing#root-and-source-directory).

```ts
export default {
  srcDir: './src'
}
```

### srcExclude

- Tipo: `string`
- Predeterminado: `undefined`

Un [patrón glob](https://github.com/mrmlnc/fast-glob#pattern-syntax) para hacer coincidir los archivos de rebajas que deben exluirse como contenido de origen.

```ts
export default {
  srcExclude: ['**/README.md', '**/TODO.md']
}
```

### outDir

- Tipo: `string`
- Predeterminado: `./.vitepress/dist`

La ubicación de la salida de compilación para el sitio, en relación con el [raiz del proyecto](../guide/routing#root-and-source-directory).

```ts
export default {
  outDir: '../public'
}
```

### assetsDir

- Tipo: `string`
- Predeterminado: `assets`

Especifica el directorio para anidar los activos generados. El camino debe estar dentro [`outDir`](#outdir) y se resuelve en relación con el mismo.

```ts
export default {
  assetsDir: 'static'
}
```

### cacheDir

- Tipo: `string`
- Predeterminado: `./.vitepress/cache`

El directorio para los archivos de caché, en relación con el [raiz del proyecto](../guide/routing#root-and-source-directory). Vea también: [cacheDir](https://vitejs.dev/config/shared-options.html#cachedir).

```ts
export default {
  cacheDir: './.vitepress/.vite'
}
```

### ignoreDeadLinks

- Tipo: `boolean | 'localhostLinks' | (string | RegExp | ((link: string) => boolean))[]`
- Predeterminado: `false`

Cuando se establece en `true`, VitePress no dejará de compilarse debido a links rotos.

Cuando se establece en `'localhostLinks'`, la compilación fallará en links rotos, per no verificará los links `localhost`.

```ts
export default {
  ignoreDeadLinks: true
}
```

También puede ser un _array_ de una exacta URL en string, patrones regex, o funciones de filtro personalizadas.

```ts
export default {
  ignoreDeadLinks: [
    // ignora URL exacta "/playground"
    '/playground',
    // ignora todos los links localhost
    /^https?:\/\/localhost/,
    // ignora todos los links incluyendo "/repl/""
    /\/repl\//,
    // función personalizada, ignora todos los links incluyendo "ignore"
    (url) => {
      return url.toLowerCase().includes('ignore')
    }
  ]
}
```

### mpa <Badge type="warning" text="experimental" />

- Tipo: `boolean`
- Predeterminado: `false`

Cuando se define como `true`, la aplicación de producción se compilará en [Modo MPA](../guide/mpa-mode). El modo MPA envía 0 kb de JavaScript de forma predeterminada, a expensas de deshabilitar la navegación del lado del cliente y requerir permiso explícito para la interactividad.

## Tematización {#theming}

### appearance

- Tipo: `boolean | 'dark' | 'force-dark' | import('@vueuse/core').UseDarkOptions`
- Predeterminado: `true`

Se habilitará el modo oscuro (agregando una classe `.dark` al elemento `<html>`).

- Si la opción está configurada en `true` El tema predeterminado está determinado por la combinación de colores preferida del usuario.
- Si la opción está configurada en `dark` El tema es oscuro de forma predeterminada a menos que el usuario lo cambie manualmente.
- Si la opción está configurada en `false` los usuarios no podrán cambiar el tema.

Esta opción inyecta un script en línea que restaura la configuración de los usuarios desde el almacenamiento local. (_local storage_) usando una llave `vitepress-theme-appearance`. Eso asegurará que la clase `.dark` se aplicará antes de que se muestre la página para evitar el parpadeo.

`appearance.initialValue` puede ser `'dark' | undefined`. Refs o getters no son soportados.

### lastUpdated

- Tipo: `boolean`
- Predeterminado: `false`

Para obtener la marca de tiempo de la última actualización para cada página usando Git. El sello de fecha se incluirá en los datos de cada página, accesible a través de [`useData`](./runtime-api#usedata).

Cuando se utiliza el tema predeterminado, al habilitar esta opción se mostrará la última hora de actualización de cada página. Puedes personalizar el texto mediante la opción [`themeConfig.lastUpdatedText`](./default-theme-config#lastupdatedtext).

## Personalización {#customization}

### markdown

- Tipo: `MarkdownOption`

Configure las opciones de procesador Markdown. VitePress usa [Markdown-it](https://github.com/markdown-it/markdown-it) como procesador y [Shiki](https://github.com/shikijs/shiki) para resaltar la sintaxis del idioma. Dentro de esta opción, puede pasar varias opciones de Markdown relacionadas para satisfacer sus necesidades.

```js
export default {
  markdown: {...}
}
```

Consulte la [declaración de tipo y jsdocs](https://github.com/vuejs/vitepress/blob/main/src/node/markdown/markdown.ts) para conocer todas las opciones disponibles.

### vite

- Tipo: `import('vite').UserConfig`

Pase la [Configuración Vite](https://vitejs.dev/config/) sin procesar al servidor interno / empaquetador Vite.

```js
export default {
  vite: {
    // Opciones de configuración Vite
  }
}
```

### vue

- Tipo: `import('@vitejs/plugin-vue').Options`

Pase las opciones [`@vitejs/plugin-vue`](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#options) sin formato a la instancia del complemento interno.

```js
export default {
  vue: {
    // Opciones @vitejs/plugin-vue
  }
}
```

## Construir Ganchos {#build-hooks}

Los enlaces de compilación VitePress permiten agregar nuevas funciones al su sitio web:

- Sitemap
- Indexación de busqueda
- PWA
- _Teleports_

## buildEnd
- Tipo: `(siteConfig: SiteConfig) => Awaitable<void>`
`buildEnd` es un enlace de compilación CLI (Interfaz de línea de comando), se ejecutará después de que se complete la compilación (SSG) pero antes de que finalice el proceso CLI de VitePress.

```ts
export default {
  async buildEnd(siteConfig) {
    // ...
  }
}
```

## postRender
- Tipo: `(context: SSGContext) => Awaitable<SSGContext | void>`
- `postRender` es un gancho de compilación, llamado cuando se completa la interpretación de SSG. Le permitirá manipular el contenido de los _teleports_ durante la generación de sitios estáticos.

  ```ts
  export default {
    async postRender(context) {
      // ...
    }
  }
  ```

  ```ts
  interface SSGContext {
    content: string
    teleports?: Record<string, string>
    [key: string]: any
  }
  ```

## transformHead
- Tipo: `(context: TransformContext) => Awaitable<HeadConfig[]>`

`transformHead` es un enlace de compilación para transformar el encabezado antes de generar cada página. Esto le permite agregar entradas de encabezado que no se pueden agregar estáticamente a la configuración de VitePress. Sólo necesita devolver entradas adicionales, que se fusionarán automáticamente con las existentes.

:::warning
No mutes ningún elemento dentro `context`.
:::

```ts
export default {
  async transformHead(context) {
    // ...
  }
}
```

```ts
interface TransformContext {
  page: string // e.g. index.md (relativo a srcDir)
  assets: string[] // todos los activos no-js/css con URL pública completamente resuelta
  siteConfig: SiteConfig
  siteData: SiteData
  pageData: PageData
  title: string
  description: string
  head: HeadConfig[]
  content: string
}
```

Tenga en cuenta que este enlace solo se llama cuando se genera el sitio de forma estática. No se llama durante el desarrollo. Si necesita agregar entradas de encabezado dinámicas durante el desarrollo, puede usar el enlace [`transformPageData`](#transformpagedata) en su lugar.

  ```ts
  export default {
    transformPageData(pageData) {
      pageData.frontmatter.head ??= []
      pageData.frontmatter.head.push([
        'meta',
        {
          name: 'og:title',
          content:
            pageData.frontmatter.layout === 'home'
              ? `VitePress`
              : `${pageData.title} | VitePress`
        }
      ])
    }
  }
  ```

#### Ejemplo: Agregando una URL canónica `<link>` {#example-adding-a-canonical-url-link}

```ts
export default {
  transformPageData(pageData) {
    const canonicalUrl = `https://example.com/${pageData.relativePath}`
      .replace(/index\.md$/, '')
      .replace(/\.md$/, '.html')

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push([
      'link',
      { rel: 'canonical', href: canonicalUrl }
    ])
  }
}
```

### transformHtml
- Tipo: `(code: string, id: string, context: TransformContext) => Awaitable<string | void>`
`transformHtml` es un gancho de compilación para transformar el contenido de cada página antes de guardarla en el disco.

:::warning
No mute ningún elemento dentro del `context`. Además, modificar el contenido HTML puede provocar problemas de hidratación en tiempo de ejecución.
:::

```ts
export default {
  async transformHtml(code, id, context) {
    // ...
  }
}
```

### transformPageData
- Tipo: `(pageData: PageData, context: TransformPageContext) => Awaitable<Partial<PageData> | { [key: string]: any } | void>`

`transformPageData` es un gancho para transformar los datos de cada página. Puedes hacer mutaciones directamente en `pageData` o devolver valores modificados que se fusionarán con los datos de la página.

:::warning
No mute ningún elemento dentro del `context` y tenga cuidado ya que esto puede afectar el rendimiento del servidor de desarrollo, especialmente si tiene algunas solicitudes de red o cálculos pesados (como generar imágenes) en el gancho. Puede consultar  `process.env.NODE_ENV === 'production'` para ver la lógica condicional.
:::

```ts
export default {
  async transformPageData(pageData, { siteConfig }) {
    pageData.contributors = await getPageContributors(pageData.relativePath)
  }

  // o devolver datos para fusionar
  async transformPageData(pageData, { siteConfig }) {
    return {
      contributors: await getPageContributors(pageData.relativePath)
    }
  }
}
```

```ts
interface TransformPageContext {
  siteConfig: SiteConfig
}
```
