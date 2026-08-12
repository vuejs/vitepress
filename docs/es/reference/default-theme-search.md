---
outline: deep
description: Configura la búsqueda local o impulsada por Algolia para tu sitio VitePress.
---

# Búsqueda {#search}

## Búsqueda Local {#local-search}

VitePress admite la búsqueda de texto completo difusa utilizando un índice en el navegador gracias a [minisearch](https://github.com/lucaong/minisearch/). Para habilitar esta característica, simplemente configure la opción `themeConfig.search.provider` como `'local'` en su archivo `.vitepress/config.ts`:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local'
    }
  }
})
```

Resultado de ejemplo:

![captura de pantalla del modal de búsqueda](/search.png)

Alternativamente, puede usar [Algolia DocSearch](#algolia-search) o algunos complementos de la comunidad como:

- <https://www.npmjs.com/package/vitepress-plugin-search>
- <https://www.npmjs.com/package/vitepress-plugin-pagefind>
- <https://www.npmjs.com/package/@orama/plugin-vitepress>
- <https://www.npmjs.com/package/vitepress-plugin-typesense>

### i18n {#local-search-i18n}

Puede usar una configuración como esta para utilizar la búsqueda multilingüe:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        locales: {
          es: { // usa `root` si quieres traducir la configuración regional predeterminada
            translations: {
              button: {
                buttonText: 'Buscar',
                buttonAriaLabel: 'Buscar'
              },
              modal: {
                displayDetails: 'Mostrar lista detallada',
                resetButtonTitle: 'Restablecer búsqueda',
                backButtonTitle: 'Cerrar búsqueda',
                noResultsText: 'No hay resultados',
                footer: {
                  selectText: 'Seleccionar',
                  selectKeyAriaLabel: 'Intro',
                  navigateText: 'Navegar',
                  navigateUpKeyAriaLabel: 'Flecha arriba',
                  navigateDownKeyAriaLabel: 'Flecha abajo',
                  closeText: 'Cerrar',
                  closeKeyAriaLabel: 'Esc'
                }
              }
            }
          }
        }
      }
    }
  }
})
```

### Opciones de MiniSearch {#minisearch-options}

Puede configurar MiniSearch de esta manera:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          /**
           * @type {Pick<import('minisearch').Options, 'extractField' | 'tokenize' | 'processTerm'>}
           */
          options: {
            /* ... */
          },
          /**
           * @type {import('minisearch').SearchOptions}
           * @default
           * { fuzzy: 0.2, prefix: true, boost: { title: 4, text: 2, titles: 1 } }
           */
          searchOptions: {
            /* ... */
          }
        }
      }
    }
  }
})
```

Obtenga más información en la [documentación de MiniSearch](https://lucaong.github.io/minisearch/classes/MiniSearch.MiniSearch.html).

### Renderizador de contenido personalizado

Puede personalizar la función utilizada para renderizar el contenido Markdown antes de indexarlo:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        /**
         * @param {string} src
         * @param {import('vitepress').MarkdownEnv} env
         * @param {import('markdown-it-async')} md
         */
        async _render(src, env, md) {
          // devuelve una cadena HTML
        }
      }
    }
  }
})
```

Esta función se eliminará de los datos del sitio en el lado del cliente, por lo que puede utilizar las API de Node.js en ella.

#### Ejemplo: Excluir páginas de la búsqueda {#example-excluding-pages-from-search}

Puede excluir páginas de la búsqueda añadiendo `search: false` en el `frontmatter` de la página. Alternativamente:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        async _render(src, env, md) {
          const html = await md.renderAsync(src, env)
          if (env.frontmatter?.search === false) return ''
          if (env.relativePath.startsWith('alguna/ruta')) return ''
          return html
        }
      }
    }
  }
})
```

::: warning Nota
En caso de que se proporcione una función `_render` personalizada, deberá gestionar el `frontmatter` `search: false` por su cuenta. Además, el objeto `env` no estará completamente poblado antes de que se llame a `md.renderAsync`, por lo que cualquier comprobación de las propiedades opcionales de `env`, como `frontmatter`, debe realizarse después de eso.
:::

#### Ejemplo: Transformar contenido - agregar anclajes {#example-transforming-content-adding-anchors}

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        async _render(src, env, md) {
          const html = await md.renderAsync(src, env)
          if (env.frontmatter?.title)
            return (await md.renderAsync(`# ${env.frontmatter.title}`)) + html
          return html
        }
      }
    }
  }
})
```

## Búsqueda de Algolia {#algolia-search}

VitePress admite la búsqueda en su sitio de documentación utilizando [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch). Consulte su guía para comenzar. En su archivo `.vitepress/config.ts`, deberá proporcionar al menos lo siguiente para que funcione:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'algolia',
      options: {
        appId: '...',
        apiKey: '...',
        indexName: '...'
      }
    }
  }
})
```

