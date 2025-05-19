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
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
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

### Opções MiniSearch {#mini-search-options}

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
          // retorne a string HTML
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
          if (env.relativePath.startsWith('algum/caminho')) return ''
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
            return await md.renderAsync(`# ${env.frontmatter.title}`) + html
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

### i18n {#algolia-search-i18n} {#algolia-search-i18n}

Você pode usar uma configuração como esta para usar a pesquisa multilínguas:

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
        locales: {
          zh: {
            placeholder: '搜索文档',
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                searchBox: {
                  resetButtonTitle: '清除查询条件',
                  resetButtonAriaLabel: '清除查询条件',
                  cancelButtonText: '取消',
                  cancelButtonAriaLabel: '取消'
                },
                startScreen: {
                  recentSearchesTitle: '搜索历史',
                  noRecentSearchesText: '没有搜索历史',
                  saveRecentSearchButtonTitle: '保存至搜索历史',
                  removeRecentSearchButtonTitle: '从搜索历史中移除',
                  favoriteSearchesTitle: '收藏',
                  removeFavoriteSearchButtonTitle: '从收藏中移除'
                },
                errorScreen: {
                  titleText: '无法获取结果',
                  helpText: '你可能需要检查你的网络连接'
                },
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                  searchByText: '搜索提供者'
                },
                noResultsScreen: {
                  noResultsText: '无法找到相关结果',
                  suggestedQueryText: '你可以尝试查询',
                  reportMissingResultsText: '你认为该查询应该有结果？',
                  reportMissingResultsLinkText: '点击反馈'
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

[Essas opções](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts) podem ser sobrepostas. Consulte a documentação oficial Algolia para obter mais informações sobre elas.

### Configuração _Crawler_ {#crawler-config}

Aqui está um exemplo de configuração baseado na qual este site usa:

```ts
new Crawler({
  appId: '...',
  apiKey: '...',
  rateLimit: 8,
  startUrls: ['https://vitepress.dev/'],
  renderJavaScript: false,
  sitemaps: [],
  exclusionPatterns: [],
  ignoreCanonicalTo: false,
  discoveryPatterns: ['https://vitepress.dev/**'],
  schedule: 'at 05:10 on Saturday',
  actions: [
    {
      indexName: 'vitepress',
      pathsToMatch: ['https://vitepress.dev/**'],
      recordExtractor: ({ $, helpers }) => {
        return helpers.docsearch({
          recordProps: {
            lvl1: '.content h1',
            content: '.content p, .content li',
            lvl0: {
              selectors: 'section.has-active div h2',
              defaultValue: 'Documentation'
            },
            lvl2: '.content h2',
            lvl3: '.content h3',
            lvl4: '.content h4',
            lvl5: '.content h5'
          },
          indexHeadings: true
        })
      }
    }
  ],
  initialIndexSettings: {
    vitepress: {
      attributesForFaceting: ['type', 'lang'],
      attributesToRetrieve: ['hierarchy', 'content', 'anchor', 'url'],
      attributesToHighlight: ['hierarchy', 'hierarchy_camel', 'content'],
      attributesToSnippet: ['content:10'],
      camelCaseAttributes: ['hierarchy', 'hierarchy_radio', 'content'],
      searchableAttributes: [
        'unordered(hierarchy_radio_camel.lvl0)',
        'unordered(hierarchy_radio.lvl0)',
        'unordered(hierarchy_radio_camel.lvl1)',
        'unordered(hierarchy_radio.lvl1)',
        'unordered(hierarchy_radio_camel.lvl2)',
        'unordered(hierarchy_radio.lvl2)',
        'unordered(hierarchy_radio_camel.lvl3)',
        'unordered(hierarchy_radio.lvl3)',
        'unordered(hierarchy_radio_camel.lvl4)',
        'unordered(hierarchy_radio.lvl4)',
        'unordered(hierarchy_radio_camel.lvl5)',
        'unordered(hierarchy_radio.lvl5)',
        'unordered(hierarchy_radio_camel.lvl6)',
        'unordered(hierarchy_radio.lvl6)',
        'unordered(hierarchy_camel.lvl0)',
        'unordered(hierarchy.lvl0)',
        'unordered(hierarchy_camel.lvl1)',
        'unordered(hierarchy.lvl1)',
        'unordered(hierarchy_camel.lvl2)',
        'unordered(hierarchy.lvl2)',
        'unordered(hierarchy_camel.lvl3)',
        'unordered(hierarchy.lvl3)',
        'unordered(hierarchy_camel.lvl4)',
        'unordered(hierarchy.lvl4)',
        'unordered(hierarchy_camel.lvl5)',
        'unordered(hierarchy.lvl5)',
        'unordered(hierarchy_camel.lvl6)',
        'unordered(hierarchy.lvl6)',
        'content'
      ],
      distinct: true,
      attributeForDistinct: 'url',
      customRanking: [
        'desc(weight.pageRank)',
        'desc(weight.level)',
        'asc(weight.position)'
      ],
      ranking: [
        'words',
        'filters',
        'typo',
        'attribute',
        'proximity',
        'exact',
        'custom'
      ],
      highlightPreTag: '<span class="algolia-docsearch-suggestion--highlight">',
      highlightPostTag: '</span>',
      minWordSizefor1Typo: 3,
      minWordSizefor2Typos: 7,
      allowTyposOnNumericTokens: false,
      minProximity: 1,
      ignorePlurals: true,
      advancedSyntax: true,
      attributeCriteriaComputedByMinProximity: true,
      removeWordsIfNoResults: 'allOptional'
    }
  }
})
```
