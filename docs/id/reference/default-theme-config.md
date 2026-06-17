---
description: Referensi semua opsi konfigurasi yang tersedia untuk tema default VitePress.
---

# Konfigurasi Tema Default

Dengan konfigurasi tema, Anda dapat menyesuaikan tema. Anda dapat mendefinisikan konfigurasi tema melalui opsi `themeConfig` di file config:

```ts
export default {
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',

  // Konfigurasi terkait tema.
  themeConfig: {
    logo: '/logo.svg',
    nav: [...],
    sidebar: { ... }
  }
}
```

**Opsi yang didokumentasikan di halaman ini hanya berlaku untuk tema default.** Tema yang berbeda mengharapkan konfigurasi tema yang berbeda. Ketika menggunakan tema kustom, objek konfigurasi tema akan diteruskan ke tema sehingga tema dapat menentukan perilaku kondisional berdasarkan konfigurasi tersebut.

## i18nRouting

- Tipe: `boolean`

Mengubah locale misalnya ke `zh` akan mengubah URL dari `/foo` (atau `/en/foo/`) menjadi `/zh/foo`. Anda dapat menonaktifkan perilaku ini dengan mengatur `themeConfig.i18nRouting` ke `false`.

## logo

- Tipe: `ThemeableImage`

File logo untuk ditampilkan di bilah nav, tepat sebelum judul situs. Menerima string path, atau objek untuk mengatur logo yang berbeda untuk mode terang/gelap.

```ts
export default {
  themeConfig: {
    logo: '/logo.svg'
  }
}
```

```ts
type ThemeableImage =
  | string
  | { src: string; alt?: string }
  | { light: string; dark: string; alt?: string }
```

## siteTitle

- Tipe: `string | false`

Anda dapat menyesuaikan item ini untuk mengganti judul situs default (`title` di config aplikasi) di nav. Ketika diatur ke `false`, judul di nav akan dinonaktifkan. Berguna ketika Anda memiliki `logo` yang sudah berisi teks judul situs.

```ts
export default {
  themeConfig: {
    siteTitle: 'Hello World'
  }
}
```

## nav

- Tipe: `NavItem`

