# Configuración del Tema Predeterminado {#default-theme-config}

La configuración del tema te permite personalizar tu tema. puedes definir la configuración del tema a través de la opción `themeConfig` en el archivo de configuración:

```ts
export default {
  lang: 'pt-BR',
  title: 'VitePress',
  description: 'Generador de site estático Vite & Vue.',

  // Configuraciones relacionadas con el tema.
  themeConfig: {
    logo: '/logo.svg',
    nav: [...],
    sidebar: { ... }
  }
}
```

**Las opciones documentadas de esta página se aplican unicamente al tema por defecto.** Diferentes temas esperan configuraciones diferentes de tema. Cuando se utiliza un tema personalizado, el objeto de configuración del tema se pasará al tema para que se puedan definir comportamientos condicionales.

## i18nRouting

- Tipo: `boolean`

Cambie la configuración a, por ejemplo, `zh` será alterado para URL `/foo` (ou `/en/foo/`) para `/zh/foo`. Puedes desactivar este comportamiento configurado `themeConfig.i18nRouting` como `false`.

## logo

- Tipo: `ThemeableImage`

Archivo de logotipo que se mostrará en la barra de navegación, justo antes del título del sitio. Acepta una ruta de cadena o un objeto para definir un logotipo diferente para los modos claro/oscuro.

```ts
export default {
  themeConfig: {
    logo: '/logo.svg'
  }
}
```

```ts
type ThemeableImage =
  | string
  | { src: string; alt?: string }
  | { light: string; dark: string; alt?: string }
```

## siteTitle

- Tipo: `string | false`

Puedes personalizar este elemento para reemplazar el título del sitio predeterminado (`title` en configuración de la aplicación) en navegación. Cuando se establece como `false`, el título en la navegación quedará deshabilitado. Útil cuando tienes un `logo` que ya contiene el título del sitio.

```ts
export default {
  themeConfig: {
    siteTitle: 'Hola mundo'
  }
}
```

## nav

- Tipo: `NavItem`