### i18n {#algolia-search-i18n}

Puede usar una configuración como esta para utilizar la búsqueda multilingüe:

<details>
<summary>Ver ejemplo completo</summary>

<<< @/snippets/algolia-i18n.ts

</details>

Consulte la [documentación oficial de Algolia](https://docsearch.algolia.com/docs/api#translations) para obtener más información al respecto. Para comenzar rápidamente, también puede copiar las traducciones utilizadas por este sitio desde [nuestro repositorio de GitHub](https://github.com/search?q=repo:vuejs/vitepress+%22function+searchOptions%22&type=code).

### Soporte de Ask AI de Algolia {#ask-ai}

Si desea incluir **Ask AI**, pase la opción `askAi` (o cualquiera de los campos parciales) dentro de `options`:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'algolia',
      options: {
        appId: '...',
        apiKey: '...',
        indexName: '...',
        // askAi: "ID-DE-SU-ASISTENTE"
        // O
        askAi: {
          // como mínimo debe proporcionar el assistantId que recibió de Algolia
          assistantId: 'XXXYYY',
          // anulaciones opcionales - si se omiten, se reutilizan los valores appId/apiKey/indexName de nivel superior
          // apiKey: '...',
          // appId: '...',
          // indexName: '...'
        }
      }
    }
  }
})
```

::: warning Nota
Si desea utilizar la búsqueda por palabras clave de forma predeterminada y no desea utilizar Ask AI, omita la propiedad `askAi`.
:::

### Panel lateral de Ask AI {#ask-ai-side-panel}

DocSearch v4.5+ admite un **panel lateral de Ask AI** opcional. Cuando está habilitado, se puede abrir con **Ctrl/Cmd+I** de forma predeterminada. La [Referencia de la API del Panel Lateral](https://docsearch.algolia.com/docs/sidepanel/api-reference) contiene la lista completa de opciones.

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'algolia',
      options: {
        appId: '...',
        apiKey: '...',
        indexName: '...',
        askAi: {
          assistantId: 'XXXYYY',
          sidePanel: {
            panel: {
              variant: 'floating', // o 'inline'
              side: 'right',
              width: '360px',
              expandedWidth: '580px',
              suggestedQuestions: true
            }
          }
        }
      }
    }
  }
})
```

Utilice `askAi.sidePanel.panel.suggestedQuestions` para las preguntas sugeridas del panel lateral. Los ejemplos independientes de Ask AI de Algolia también mencionan `askAi.suggestedQuestions`, pero esa opción de nivel superior no es suficiente para el modo de panel lateral de VitePress y no hace que el modal integrado de búsqueda por palabras clave muestre las preguntas sugeridas al abrirse por primera vez.

Si necesita deshabilitar el atajo de teclado, use la opción `keyboardShortcuts` en el nivel raíz del panel lateral:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'algolia',
      options: {
        appId: '...',
        apiKey: '...',
        indexName: '...',
        askAi: {
          assistantId: 'XXXYYY',
          sidePanel: {
            keyboardShortcuts: {
              'Ctrl/Cmd+I': false
            }
          }
        }
      }
    }
  }
})
```

#### Modo (auto / sidePanel / hybrid / modal) {#ask-ai-mode}

Opcionalmente puede controlar cómo VitePress integra la búsqueda por palabras clave y Ask AI:

- `mode: 'auto'` (predeterminado): infiere `hybrid` cuando la búsqueda por palabras clave está configurada, de lo contrario `sidePanel` cuando el panel lateral de Ask AI está configurado.
- `mode: 'sidePanel'`: fuerza solo el panel lateral (oculta el botón de búsqueda por palabras clave).
- `mode: 'hybrid'`: habilita el modal de búsqueda por palabras clave + panel lateral de Ask AI (requiere configuración de búsqueda por palabras clave).
- `mode: 'modal'`: mantiene Ask AI dentro del modal de DocSearch (incluso si configuró el panel lateral).

#### Solo Ask AI (sin búsqueda por palabras clave) {#ask-ai-only}

Si desea usar **solo el panel lateral de Ask AI**, puede omitir la configuración de búsqueda por palabras clave de nivel superior y proporcionar las credenciales bajo `askAi`:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'algolia',
      options: {
        mode: 'sidePanel',
        askAi: {
          assistantId: 'XXXYYY',
          appId: '...',
          apiKey: '...',
          indexName: '...',
          sidePanel: true
        }
      }
    }
  }
})
```

### Configuración de _Crawler_ {#crawler-config}

A continuación se muestra un ejemplo de configuración basado en lo que usa este sitio:

<<< @/snippets/algolia-crawler.js