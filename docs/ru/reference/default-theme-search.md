---
outline: deep
---

# Поиск {#search}

## Локальный поиск {#local-search}

VitePress поддерживает нечёткий полнотекстовый поиск с использованием внутрибраузерного индекса благодаря [MiniSearch](https://github.com/lucaong/minisearch/). Чтобы включить эту функцию, просто установите значение `'local'` для опции `themeConfig.search.provider` в файле `.vitepress/config.ts`:

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

Пример результата:

![скриншот модального окна поиска](/search.png)

В качестве альтернативы можно использовать [Algolia DocSearch](#algolia-search) или некоторые плагины сообщества, например:

- <https://www.npmjs.com/package/vitepress-plugin-search>
- <https://www.npmjs.com/package/vitepress-plugin-pagefind>
- <https://www.npmjs.com/package/@orama/plugin-vitepress>

### i18n {#local-search-i18n}

Пример конфигурации для использования многоязычного поиска:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        locales: {
          ru: { // используйте ключ `root`, если хотите перевести локаль по умолчанию
            translations: {
              button: {
                buttonText: 'Поиск',
                buttonAriaLabel: 'Поиск'
              },
              modal: {
                displayDetails: 'Отобразить подробный список',
                resetButtonTitle: 'Сбросить поиск',
                backButtonTitle: 'Закрыть поиск',
                noResultsText: 'Нет результатов по запросу',
                footer: {
                  selectText: 'выбрать',
                  selectKeyAriaLabel: 'выбрать',
                  navigateText: 'перейти',
                  navigateUpKeyAriaLabel: 'стрелка вверх',
                  navigateDownKeyAriaLabel: 'стрелка вниз',
                  closeText: 'закрыть',
                  closeKeyAriaLabel: 'esc'
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

### Параметры MiniSearch {#minisearch-options}

Вы можете настроить MiniSearch следующим образом:

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

Подробнее в [документации MiniSearch](https://lucaong.github.io/minisearch/classes/MiniSearch.MiniSearch.html).

### Пользовательский рендерер содержимого {#custom-content-renderer}

Вы можете настроить функцию, используемую для отображения содержимого в формате Markdown перед его индексацией:

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
          // возвращаем html
        }
      }
    }
  }
})
```

Эта функция будет очищена от данных сайта на стороне клиента, поэтому вы можете использовать в ней API Node.js.

#### Пример: Исключение страниц из поиска {#example-excluding-pages-from-search}

Вы можете исключить страницы из поиска, добавив `search: false` в блок метаданных страницы. Альтернативный вариант:

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

::: warning ПРИМЕЧАНИЕ
В случае, если предоставляется пользовательская функция `_render`, вам нужно самостоятельно обработать заголовок `search: false`. Кроме того, объект `env` не будет полностью заполнен до вызова `md.renderAsync`, поэтому любые проверки необязательных свойств `env`, таких как `frontmatter`, должны быть выполнены после этого.
:::

#### Пример: Преобразование содержимого - добавление якорей {#example-transforming-content-adding-anchors}

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

## Поиск Algolia {#algolia-search}

VitePress поддерживает поиск в вашей документации с помощью [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch). Обратитесь к руководству по началу работы. В файле `.vitepress/config.ts` вам нужно будет указать, по крайней мере, следующее, чтобы всё работало:

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

Пример конфигурации для использования многоязычного поиска:

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
          ru: {
            placeholder: 'Поиск в документации',
            translations: {
              button: {
                buttonText: 'Поиск',
                buttonAriaLabel: 'Поиск'
              },
              modal: {
                searchBox: {
                  resetButtonTitle: 'Сбросить поиск',
                  resetButtonAriaLabel: 'Сбросить поиск',
                  cancelButtonText: 'Отменить поиск',
                  cancelButtonAriaLabel: 'Отменить поиск'
                },
                startScreen: {
                  recentSearchesTitle: 'История поиска',
                  noRecentSearchesText: 'Нет истории поиска',
                  saveRecentSearchButtonTitle: 'Сохранить в истории поиска',
                  removeRecentSearchButtonTitle: 'Удалить из истории поиска',
                  favoriteSearchesTitle: 'Избранное',
                  removeFavoriteSearchButtonTitle: 'Удалить из избранного'
                },
                errorScreen: {
                  titleText: 'Невозможно получить результаты',
                  helpText:
                    'Вам может потребоваться проверить подключение к Интернету'
                },
                footer: {
                  selectText: 'выбрать',
                  navigateText: 'перейти',
                  closeText: 'закрыть',
                  searchByText: 'поставщик поиска'
                },
                noResultsScreen: {
                  noResultsText: 'Нет результатов для',
                  suggestedQueryText: 'Вы можете попытаться узнать',
                  reportMissingResultsText:
                    'Считаете, что поиск даёт ложные результаты？',
                  reportMissingResultsLinkText:
                    'Нажмите на кнопку «Обратная связь»'
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

[Эти параметры](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts) можно переопределить. Чтобы узнать о них больше, обратитесь к официальной документации Algolia.

### Конфигурация поискового робота {#crawler-config}

Вот пример конфигурации, основанной на той, что используется на этом сайте:

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
