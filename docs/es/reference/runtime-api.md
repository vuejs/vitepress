# API en Tiempo de Ejecución {#runtime-api}

VitePress ofrece varias API integradas para permitir el acceso a los datos de la aplicación. VitePress también viene con algunos componentes integrados que se pueden utilizar globalmente.

Los métodos auxiliares son importaciones globales de `vitepress` y se utilizan a menudo en componentes Vue de temas personalizados. Sin embargo, también se pueden utilizar dentro de páginas `.md` porque los archivos de rebajas se compilan en [Componentes de Archivo Único Vue (SFC)](https://vuejs.org/guide/scaling-up/sfc.html).

Métodos que comienzan con `use*` indican que es una función de [API de Composición Vue 3](https://vuejs.org/guide/introduction.html#composition-api) ("Composable") que solo puede ser utilizada dentro de `setup()` o `<script setup>`.

## `useData` <Badge type="info" text="composable" />

Retorna datos específicos de la página. El objeto devuelto tiene el siguiente tipo:

```ts
interface VitePressData<T = any> {
  /**
   * Metadátos a nivel del sitio
   */
  site: Ref<SiteData<T>>
  /**
   * themeConfig de .vitepress/config.js
   */
  theme: Ref<T>
  /**
   * Metadátos a nível de la página
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
}

interface PageData {
  title: string
  titleTemplate?: string | boolean
  description: string
  relativePath: string
  filePath: string,
  headers: Header[]
  frontmatter: Record<string, any>
  params?: Record<string, any>
  isNotFound?: boolean
  lastUpdated?: number
}
```

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

Devuelve la instancia del enrutador VitePress para que pueda navegar mediante programación a otra página.

```ts
interface Router {
  /**
   * Ruta atual.
   */
  route: Route
  /**
   * Navegar para una nueva URL.
   */
  go: (to?: string) => Promise<void>
  /**
   * Llamado antes del cambio de ruta. Devuelve 'falso' para cancelar la navegación.
   */
  onBeforeRouteChange?: (to: string) => Awaitable<void | boolean>
  /**
   * Se llama antes de que se cargue el componente de la página (después de que se haya actualizado el estado del historial).
   * atualizado). Retorne `false` para cancelar la navegación.
   */
  onBeforePageLoad?: (to: string) => Awaitable<void | boolean>
  /**
   * Llamado después del cambio de ruta.
   */
  onAfterRouteChange?: (to: string) => Awaitable<void>
}
```

## `withBase` <Badge type="info" text="helper" />

- **Tipo**: `(path: string) => string`

agrega la [`base`](./site-config#base) configurada a una ruta URL determinada. Consulte también [Base URL](../guide/asset-handling#base-url).

## `<Content />` <Badge type="info" text="component" />

El componente `<Content />` muestra el contenido de markdown renderizado. Útil [al crear tu propio tema](../guide/custom-theme).

```vue
<template>
  <h1>Layout Personalizado!</h1>
  <Content />
</template>
```

## `<ClientOnly />` <Badge type="info" text="component" />

El componente `<ClientOnly />` muestra tu _slot_ solo del lado del cliente.

Debido a que las aplicaciones VitePress se interpretan en el lado del servidor en Node.js cuando generan compilaciones estáticas, cualquier uso de Vue debe seguir los requisitos del código universal. En resumen, asegúrese de acceder solo a las API del navegador/DOM en ganchos `beforeMount` o `mounted`.

Si está utilizando o demostrando componentes que no son compatibles con SSR (por ejemplo, contienen directivas personalizadas), puede incluirlos dentro del componente. `ClientOnly`.

```vue-html
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```

- Relacionado: [Compatibilidad SSR](../guide/ssr-compat)

## `$frontmatter` <Badge type="info" text="template global" />

Accede directamente a los datos [frontmatter](../guide/frontmatter) de la página actual en expresiones Vue.

```md
---
title: Olá
---

# {{ $frontmatter.title }}
```

## `$params` <Badge type="info" text="template global" />

Accede directamente a los [parámetros de ruta dinámica](../guide/routing#dynamic-routes) de la página actual en expresiones Vue.

```md
- nombre del paquete: {{ $params.pkg }}
- versión: {{ $params.version }}
```
