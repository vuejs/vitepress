---
description: Referencia de las API en tiempo de ejecución de VitePress, incluyendo composables, funciones auxiliares y componentes integrados.
---

# API en Tiempo de Ejecución {#runtime-api}

VitePress ofrece varias API integradas para permitir el acceso a los datos de la aplicación. VitePress también viene con algunos componentes integrados que se pueden utilizar globalmente.

Los métodos auxiliares se pueden importar globalmente desde `vitepress` y normalmente se utilizan en componentes de Vue de temas personalizados. Sin embargo, también se pueden utilizar dentro de páginas `.md` porque los archivos Markdown se compilan en [Componentes de un solo archivo de Vue (SFC)](https://vuejs.org/guide/scaling-up/sfc.html).

Los métodos que comienzan con `use*` indican que se trata de una función de la [API de Composición de Vue 3](https://vuejs.org/guide/introduction.html#composition-api) ("Composable") que solo se puede utilizar dentro de `setup()` o `<script setup>`.

## `useData` <Badge type="info" text="composable" />

Retorna datos específicos de la página. El objeto devuelto tiene el siguiente tipo:

```ts
interface VitePressData<T = any> {
  /**
   * Metadatos a nivel del sitio
   */
  site: Ref<SiteData<T>>
  /**
   * themeConfig desde .vitepress/config.js
   */
  theme: Ref<T>
  /**
   * Metadatos a nivel de la página
   */
  page: Ref<PageData>
  /**
   * Frontmatter de la página
   */
  frontmatter: Ref<PageData['frontmatter']>
  /**
   * Parámetros de ruta dinámica
   */
  params: Ref<PageData['params']>
  title: Ref<string>
  description: Ref<string>
  lang: Ref<string>
  isDark: Ref<boolean>
  dir: Ref<string>
  localeIndex: Ref<string>
  /**
   * Hash de la ubicación actual
   */
  hash: Ref<string>
}

interface PageData {
  title: string
  titleTemplate?: string | boolean
  description: string
  relativePath: string
  filePath: string
  headers: Header[]
  frontmatter: Record<string, any>
  params?: Record<string, any>
  isNotFound?: boolean
  lastUpdated?: number
}
```

`page.headers` se rellena solo cuando [`markdown.headers`](./site-config#markdown) está habilitado. Sin esa opción, permanece como un `array` vacío. El esquema del tema predeterminado lee los encabezados renderizados del contenido de la página, por lo que aún puede aparecer cuando `page.headers` está vacío.

**Ejemplo:**

```vue
<script setup>
import { useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <h1>{{ theme.footer.copyright }}</h1>
</template>
```

## `useRoute` <Badge type="info" text="composable" />

Devuelve el objeto de ruta actual con el siguiente tipo:

```ts
interface Route {
  path: string
  data: PageData
  component: Component | null
}
```

## `useRouter` <Badge type="info" text="composable" />

Devuelve la instancia del enrutador de VitePress para que pueda navegar a otra página de forma programática.

```ts
interface Router {
  /**
   * Ruta actual.
   */
  route: Route
  /**
   * Navegar a una nueva URL.
   */
  go: (to?: string) => Promise<void>
  /**
   * Se llama antes de que cambie la ruta. Devuelve `false` para cancelar la navegación.
   */
  onBeforeRouteChange?: (to: string) => Awaitable<void | boolean>
  /**
   * Se llama antes de que se cargue el componente de la página (después de que se haya actualizado el estado del historial).
   * Devuelve `false` para cancelar la navegación.
   */
  onBeforePageLoad?: (to: string) => Awaitable<void | boolean>
  /**
   * Se llama después de que se cargue el componente de la página (antes de que se actualice el componente de la página).
   */
  onAfterPageLoad?: (to: string) => Awaitable<void>
  /**
   * Se llama después de que cambie la ruta.
   */
  onAfterRouteChange?: (to: string) => Awaitable<void>
}
```

Asigne manejadores de cambio de ruta en la instancia del enrutador:

```ts
const router = useRouter()

router.onBeforeRouteChange = (to) => {
  console.log('navegando a', to)
}
```

Para los temas personalizados, el mismo enrutador está disponible desde [`enhanceApp`](../guide/custom-theme#theme-interface).

## `withBase` <Badge type="info" text="helper" />

- **Tipo**: `(path: string) => string`

Antepone la [`base`](./site-config#base) configurada a una ruta de URL dada. Consulte también [URL base](../guide/asset-handling#base-url).

## `<Content />` <Badge type="info" text="component" />

El componente `<Content />` muestra los contenidos Markdown renderizados. Es útil [al crear su propio tema](../guide/custom-theme).

```vue
<template>
  <h1>¡Layout personalizado!</h1>
  <Content />
</template>
```

## `<ClientOnly />` <Badge type="info" text="component" />

El componente `<ClientOnly />` renderiza su `slot` solo en el lado del cliente.

Debido a que las aplicaciones de VitePress se renderizan en el lado del servidor en Node.js al generar compilaciones estáticas, cualquier uso de Vue debe cumplir con los requisitos del código universal. En resumen, asegúrese de acceder a las API del navegador/DOM solo en los *hooks* `beforeMount` o `mounted`.

Si está utilizando o demostrando componentes que no son compatibles con SSR (por ejemplo, que contienen directivas personalizadas), puede envolverlos dentro del componente `ClientOnly`.

```vue-html
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```

- Relacionado: [Compatibilidad con SSR](../guide/ssr-compat)

## `$frontmatter` <Badge type="info" text="template global" />

Acceda directamente a los datos del [`frontmatter`](../guide/frontmatter) de la página actual en expresiones de Vue.

```md
---
title: Hola
---

# {{ $frontmatter.title }}
```

## `$params` <Badge type="info" text="template global" />

Acceda directamente a los [parámetros de ruta dinámica](../guide/routing#dynamic-routes) de la página actual en expresiones de Vue.

```md
- nombre del paquete: {{ $params.pkg }}
- versión: {{ $params.version }}
```