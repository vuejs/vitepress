---
outline: deep
---

# Configuração do Site {#site-config}

A configuração do site é onde você pode definir as configurações globais do site. As opções de configuração do aplicativo definem configurações que se aplicam a todos os sites VitePress, independentemente do tema que estão usando. Por exemplo, o diretório base ou o título do site.

## Visão geral {#overview}

### Resolução de Configuração {#config-resolution}

O arquivo de configuração é sempre resolvido a partir de `<root>/.vitepress/config.[ext]`, onde `<root>` é a [raiz do projeto](../guide/routing#root-and-source-directory) VitePress e `[ext]` é uma das extensões de arquivo suportadas. O TypeScript é suportado de fábrica. As extensões suportadas incluem `.js`, `.ts`, `.mjs` e `.mts`.

Recomenda-se usar a sintaxe de módulos ES nos arquivos de configuração. O arquivo de configuração deve exportar por padrão um objeto:

```ts
export default {
  // opções de configuração de nível da aplicação
  lang: 'pt-BR',
  title: 'VitePress',
  description: 'Gerador de site estático Vite & Vue.',
  ...
}
```

:::details Configuração Dinâmica (Assíncrona)

Se você precisar gerar dinamicamente a configuração, também pode exportar por padrão uma função. Por exemplo:

```ts
import { defineConfig } from 'vitepress'

export default async () => {
  const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

  return defineConfig({
  // opções de configuração de nível da aplicação
    lang: 'pt-BR',
    title: 'VitePress',
    description: 'Gerador de site estático Vite & Vue.',

    // opções de configuração de nível do tema
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

Você também pode usar o `await` no nível superior. Como:

```ts
import { defineConfig } from 'vitepress'

const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

export default defineConfig({
  // opções de configuração de nível da aplicação
    lang: 'pt-BR',
    title: 'VitePress',
    description: 'Gerador de site estático Vite & Vue.',

  // opções de configuração de nível do tema
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

### Configuração Intellisense {#config-intellisense}

Usar o auxiliar `defineConfig` fornecerá Intellisense alimentado por TypeScript para as opções de configuração. Supondo que seu IDE o suporte, isso deve funcionar tanto em JavaScript quanto em TypeScript.

```js
import { defineConfig } from 'vitepress'

export default defineConfig({
  // ...
})
```

### Configuração de Tema Tipada {#typed-theme-config}

Por padrão, o auxiliar `defineConfig` espera o tipo de configuração de tema do tema padrão:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    // O tipo é `DefaultTheme.Config`
  }
})
```

Se você estiver usando um tema personalizado e desejar verificações de tipo para a configuração do tema, será necessário usar `defineConfigWithTheme` em vez disso, e passar o tipo de configuração para o seu tema personalizado por meio de um argumento genérico:

```ts
import { defineConfigWithTheme } from 'vitepress'
import type { ThemeConfig } from 'your-theme'

