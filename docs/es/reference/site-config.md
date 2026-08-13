---
outline: deep
description: Referencia completa de las opciones de configuración del sitio VitePress, incluyendo los ajustes a nivel de aplicación, tematización y opciones de compilación.
---

# Configuración del sitio {#site-config}

La configuración del sitio es donde puede definir los ajustes globales del sitio. Las opciones de configuración a nivel de aplicación definen los ajustes que se aplican a todos los sitios de VitePress, independientemente del tema que estén utilizando. Por ejemplo, el directorio base o el título del sitio.

## Descripción general {#overview}

### Resolución de la configuración {#config-resolution}

El archivo de configuración siempre se resuelve desde `<root>/.vitepress/config.[ext]`, donde `<root>` es la [raíz de su proyecto](../guide/routing#root-and-source-directory) de VitePress, y `[ext]` es una de las extensiones de archivo compatibles. TypeScript es compatible de forma predeterminada. Las extensiones compatibles incluyen `.js`, `.ts`, `.mjs` y `.mts`.

Se recomienda usar la sintaxis de módulos ES en los archivos de configuración. El archivo de configuración debe exportar por defecto un objeto:

```ts
export default {
  // opciones de configuración a nivel de aplicación
  lang: 'es-ES',
  title: 'VitePress',
  description: 'Generador de Sitios Estáticos desarrollado con Vite y Vue.',
  ...
}
```

::: details Configuración dinámica (asíncrona)

Si necesita generar dinámicamente la configuración, también puede exportar por defecto una función. Por ejemplo:

```ts
import { defineConfig } from 'vitepress'

export default async () => {
  const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

  return defineConfig({
    // opciones de configuración a nivel de aplicación
    lang: 'es-ES',
    title: 'VitePress',
    description: 'Generador de Sitios Estáticos desarrollado con Vite y Vue.',

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

También puede utilizar `await` en el nivel superior. Por ejemplo:

```ts
import { defineConfig } from 'vitepress'

const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

export default defineConfig({
  // opciones de configuración a nivel de aplicación
  lang: 'es-ES',
  title: 'VitePress',
  description: 'Generador de Sitios Estáticos desarrollado con Vite y Vue.',

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

El uso del asistente `defineConfig` proporcionará Intellisense impulsado por TypeScript para las opciones de configuración. Suponiendo que su IDE lo admita, esto debería funcionar tanto en JavaScript como en TypeScript.

```js
import { defineConfig } from 'vitepress'

export default defineConfig({
  // ...
})
```

### Configuración de Tema Tipada {#typed-theme-config}

De forma predeterminada, el asistente `defineConfig` espera el tipo de configuración de tema desde el tema predeterminado:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    // El tipo es `DefaultTheme.Config`
  }
})
```

Si usa un tema personalizado y desea realizar comprobaciones de tipo para la configuración del tema, deberá usar `defineConfigWithTheme` en su lugar, y pasar el tipo de configuración de su tema personalizado a través de un argumento genérico:

```ts
import { defineConfigWithTheme } from 'vitepress'
import type { ThemeConfig } from 'your-theme'

export default defineConfigWithTheme<ThemeConfig>({
  themeConfig: {
    // El tipo es `ThemeConfig`
  }
})
```

### Configuración de Vite, Vue y Markdown {#vite-vue-markdown-config}

- **Vite**

  Puede configurar la instancia de Vite subyacente utilizando la opción [vite](#vite) en su configuración de VitePress. No es necesario crear un archivo de configuración de Vite por separado.

- **Vue**

  VitePress ya incluye el complemento oficial de Vue para Vite ([@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue)). Puede configurar sus opciones utilizando la opción [vue](#vue) en su configuración de VitePress.

- **Markdown**

  Puede configurar la instancia subyacente de [Markdown-It](https://github.com/markdown-it/markdown-it) utilizando la opción [markdown](#markdown) en su configuración de VitePress.

### Sobrescrituras a nivel de página {#page-level-overrides}

Algunos ajustes se pueden sobrescribir para páginas específicas utilizando el `frontmatter`.

Consulte la [Configuración de frontmatter](./frontmatter-config) para obtener más detalles.

### Sobrescrituras a nivel de directorio {#directory-level-overrides}

Algunos ajustes de configuración se pueden sobrescribir a nivel de directorio, lo que permite que todas las páginas en ese directorio compartan la configuración sin necesidad de repetirla en el `frontmatter` de cada página.

Esto se logra agregando un archivo llamado `config.ts` (o `.js`, `.mjs`, o `.mts`) en el directorio correspondiente. Este archivo debe exportar un objeto de configuración utilizando `export default`, de manera similar al archivo de configuración principal.

Los directorios anidados heredan la configuración de su directorio principal, y las sobrescrituras de configuración se fusionan en consecuencia.

El asistente `defineAdditionalConfig` se puede utilizar para obtener Intellisense impulsado por TypeScript para las opciones disponibles, aunque al igual que con `defineConfig`, su uso es opcional.

Por ejemplo, para un sitio con varios idiomas, es posible que queramos una `description` diferente para cada idioma. Podríamos agregar `es/config.ts` con el siguiente contenido:

```ts
import { defineAdditionalConfig } from 'vitepress'

