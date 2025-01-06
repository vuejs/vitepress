---
outline: deep
---

# Estendendo o Tema Padrão {#extending-the-default-theme}

O tema padrão do VitePress é otimizado para documentação e pode ser personalizado. Consulte a [Visão Geral de Configuração do Tema Padrão](../reference/default-theme-config) para uma lista abrangente de opções.

No entanto, há casos em que apenas a configuração não será suficiente. Por exemplo:

1. É necessário ajustar a estilização CSS;
2. É necessário modificar a instância da aplicação Vue, por exemplo para registrar componentes globais;
3. É necessário injetar conteúdo personalizado no tema por meio de _slots_ no layout.

Essas personalizações avançadas exigirão o uso de um tema personalizado que "estende" o tema padrão.

::: tip
Antes de prosseguir, certifique-se de ler primeiro [Usando um Tema Personalizado](./custom-theme) para entender como temas personalizados funcionam.
:::

## Personalizando o CSS {#customizing-css}

O CSS do tema padrão pode ser personalizado substituindo as variáveis CSS no nível raiz:

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default DefaultTheme
```

```css
/* .vitepress/theme/custom.css */
:root {
  --vp-c-brand-1: #646cff;
  --vp-c-brand-2: #747bff;
}
```

Veja as [variáveis CSS do tema padrão](https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/styles/vars.css) que podem ser substituídas.

## Usando Fontes Diferentes {#using-different-fonts}

VitePress usa [Inter](https://rsms.me/inter/) como fonte padrão e incluirá as fontes na saída de compilação. A fonte também é pré-carregada automaticamente em produção. No entanto, isso pode não ser desejável se você quiser usar uma fonte principal diferente.

Para evitar a inclusão de Inter na saída de compilação, importe o tema de `vitepress/theme-without-fonts`:

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme-without-fonts'
import './my-fonts.css'

export default DefaultTheme
```

```css
/* .vitepress/theme/my-fonts.css */
:root {
  --vp-font-family-base: /* fonte de texto normal */
  --vp-font-family-mono: /* fonte de código */
}
```

::: warning
Se estiver usando componentes opcionais como os componentes da [Página da Equipe](../reference/default-theme-team-page), certifique-se de também importá-los de `vitepress/theme-without-fonts`!
:::

Se a sua fonte é um arquivo local referenciado via `@font-face`, ela será processada como um ativo e incluída em `.vitepress/dist/assets` com um nome de arquivo hash. Para pré-carregar esse arquivo, use o gancho de construção [transformHead](../reference/site-config#transformhead):

```js [.vitepress/config.js]
export default {
  transformHead({ assets }) {
    // ajuste o regex para corresponder à sua fonte
    const myFontFile = assets.find(file => /font-name\.\w+\.woff2/)
    if (myFontFile) {
      return [
        [
          'link',
          {
            rel: 'preload',
            href: myFontFile,
            as: 'font',
            type: 'font/woff2',
            crossorigin: ''
          }
        ]
      ]
    }
  }
}
```

## Registrando Componentes Globais {#registering-global-components}

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // registre seus componentes globais personalizados
    app.component('MyGlobalComponent' /* ... */)
  }
}
```

Se estiver usando TypeScript:
```ts [.vitepress/theme/index.ts]
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // registre seus componentes globais personalizados
    app.component('MyGlobalComponent' /* ... */)
  }
} satisfies Theme
```

Como estamos usando Vite, você também pode aproveitar a [funcionalidade de importação glob](https://vitejs.dev/guide/features.html#glob-import) do Vite para registrar automaticamente um diretório de componentes.

## _Slots_ no Layout {#layout-slots}

O componente `<Layout/>` do tema padrão possui alguns _slots_ que podem ser usados para injetar conteúdo em locais específicos da página. Aqui está um exemplo de como injetar um componente antes do esquema :

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'
import MyLayout from './MyLayout.vue'

export default {
  extends: DefaultTheme,
  // substitua o Layout por um componente envolvente que
  // injeta os slots
  Layout: MyLayout
}
```