Konfigurasi untuk item menu nav. Detail lebih lanjut di [Default Theme: Nav](./default-theme-nav#navigation-links).

```ts
export default {
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide' },
      {
        text: 'Dropdown Menu',
        items: [
          { text: 'Item A', link: '/item-1' },
          { text: 'Item B', link: '/item-2' },
          { text: 'Item C', link: '/item-3' }
        ]
      }
    ]
  }
}
```

```ts
type NavItem = NavItemWithLink | NavItemWithChildren

interface NavItemWithLink {
  text: string
  link: string | ((payload: PageData) => string)
  activeMatch?: string
  target?: string
  rel?: string
  noIcon?: boolean
}

interface NavItemChildren {
  text?: string
  items: NavItemWithLink[]
}

interface NavItemWithChildren {
  text?: string
  items: (NavItemChildren | NavItemWithLink)[]
  activeMatch?: string
}
```

## sidebar

- Tipe: `Sidebar`

Konfigurasi untuk item menu sidebar. Detail lebih lanjut di [Default Theme: Sidebar](./default-theme-sidebar).

```ts
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Getting Started', link: '/getting-started' },
          ...
        ]
      }
    ]
  }
}
```

```ts
export type Sidebar = SidebarItem[] | SidebarMulti

export interface SidebarMulti {
  [path: string]: SidebarItem[] | { items: SidebarItem[]; base: string }
}

export type SidebarItem = {
  /**
   * Label teks dari item.
   */
  text?: string

  /**
   * Tautan dari item.
   */
  link?: string

  /**
   * Children dari item.
   */
  items?: SidebarItem[]

  /**
   * Jika tidak ditentukan, grup tidak dapat diciutkan.
   *
   * Jika `true`, grup dapat diciutkan dan diciutkan secara default
   *
   * Jika `false`, grup dapat diciutkan tetapi diperluas secara default
   */
  collapsed?: boolean

  /**
   * Path dasar untuk item children.
   */
  base?: string

  /**
   * Menyesuaikan teks yang muncul di footer halaman sebelumnya/berikutnya.
   */
  docFooterText?: string

  rel?: string
  target?: string
}
```

## aside

- Tipe: `boolean | 'left'`
- Default: `true`
- Dapat ditimpa per halaman melalui [frontmatter](./frontmatter-config#aside)

Mengatur nilai ini ke `false` mencegah rendering kontainer aside.\
Mengatur nilai ini ke `true` merender aside di sebelah kanan.\
Mengatur nilai ini ke `left` merender aside di sebelah kiri.

Jika Anda ingin menonaktifkannya untuk semua viewport, sebaiknya gunakan `outline: false`.

## outline

- Tipe: `Outline | Outline['level'] | false`
- Level dapat ditimpa per halaman melalui [frontmatter](./frontmatter-config#outline)

Mengatur nilai ini ke `false` mencegah rendering kontainer outline. Lihat interface ini untuk detail lebih lanjut:

```ts
interface Outline {
  /**
   * Level heading yang akan ditampilkan di outline.
   * Angka tunggal berarti hanya heading pada level tersebut yang akan ditampilkan.
   * Jika tuple diberikan, angka pertama adalah level minimum dan angka kedua adalah level maksimum.
   * `'deep'` sama dengan `[2, 6]`, yang berarti semua heading dari `<h2>` hingga `<h6>` akan ditampilkan.
   *
   * @default 2
   */
  level?: number | [number, number] | 'deep'

  /**
   * Judul yang akan ditampilkan pada outline.
   *
   * @default 'On this page'
   */
  label?: string
}
```

## socialLinks

- Tipe: `SocialLink[]`

Anda dapat mendefinisikan opsi ini untuk menampilkan tautan akun sosial Anda dengan ikon di nav.

```ts
export default {
  themeConfig: {
    socialLinks: [
      // Anda dapat menambahkan ikon apa pun dari simple-icons (https://simpleicons.org/):
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
      { icon: 'twitter', link: '...' },
      // Anda juga dapat menambahkan ikon kustom dengan mengirimkan SVG sebagai string:
      {
        icon: {
          svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Dribbble</title><path d="M12...6.38z"/></svg>'
        },
        link: '...',
        // Anda dapat menyertakan label kustom untuk aksesibilitas juga (opsional tetapi direkomendasikan):
        ariaLabel: 'cool link'
      }
    ]
  }
}
```

```ts
interface SocialLink {
  icon: string | { svg: string }
  link: string
  ariaLabel?: string
}
```

## footer

- Tipe: `Footer`
- Dapat ditimpa per halaman melalui [frontmatter](./frontmatter-config#footer)

Konfigurasi footer. Anda dapat menambahkan pesan atau teks hak cipta di footer, namun, ini hanya akan ditampilkan ketika halaman tidak memiliki sidebar. Ini karena pertimbangan desain.

```ts
export default {
  themeConfig: {
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present Evan You'
    }
  }
}
```

```ts
export interface Footer {
  message?: string
  copyright?: string
}
```

## editLink

- Tipe: `EditLink`
- Dapat ditimpa per halaman melalui [frontmatter](./frontmatter-config#editlink)

Edit Link dapat digunakan untuk menampilkan tautan untuk mengedit halaman pada layanan manajemen Git seperti GitHub atau GitLab. Lihat [Default Theme: Edit Link](./default-theme-edit-link) untuk detail lebih lanjut.

```ts
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
}
```

```ts
export interface EditLink {
  pattern: string
  text?: string
}
```

## lastUpdated

- Tipe: `LastUpdatedOptions`

Memungkinkan penyesuaian untuk teks last updated dan format tanggal.

```ts
export default {
  themeConfig: {
    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    }
  }
}
```

```ts
export interface LastUpdatedOptions {
  /**
   * @default 'Last updated'
   */
  text?: string

  /**
   * @default
   * { dateStyle: 'short',  timeStyle: 'short' }
   */
  formatOptions?: Intl.DateTimeFormatOptions & { forceLocale?: boolean }
}
```

## algolia

- Tipe: `AlgoliaSearch`

Opsi untuk mendukung pencarian di situs dokumentasi Anda menggunakan [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch). Pelajari lebih lanjut di [Default Theme: Search](./default-theme-search)

```ts
export interface AlgoliaSearchOptions extends DocSearchProps {
  locales?: Record<string, Partial<DocSearchProps>>
}
```

Lihat opsi lengkap [di sini](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts).

## carbonAds {#carbon-ads}

- Tipe: `CarbonAdsOptions`

Opsi untuk menampilkan [Carbon Ads](https://www.carbonads.net/).

```ts
export default {
  themeConfig: {
    carbonAds: {
      code: 'your-carbon-code',
      placement: 'your-carbon-placement'
      format: 'classic'
    }
  }
}
```

```ts
export interface CarbonAdsOptions {
  code: string
  placement: string
  format?: 'classic' | 'responsive' | 'cover'
}
```

Pelajari lebih lanjut di [Default Theme: Carbon Ads](./default-theme-carbon-ads)

## docFooter

- Tipe: `DocFooter`

Dapat digunakan untuk menyesuaikan teks yang muncul di atas tautan sebelumnya dan berikutnya. Berguna jika tidak menulis dokumen dalam bahasa Inggris. Juga dapat digunakan untuk menonaktifkan tautan prev/next secara global. Jika Anda ingin mengaktifkan/menonaktifkan tautan prev/next secara selektif, Anda dapat menggunakan [frontmatter](./default-theme-prev-next-links).

```ts
export default {
  themeConfig: {
    docFooter: {
      prev: 'Pagina prior',
      next: 'Proxima pagina'
    }
  }
}
```

```ts
export interface DocFooter {
  prev?: string | false
  next?: string | false
}
```

## darkModeSwitchLabel

- Tipe: `string`
- Default: `Appearance`

Dapat digunakan untuk menyesuaikan label tombol mode gelap. Label ini hanya ditampilkan di tampilan mobile.

## lightModeSwitchTitle

- Tipe: `string`
- Default: `Switch to light theme`

Dapat digunakan untuk menyesuaikan judul tombol mode terang yang muncul saat hover.

## darkModeSwitchTitle

- Tipe: `string`
- Default: `Switch to dark theme`

Dapat digunakan untuk menyesuaikan judul tombol mode gelap yang muncul saat hover.

## sidebarMenuLabel

- Tipe: `string`
- Default: `Menu`

Dapat digunakan untuk menyesuaikan label menu sidebar. Label ini hanya ditampilkan di tampilan mobile.

## returnToTopLabel

- Tipe: `string`
- Default: `Return to top`

Dapat digunakan untuk menyesuaikan label tombol kembali ke atas. Label ini hanya ditampilkan di tampilan mobile.

## langMenuLabel

- Tipe: `string`
- Default: `Change language`

Dapat digunakan untuk menyesuaikan aria-label tombol pengganti bahasa di navbar. Ini hanya digunakan jika Anda menggunakan [i18n](../guide/i18n).

## skipToContentLabel

- Tipe: `string`
- Default: `Skip to content`

Dapat digunakan untuk menyesuaikan label tautan skip to content. Tautan ini ditampilkan ketika pengguna menavigasi situs menggunakan keyboard.

## externalLinkIcon

- Tipe: `boolean`
- Default: `false`

Apakah akan menampilkan ikon tautan eksternal di samping tautan eksternal di markdown.

## `useLayout` <Badge type="info" text="composable" />

Mengembalikan data terkait layout. Objek yang dikembalikan memiliki tipe berikut:

```ts
interface {
  isHome: ComputedRef<boolean>

  sidebar: Readonly<ShallowRef<DefaultTheme.SidebarItem[]>>
  sidebarGroups: ComputedRef<DefaultTheme.SidebarItem[]>
  hasSidebar: ComputedRef<boolean>
  isSidebarEnabled: ComputedRef<boolean>

  hasAside: ComputedRef<boolean>
  leftAside: ComputedRef<boolean>

  headers: Readonly<ShallowRef<DefaultTheme.OutlineItem[]>>
  hasLocalNav: ComputedRef<boolean>
}
```

**Contoh:**

```vue
<script setup>
import { useLayout } from 'vitepress/theme'

const { hasSidebar } = useLayout()
</script>

<template>
  <div v-if="hasSidebar">Hanya tampil ketika sidebar ada</div>
</template>
```