export default defineConfigWithTheme<ThemeConfig>({
  themeConfig: {
    // O tipo é `ThemeConfig`
  }
})
```

### Configuração Vite, Vue & Markdown

- **Vite**

  Você pode configurar a instância subjacente do Vite usando a opção [vite](#vite) em sua configuração VitePress. Não é necessário criar um arquivo de configuração Vite separado.

- **Vue**

  VitePress já inclui o plugin Vue oficial para Vite ([@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue)). Você pode configurar suas opções usando a opção [vue](#vue) em sua configuração VitePress.

- **Markdown**

  Você pode configurar a instância subjacente de [Markdown-It](https://github.com/markdown-it/markdown-it) usando a opção [markdown](#markdown) em sua configuração VitePress.

## Metadados do Site {#site-metadata}

### title

- Tipo: `string`
- Padrão: `VitePress`
- Pode ser substituído por página via [frontmatter](./frontmatter-config#title)

Título do site. Ao usar o tema padrão, isso será exibido na barra de navegação.

Ele também será usado como o sufixo padrão para todos os títulos individuais das páginas, a menos que [`titleTemplate`](#titletemplate) seja definido. O título final de uma página individual será o conteúdo textual do seu primeiro cabeçalho `<h1>`, combinado com o título global como sufixo. Por exemplo, com a seguinte configuração e conteúdo da página:

```ts
export default {
  title: 'Meu Site Incrível'
}
```

```md
# Olá
```

O título da página será `Olá | Meu Site Incrível`.

### titleTemplate

- Tipo: `string | boolean`
- Pode ser substituído por página via [frontmatter](./frontmatter-config#titletemplate)

Permite personalizar o sufixo do título de cada página ou o título inteiro. Por exemplo:

```ts
export default {
  title: 'Meu Site Incrível',
  titleTemplate: 'Sufixo Personalizado'
}
```

```md
# Olá
```

O título da página será `Olá | Sufixo Personalizado`.

Para personalizar completamente como o título deve ser renderizado, você pode usar o símbolo `:title` em `titleTemplate`:

```ts
export default {
  titleTemplate: ':title - Sufixo Personalizado'
}
```

Aqui, `:title` será substituído pelo texto inferido do primeiro cabeçalho `<h1>` da página. O título do exemplo anterior da página será `Olá - Sufixo Personalizado`.

A opção pode ser definida como `false` para desativar sufixos de título.

### description

- Tipo: `string`
- Padrão: `Um site VitePress`
- Pode ser substituído por página via [frontmatter](./frontmatter-config#descrição)

Descrição para o site. Isso será apresentado como uma tag `<meta>` na página HTML.

```ts
export default {
  descrição: 'Um site VitePress'
}
```

### head

- Tipo: `HeadConfig[]`
- Padrão: `[]`
- Pode ser acrescentado por página via [frontmatter](./frontmatter-config#head)

Elementos adicionais para adicionar na tag `<head>` da página HTML. As tags adicionadas pelo usuário são mostradas antes da tag `head` de fechamento, após as tags VitePress.

```ts
type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

#### Exemplo: Adicionando um favicon {#example-adding-a-favicon}

```ts
export default {
  cabeça: [['link', { rel: 'icon', href: '/favicon.ico' }]]
} // coloque o favicon.ico no diretório public, se a base estiver definida, use /base/favicon.ico

/* Mostraria:
  <link rel="icon" href="/favicon.ico">
*/
```

#### Exemplo: Adicionando Fontes do Google {#example-adding-google-fonts}

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

/* Mostraria:
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
*/
```

#### Exemplo: Registrando um _service worker_ {#example-registering-a-service-worker}

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

/* Mostraria:
  <script id="register-sw">
    ;(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
      }
    })()
  </script>
*/
```

#### Exemplo: Usando o Google Analytics {#example-using-google-analytics}

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