```vue [.vitepress/theme/MyLayout.vue]
<script setup>
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #aside-outline-before>
      Meu conteúdo personalizado superior da barra lateral
    </template>
  </Layout>
</template>
```

Ou você também pode usar a função _render_.

```js [.vitepress/theme/index.js]
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import MyComponent from './MyComponent.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'aside-outline-before': () => h(MyComponent)
    })
  }
}
```

Lista completa de _slots_ disponíveis no layout do tema padrão:

- Quando `layout: 'doc'` (padrão) está habilitado via frontmatter:
  - `doc-top`
  - `doc-bottom`
  - `doc-footer-before`
  - `doc-before`
  - `doc-after`
  - `sidebar-nav-before`
  - `sidebar-nav-after`
  - `aside-top`
  - `aside-bottom`
  - `aside-outline-before`
  - `aside-outline-after`
  - `aside-ads-before`
  - `aside-ads-after`
- Quando `layout: 'home'` está habilitado via frontmatter:
  - `home-hero-before`
  - `home-hero-info-before`
  - `home-hero-info`
  - `home-hero-actions-after`
  - `home-hero-image`
  - `home-hero-after`
  - `home-features-before`
  - `home-features-after`
- Quando `layout: 'page'` está habilitado via frontmatter:
  - `page-top`
  - `page-bottom`
- Na página não encontrada (404):
  - `not-found`
- Sempre:
  - `layout-top`
  - `layout-bottom`
  - `nav-bar-title-before`
  - `nav-bar-title-after`
  - `nav-bar-content-before`
  - `nav-bar-content-after`
  - `nav-screen-content-before`
  - `nav-screen-content-after`

## Usando a API View Transitions

### Na Alternância de Aparência {#on-appearance-toggle}

Você pode estender o tema padrão para fornecer uma transição personalizada quando o modo de cor é alternado. Um exemplo:

```vue [.vitepress/theme/Layout.vue]
<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { nextTick, provide } from 'vue'

const { isDark } = useData()

const enableTransitions = () =>
  'startViewTransition' in document &&
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches

provide('toggle-appearance', async ({ clientX: x, clientY: y }: MouseEvent) => {
  if (!enableTransitions()) {
    isDark.value = !isDark.value
    return
  }

  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    )}px at ${x}px ${y}px)`
  ]

  await document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  }).ready

  document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    {
      duration: 300,
      easing: 'ease-in',
      pseudoElement: `::view-transition-${isDark.value ? 'old' : 'new'}(root)`
    }
  )
})
</script>

<template>
  <DefaultTheme.Layout />
</template>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root),
.dark::view-transition-new(root) {
  z-index: 1;
}

::view-transition-new(root),
.dark::view-transition-old(root) {
  z-index: 9999;
}

.VPSwitchAppearance {
  width: 22px !important;
}

.VPSwitchAppearance .check {
  transform: none !important;
}
</style>
```

Resultado (**atenção!**: cores piscantes, movimentos súbitos, luzes brilhantes):

<details>
<summary>Demo</summary>

![Demo de Transição de Alternância de Aparência](/appearance-toggle-transition.webp)

</details>

Consulte [Chrome Docs](https://developer.chrome.com/docs/web-platform/view-transitions/) para mais detalhes sobre _view transitions_.

### Na Mudança de Rota {#on-route-change}

Em breve.

## Substituindo Componentes Internos {#overriding-internal-components}

Você pode usar os [aliases](https://vitejs.dev/config/shared-options.html#resolve-alias) Vite para substituir os componentes do tema padrão pelos seus personalizados:

```ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

export default defineConfig({
  vite: {
    resolve: {
      alias: [
        {
          find: /^.*\/VPNavBar\.vue$/,
          replacement: fileURLToPath(
            new URL('./components/CustomNavBar.vue', import.meta.url)
          )
        }
      ]
    }
  }
})
```

Para saber o nome exato do componente consulte [nosso código fonte](https://github.com/vuejs/vitepress/tree/main/src/client/theme-default/components). Como os componentes são internos, há uma pequena chance de que o nome deles seja atualizado entre lançamentos secundários.
