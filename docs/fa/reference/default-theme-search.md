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
          fa: { // اگر می خواهید زبان پیش فرض را ترجمه کنید، این را `root` قرار دهید
            translations: {
              button: {
                buttonText: 'جستجو',
                buttonAriaLabel: 'جستجو'
              },
              modal: {
                displayDetails: 'نمایش فهرست کامل',
                resetButtonTitle: 'بازنشانی جستجو',
                backButtonTitle: 'بستن جستجو',
                noResultsText: 'نتیجه ای یافت نشد',
                footer: {
                  selectText: 'انتخاب',
                  selectKeyAriaLabel: 'Enter',
                  navigateText: 'پیمایش',
                  navigateUpKeyAriaLabel: 'فلش بالا',
                  navigateDownKeyAriaLabel: 'فلش پایین',
                  closeText: 'بستن',
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
          // رشته HTML را برمی گرداند
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
            return (await md.renderAsync(`# ${env.frontmatter.title}`)) + html
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

<details>
<summary>برای باز کردن کلیک کنید</summary>

<<< @/snippets/algolia-i18n.ts

</details>

برای اطلاعات بیشتر به [مستندات رسمی Algolia](https://docsearch.algolia.com/docs/api#translations) مراجعه کنید. برای شروع سریع‌تر، می‌توانید ترجمه‌های استفاده‌شده در این سایت را از [مخزن GitHub ما](https://github.com/search?q=repo:vuejs/vitepress+%22function+searchOptions%22&type=code) کپی کنید.

### پشتیبانی Algolia Ask AI {#ask-ai}

برای فعال‌سازی **Ask AI** کافی است گزینه `askAi` را اضافه کنید:

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
        // askAi: "شناسه-دستیار-شما"
        // یا
        askAi: {
          // حداقل باید assistantId دریافت شده از Algolia را ارائه کنید
          assistantId: 'XXXYYY',
          // بازنویسی های اختیاری — اگر حذف شوند، مقادیر appId/apiKey/indexName سطح بالا دوباره استفاده می شوند
          // apiKey: '...',
          // appId: '...',
          // indexName: '...'
        }
      }
    }
  }
})
```

::: warning نکته
اگر فقط به جستجوی کلمات کلیدی نیاز دارید، `askAi` را اضافه نکنید.
:::

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

#### حالت (auto / sidePanel / hybrid / modal) {#ask-ai-mode}

می‌توانید به صورت اختیاری نحوه ادغام جستجوی کلمات کلیدی و Ask AI در VitePress را کنترل کنید:

- `mode: 'auto'` (پیش‌فرض): وقتی جستجوی کلمات کلیدی پیکربندی شده باشد `hybrid` را استنباط می‌کند، در غیر این صورت وقتی پنل کناری Ask AI پیکربندی شده باشد `sidePanel` را استنباط می‌کند.
- `mode: 'sidePanel'`: فقط پنل کناری را اعمال می‌کند (دکمه جستجوی کلمات کلیدی را پنهان می‌کند).
- `mode: 'hybrid'`: مودال جستجوی کلمات کلیدی + پنل کناری Ask AI را فعال می‌کند (نیاز به پیکربندی جستجوی کلمات کلیدی دارد).
- `mode: 'modal'`: Ask AI را درون مودال DocSearch نگه می‌دارد (حتی اگر پنل کناری را پیکربندی کرده باشید).

#### فقط Ask AI (بدون جستجوی کلمات کلیدی) {#ask-ai-only}

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

### پیکربندی Crawler {#crawler-config}

در اینجا یک پیکربندی نمونه بر اساس آنچه که این سایت استفاده می‌کند آمده است:

<<< @/snippets/algolia-crawler.js
