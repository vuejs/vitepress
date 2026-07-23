---
outline: deep
description: Siapkan pencarian lokal atau berbasis Algolia untuk situs VitePress Anda.
---

# Pencarian

## Pencarian Lokal

VitePress mendukung pencarian teks lengkap fuzzy menggunakan indeks dalam browser berkat [minisearch](https://github.com/lucaong/minisearch/). Untuk mengaktifkan fitur ini, cukup atur opsi `themeConfig.search.provider` ke `'local'` di file `.vitepress/config.ts` Anda:

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

Contoh hasil:

![screenshot of the search modal](/search.png)

Sebagai alternatif, Anda dapat menggunakan [Algolia DocSearch](#algolia-search) atau beberapa plugin komunitas seperti:

- <https://www.npmjs.com/package/vitepress-plugin-search>
- <https://www.npmjs.com/package/vitepress-plugin-pagefind>
- <https://www.npmjs.com/package/@orama/plugin-vitepress>
- <https://www.npmjs.com/package/vitepress-plugin-typesense>

### i18n {#local-search-i18n}

Anda dapat menggunakan konfigurasi seperti ini untuk menggunakan pencarian multibahasa:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: { // gunakan `root` jika Anda ingin menerjemahkan locale default
            translations: {
              button: {
                buttonText: '搜索',
                buttonAriaLabel: '搜索'
              },
              modal: {
                displayDetails: '显示详细列表',
                resetButtonTitle: '重置搜索',
                backButtonTitle: '关闭搜索',
                noResultsText: '没有结果',
                footer: {
                  selectText: '选择',
                  selectKeyAriaLabel: '输入',
                  navigateText: '导航',
                  navigateUpKeyAriaLabel: '上箭头',
                  navigateDownKeyAriaLabel: '下箭头',
                  closeText: '关闭',
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

### Opsi miniSearch

Anda dapat mengonfigurasi MiniSearch seperti ini:

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

Pelajari lebih lanjut di [dokumentasi MiniSearch](https://lucaong.github.io/minisearch/classes/MiniSearch.MiniSearch.html).

### Perender konten kustom

Anda dapat menyesuaikan fungsi yang digunakan untuk merender konten markdown sebelum mengindeksnya:

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
          // kembalikan string html
        }
      }
    }
  }
})
```

Fungsi ini akan dihapus dari data situs sisi klien, sehingga Anda dapat menggunakan API Node.js di dalamnya.

#### Contoh: Mengecualikan halaman dari pencarian

Anda dapat mengecualikan halaman dari pencarian dengan menambahkan `search: false` ke frontmatter halaman. Sebagai alternatif:

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

::: warning Catatan
Jika fungsi `_render` kustom disediakan, Anda perlu menangani sendiri `search: false` di frontmatter. Selain itu, objek `env` tidak akan sepenuhnya terisi sebelum `md.renderAsync` dipanggil, jadi pemeriksaan apa pun pada properti opsional `env` seperti `frontmatter` harus dilakukan setelahnya.
:::

#### Contoh: Mentransformasi konten - menambahkan anchor

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

## Pencarian Algolia

VitePress mendukung pencarian di situs dokumentasi Anda menggunakan [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch). Lihat panduan memulai mereka. Di `.vitepress/config.ts` Anda, setidaknya Anda perlu menyediakan yang berikut agar berfungsi:

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

Anda dapat menggunakan konfigurasi seperti ini untuk menggunakan pencarian multibahasa:

<details>
<summary>Lihat contoh lengkap</summary>

<<< @/snippets/algolia-i18n.ts

</details>

Lihat [dokumentasi resmi Algolia](https://docsearch.algolia.com/docs/api#translations) untuk mempelajari lebih lanjut. Untuk memulai dengan cepat, Anda juga dapat menyalin terjemahan yang digunakan oleh situs ini dari [repo GitHub kami](https://github.com/search?q=repo:vuejs/vitepress+%22function+searchOptions%22&type=code).

### Dukungan Algolia Ask AI {#ask-ai}

Jika Anda ingin menyertakan **Ask AI**, berikan opsi `askAi` (atau salah satu field parsial) di dalam `options`:

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
        // askAi: "YOUR-ASSISTANT-ID"
        // ATAU
        askAi: {
          // minimal Anda harus memberikan assistantId yang Anda terima dari Algolia
          assistantId: 'XXXYYY',
          // penimpaan opsional – jika dihilangkan, nilai appId/apiKey/indexName tingkat atas digunakan kembali
          // apiKey: '...',
          // appId: '...',
          // indexName: '...'
        }
      }
    }
  }
})
```

::: warning Catatan
Jika Anda ingin default ke pencarian keyword dan tidak ingin menggunakan Ask AI, hilangkan properti `askAi`.
:::

### Panel Samping Ask AI {#ask-ai-side-panel}

DocSearch v4.5+ mendukung **panel samping Ask AI** opsional. Ketika diaktifkan, panel ini dapat dibuka dengan **Ctrl/Cmd+I** secara default. [Referensi API Sidepanel](https://docsearch.algolia.com/docs/sidepanel/api-reference) berisi daftar opsi lengkap.

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
              variant: 'floating', // atau 'inline'
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

Jika Anda perlu menonaktifkan shortcut keyboard, gunakan opsi `keyboardShortcuts` di tingkat root sidepanel:

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

#### Mode (auto / sidePanel / hybrid / modal) {#ask-ai-mode}

Anda dapat secara opsional mengontrol bagaimana VitePress mengintegrasikan pencarian keyword dan Ask AI:

- `mode: 'auto'` (default): menyimpulkan `hybrid` ketika pencarian keyword dikonfigurasi, jika tidak `sidePanel` ketika panel samping Ask AI dikonfigurasi.
- `mode: 'sidePanel'`: paksa hanya panel samping (menyembunyikan tombol pencarian keyword).
- `mode: 'hybrid'`: aktifkan modal pencarian keyword + panel samping Ask AI (memerlukan konfigurasi pencarian keyword).
- `mode: 'modal'`: pertahankan Ask AI di dalam modal DocSearch (bahkan jika Anda mengonfigurasi panel samping).

#### Hanya Ask AI (tanpa pencarian keyword) {#ask-ai-only}

Jika Anda ingin menggunakan **panel samping Ask AI saja**, Anda dapat menghilangkan konfigurasi pencarian keyword tingkat atas dan memberikan kredensial di bawah `askAi`:

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

### Konfigurasi Crawler

Berikut adalah contoh konfigurasi berdasarkan apa yang digunakan situs ini:

<<< @/snippets/algolia-crawler.js