export default defineAdditionalConfig({
  description: 'Generador de Sitios Estáticos desarrollado con Vite y Vue.'
})
```

Esta `description` se usaría entonces para todas las páginas en el directorio `es`.

Como alternativa, al usar las características integradas de i18n, los ajustes para un directorio de configuración regional (locale) se pueden sobrescribir a través de la opción `locales` en el archivo de configuración principal. Consulte la [Internacionalización](../guide/i18n) para obtener más detalles.

## Metadatos del sitio {#site-metadata}

### title

- Tipo: `string`
- Predeterminado: `VitePress`
- Puede sobrescribirse por página a través del [`frontmatter`](./frontmatter-config#title) o a [nivel de directorio](#directory-level-overrides)

Título para el sitio. Cuando se utiliza el tema predeterminado, este se mostrará en la barra de navegación.

También se utilizará como el sufijo predeterminado para todos los títulos de páginas individuales, a menos que se defina [`titleTemplate`](#titletemplate). El título final de una página individual será el contenido de texto de su primer encabezado `<h1>`, combinado con el `title` global como sufijo. Por ejemplo, con la siguiente configuración y contenido de página:

```ts
export default {
  title: 'Mi sitio increíble'
}
```

```md
# Hola
```

El título de la página será `Hola | Mi sitio increíble`.

### titleTemplate

- Tipo: `string | boolean`
- Puede sobrescribirse por página a través del [`frontmatter`](./frontmatter-config#titletemplate) o a [nivel de directorio](#directory-level-overrides)

Permite personalizar el sufijo del título de cada página o el título completo. Por ejemplo:

```ts
export default {
  title: 'Mi sitio increíble',
  titleTemplate: 'Sufijo personalizado'
}
```

```md
# Hola
```

El título de la página será `Hola | Sufijo personalizado`.

Para personalizar completamente cómo se debe renderizar el título, puede usar el símbolo `:title` en `titleTemplate`:

```ts
export default {
  titleTemplate: ':title - Sufijo personalizado'
}
```

Aquí `:title` será reemplazado con el texto inferido del primer encabezado `<h1>` de la página. El título de la página del ejemplo anterior sería `Hola - Sufijo personalizado`.

La opción se puede establecer en `false` para desactivar los sufijos de los títulos.

### description

- Tipo: `string`
- Predeterminado: `A VitePress site`
- Puede sobrescribirse por página a través del [`frontmatter`](./frontmatter-config#description) o a [nivel de directorio](#directory-level-overrides)

Descripción para el sitio. Esto se renderizará como una etiqueta `<meta>` en el HTML de la página.

```ts
export default {
  description: 'Un sitio de VitePress'
}
```

### head

- Tipo: `HeadConfig[]`
- Predeterminado: `[]`
- Se puede agregar por página a través del [`frontmatter`](./frontmatter-config#head) o a [nivel de directorio](#directory-level-overrides)

Elementos adicionales para renderizar en la etiqueta `<head>` en el HTML de la página. Las etiquetas añadidas por el usuario se renderizan antes de la etiqueta `head` de cierre, después de las etiquetas de VitePress.

```ts
type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

#### Ejemplo: Agregar un favicon {#example-adding-a-favicon}

```ts
export default {
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]]
} // coloque favicon.ico en el directorio public, si se establece la base, use /base/favicon.ico

/* Renderizaría:
  <link rel="icon" href="/favicon.ico">
*/
```

#### Ejemplo: Agregar Google Fonts {#example-adding-google-fonts}

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

