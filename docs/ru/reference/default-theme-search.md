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
- <https://www.npmjs.com/package/vitepress-plugin-typesense>

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
          ru: { // используйте `root`, если хотите перевести локаль по умолчанию
            translations: {
              button: {
                buttonText: 'Поиск',
                buttonAriaLabel: 'Поиск'
              },
              modal: {
                displayDetails: 'Показать подробный список',
                resetButtonTitle: 'Сбросить поиск',
                backButtonTitle: 'Закрыть поиск',
                noResultsText: 'Нет результатов',
                footer: {
                  selectText: 'Выбрать',
                  selectKeyAriaLabel: 'Enter',
                  navigateText: 'Навигация',
                  navigateUpKeyAriaLabel: 'Стрелка вверх',
                  navigateDownKeyAriaLabel: 'Стрелка вниз',
                  closeText: 'Закрыть',
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
          // вернуть строку HTML
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
            return (await md.renderAsync(`# ${env.frontmatter.title}`)) + html
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

<details>
<summary>Нажмите, чтобы развернуть</summary>

<<< @/snippets/algolia-i18n.ts

</details>

Подробности см. в [официальной документации Algolia](https://docsearch.algolia.com/docs/api#translations). Чтобы быстрее начать, можно также скопировать переводы, используемые на этом сайте, из [нашего репозитория GitHub](https://github.com/search?q=repo:vuejs/vitepress+%22function+searchOptions%22&type=code).

### Поддержка Ask AI в Algolia {#ask-ai}

Если вы хотите добавить функцию **Ask AI**, передайте параметр `askAi` (или любые из его отдельных полей) внутри объекта `options`:

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
        // askAi: "ВАШ-ID-АССИСТЕНТА"
        // ИЛИ
        askAi: {
          // как минимум нужно указать assistantId, полученный от Algolia
          assistantId: 'XXXYYY',
          // необязательные переопределения — если их нет, используются значения appId/apiKey/indexName верхнего уровня
          // apiKey: '...',
          // appId: '...',
          // indexName: '...'
        }
      }
    }
  }
})
```

::: warning Примечание
Если вы хотите использовать обычный поиск по ключевым словам без Ask AI, просто не указывайте свойство `askAi`
:::

### Боковая панель Ask AI {#ask-ai-side-panel}

DocSearch v4.5+ поддерживает опциональную **боковую панель Ask AI**. Когда она включена, её можно открыть с помощью **Ctrl/Cmd+I** по умолчанию. [Справочник API боковой панели](https://docsearch.algolia.com/docs/sidepanel/api-reference) содержит полный список опций.

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
            // Отражает API @docsearch/sidepanel-js SidepanelProps
            panel: {
              variant: 'floating', // или 'inline'
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

Если вам нужно отключить сочетание клавиш, используйте опцию `keyboardShortcuts` боковой панели:

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

#### Режим (auto / sidePanel / hybrid / modal) {#ask-ai-mode}

Вы можете опционально контролировать, как VitePress интегрирует поиск по ключевым словам и Ask AI:

- `mode: 'auto'` (по умолчанию): выводит `hybrid`, когда настроен поиск по ключевым словам, иначе `sidePanel`, когда настроена боковая панель Ask AI.
- `mode: 'sidePanel'`: принудительно использовать только боковую панель (скрывает кнопку поиска по ключевым словам).
- `mode: 'hybrid'`: включает модальное окно поиска по ключевым словам + боковую панель Ask AI (требует настройки поиска по ключевым словам).
- `mode: 'modal'`: сохраняет Ask AI внутри модального окна DocSearch (даже если вы настроили боковую панель).

#### Только Ask AI (без поиска по ключевым словам) {#ask-ai-only}

Если вы хотите использовать **только боковую панель Ask AI**, вы можете опустить конфигурацию поиска по ключевым словам верхнего уровня и предоставить учётные данные в `askAi`:

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

### Конфигурация поискового робота {#crawler-config}

Вот пример конфигурации, основанной на той, что используется на этом сайте:

<<< @/snippets/algolia-crawler.js
