# Usando um Tema Personalizado {#using-a-custom-theme}

## Resolução de Tema {#theme-resolving}

Você pode habilitar um tema personalizado criando um arquivo `.vitepress/theme/index.js` ou `.vitepress/theme/index.ts` (o "arquivo de entrada do tema"):

```
.
├─ docs                # raiz do projeto
│  ├─ .vitepress
│  │  ├─ theme
│  │  │  └─ index.js   # entrada do tema
│  │  └─ config.js     # arquivo de configuração
│  └─ index.md
└─ package.json
```

VitePress sempre usará o tema personalizado em vez do tema padrão quando detectar a presença de um arquivo de entrada do tema. No entanto, você pode [estender o tema padrão](./extending-default-theme) para realizar personalizações avançadas sobre ele.

## Interface do Tema {#theme-interface}

Um tema personalizado do VitePress é definido como um objeto com a seguinte interface:

```ts
interface Theme {
  /**
   * Componente raiz de layout para toda página
   * @required
   */
  Layout: Component
  /**
   * Aprimora a instância da aplicação Vue
   * @optional
   */
  enhanceApp?: (ctx: EnhanceAppContext) => Awaitable<void>
  /**
   * Estende outro tema, chamando seu `enhanceApp` antes do nosso
   * @optional
   */
  extends?: Theme
}

interface EnhanceAppContext {
  app: App // instância da aplicação Vue
  router: Router // instância do roteador VitePress
  siteData: Ref<SiteData> // Metadados do nível do site
}
```

O arquivo de entrada do tema deve exportar o tema como sua exportação padrão:

```js [.vitepress/theme/index.js]

// Você pode importar arquivos Vue diretamente no arquivo de entrada do tema
// VitePress já está pré-configurado com @vitejs/plugin-vue.
import Layout from './Layout.vue'

export default {
  Layout,
  enhanceApp({ app, router, siteData }) {
    // ...
  }
}
```

A exportação padrão é o único contrato para um tema personalizado, e apenas a propriedade `Layout` é exigida. Tecnicamente, um tema do VitePress pode ser tão simples quanto um único componente Vue.

Dentro do seu componente de layout, ele funciona como uma aplicação Vite + Vue 3 normal. Note que o tema também precisa ser [compatível com SSR](./ssr-compat).

## Construindo um Layout {#building-a-layout}

O componente de layout mais básico precisa conter um componente [`<Content />`](../reference/runtime-api#content):

```vue [.vitepress/theme/Layout.vue]
<template>
  <h1>Layout Personalizado!</h1>

  <!-- aqui é onde o conteúdo markdown será apresentado -->
  <Content />
</template>
```

O layout acima simplesmente renderiza o markdown de toda página como HTML. A primeira melhoria que podemos adicionar é lidar com erros 404:

```vue{1-4,9-12}
<script setup>
import { useData } from 'vitepress'
const { page } = useData()
</script>

<template>
  <h1>Layout Personalizado!</h1>

  <div v-if="page.isNotFound">
    Página 404 personalizada!
  </div>
  <Content v-else />
</template>
```

O auxiliar [`useData()`](../reference/runtime-api#usedata) fornece todos os dados em tempo de execução que precisamos para mostrar layouts diferentes. Um dos outros dados que podemos acessar é o frontmatter da página atual. Podemos aproveitar isso para permitir que o usuário final controle o layout em cada página. Por exemplo, o usuário pode indicar que a página deve usar um layout especial de página inicial com:

```md
---
layout: home
---
```

E podemos ajustar nosso tema para lidar com isso:

```vue{3,12-14}
<script setup>
import { useData } from 'vitepress'
const { page, frontmatter } = useData()
</script>

<template>
  <h1>Layout Personalizado!</h1>

  <div v-if="page.isNotFound">
    Página 404 personalizada!
  </div>
  <div v-if="frontmatter.layout === 'home'">
    Página inicial personalizada!
  </div>
  <Content v-else />
</template>
```

Você pode, é claro, dividir o layout em mais componentes:

```vue{3-5,12-15}
<script setup>
import { useData } from 'vitepress'
import NotFound from './NotFound.vue'
import Home from './Home.vue'
import Page from './Page.vue'

const { page, frontmatter } = useData()
</script>

<template>
  <h1>Layout Personalizado!</h1>

  <NotFound v-if="page.isNotFound" />
  <Home v-if="frontmatter.layout === 'home'" />
  <Page v-else /> <!-- <Page /> renders <Content /> -->
</template>
```

Consulte a [Referência da API em Tempo de Execução](../reference/runtime-api) para tudo que está disponível em componentes de tema. Além disso, você pode aproveitar [Carregamento de Dados em Tempo de Compilação](./data-loading) para gerar layouts orientados por dados - por exemplo, uma página que lista todas as postagens do blog no projeto atual.

## Distribuindo um Tema Personalizado {#distributing-a-custom-theme}

A maneira mais fácil de distribuir um tema personalizado é fornecê-lo como um [repositório de modelo no GitHub](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository).

Se você deseja distribuir seu tema como um pacote npm, siga estas etapas:

1. Exporte o objeto do tema como a exportação padrão no seu arquivo de pacote.

2. Se aplicável, exporte a definição de configuração de tipo do tema como `ThemeConfig`.

3. Se seu tema exigir ajustes na configuração VitePress, exporte essa configuração em um subdiretório do pacote (por exemplo, `meu-tema/config`) para que o usuário possa estendê-la.

4. Documente as opções de configuração do tema (tanto via arquivo de configuração quanto em frontmatter).

5. Forneça instruções claras sobre como consumir seu tema (veja abaixo).

## Consumindo um Tema Personalizado {#consuming-a-custom-theme}

Para consumir um tema externo, importe-o e reexporte-o a partir do arquivo de entrada do tema personalizado:

```js [.vitepress/theme/index.js]
import Theme from 'awesome-vitepress-theme'

export default Theme
```

Se o tema precisar ser estendido:

```js [.vitepress/theme/index.js]
import Theme from 'awesome-vitepress-theme'

export default {
  extends: Theme,
  enhanceApp(ctx) {
    // ...
  }
}
```

Se o tema exigir uma configuração especial do VitePress, você também precisará estendê-lo em sua própria configuração:

```ts
// .vitepress/theme/config.ts
import baseConfig from 'awesome-vitepress-theme/config'

export default {
  // estenda a configuração base do tema (se preciso)
  extends: baseConfig
}
```

Finalmente, se o tema fornecer tipos para a configuração do tema:

```ts
// .vitepress/theme/config.ts
import baseConfig from 'awesome-vitepress-theme/config'
import { defineConfigWithTheme } from 'vitepress'
import type { ThemeConfig } from 'awesome-vitepress-theme'

export default defineConfigWithTheme<ThemeConfig>({
  extends: baseConfig,
  themeConfig: {
    // O tipo é `ThemeConfig`
  }
})
```