La configuración del elemento del menú de navegación. Más detalles en [Tema Predeterminado: Navegación](./default-theme-nav#navigation-links).

```ts
export default {
  themeConfig: {
    nav: [
      { text: 'Guia', link: '/guide' },
      {
        text: 'Menú Dropdown',
        items: [
          { text: 'Item A', link: '/item-1' },
          { text: 'Item B', link: '/item-2' },
          { text: 'Item C', link: '/item-3' }
        ]
      }
    ]
  }
}
```

```ts
type NavItem = NavItemWithLink | NavItemWithChildren

interface NavItemWithLink {
  text: string
  link: string
  activeMatch?: string
  target?: string
  rel?: string
  noIcon?: boolean
}

interface NavItemChildren {
  text?: string
  items: NavItemWithLink[]
}

interface NavItemWithChildren {
  text?: string
  items: (NavItemChildren | NavItemWithLink)[]
  activeMatch?: string
}
```

## sidebar

- Tipo: `Sidebar`

La configuración del elemento del menú de la barra lateral. Más detalles en [Tema Predeterminado: Barra Lateral](./default-theme-sidebar).

```ts
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Guia',
        items: [
          { text: 'Introducción', link: '/introduction' },
          { text: 'A partir de', link: '/getting-started' },
          ...
        ]
      }
    ]
  }
}
```

```ts
export type Sidebar = SidebarItem[] | SidebarMulti

export interface SidebarMulti {
  [path: string]: SidebarItem[]
}

export type SidebarItem = {
  /**
   * El rotulo del item.
   */
  text?: string

  /**
   * El link del item.
   */
  link?: string

  /**
   * Los hijos del item.
   */
  items?: SidebarItem[]

  /**
   * Si no se especifica, el grupo no es retráctil.
   *
   * Si es 'true', el grupo se puede contraer y está contraído de forma predeterminada.
   *
   * Si es 'false', el grupo se puede contraer pero se expande de forma predeterminada.
   */
  collapsed?: boolean
}
```

## aside

- Tipo: `boolean | 'left'`
- Estandar: `true`
- Puede ser anulado por la página a través de [frontmatter](./frontmatter-config#aside)

Definir este valor como `false` evita que se muestre el elemento lateral.\
Definir este valor como `true` presenta el lado de la derecha.\
Definir este valor como `left` presenta el lado de la izquierda.

Si desea deshabilitarlo para todas las vistas, debe usar `outline: false` en vez de eso.

## outline

- Tipo: `Outline | Outline['level'] | false`
- El nivel se puede superponer por página mediante [frontmatter](./frontmatter-config#outline)

Definir este valor como `false` evita que el elemento se muestre _outline_. Consulte la interfaz para más detalles:

```ts
interface Outline {
  /**
   * Los niveles de título que se mostrarán en el esquema.
   * Un solo número significa que solo se mostrarán los títulos de ese nivel.
   * Si se pasa una tupla, el primer número es el nivel mínimo y el segundo número es el nivel máximo.
   * `'deep'` es lo mismo que `[2, 6]`, lo que significa que todos los titulos `<h2>` a `<h6>` serán mostrados.
   *
   * @default 2
   */
  level?: number | [number, number] | 'deep'

  /**
   * El titulo que se mostrará en el equema.
   *
   * @default 'On this page'
   */
  label?: string
}
```

## socialLinks

- Tipo: `SocialLink[]`

Puedes configurar esta opción para mostrar enlaces de redes sociales con íconos en la navegación.

```ts
export default {
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
      { icon: 'twitter', link: '...' },
      // También puedes agregar íconos personalizados pasando SVG como string:
       {
        icon: {
          svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Dribbble</title><path d="M12...6.38z"/></svg>'
        },
        link: '...',
        // También puedes incluir una etiqueta personalizada de accesibilidad (opcional pero recomendada):
        ariaLabel: 'cool link'
      }
    ]
  }
}
```

```ts
interface SocialLink {
  icon: string | { svg: string }
  link: string
  ariaLabel?: string
}
```

## footer

- Tipo: `Footer`
- Se puede superponer por página mediante [frontmatter](./frontmatter-config#footer)

Configuración de pie de página. Puede agregar un mensaje o texto de derechos de autor en el pie de página; sin embargo, solo se mostrará cuando la página no contenga una barra lateral. Esto se debe a preocupaciones de diseño.

```ts
export default {
  themeConfig: {
    footer: {
      message: 'Publicado bajo la licencia MIT.',
      copyright: 'Derechos de autor © 2019-presente Evan You'
    }
  }
}
```

```ts
export interface Footer {
  message?: string
  copyright?: string
}
```

## editLink

- Tipo: `EditLink`
- Se puede superponer por página mediante [frontmatter](./frontmatter-config#editlink)

_EditLink_ le permite mostrar un enlace para editar la página en los servicios de administración Git, como GitHub o GitLab. Consulte [Tema por defecto: Editar Link](./default-theme-edit-link) para más detalles.

```ts
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'Editar esta página en GitHub'
    }
  }
}
```

```ts
export interface EditLink {
  pattern: string
  text?: string
}
```

## lastUpdated

- Tipo: `LastUpdatedOptions`

Permite la personalización del formato de fecha y texto actualizado por ultima vez.

```ts
export default {
  themeConfig: {
    lastUpdated: {
      text: 'Actualizado en',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    }
  }
}
```

```ts
export interface LastUpdatedOptions {
  /**
   * @default 'Last updated'
   */
  text?: string

  /**
   * @default
   * { dateStyle: 'short',  timeStyle: 'short' }
   */
  formatOptions?: Intl.DateTimeFormatOptions & { forceLocale?: boolean }
}
```

## algolia

- Tipo: `AlgoliaSearch`

Una opción para dar soporte para buscar en su sitio de documentación usando [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch). Obtenga más información en [Tema predeterminado: Buscar](./default-theme-search).

```ts
export interface AlgoliaSearchOptions extends DocSearchProps {
  locales?: Record<string, Partial<DocSearchProps>>
}
```

Ver todas las opciones [aquí](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts).

## carbonAds {#carbon-ads}

- Tipo: `CarbonAdsOptions`

Una opción para mostrar [Carbon Ads](https://www.carbonads.net/).

```ts
export default {
  themeConfig: {
    carbonAds: {
      code: 'su-código-carbon',
      placement: 'su-colocación-carbon'
    }
  }
}
```

```ts
export interface CarbonAdsOptions {
  code: string
  placement: string
}
```

Obtenga más información en [Tema Predeterminado: Carbon Ads](./default-theme-carbon-ads).

## docFooter

- Tipo: `DocFooter`

Se puede utilizar para personalizar el texto que aparece encima de los enlaces anterior y siguiente. Útil si no estás escribiendo documentación en inglés. También se puede utilizar para desactivar globalmente los enlaces anteriores/siguientes. Si desea habilitar/deshabilitar selectivamente enlaces anteriores/siguientes, puede usar [frontmatter](./default-theme-prev-next-links).

```ts
export default {
  themeConfig: {
    docFooter: {
      prev: 'Página anterior',
      next: 'Próxima página'
    }
  }
}
```

```ts
export interface DocFooter {
  prev?: string | false
  next?: string | false
}
```

## darkModeSwitchLabel

- Tipo: `string`
- Estandar: `Appearance`

Se puede utilizar para personalizar la etiqueta del botón del modo oscuro. Esta etiqueta solo se muestra en la vista móvil.

## lightModeSwitchTitle

- Tipo: `string`
- Estandar: `Switch to light theme`

Se puede utilizar para personalizar el título del botón borrar que aparece al pasar el mouse.

## darkModeSwitchTitle

- Tipo: `string`
- Estandar: `Switch to dark theme`

Se puede utilizar para personalizar el título del botón del modo oscuro que aparece al pasar el mouse.

## sidebarMenuLabel

- Tipo: `string`
- Estandar: `Menu`

Se puede utilizar para personalizar la etiqueta del menú de la barra lateral. Esta etiqueta solo se muestra en la vista móvil.

## returnToTopLabel

- Tipo: `string`
- Estandar: `Return to top`

Se puede utilizar para personalizar la etiqueta del botón Volver al principio. Esta etiqueta solo se muestra en la vista móvil.

## langMenuLabel

- Tipo: `string`
- Estandar: `Change language`

Se puede utilizar para personalizar la etiqueta aria del botón de idioma en la barra de navegación. Esto sólo se usa si estás usando [i18n](../guide/i18n).

## externalLinkIcon

- Tipo: `boolean`
- Estandar: `false`

Se debe mostrar um ícono de link externo junto a los enlaces externos en markdown.