/* Renderizaría:
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
*/
```

#### Ejemplo: Registrar _service worker_ {#example-registering-a-service-worker}

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

/* Renderizaría:
  <script id="register-sw">
    ;(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
      }
    })()
  </script>
*/
```

#### Ejemplo: Usar Google Analytics {#example-using-google-analytics}

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

/* Renderizaría:
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
- Puede sobrescribirse a [nivel de directorio](#directory-level-overrides)

El atributo `lang` para el sitio. Esto se renderizará como una etiqueta `<html lang="en-US">` en el HTML de la página.

```ts
export default {
  lang: 'en-US'
}
```

### base

- Tipo: `string`
- Predeterminado: `/`

La URL base en la que se desplegará el sitio. Tendrá que configurar esto si planea desplegar su sitio en una subruta, por ejemplo, en GitHub Pages. Si planea desplegar su sitio en `https://foo.github.io/bar/`, entonces debe establecer la `base` en `'/bar/'`. Siempre debe comenzar y terminar con una barra. No se admiten bases relativas.

La base se antepone automáticamente a todas las URL que comienzan con `/` en otras opciones, por lo que solo necesita especificarla una vez.

```ts
export default {
  base: '/base/'
}
```

## Enrutamiento {#routing}

### cleanUrls

- Tipo: `boolean`
- Predeterminado: `false`

Cuando se establece en `true`, VitePress eliminará el `.html` final de las URLs. Consulte también [Generar URLs limpias](../guide/routing#generating-clean-urls).

::: warning Se requiere soporte del servidor
Habilitar esto puede requerir configuración adicional en su plataforma de alojamiento. Para que funcione, su servidor debe poder servir `/foo.html` al visitar `/foo` **sin una redirección**.
:::

### rewrites

- Tipo: `Record<string, string>`

Define mapeos personalizados de directorio &lt;-&gt; URL. Consulte [Enrutamiento: Reescribir rutas](../guide/routing#route-rewrites) para obtener más detalles.

```ts
export default {
  rewrites: {
    'source/:page': 'destination/:page'
  }
}
```

## Compilación {#build}

### srcDir

- Tipo: `string`
- Predeterminado: `.`

El directorio donde se almacenan sus páginas Markdown, relativo a la raíz del proyecto. Consulte también [Raíz y directorio fuente](../guide/routing#root-and-source-directory).

```ts
export default {
  srcDir: './src'
}
```

### srcExclude

- Tipo: `string[]`
- Predeterminado: `undefined`

Un [patrón glob](https://github.com/mrmlnc/fast-glob#pattern-syntax) para hacer coincidir los archivos Markdown que deben excluirse del contenido fuente.

```ts
export default {
  srcExclude: ['**/README.md', '**/TODO.md']
}
```

### outDir

- Tipo: `string`
- Predeterminado: `./.vitepress/dist`

La ubicación de salida de la compilación para el sitio, relativa a la [raíz del proyecto](../guide/routing#root-and-source-directory).

```ts
export default {
  outDir: '../public'
}
```

### assetsDir

- Tipo: `string`
- Predeterminado: `assets`

Especifica el directorio para anidar los recursos generados. La ruta debe estar dentro de [`outDir`](#outdir) y se resuelve de forma relativa a este.

```ts
export default {
  assetsDir: 'static'
}
```

### cacheDir

- Tipo: `string`
- Predeterminado: `./.vitepress/cache`

El directorio para los archivos de caché, relativo a la [raíz del proyecto](../guide/routing#root-and-source-directory). Consulte también: [cacheDir](https://vite.dev/config/shared-options.html#cachedir).

```ts
export default {
  cacheDir: './.vitepress/.vite'
}
```

### ignoreDeadLinks

- Tipo: `boolean | 'localhostLinks' | (string | RegExp | ((link: string, source: string) => boolean))[]`
- Predeterminado: `false`

Cuando se establece en `true`, VitePress no fallará las compilaciones debido a enlaces rotos.

Cuando se establece en `'localhostLinks'`, la compilación fallará en los enlaces rotos, pero no comprobará los enlaces a `localhost`.

```ts
export default {
  ignoreDeadLinks: true
}
```

También puede ser un _array_ de cadenas de URL exactas, patrones de expresiones regulares (regex) o funciones de filtro personalizadas.

```ts
export default {
  ignoreDeadLinks: [
    // ignora la URL exacta "/playground"
    '/playground',
    // ignora todos los enlaces a localhost
    /^https?:\/\/localhost/,
    // ignora todos los enlaces que incluyan "/repl/"
    /\/repl\//,
    // función personalizada, ignora todos los enlaces que incluyan "ignore"
    (url) => {
      return url.toLowerCase().includes('ignore')
    }
  ]
}
```

### mpa <Badge type="warning" text="experimental" />

- Tipo: `boolean`
- Predeterminado: `false`

Cuando se establece en `true`, la aplicación de producción se compilará en [Modo MPA](../guide/mpa-mode). El modo MPA envía 0 kb de JavaScript de forma predeterminada, a expensas de deshabilitar la navegación en el lado del cliente y requiere habilitación explícita (opt-in) para la interactividad.

## Tematización {#theming}

### appearance

- Tipo: `boolean | 'dark' | 'force-dark' | 'force-auto' | import('@vueuse/core').UseDarkOptions`
- Predeterminado: `true`

Indica si se debe habilitar el modo oscuro (añadiendo la clase `.dark` al elemento `<html>`).

- Si la opción está establecida en `true`, el tema predeterminado se determinará por la preferencia de color del usuario.
- Si la opción está establecida en `dark`, el tema será oscuro de forma predeterminada, a menos que el usuario lo cambie manualmente.
- Si la opción está establecida en `false`, los usuarios no podrán cambiar el tema.
- Si la opción está establecida en `'force-dark'`, el tema siempre será oscuro y los usuarios no podrán cambiarlo.
- Si la opción está establecida en `'force-auto'`, el tema siempre se determinará por la preferencia de color del usuario y los usuarios no podrán cambiarlo.

Esta opción inyecta un script en línea que restaura la configuración del usuario desde el almacenamiento local utilizando la clave `vitepress-theme-appearance`. Esto asegura que la clase `.dark` se aplique antes de que la página se renderice para evitar parpadeos.

`appearance.initialValue` solo puede ser `'dark' | undefined`. No se admiten referencias (`refs`) o `getters`.

### lastUpdated

- Tipo: `boolean`
- Predeterminado: `false`

Indica si se debe obtener la marca de tiempo de la última actualización para cada página utilizando Git. La marca de tiempo se incluirá en los datos de página de cada página, accesible a través de [`useData`](./runtime-api#usedata).

Al usar el tema predeterminado, habilitar esta opción mostrará la hora de última actualización de cada página. Puede personalizar el texto a través de la opción [`themeConfig.lastUpdated.text`](./default-theme-config#lastupdated).

## Personalización {#customization}

### markdown

- Tipo: `MarkdownOption`

Configura las opciones del analizador Markdown. VitePress usa [Markdown-it](https://github.com/markdown-it/markdown-it) como analizador y [Shiki](https://github.com/shikijs/shiki) para el resaltado de la sintaxis del lenguaje. Dentro de esta opción, puede pasar varias opciones relacionadas con Markdown para adaptarse a sus necesidades.

```js
export default {
  markdown: {...}
}
```

Consulte la [declaración de tipo y jsdocs](https://github.com/vuejs/vitepress/blob/main/src/node/markdown/markdown.ts) para conocer todas las opciones disponibles.

Establezca `markdown.headers` en `true` o pase las opciones de [`@mdit-vue/plugin-headers`](https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-headers) para recopilar los encabezados en [`useData().page.headers`](./runtime-api#usedata). Esta opción está deshabilitada de forma predeterminada.

### vite

- Tipo: `import('vite').UserConfig`

Pase la [configuración de Vite](https://vite.dev/config/) sin procesar al servidor de desarrollo / empaquetador de Vite interno.

```js
export default {
  vite: {
    // Opciones de configuración de Vite
  }
}
```

### vue

- Tipo: `import('@vitejs/plugin-vue').Options`

Pase las opciones de [`@vitejs/plugin-vue`](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#options) sin procesar a la instancia del complemento interno.

```js
export default {
  vue: {
    // Opciones de @vitejs/plugin-vue
  }
}
```

## Hooks de compilación {#build-hooks}

Los hooks de compilación de VitePress le permiten agregar nueva funcionalidad y comportamientos a su sitio web:

- Sitemap (mapa del sitio)
- Indexación de búsqueda
- PWA
- _Teleports_

### buildEnd

- Tipo: `(siteConfig: SiteConfig) => Awaitable<void>`

`buildEnd` es un hook de la CLI de compilación, se ejecutará después de que finalice la compilación (SSG) pero antes de que termine el proceso de la CLI de VitePress.

```ts
export default {
  async buildEnd(siteConfig) {
    // ...
  }
}
```

### postRender

- Tipo: `(context: SSGContext) => Awaitable<SSGContext | void>`

`postRender` es un hook de compilación, llamado cuando se completa el renderizado de SSG. Le permitirá manejar el contenido de los `teleports` durante la generación estática (SSG).

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

### transformHead

- Tipo: `(context: TransformContext) => Awaitable<HeadConfig[]>`

`transformHead` es un hook de compilación para agregar etiquetas adicionales al `<head>` de cada página. Le permite añadir entradas de encabezado que no se pueden agregar estáticamente a su configuración de VitePress. Solo necesita devolver entradas adicionales, que se fusionarán automáticamente con las existentes.

::: warning
No mute nada dentro del `context`.
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
  page: string // ej. index.md (relativo a srcDir)
  assets: string[] // todos los recursos no js/css como una URL pública completamente resuelta
  siteConfig: SiteConfig
  siteData: SiteData
  pageData: PageData
  title: string
  description: string
  head: HeadConfig[]
  content: string
}
```

