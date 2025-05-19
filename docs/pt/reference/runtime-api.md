# API em Tempo de Execução {#runtime-api}

VitePress oferece várias APIs embutidas para permitir o acesso aos dados da aplicação. VitePress vem também com alguns componentes embutidos que podem ser usados globalmente.

Os métodos auxiliares são importáveis globais de `vitepress` e geralmente são usados em componentes Vue de temas personalizados. No entanto, eles também podem ser usados dentro de páginas `.md` porque os arquivos markdown são compilados em [Componentes de Arquivo Único Vue (SFC)](https://vuejs.org/guide/scaling-up/sfc.html).

Métodos que começam com `use*` indicam que é uma função da [API de Composição Vue 3](https://vuejs.org/guide/introduction.html#composition-api) ("Composable") que só pode ser usada dentro de `setup()` ou `<script setup>`.

## `useData` <Badge type="info" text="composable" />

Retorna dados específicos da página. O objeto retornado possui o seguinte tipo:

```ts
interface VitePressData<T = any> {
  /**
   * Metadados do nível do site
   */
  site: Ref<SiteData<T>>
  /**
   * themeConfig de .vitepress/config.js
   */
  theme: Ref<T>
  /**
   * Metadados do nível da página
   */
  page: Ref<PageData>
  /**
   * Frontmatter da página
   */
  frontmatter: Ref<PageData['frontmatter']>
  /**
   * Parâmetros dinâmicos da rota
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

**Exemplo:**

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

Retorna o objeto de rota atual com o seguinte tipo:

```ts
interface Route {
  path: string
  data: PageData
  component: Component | null
}
```

## `useRouter` <Badge type="info" text="composable" />

Retorna a instância do roteador VitePress para que você possa navegar programaticamente para outra página.

```ts
interface Router {
  /**
   * Rota atual.
   */
  route: Route
  /**
   * Navegar para uma nova URL.
   */
  go: (to?: string) => Promise<void>
  /**
   * Chamado antes da mudança de rota. Retorne `false` para cancelar a navegação.
   */
  onBeforeRouteChange?: (to: string) => Awaitable<void | boolean>
  /**
   * Chamado antes do carregamento do componente da página (depois que o estado do histórico é
   * atualizado). Retorne `false` para cancelar a navegação.
   */
  onBeforePageLoad?: (to: string) => Awaitable<void | boolean>
  /**
   * Chamado após a mudança de rota.
   */
  onAfterRouteChange?: (to: string) => Awaitable<void>
}
```

## `withBase` <Badge type="info" text="helper" />

- **Tipo**: `(path: string) => string`

Anexa o [`base`](./site-config#base) configurado a um caminho de URL fornecido. Veja também [Base URL](../guide/asset-handling#base-url).

## `<Content />` <Badge type="info" text="component" />

O componente `<Content />` exibe o conteúdo markdown renderizado. Útil [ao criar seu próprio tema](../guide/custom-theme).

```vue
<template>
  <h1>Layout Personalizado!</h1>
  <Content />
</template>
```

## `<ClientOnly />` <Badge type="info" text="component" />

O componente `<ClientOnly />` revela seu _slot_ apenas no lado do cliente.

Como as aplicações VitePress são interpretadas no lado do servidor em Node.js ao gerar builds estáticos, qualquer uso do Vue deve seguir os requisitos de código universal. Em resumo, certifique-se de acessar apenas APIs do Navegador / DOM em ganchos `beforeMount` ou `mounted`.

Se você estiver usando ou demonstrando componentes que não são compatíveis com SSR (por exemplo, contêm diretivas personalizadas), você pode envolvê-los dentro do componente `ClientOnly`.

```vue-html
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```

- Relacionado: [Compatibilidade SSR](../guide/ssr-compat)

## `$frontmatter` <Badge type="info" text="template global" />

Acesse diretamente os dados [frontmatter](../guide/frontmatter) da página atual em expressões Vue.

```md
---
title: Olá
---

# {{ $frontmatter.title }}
```

## `$params` <Badge type="info" text="template global" />

Acesse diretamente os [parâmetros de rota dinâmica](../guide/routing#dynamic-routes) da página atual em expressões Vue.

```md
- nome do pacote: {{ $params.pkg }}
- versão: {{ $params.version }}
```
