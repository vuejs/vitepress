---
description: Referensi API runtime VitePress termasuk composable, fungsi helper, dan komponen bawaan.
---

# Runtime API

VitePress menawarkan beberapa API bawaan untuk mengakses data aplikasi. VitePress juga dilengkapi dengan beberapa komponen bawaan yang dapat digunakan secara global.

Metode helper dapat diimpor secara global dari `vitepress` dan biasanya digunakan dalam komponen Vue tema kustom. Namun, metode ini juga dapat digunakan di dalam halaman `.md` karena file markdown dikompilasi menjadi [Single-File Components](https://vuejs.org/guide/scaling-up/sfc.html) Vue.

Metode yang dimulai dengan `use*` menunjukkan bahwa itu adalah fungsi [Vue 3 Composition API](https://vuejs.org/guide/introduction.html#composition-api) ("Composable") yang hanya dapat digunakan di dalam `setup()` atau `<script setup>`.

## `useData` <Badge type="info" text="composable" />

Mengembalikan data spesifik halaman. Objek yang dikembalikan memiliki tipe berikut:

```ts
interface VitePressData<T = any> {
  /**
   * Metadata tingkat situs
   */
  site: Ref<SiteData<T>>
  /**
   * themeConfig dari .vitepress/config.js
   */
  theme: Ref<T>
  /**
   * Metadata tingkat halaman
   */
  page: Ref<PageData>
  /**
   * Frontmatter halaman
   */
  frontmatter: Ref<PageData['frontmatter']>
  /**
   * Parameter rute dinamis
   */
  params: Ref<PageData['params']>
  title: Ref<string>
  description: Ref<string>
  lang: Ref<string>
  isDark: Ref<boolean>
  dir: Ref<string>
  localeIndex: Ref<string>
  /**
   * Hash lokasi saat ini
   */
  hash: Ref<string>
}

interface PageData {
  title: string
  titleTemplate?: string | boolean
  description: string
  relativePath: string
  filePath: string
  headers: Header[]
  frontmatter: Record<string, any>
  params?: Record<string, any>
  isNotFound?: boolean
  lastUpdated?: number
}
```

**Contoh:**

```vue
<script setup>
import { useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <h1>{{ theme.footer.copyright }}</h1>
</template>
```

## `useRoute` <Badge type="info" text="composable" />

Mengembalikan objek rute saat ini dengan tipe berikut:

```ts
interface Route {
  path: string
  data: PageData
  component: Component | null
}
```

## `useRouter` <Badge type="info" text="composable" />

Mengembalikan instance router VitePress sehingga Anda dapat bernavigasi ke halaman lain secara terprogram.

```ts
interface Router {
  /**
   * Rute saat ini.
   */
  route: Route
  /**
   * Navigasi ke URL baru.
   */
  go: (to?: string) => Promise<void>
  /**
   * Dipanggil sebelum rute berubah. Kembalikan `false` untuk membatalkan navigasi.
   */
  onBeforeRouteChange?: (to: string) => Awaitable<void | boolean>
  /**
   * Dipanggil sebelum komponen halaman dimuat (setelah state riwayat diperbarui).
   * Kembalikan `false` untuk membatalkan navigasi.
   */
  onBeforePageLoad?: (to: string) => Awaitable<void | boolean>
  /**
   * Dipanggil setelah komponen halaman dimuat (sebelum komponen halaman diperbarui).
   */
  onAfterPageLoad?: (to: string) => Awaitable<void>
  /**
   * Dipanggil setelah rute berubah.
   */
  onAfterRouteChange?: (to: string) => Awaitable<void>
}
```

## `withBase` <Badge type="info" text="helper" />

- **Tipe**: `(path: string) => string`

Menambahkan [`base`](./site-config#base) yang dikonfigurasi ke path URL yang diberikan. Lihat juga [Base URL](../guide/asset-handling#base-url).

## `<Content />` <Badge type="info" text="component" />

Komponen `<Content />` menampilkan konten markdown yang dirender. Berguna [ketika membuat tema Anda sendiri](../guide/custom-theme).

```vue
<template>
  <h1>Custom Layout!</h1>
  <Content />
</template>
```

## `<ClientOnly />` <Badge type="info" text="component" />

Komponen `<ClientOnly />` merender slot-nya hanya di sisi klien.

Karena aplikasi VitePress dirender di server dalam Node.js ketika menghasilkan build statis, penggunaan Vue apa pun harus mematuhi persyaratan kode universal. Singkatnya, pastikan hanya mengakses API Browser / DOM di hook beforeMount atau mounted.

Jika Anda menggunakan atau mendemokan komponen yang tidak SSR-friendly (misalnya, berisi custom directives), Anda dapat membungkusnya di dalam komponen `ClientOnly`.

```vue-html
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```

- Terkait: [SSR Compatibility](../guide/ssr-compat)

## `$frontmatter` <Badge type="info" text="template global" />

Langsung mengakses data [frontmatter](../guide/frontmatter) halaman saat ini dalam ekspresi Vue.

```md
---
title: Hello
---

# {{ $frontmatter.title }}
```

## `$params` <Badge type="info" text="template global" />

Langsung mengakses [parameter rute dinamis](../guide/routing#dynamic-routes) halaman saat ini dalam ekspresi Vue.

```md
- package name: {{ $params.pkg }}
- version: {{ $params.version }}
```
