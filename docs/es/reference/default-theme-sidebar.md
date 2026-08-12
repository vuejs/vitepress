---
description: Configura la navegación de la barra lateral en el tema predeterminado de VitePress con grupos, secciones plegables y múltiples barras laterales.
---

# Barra Lateral {#sidebar}

La barra lateral es el bloque de navegación principal de su documentación. Puede configurar el menú de la barra lateral en [`themeConfig.sidebar`](./default-theme-config#sidebar).

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Guía',
        items: [
          { text: 'Introducción', link: '/introduccion' },
          { text: 'Comenzar', link: '/comenzar' },
          ...
        ]
      }
    ]
  }
}
```

## Conceptos básicos {#the-basics}

La forma más sencilla del menú de la barra lateral es pasar un único _array_ de enlaces. El elemento de primer nivel define la "sección" para la barra lateral. Debe contener `text`, que es el título de la sección, e `items`, que son los enlaces de navegación reales.

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

Cada `link` debe especificar la ruta al archivo real comenzando con `/`. Si agrega una barra al final del enlace, se mostrará el `index.md` del directorio correspondiente.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Guía',
        items: [
          // Esto muestra la página `/guia/index.md`.
          { text: 'Introducción', link: '/guia/' }
        ]
      }
    ]
  }
}
```

Puede anidar aún más los _items_ (elementos) de la barra lateral hasta 6 niveles de profundidad contando desde el nivel raíz. Tenga en cuenta que los niveles de elementos anidados superiores a 6 se ignorarán y no se mostrarán en la barra lateral.

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

## Múltiples barras laterales {#multiple-sidebars}

Puede mostrar una barra lateral diferente dependiendo de la ruta de la página. Por ejemplo, como se muestra en este sitio, es posible que desee crear secciones de contenido separadas en su documentación, como la página "Guía" y la página "Configuración".

Para hacerlo, primero organice sus páginas en directorios para cada sección deseada:

```
.
├─ guia/
│  ├─ index.md
│  ├─ uno.md
│  └─ dos.md
└─ configuracion/
   ├─ index.md
   ├─ tres.md
   └─ cuatro.md
```

Luego, actualice su configuración para definir su barra lateral para cada sección. Esta vez, debe pasar un objeto en lugar de un `array`.

```js
export default {
  themeConfig: {
    sidebar: {
      // Esta barra lateral se muestra cuando un usuario
      // está en el directorio `guia`.
      '/guia/': [
        {
          text: 'Guía',
          items: [
            { text: 'Índice', link: '/guia/' },
            { text: 'Uno', link: '/guia/uno' },
            { text: 'Dos', link: '/guia/dos' }
          ]
        }
      ],

      // Esta barra lateral se muestra cuando un usuario
      // está en el directorio `configuracion`.
      '/configuracion/': [
        {
          text: 'Configuración',
          items: [
            { text: 'Índice', link: '/configuracion/' },
            { text: 'Tres', link: '/configuracion/tres' },
            { text: 'Cuatro', link: '/configuracion/cuatro' }
          ]
        }
      ]
    }
  }
}
```

## Grupos de barra lateral plegables {#collapsible-sidebar-groups}

Al agregar la opción `collapsed` al grupo de la barra lateral, se muestra un botón de alternancia para ocultar/mostrar cada sección.

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

Todas las secciones están "abiertas" de forma predeterminada. Si desea que estén "cerradas" en la carga inicial de la página, configure la opción `collapsed` en `true`.

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

## Prefijo de Ruta {#path-prefix}

Cuando la estructura de su documentación tiene directorios profundos o grupos ubicados bajo el mismo subdirectorio, puede usar la opción `base` para anteponer automáticamente un prefijo de ruta a todos los `items` anidados dentro de ese grupo. Esto evita repetir el mismo prefijo de ruta para cada `link`.

La opción `base` es compatible tanto en configuraciones de múltiples barras laterales como en grupos de barras laterales anidados.

### En Múltiples Barras Laterales {#in-multiple-sidebars}

Puede definir `base` en la raíz de la configuración de una sección de la barra lateral:

```js {5}
export default {
  themeConfig: {
    sidebar: {
      '/guia/': {
        base: '/guia/',
        items: [
          // Este enlace se resuelve como `/guia/introduccion`
          { text: 'Introducción', link: 'introduccion' },
          // Este enlace se resuelve como `/guia/comenzar`
          { text: 'Comenzar', link: 'comenzar' }
        ]
      }
    }
  }
}
```

### En Grupos Anidados {#in-nested-groups}

También puede usar `base` dentro de grupos de barras laterales anidados. Se aplicará a los hijos inmediatos de ese grupo:

```js{6,13}
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Referencia',
        base: '/referencia/',
        items: [
          // Este enlace se resuelve como `/referencia/configuracion-del-sitio`
          { text: 'Configuración del sitio', link: 'configuracion-del-sitio' },
          {
            text: 'Tema predeterminado',
            // La base anidada sobrescribe el prefijo de ruta principal
            base: '/referencia/tema-predeterminado-',
            items: [
              // Este enlace se resuelve como `/referencia/tema-predeterminado-nav`
              { text: 'Nav', link: 'nav' },
              // Este enlace se resuelve como `/referencia/tema-predeterminado-sidebar`
              { text: 'Barra lateral', link: 'sidebar' }
            ]
          }
        ]
      }
    ]
  }
}
```