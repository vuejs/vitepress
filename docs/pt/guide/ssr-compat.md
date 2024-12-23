---
outline: deep
---

# Compatibilidade SSR {#ssr-compatibility}

VitePress pré-interpreta a aplicação no Node.js durante a compilação de produção, utilizando as capacidades de Interpretação do Lado do Servidor (SSR) do Vue. Isso significa que todo o código personalizado nos componentes do tema está sujeito à Compatibilidade SSR.

A [seção SSR na documentação Vue oficial](https://vuejs.org/guide/scaling-up/ssr.html) fornece mais contexto sobre o que é SSR, a relação entre SSR / SSG e notas comuns sobre escrever código amigável a SSR. A regra geral é acessar apenas APIs do navegador / DOM nos gatilhos `beforeMount` ou `mounted` dos componentes Vue.

## `<ClientOnly>`

Se você estiver usando ou demonstrando componentes que não são compatíveis com SSR (por exemplo, contêm diretivas personalizadas), você pode envolvê-los no componente embutido `<ClientOnly>`:

```md
<ClientOnly>
  <ComponenteNaoCompativelComSSR />
</ClientOnly>
```

## Bibliotecas que Acessam a API do Navegador na Importação {#libraries-that-access-browser-api-on-import}

Alguns componentes ou bibliotecas acessam APIs do navegador **na importação**. Para usar código que assume um ambiente de navegador na importação, você precisa importá-los dinamicamente.

### Importando no Gatilho `mounted` {#importing-in-mounted-hook}

```vue
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  import('./lib-que-acessa-window-na-importacao').then((module) => {
    // usar código
  })
})
</script>
```

### Importação Condicional {#conditional-import}

Você também pode importar condicionalmente uma dependência usando o sinalizador `import.meta.env.SSR` (parte das [variáveis de ambiente Vite](https://vitejs.dev/guide/env-and-mode.html#env-variables)):

```js
if (!import.meta.env.SSR) {
  import('./lib-que-acessa-window-na-importacao').then((module) => {
    // usar código
  })
}
```

Como [`Theme.enhanceApp`](./custom-theme#theme-interface) pode ser assíncrono, você pode importar condicionalmente e registrar plugins Vue que acessam APIs do navegador na importação:

```js [.vitepress/theme/index.js]
/** @type {import('vitepress').Theme} */
export default {
  // ...
  async enhanceApp({ app }) {
    if (!import.meta.env.SSR) {
      const plugin = await import('plugin-que-acessa-window-na-importacao')
      app.use(plugin.default)
    }
  }
}
```

Se estiver usando TypeScript:
```ts [.vitepress/theme/index.ts]
import type { Theme } from 'vitepress'

export default {
  // ...
  async enhanceApp({ app }) {
    if (!import.meta.env.SSR) {
      const plugin = await import('plugin-que-acessa-window-na-importacao')
      app.use(plugin.default)
    }
  }
} satisfies Theme
```

### `defineClientComponent`

VitePress fornece um auxiliar de conveniência para importar componentes Vue que acessam APIs do navegador na importação.

```vue
<script setup>
import { defineClientComponent } from 'vitepress'

const ClientComp = defineClientComponent(() => {
  return import('componente-que-acessa-window-na-importacao')
})
</script>

<template>
  <ClientComp />
</template>
```

Você também pode passar propriedades/filhos/_slots_ para o componente alvo:

```vue
<script setup>
import { ref } from 'vue'
import { defineClientComponent } from 'vitepress'

const clientCompRef = ref(null)
const ClientComp = defineClientComponent(
  () => import('componente-que-acessa-window-na-importacao'),

  // os argumentos são passados para h() - https://vuejs.org/api/render-function.html#h
  [
    {
      ref: clientCompRef
    },
    {
      default: () => 'slot padrão',
      foo: () => h('div', 'foo'),
      bar: () => [h('span', 'um'), h('span', 'dois')]
    }
  ],

  // retorno de chamada depois que o componente é carregado, pode ser assíncrono
  () => {
    console.log(clientCompRef.value)
  }
)
</script>

<template>
  <ClientComp />
</template>
```

O componente alvo só será importado no gatilho `mounted` do componente que o envolve.