/* Mostraria:
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
- Padrão: `en-US`

O atributo de idioma para o site. Isso será mostrado como uma tag `<html lang="en-US">` na página HTML.

```ts
export default {
  lang: 'en-US'
}
```

### base

- Tipo: `string`
- Padrão: `/`

A URL base em que o site será implantado. Você precisará definir isso se planeja implantar seu site em um subdiretório, por exemplo, no GitHub pages. Se você planeja implantar seu site em `https://foo.github.io/bar/` então você deve definir a base como `'/bar/'`. Deve sempre começar e terminar com uma barra.

A base é automaticamente adicionada a todos as URLs que começam com / em outras opções, então você só precisa especificá-la uma vez.

```ts
export default {
  base: '/base/'
}
```

## Roteamento {#routing}

### cleanUrls

- Tipo: `boolean`
- Padrão: `false`

Quando definido como `true`, VitePress removerá o `.html` no final dos URLs. Veja também [Gerando URL Limpa](../guide/routing#generating-clean-url).

::: warning Suporte do Servidor Necessário
Ativar isso pode exigir configurações adicionais em sua plataforma de hospedagem. Para funcionar, seu servidor deve ser capaz de servir `/foo.html` ao visitar `/foo` **sem redirecionamento**.
:::

### rewrites

- Tipo: `Record<string, string>`

Define mapeamentos personalizados de diretório &lt;-&gt; URL. Veja [Roteamento: Reescrever Rotas](../guide/routing#route-rewrites) para mais detalhes.

```ts
export default {
  rewrites: {
    'source/:page': 'destination/:page'
  }
}
```

## Construção {#build}

### srcDir

- Tipo: `string`
- Padrão: `.`

O diretório onde suas páginas de markdown são armazenadas, relativo à raiz do projeto. Veja também [Diretório Raiz e Fonte](../guide/routing#root-and-source-directory).

```ts
export default {
  srcDir: './src'
}
```

### srcExclude

- Tipo: `string`
- Padrão: `undefined`

Um [padrão glob](https://github.com/mrmlnc/fast-glob#pattern-syntax) para corresponder a arquivos markdown que devem ser excluídos como conteúdo fonte.

```ts
export default {
  srcExclude: ['**/README.md', '**/TODO.md']
}
```

### outDir

- Tipo: `string`
- Padrão: `./.vitepress/dist`

A localização da saída da compilação para o site, relativa à [raiz do projeto](../guide/routing#root-and-source-directory).

```ts
export default {
  outDir: '../public'
}
```

### assetsDir

- Tipo: `string`
- Padrão: `assets`

Especifica o diretório para aninhar ativos gerados. O caminho deve estar dentro de [`outDir`](#outdir) e é resolvido em relação a ele.

```ts
export default {
  assetsDir: 'static'
}
```

### cacheDir

- Tipo: `string`
- Padrão: `./.vitepress/cache`

O diretório para arquivos de cache, relativo à [raiz do projeto](../guide/routing#root-and-source-directory). Veja também: [cacheDir](https://vitejs.dev/config/shared-options.html#cachedir).

```ts
export default {
  cacheDir: './.vitepress/.vite'
}
```

### ignoreDeadLinks

- Tipo: `boolean | 'localhostLinks' | (string | RegExp | ((link: string) => boolean))[]`
- Padrão: `false`

Quando definido como `true`, VitePress não falhará na compilação devido a links quebrados.

Quando definido como `'localhostLinks'`, a compilação falhará em links quebrados, mas não verificará links `localhost`.

```ts
export default {
  ignoreDeadLinks: true
}
```

Também pode ser um _array_ de uma exata URL em string, padrões regex, ou funções de filtro personalizadas.

```ts
export default {
  ignoreDeadLinks: [
    // ignora URL exata "/playground"
    '/playground',
    // ignora todos os links localhost
    /^https?:\/\/localhost/,
    // ignora todos os links incluindo "/repl/""
    /\/repl\//,
    // função personalizada, ignora todos os links incluindo "ignore"
    (url) => {
      return url.toLowerCase().includes('ignore')
    }
  ]
}
```

### mpa <Badge type="warning" text="experimental" />

- Tipo: `boolean`
- Padrão: `false`

Quando definido como `true`, a aplicação em produção será compilada no [Modo MPA](../guide/mpa-mode). O modo MPA envia 0kb de JavaScript por padrão, às custas de desabilitar a navegação no lado do cliente e exigir permissão explícita para interatividade.

## Tematização {#theming}

### appearance

- Tipo: `boolean | 'dark' | 'force-dark' | import('@vueuse/core').UseDarkOptions`
- Padrão: `true`

Se habilitar o modo escuro (adicionando a classe `.dark` ao elemento `<html>`).

- Se a opção estiver definida como `true` o tema padrão é determinado pelo esquema de cores preferido do usuário.
- Se a opção estiver definida como `dark` o tema é escuro por padrão, a menos que o usuário mude manualmente.
- Se a opção estiver definida como `false` os usuários não poderão mudar o tema.

Esta opção injeta um script em linha que restaura as configurações dos usuários do armazenamento local (_local storage_) usando a chave `vitepress-theme-appearance`. Isso garante que a classe `.dark` seja aplicada antes de a página ser mostrada para evitar oscilações.

`appearance.initialValue` só pode ser `'dark' | undefined`. Refs ou getters não são suportados.

### lastUpdated

- Tipo: `boolean`
- Padrão: `false`

Para obter o selo de tempo da última atualização para cada página usando o Git. O selo de data será incluído nos dados de cada página, acessíveis via [`useData`](./runtime-api#usedata).

Ao usar o tema padrão, habilitar esta opção exibirá o horário da última atualização de cada página. Você pode personalizar o texto via opção [`themeConfig.lastUpdatedText`](./default-theme-config#lastupdatedtext).

## Personalização {#customization}

### markdown

- Tipo: `MarkdownOption`

Configure as opções do processador Markdown. VitePress usa [Markdown-it](https://github.com/markdown-it/markdown-it) como processador e [Shiki](https://github.com/shikijs/shiki) para destacar sintaxe de linguagem. Dentro desta opção, você pode passar várias opções Markdown relacionadas para atender às suas necessidades.

```js
export default {
  markdown: {...}
}
```

Verifique a [declaração de tipo e jsdocs](https://github.com/vuejs/vitepress/blob/main/src/node/markdown/markdown.ts) para todas as opções disponíveis.

### vite

- Tipo: `import('vite').UserConfig`

Passe a [Configuração Vite](https://vitejs.dev/config/) crua para o servidor interno / empacotador Vite.

```js
export default {
  vite: {
    // Opções de configuração Vite
  }
}
```

### vue

- Tipo: `import('@vitejs/plugin-vue').Options`

Passe as opções [`@vitejs/plugin-vue`](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#options) cruas para a instância interna do plugin.

```js
export default {
  vue: {
    // Opções @vitejs/plugin-vue
  }
}
```

## Ganchos de Compilação {#build-hooks}

Os ganchos de compilação VitePress permitem adicionar novas funcionalidades ao seu site:

- Sitemap
- Indexação de Pesquisa
- PWA
- _Teleports_

## buildEnd
- Tipo: `(siteConfig: SiteConfig) => Awaitable<void>`
`buildEnd` é um gancho de compilação CLI (Interface de Linha de Comando), ele será executado após a conclusão da compilação (SSG), mas antes que o processo VitePress CLI termine.

```ts
export default {
  async buildEnd(siteConfig) {
    // ...
  }
}
```

## postRender
- Tipo: `(context: SSGContext) => Awaitable<SSGContext | void>`
- `postRender` é um gancho de compilação, chamado quando a interpretação SSG é concluída. Ele permitirá que você manipule o conteúdo de _teleports_ durante a geração de site estático.

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

`transformHead` é um gancho de compilação para transformar o cabeçalho antes de gerar cada página. Isso permite adicionar entradas no cabeçalho que não podem ser adicionadas estaticamente à configuração VitePress. Você só precisa retornar entradas extras, que serão mescladas automaticamente com as existentes.

:::warning
Não faça mutações em qualquer item dentro de `context`.
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
  assets: string[] // todos os ativos não-js/css com URL pública completamente resolvida
  siteConfig: SiteConfig
  siteData: SiteData
  pageData: PageData
  title: string
  description: string
  head: HeadConfig[]
  content: string
}
```

