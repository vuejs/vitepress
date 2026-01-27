---
outline: deep
---

# جستجو {#search}

## جستجوی محلی {#local-search}

ویت‌پرس از جستجوی متن کامل نامتقارن با استفاده از یک فهرست در مرورگر با تشکر از [minisearch](https://github.com/lucaong/minisearch/) پشتیبانی می‌کند. برای فعال‌سازی این ویژگی، کافی است گزینه `themeConfig.search.provider` را به `'local'` در فایل `.vitepress/config.ts` خود تنظیم کنید:

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

نمونه نتیجه:

![تصویر نمایشی از مودال جستجو](/search.png)

همچنین، می‌توانید از [Algolia DocSearch](#algolia-search) یا برخی افزونه‌های جامعه‌ای مانند <https://www.npmjs.com/package/vitepress-plugin-search> یا <https://www.npmjs.com/package/vitepress-plugin-pagefind> استفاده کنید.

### بین‌المللی‌سازی {#local-search-i18n}

می‌توانید با استفاده از تنظیماتی مانند این برای جستجوی چندزبانه استفاده کنید:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: { // اگر می‌خواهید زبان پیش‌فرض را ترجمه کنید، این را به `root` تغییر دهید
            translations: {
              button: {
                buttonText: 'جستجو',
                buttonAriaLabel: 'جستجو'
              },
              modal: {
                displayDetails: 'نمایش جزئیات',
                resetButtonTitle: 'بازنشانی جستجو',
                backButtonTitle: 'بستن جستجو',
                noResultsText: 'نتیجه‌ای یافت نشد',
                footer: {
                  selectText: 'انتخاب',
                  selectKeyAriaLabel: 'ورود',
                  navigateText: 'پیمایش',
                  navigateUpKeyAriaLabel: 'کلید بالا',
                  navigateDownKeyAriaLabel: 'کلید پایین',
                  closeText: 'بستن',
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

### گزینه‌های miniSearch {#minisearch-options}

می‌توانید MiniSearch را به این صورت پیکربندی کنید:

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

برای کسب اطلاعات بیشتر به [اسناد MiniSearch](https://lucaong.github.io/minisearch/classes/MiniSearch.MiniSearch.html) مراجعه کنید.

### سفارشی‌سازی رندر محتوا {#custom-content-renderer}

می‌توانید تابع استفاده شده برای رندر محتوای Markdown قبل از فهرست‌بندی آن را سفارشی‌سازی کنید:

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
          // بازگشت رشته HTML
        }
      }
    }
  }
})
```

این تابع از داده‌های سایت سمت کلاینت پاک خواهد شد، بنابراین شما می‌توانید از API‌های Node.js در آن استفاده کنید.

#### مثال: استثنای صفحات از جستجو {#example-excluding-pages-from-search}

می‌توانید با اضافه کردن `search: false` به frontmatter صفحه، صفحات را از جستجو استثنا دهید. به طور جایگزین:

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

::: warning توجه
در صورت ارائه تابع `_render` سفارشی، باید خودتان بررسی کنید که آیا frontmatter `search: false` را مدیریت می‌کند یا خیر. همچنین، شی env قبل از فراخوانی `md.renderAsync` کاملاً پر نمی‌شود، بنابراین هر بررسی‌ای روی ویژگی‌های اختیاری env مانند `frontmatter` باید بعد از آن انجام شود.
:::

#### مثال: تبدیل محتوا - افزودن لینک‌های صفحه {#example-transforming-content-adding-anchors}

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

## جستجوی Algolia {#algolia-search}

ویت‌پرس از جستجو در سایت مستندات شما با استفاده از [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch) پشتیبانی می‌کند. به راهنمای شروع کار آن‌ها مراجعه کنید. در فایل `.vitepress/config.ts` شما نیاز دارید که حداقل موارد زیر را فراهم کنید تا کار کند:

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

### بین‌المللی‌سازی {#algolia-search-i18n}

می‌توانید با استفاده از تنظیماتی مانند این برای جستجوی چندزبانه استفاده کنید:

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
                  resetButtonTitle: '清除搜索条件',
                  resetButtonAriaLabel: '清除搜索条件',
                  cancelButtonText: '取消',
                  cancelButtonAriaLabel: '取消'
                },
                startScreen: {
                  recentSearchesTitle: '最近搜索',
                  noRecentSearchesText: '没有最近搜索',
                  saveRecentSearchButtonTitle: '保存到最近搜索',
                  removeRecentSearchButtonTitle: '从最近搜索中删除'
                },
                errorScreen: {
                  titleText: '无法显示结果',
                  helpText: '您可能需要检查您的互联网连接'
                },
                footer: {
                  selectText: '选择',
                  navigateText: '导航',
                  closeText: '关闭',
                  searchByText: '搜索由'
                },
                noResultsScreen: {
                  noResultsText: '没有找到结果',
                  suggestedQueryText: '您可以尝试',
                  reportMissingResultsText: '您认为应该有结果吗？',
                  reportMissingResultsLinkText: '点击这里报告'
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

این [گزینه‌ها](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts) می‌توانند بازنویسی شوند. برای یادگیری بیشتر درباره آن‌ها به اسناد رسمی Algolia مراجعه کنید.

### پیکربندی Crawler {#crawler-config}

در اینجا یک پیکربندی نمونه بر اساس آنچه که این سایت استفاده می‌کند آمده است:

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
              selectors: '',
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

### پشتیبانی Algolia Ask AI {#ask-ai}

برای فعال‌سازی **Ask AI** کافی است گزینه `askAi` را اضافه کنید:

```ts
options: {
  appId: '...',
  apiKey: '...',
  indexName: '...',
  askAi: {
    assistantId: 'XXXYYY'
  }
}
```

::: warning نکته
اگر فقط به جستجوی کلمات کلیدی نیاز دارید، `askAi` را اضافه نکنید.
:::

ترجمه‌های Ask AI درون **مودال** در `options.translations.modal.askAiScreen` و `options.translations.modal.resultsScreen` قرار دارند — برای تمام کلیدها به [تعاریف نوع](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts) مراجعه کنید.

### پنل کناری Ask AI {#ask-ai-side-panel}

DocSearch v4.5+ از **پنل کناری Ask AI** اختیاری پشتیبانی می‌کند. وقتی فعال باشد، به طور پیش‌فرض می‌توان آن را با **Ctrl/Cmd+I** باز کرد. [مرجع API پنل کناری](https://docsearch.algolia.com/docs/sidepanel/api-reference) شامل لیست کامل گزینه‌ها است.

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
            // آینه API @docsearch/sidepanel-js SidepanelProps
            panel: {
              variant: 'floating', // یا 'inline'
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

اگر نیاز به غیرفعال کردن میانبر صفحه‌کلید دارید، از گزینه `keyboardShortcuts` پنل کناری استفاده کنید:

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

#### i18n پنل کناری

ترجمه‌های پنل کناری در `options.askAi.sidePanel.panel.translations` پیکربندی می‌شوند. برای ساختار کامل به [تعاریف نوع](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts) مراجعه کنید.

### حالت (auto / sidePanel / hybrid / modal) {#ask-ai-mode}

می‌توانید به صورت اختیاری نحوه ادغام جستجوی کلمات کلیدی و Ask AI در VitePress را کنترل کنید:

- `mode: 'auto'` (پیش‌فرض): وقتی جستجوی کلمات کلیدی پیکربندی شده باشد `hybrid` را استنباط می‌کند، در غیر این صورت وقتی پنل کناری Ask AI پیکربندی شده باشد `sidePanel` را استنباط می‌کند.
- `mode: 'sidePanel'`: فقط پنل کناری را اعمال می‌کند (دکمه جستجوی کلمات کلیدی را پنهان می‌کند).
- `mode: 'hybrid'`: مودال جستجوی کلمات کلیدی + پنل کناری Ask AI را فعال می‌کند (نیاز به پیکربندی جستجوی کلمات کلیدی دارد).
- `mode: 'modal'`: Ask AI را درون مودال DocSearch نگه می‌دارد (حتی اگر پنل کناری را پیکربندی کرده باشید).

### فقط Ask AI (بدون جستجوی کلمات کلیدی) {#ask-ai-only}

اگر می‌خواهید **فقط پنل کناری Ask AI** را استفاده کنید، می‌توانید پیکربندی جستجوی کلمات کلیدی سطح بالا را حذف کرده و اعتبارنامه‌ها را در `askAi` ارائه دهید:

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