Este hook solo se llama al realizar una compilación, no se llama durante el desarrollo.

Las etiquetas adicionales se añadirán a los archivos HTML estáticos generados por la compilación. No se actualizarán durante la navegación en el lado del cliente.

En muchos casos, el uso del hook [`transformPageData`](#transformpagedata) es una solución más limpia. Ese hook también se aplicará tanto a la navegación en el lado del cliente como durante el desarrollo. Pero si la generación de las etiquetas de encabezado es computacionalmente costosa, entonces `transformHead` evitará esa sobrecarga durante el desarrollo.

#### Ejemplo: Agregar meta `og:image` {#example-adding-og-image-meta}

```ts
export default {
  async transformHead(context) {
    if (context.page === '404.md') {
      return
    }

    // Los detalles de implementación de generatePageImage dependerán
    // de sus requerimientos. Aquí asumimos que genera una imagen adecuada
    // para cada página y devuelve la URL de la imagen.
    const imageUrl = await generatePageImage(context)
    
    return [[
      'meta',
      { name: 'og:image', content: imageUrl }
    ]]
  }
}
```

Aquí asumimos que la URL de la imagen es dinámica y su generación lleva mucho tiempo. El uso de `transformHead` evita esa sobrecarga durante el desarrollo.

Para casos más simples, es posible que pueda usar la configuración [`head`](./frontmatter-config#head) en el `frontmatter`, o [`transformPageData`](#transformpagedata).

### transformHtml

- Tipo: `(code: string, id: string, context: TransformContext) => Awaitable<string | void>`

`transformHtml` es un hook de compilación para transformar el contenido de cada página antes de guardarlo en el disco.

::: warning
No mute nada dentro del `context`. Además, modificar el contenido HTML puede causar problemas de hidratación en el tiempo de ejecución.
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

`transformPageData` es un hook para transformar el `pageData` de cada página. Puede mutar directamente `pageData` o devolver valores modificados que se fusionarán en los datos de la página.

::: warning
No mute nada dentro del `context` y tenga cuidado de que esto podría afectar el rendimiento del servidor de desarrollo, especialmente si tiene algunas solicitudes de red o cálculos pesados (como generar imágenes) en el hook. Puede comprobar si `process.env.NODE_ENV === 'production'` para utilizar lógica condicional.
:::

```ts
export default {
  async transformPageData(pageData, { siteConfig }) {
    pageData.contributors = await getPageContributors(pageData.relativePath)
  }

  // o devolver datos para fusionarlos
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

#### Ejemplo: Agregar un `<meta name="og:title">` {#example-adding-a-meta-name-og-title}

```ts
export default {
  transformPageData(pageData) {
    const title = pageData.frontmatter.layout === 'home'
      ? 'VitePress'
      : `${pageData.title} | VitePress`

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push([
      'meta',
      { name: 'og:title', content: title }
    ])
  }
}
```

#### Ejemplo: Agregar una URL canónica `<link>` {#example-adding-a-canonical-url-link}

```ts
export default {
  transformPageData(pageData) {
    const canonicalUrl = `https://ejemplo.com/${pageData.relativePath}`
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