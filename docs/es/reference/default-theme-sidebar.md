# Barra Lateral {#sidebar}

La barra lateral es el bloque de navegación principal de su documentación. Puede configurar el menú de la barra lateral en [`themeConfig.sidebar`](./default-theme-config#sidebar).

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Guia',
        items: [
          { text: 'Introducción', link: '/introduction' },
          { text: 'Iniciando', link: '/getting-started' },
          ...
        ]
      }
    ]
  }
}
```

## Conceptos básicos {#the-basics}

La forma más sencilla del menú de la barra lateral es pasar una único _array_ de links. El elemento de primer nivel define la "sección" de la barra latera. debe contener `text`, cuál es el título de la sección, y `items` que son los propios enlaces de navegación.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Título de la sección A',
        items: [
          { text: 'Item A', link: '/item-a' },
          { text: 'Item B', link: '/item-b' },
          ...
        ]
      },
      {
        text: 'Título de la sección B',
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

Cada `link` debe especificar la ruta al archivo en sí comenzando con `/`.
Si agrega una barra al final del enlace, mostrará el `index.md` del directorio correspondiente.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Guia',
        items: [
          // Esto muestra la página `/guide/index.md`.
          { text: 'Introducción', link: '/guide/' }
        ]
      }
    ]
  }
}
```

Puede anidar aún más elementos de la barra lateral hasta 6 niveles de profundidad contando desde el nivel raíz. Tenga en cuenta que los niveles superiores a 6 se ignorarán y no se mostrarán en la barra lateral.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Nivel 1',
        items: [
          {
            text: 'Nivel 2',
            items: [
              {
                text: 'Nivel 3',
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

## Varias Barras Laterales {#multiple-sidebars}

Puedes mostrar una barra lateral diferente según la ruta de la página. Por ejemplo, como se muestra en este sitio, es posible que desee crear secciones separadas de contenido en su documentación, como la página "Guía" y la página "Configuración".

Para hacer esto, primero organice sus páginas en directorios para cada sección deseada:

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

Luego actualice su configuración para definir su barra lateral para cada sección. Esta vez debes pasar un objeto en lugar de un array.

```js
export default {
  themeConfig: {
    sidebar: {
      // Esta barra lateral se muestra cuando un usuario
      // está en el directorio `guide`.
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

      // Esta barra lateral se muestra cuando un usuario
      // está en el directorio `config`.
      '/config/': [
        {
          text: 'Configuración',
          items: [
            { text: 'Índice', link: '/config/' },
            { text: 'Tres', link: '/config/three' },
            { text: 'Cuatro', link: '/config/four' }
          ]
        }
      ]
    }
  }
}
```

## Grupos Retráctiles en la Barra Lateral {#collapsible-sidebar-groups}

Adicionando una opción `collapsed` al grupo de la barra lateral, muestra un botón para ocultar/mostrar cada sección

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Título de la sección A',
        collapsed: false,
        items: [...]
      }
    ]
  }
}
```

Todas las secciones están 'abiertas' de forma predeterminada. Si desea que estén 'cerrados' al cargar la página inicial, configure la opción `collapsed` como `true`.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Título de la sección A',
        collapsed: true,
        items: [...]
      }
    ]
  }
}
```

## `useSidebar` <Badge type="info" text="composable" />

Devuelve datos relacionados con la barra lateral. El objeto devuelto tiene el siguiente tipo:

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
  <div v-if="hasSidebar">Sólo visible cuando existe la barra lateral</div>
</template>
```
