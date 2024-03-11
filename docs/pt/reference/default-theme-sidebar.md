# Barra Lateral {#sidebar}

A barra lateral é o bloco principal de navegação da sua documentação. Você pode configurar o menu da barra lateral em [`themeConfig.sidebar`](./default-theme-config#sidebar).

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Guia',
        items: [
          { text: 'Introdução', link: '/introduction' },
          { text: 'Iniciando', link: '/getting-started' },
          ...
        ]
      }
    ]
  }
}
```

## O Básico {#the-basics}

A forma mais simples do menu da barra lateral é passar um único _array_ de links. O item do primeiro nível define a "seção" da barra lateral. Ele deve conter `text`, que é o título da seção, e `items` que são os próprios links de navegação.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Título da Seção A',
        items: [
          { text: 'Item A', link: '/item-a' },
          { text: 'Item B', link: '/item-b' },
          ...
        ]
      },
      {
        text: 'Título da Seção B',
        items: [
          { text: 'Item C', link: '/item-c' },
          { text: 'Item D', link: '/item-d' },
          ...
        ]
      }
    ]
  }
}
```

Cada `link` deve especificar o caminho para o próprio arquivo começando com `/`. Se você adicionar uma barra no final do link, será mostrado o `index.md` do diretório correspondente.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Guia',
        items: [
          // Isso mostra a página `/guide/index.md`.
          { text: 'Introdução', link: '/guide/' }
        ]
      }
    ]
  }
}
```

Você pode aninhar ainda mais os itens da barra lateral até 6 níveis de profundidade contando a partir do nível raiz. Note que níveis mais profundos que 6 serão ignorados e não serão exibidos na barra lateral.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Nível 1',
        items: [
          {
            text: 'Nível 2',
            items: [
              {
                text: 'Nível 3',
                items: [
                  ...
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

## Múltiplas Barras Laterais {#multiple-sidebars}

Você pode mostrar uma barra lateral diferente dependendo do caminho da página. Por exemplo, como mostrado neste site, você pode querer criar seções separadas de conteúdo em sua documentação, como a página "Guia" e a página "Configuração".

Para fazer isso, primeiro organize suas páginas em diretórios para cada seção desejada:

```
.
├─ guide/
│  ├─ index.md
│  ├─ one.md
│  └─ two.md
└─ config/
   ├─ index.md
   ├─ three.md
   └─ four.md
```

Em seguida, atualize sua configuração para definir sua barra lateral para cada seção. Desta vez, você deve passar um objeto em vez de um array.

```js
export default {
  themeConfig: {
    sidebar: {
      // Esta barra lateral é exibida quando um usuário
      // está no diretório `guide`.
      '/guide/': [
        {
          text: 'Guia',
          items: [
            { text: 'Índice', link: '/guide/' },
            { text: 'Um', link: '/guide/one' },
            { text: 'Dois', link: '/guide/two' }
          ]
        }
      ],

      // Esta barra lateral é exibida quando um usuário
      // está no diretório `config`.
      '/config/': [
        {
          text: 'Configuração',
          items: [
            { text: 'Índice', link: '/config/' },
            { text: 'Três', link: '/config/three' },
            { text: 'Quatro', link: '/config/four' }
          ]
        }
      ]
    }
  }
}
```

## Grupos Retráteis na Barra Lateral {#collapsible-sidebar-groups}

Adicionando a opção `collapsed` ao grupo da barra lateral, ela mostra um botão para ocultar/mostrar cada seção.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Título da Seção A',
        collapsed: false,
        items: [...]
      }
    ]
  }
}
```

Todas as seções são "abertas" por padrão. Se você deseja que elas estejam "fechadas" na carga inicial da página, defina a opção `collapsed` como `true`.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Título da Seção A',
        collapsed: true,
        items: [...]
      }
    ]
  }
}
```

## `useSidebar` <Badge type="info" text="composable" />

Retorna dados relacionados à barra lateral. O objeto retornado tem o seguinte tipo:

```ts
export interface DocSidebar {
  isOpen: Ref<boolean>
  sidebar: ComputedRef<DefaultTheme.SidebarItem[]>
  sidebarGroups: ComputedRef<DefaultTheme.SidebarItem[]>
  hasSidebar: ComputedRef<boolean>
  hasAside: ComputedRef<boolean>
  leftAside: ComputedRef<boolean>
  isSidebarEnabled: ComputedRef<boolean>
  open: () => void
  close: () => void
  toggle: () => void
}
```

**Exemplo:**

```vue
<script setup>
import { useSidebar } from 'vitepress/theme'

const { hasSidebar } = useSidebar()
</script>

<template>
  <div v-if="hasSidebar">Visível apenas quando a barra lateral existe</div>
</template>
```
