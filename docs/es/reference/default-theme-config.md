---
description: Referencia de todas las opciones de configuración disponibles para el tema predeterminado de VitePress.
---

# Configuración del Tema Predeterminado {#default-theme-config}

La configuración del tema te permite personalizar tu tema. puedes definir la configuración del tema a través de la opción `themeConfig` en el archivo de configuración:

```ts
export default {
  lang: 'es-ES',
  title: 'VitePress',
  description: 'Generador de sitios estáticos desarrollado con Vite y Vue.',

  // Configuraciones relacionadas con el tema.
  themeConfig: {
    logo: '/logo.svg',
    nav: [...],
    sidebar: { ... }
  }
}
```

**Las opciones documentadas en esta página se aplican unicamente al tema por defecto.** Diferentes temas esperan configuraciones distintas. Al usar un tema personalizado, el objeto de configuración del tema se le pasará al tema para que este pueda definir un comportamiento condicional basado en él.

## i18nRouting

- Tipo: `boolean | ((data: VitePressData<DefaultTheme.Config>, route: Route, targetLocale: string) => string)`

Cambiar la configuración regional a `zh` modificará la URL de `/foo` (o `/en/foo/`) a `/zh/foo`. Puedes desactivar este comportamiento estableciendo `themeConfig.i18nRouting` en `false`.

Establezca `themeConfig.i18nRouting` en una función para personalizar el enlace de configuración regional. La función recibe los datos actuales de VitePress, la ruta actual y la clave de configuración regional de destino, y devuelve el enlace de destino.

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    i18nRouting(data, route, targetLocale) {
      const target = data.site.value.locales[targetLocale]
      const targetLink =
        target.link || (targetLocale === 'root' ? '/' : `/${targetLocale}/`)

      return `${targetLink}${route.data.relativePath.replace(/\.md$/, '')}${route.hash}`
    }
  }
})
```

## logo

- Tipo: `ThemeableImage`

Archivo de logotipo para mostrar en la barra de navegación, justo antes del título del sitio. Acepta una ruta de archivo (string) o un objeto para configurar un logotipo diferente para el modo claro/oscuro.

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

Puedes personalizar este elemento para reemplazar el título del sitio predeterminado (`title` en la configuración de la aplicación) en la navegación. Cuando se establece como `false`, el título en la navegación quedará deshabilitado. Útil cuando tienes un `logo` que ya contiene el texto del título del sitio.

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
      { text: 'Guía', link: '/guide' },
      {
        text: 'Menú desplegable',
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
  link: string | ((payload: PageData) => string)
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

The configuración del elemento del menu item. More details in [Default Theme: Sidebar](./default-theme-sidebar).

```ts
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Guía',
        items: [
          { text: 'Introducción', link: '/introduction' },
          { text: 'Comenzar', link: '/getting-started' },
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
  [path: string]: SidebarItem[] | { items: SidebarItem[]; base: string }
}

export type SidebarItem = {
  /**
   * La etiqueta de texto del artículo.
   */
  text?: string

  /**
   * El enlace del artículo.
   */
  link?: string

  /**
   * Los hijos del elemento.
   */
  items?: SidebarItem[]

  /**
   * Si no se especifica, el grupo no se puede contraer.
   *
   * Si es 'true', el grupo se puede contraer y está contraído de forma predeterminada.
   *
   * Si es 'false', el grupo se puede contraer pero se expande de forma predeterminada.
   */
  collapsed?: boolean

  /**
   * Ruta base para los elementos secundarios.
   */
  base?: string

  /**
   * Personaliza el texto que aparece en el pie de página de la página anterior/siguiente.
   */
  docFooterText?: string

  rel?: string
  target?: string
}
```

## aside

- Tipo: `boolean | 'left'`
- Predeterminado: `true`
- Se puede sobrescribir por página mediante [frontmatter](./frontmatter-config#aside)

Definir este valor como `false`, impide la visualización del contenedor lateral.
Definir este valor como `true`, muestra el contenedor lateral a la derecha.
Definir este valor como `left`, muestra el contenedor lateral a la izquierda.

Si desea deshabilitarlo para todas los viewports, debe usar `outline: false` en su lugar.

## outline

- Type: `Outline | Outline['level'] | false`
- El nivel se puede sobrescribir por página mediante [frontmatter](./frontmatter-config#outline)

Definir este valor como `false`, evita mostrar el contorno (outline) del contenedor. Consulte esta interfaz para obtener más detalles:

```ts
interface Outline {
  /**
   * Niveles de encabezados que se mostrarán en el esquema.
   * Un solo número indica que solo se mostrarán los encabezados de ese nivel.
   * Si se pasa una tupla, el primer número corresponde al nivel mínimo y el segundo al nivel máximo.
   * `'deep'` es equivalente a `[2, 6]`, lo que significa que se mostrarán todos los encabezados desde `<h2>` hasta `<h6>`.
   *
   * @default 2
   */
  level?: number | [number, number] | 'deep'

