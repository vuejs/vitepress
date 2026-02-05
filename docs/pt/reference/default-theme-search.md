---
outline: deep
---

# Pesquisa {#search}

## Pesquisa Local {#local-search}

VitePress oferece suporte à pesquisa de texto completa usando um índice no navegador graças ao [minisearch](https://github.com/lucaong/minisearch/). Para habilitar esse recurso, basta definir a opção `themeConfig.search.provider` como `'local'` no arquivo `.vitepress/config.ts`:

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

Exemplo de resultado:

![captura de tela do modal de pesquisa](/search.png)

Alternativamente, você pode usar [Algolia DocSearch](#algolia-search) ou alguns plugins da comunidade como <https://www.npmjs.com/package/vitepress-plugin-search> ou <https://www.npmjs.com/package/vitepress-plugin-pagefind>.

### i18n {#local-search-i18n}

Você pode usar uma configuração como esta para usar a pesquisa multilínguas:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        locales: {
          pt: { // torne isto `root` se quiser traduzir a localidade padrão
            translations: {
              button: {
                buttonText: 'Pesquisar',
                buttonAriaLabel: 'Pesquisar'
              },
              modal: {
                displayDetails: 'Mostrar lista detalhada',
                resetButtonTitle: 'Redefinir pesquisa',
                backButtonTitle: 'Fechar pesquisa',
                noResultsText: 'Nenhum resultado',
                footer: {
                  selectText: 'Selecionar',
                  selectKeyAriaLabel: 'Enter',
                  navigateText: 'Navegar',
                  navigateUpKeyAriaLabel: 'Seta para cima',
                  navigateDownKeyAriaLabel: 'Seta para baixo',
                  closeText: 'Fechar',
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

### Opções MiniSearch {#minisearch-options}

Você pode configurar o MiniSearch assim:

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

Saiba mais na [documentação do MiniSearch](https://lucaong.github.io/minisearch/classes/MiniSearch.MiniSearch.html).

### Apresentador de Conteúdo Personalizado {#custom-content-renderer}

Você pode personalizar a função usada para apresentar o conteúdo markdown antes de indexá-lo:

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
          // retorna uma string HTML
        }
      }
    }
  }
})
```

Essa função será removida dos dados do site no lado do cliente, então você pode usar APIs do Node.js nela.

#### Exemplo: Excluindo páginas da pesquisa {#example-excluding-pages-from-search}

Você pode excluir páginas da pesquisa adicionando `search: false` ao frontmatter da página. Alternativamente:

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
No caso uma função `_render` personalizada ser fornecida, você precisa manipular o `search: false` do frontmatter por conta própria. Além disso, o objeto `env` não estará completamente populado antes que `md.renderAsync` seja chamado, então verificações em propriedades opcionais `env`, como `frontmatter`, devem ser feitas após isso.
:::

#### Exemplo: Transformando conteúdo - adicionando âncoras {#example-transforming-content-adding-anchors}

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

## Pesquisa Algolia {#algolia-search}

VitePress oferece suporte à pesquisa em seu site de documentação usando [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch). Consulte o guia de início deles. Em seu arquivo `.vitepress/config.ts`, você precisará fornecer pelo menos o seguinte para que funcione:

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

Você pode usar uma configuração como esta para usar a pesquisa multilínguas:

<details>
<summary>Clique para expandir</summary>

<<< @/snippets/algolia-i18n.ts

</details>

Consulte a [documentação oficial da Algolia](https://docsearch.algolia.com/docs/api#translations) para saber mais. Para começar rapidamente, você também pode copiar as traduções usadas por este site do [nosso repositório no GitHub](https://github.com/search?q=repo:vuejs/vitepress+%22function+searchOptions%22&type=code).

### Suporte ao Algolia Ask AI {#ask-ai}

Se quiser incluir o **Ask AI**, adicione `askAi` em `options`:

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
        // askAi: "SEU-ID-DO-ASSISTENTE"
        // OU
        askAi: {
          // no mínimo, você deve fornecer o assistantId recebido da Algolia
          assistantId: 'XXXYYY',
          // substituições opcionais — se omitidas, os valores appId/apiKey/indexName de nível superior são reutilizados
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
Caso queira apenas a pesquisa por palavra-chave, omita `askAi`.
:::

### Painel Lateral do Ask AI {#ask-ai-side-panel}

O DocSearch v4.5+ suporta um **painel lateral do Ask AI** opcional. Quando habilitado, pode ser aberto com **Ctrl/Cmd+I** por padrão. A [Referência da API do Painel Lateral](https://docsearch.algolia.com/docs/sidepanel/api-reference) contém a lista completa de opções.

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
            // Espelha a API do @docsearch/sidepanel-js SidepanelProps
            panel: {
              variant: 'floating', // ou 'inline'
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

Se precisar desabilitar o atalho de teclado, use a opção `keyboardShortcuts` do painel lateral:

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

Você pode controlar opcionalmente como o VitePress integra a pesquisa por palavra-chave e o Ask AI:

- `mode: 'auto'` (padrão): infere `hybrid` quando a pesquisa por palavra-chave está configurada, caso contrário `sidePanel` quando o painel lateral do Ask AI está configurado.
- `mode: 'sidePanel'`: força apenas o painel lateral (oculta o botão de pesquisa por palavra-chave).
- `mode: 'hybrid'`: habilita o modal de pesquisa por palavra-chave + painel lateral do Ask AI (requer configuração de pesquisa por palavra-chave).
- `mode: 'modal'`: mantém o Ask AI dentro do modal do DocSearch (mesmo se você configurou o painel lateral).

#### Apenas Ask AI (sem pesquisa por palavra-chave) {#ask-ai-only}

Se quiser usar **apenas o painel lateral do Ask AI**, você pode omitir a configuração de pesquisa por palavra-chave de nível superior e fornecer as credenciais em `askAi`:

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

### Configuração _Crawler_ {#crawler-config}

Aqui está um exemplo de configuração baseado na qual este site usa:

<<< @/snippets/algolia-crawler.js