Note que este gancho só é chamado ao gerar o site estaticamente. Não é chamado durante o desenvolvimento. Se você precisar adicionar entradas de cabeçalho dinâmicas durante o desenvolvimento, pode usar o gancho [`transformPageData`](#transformpagedata) em seu lugar.

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

#### Exemplo: Adicionar URL canônica `<link>` {#example-adding-a-canonical-url-link}

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
`transformHtml` é um gancho de compilação para transformar o conteúdo de cada página antes de salvá-lo no disco.

:::warning
Não faça mutações em qualquer item dentro de `context`. Além disso, modificar o conteúdo HTML pode causar problemas de hidratação em tempo de execução.
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

`transformPageData` é um gancho para transformar os dados de cada página. Você pode fazer mutações diretamente em `pageData` ou retornar valores alterados que serão mesclados nos dados da página.

:::warning
Não faça mutações em qualquer item dentro de `context` e tenha cuidado pois isso pode impactar no desempenho do servidor de desenvolvimento, especialmente se você tiver algumas solicitações de rede ou computações pesadas (como gerar imagens) no gancho. Você pode verificar `process.env.NODE_ENV === 'production'` para lógica condicional.
:::

```ts
export default {
  async transformPageData(pageData, { siteConfig }) {
    pageData.contributors = await getPageContributors(pageData.relativePath)
  }

  // ou retorne dados a serem mesclados
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
