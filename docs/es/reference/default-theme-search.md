---
outline: deep
---

# Buscar {#search}

## Busqueda local {#local-search}

VitePress admite la búsqueda de texto completo utilizando un índice en el navegador gracias a [minisearch](https://github.com/lucaong/minisearch/). Para habilitar esta función, simplemente configure la opción `themeConfig.search.provider` como `'local'` en el archivo `.vitepress/config.ts`:

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

![captura de pantalla del modo de búsqueda](/search.png)

Alternativamente, puedes usar [Algolia DocSearch](#algolia-search) o algunos complementos comunitarios como <https://www.npmjs.com/package/vitepress-plugin-search> o <https://www.npmjs.com/package/vitepress-plugin-pagefind>.

### i18n {#local-search-i18n}

Puede utilizar una configuración como esta para utilizar la búsqueda multilingüe:

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

### Opciones MiniSearch {#minisearch-options}

Puedes configurar MiniSearch de esta manera:

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

Obtenga más información en [documentación de MiniSearch](https://lucaong.github.io/minisearch/classes/MiniSearch.MiniSearch.html).

### Presentador de contenido personalizado {#custom-content-renderer}

Puedes personalizar la función utilizada para presentar el contenido de rebajas antes de indexarlo:

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

Esta función se eliminará de los datos del sitio web en el lado del cliente, por lo que podrá utilizar las API de Node.js en ella.

#### Ejemplo: Excluir páginas de la busqueda {#example-excluding-pages-from-search}

Puedes excluir páginas de la busqueda adicionando `search: false` al principio de la página. Alternativamente:

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
          if (env.relativePath.startsWith('some/path')) return ''
          return html
        }
      }
    }
  }
})
```

::: warning Nota
En este caso, una función `_render` se proporciona, es necesario manipular el `search: false` desde el frente por su cuenta. Además, el objeto `env` no estará completamente poblado antes que `md.renderAsync` se llama, luego verifica las propiedades opcionales `env`, como `frontmatter`, debe hacerse después de eso.
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

## Busqueda de Algolia {#algolia-search}

VitePress admite la búsqueda en su sitio de documentación utilizando [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch). Consulte su guía de introducción. en tu archivo `.vitepress/config.ts`, Deberá proporcionar al menos lo siguiente para que funcione:

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

Puedes utilizar una configuración como esta para utilizar la búsqueda multilingüe:

<details>
<summary>Haz clic para expandir</summary>

<<< @/snippets/algolia-i18n.ts

</details>

Consulta la [documentación oficial de Algolia](https://docsearch.algolia.com/docs/api#translations) para conocer más detalles. Para empezar rápidamente, también puedes copiar las traducciones usadas por este sitio desde [nuestro repositorio de GitHub](https://github.com/search?q=repo:vuejs/vitepress+%22function+searchOptions%22&type=code).

### Algolia Ask AI Support {#ask-ai}

Si deseas incluir **Ask AI**, pasa la opción `askAi` (o alguno de sus campos parciales) dentro de `options`:

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
        // askAi: "TU-ID-DE-ASISTENTE"
        // O
        askAi: {
          // como mínimo debes proporcionar el assistantId que recibiste de Algolia
          assistantId: 'XXXYYY',
          // anulaciones opcionales — si se omiten, se reutilizan los valores appId/apiKey/indexName de nivel superior
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
Si prefieres solo la búsqueda por palabra clave y no la Ask AI, simplemente omite `askAi`.
:::

### Panel lateral de Ask AI {#ask-ai-side-panel}

DocSearch v4.5+ admite un **panel lateral de Ask AI** opcional. Cuando está habilitado, se puede abrir con **Ctrl/Cmd+I** por defecto. La [Referencia de API del Panel Lateral](https://docsearch.algolia.com/docs/sidepanel/api-reference) contiene la lista completa de opciones.

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
            // Refleja la API de @docsearch/sidepanel-js SidepanelProps
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

Si necesitas deshabilitar el atajo de teclado, usa la opción `keyboardShortcuts` del panel lateral:

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

Puedes controlar opcionalmente cómo VitePress integra la búsqueda por palabra clave y Ask AI:

- `mode: 'auto'` (por defecto): infiere `hybrid` cuando la búsqueda por palabra clave está configurada, de lo contrario `sidePanel` cuando el panel lateral de Ask AI está configurado.
- `mode: 'sidePanel'`: fuerza solo el panel lateral (oculta el botón de búsqueda por palabra clave).
- `mode: 'hybrid'`: habilita el modal de búsqueda por palabra clave + panel lateral de Ask AI (requiere configuración de búsqueda por palabra clave).
- `mode: 'modal'`: mantiene Ask AI dentro del modal de DocSearch (incluso si configuraste el panel lateral).

#### Solo Ask AI (sin búsqueda por palabra clave) {#ask-ai-only}

Si quieres usar **solo el panel lateral de Ask AI**, puedes omitir la configuración de búsqueda por palabra clave de nivel superior y proporcionar las credenciales bajo `askAi`:

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

### Configuración _Crawler_ {#crawler-config}

A continuación se muestra un ejemplo de la configuración que utiliza este sitio:

<<< @/snippets/algolia-crawler.js