  /**
   * El titulo que se mostrará en el esquema.
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
      // Puedes añadir cualquier icono de simple-icons (https://simpleicons.org/):
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
      { icon: 'twitter', link: '...' },
      { icon: 'discord', link: '/community', target: '_self' },
      // También puedes agregar íconos personalizados pasando SVG como 
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
  target?: string
}
```

## footer

- Tipo: `Footer`
- Se puede sobrescribir por página mediante [frontmatter](./frontmatter-config#footer)

Configuración de pie de página. Puede agregar un mensaje o texto de derechos de autor en el pie de página; sin embargo, solo se mostrará cuando la página no contenga una barra lateral. Esto se debe a consideraciones de diseño.

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
- Se puede sobrescribir por página mediante [frontmatter](./frontmatter-config#editlink)

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
      text: 'Actualizado el',
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
      code: 'tu-código-carbon',
      placement: 'tu-vinculación-carbon',
      format: 'classic'
    }
  }
}
```

```ts
export interface CarbonAdsOptions {
  code: string
  placement: string
  format?: 'classic' | 'responsive' | 'cover'
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
      prev: 'Anterior',
      next: 'Siguiente'
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
- Predeterminado: `Appearance`

Se puede utilizar para personalizar la etiqueta del botón del modo oscuro. Esta etiqueta solo se muestra en la vista móvil.

## lightModeSwitchTitle

- Tipo: `string`
- Predeterminado: `Switch to light theme`

Se puede utilizar para personalizar el título del interruptor de modo de claro que aparece al pasar el cursor por encima.

## darkModeSwitchTitle

- Tipo: `string`
- Predeterminado: `Switch to dark theme`

Se puede utilizar para personalizar el título del interruptor del modo oscuro que aparece al pasar el cursor por encima.

## sidebarMenuLabel

- Tipo: `string`
- Predeterminado: `Menu`

Se puede utilizar para personalizar la etiqueta del menú de la barra lateral. Esta etiqueta solo se muestra en la vista móvil.

## returnToTopLabel

- Tipo: `string`
- Predeterminado: `Return to top`

Se puede usar para personalizar la etiqueta del botón "Volver al inicio". Esta etiqueta solo se muestra en la vista móvil.

## langMenuLabel

- Tipo: `string`
- Predeterminado: `Change language`

Se puede usar para personalizar la etiqueta aria del botón de cambio de idioma en la barra de navegación. Esto solo se usa si estás usando [i18n](../guide/i18n).

## skipToContentLabel

- Tipo: `string`
- Predeterminado: `Skip to content`

Se puede usar para personalizar la etiqueta del enlace "Saltar al contenido". Este enlace se muestra cuando el usuario navega por el sitio web mediante el teclado.

## externalLinkIcon

- Tipo: `boolean`
- Predeterminado: `false`

Indica si se debe mostrar un icono de enlace externo junto a los enlaces externos en Markdown.

## `useLayout` <Badge type="info" text="componible" />

Devuelve datos relacionados con el diseño. El objeto devuelto tiene el siguiente tipo:

```ts
interface {
  isHome: ComputedRef<boolean>

  sidebar: Readonly<ShallowRef<DefaultTheme.SidebarItem[]>>
  sidebarGroups: ComputedRef<DefaultTheme.SidebarItem[]>
  hasSidebar: ComputedRef<boolean>
  isSidebarEnabled: ComputedRef<boolean>

  hasAside: ComputedRef<boolean>
  leftAside: ComputedRef<boolean>

  headers: Readonly<ShallowRef<DefaultTheme.OutlineItem[]>>
  hasLocalNav: ComputedRef<boolean>
}
```

**Ejemplo:**

```vue
<script setup>
import { useLayout } from 'vitepress/theme'

const { hasSidebar } = useLayout()
</script>

<template>
  <div v-if="hasSidebar">Mostrar solo cuando exista la barra lateral.</div>
</template>
```
