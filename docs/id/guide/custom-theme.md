---
description: Buat dan gunakan tema kustom di VitePress untuk mengontrol sepenuhnya tampilan situs Anda.
---

# Menggunakan Tema Kustom

## Resolusi Tema

Anda dapat mengaktifkan tema kustom dengan membuat file `.vitepress/theme/index.js` atau `.vitepress/theme/index.ts` ("theme entry file"):

```
.
├─ docs                # project root
│  ├─ .vitepress
│  │  ├─ theme
│  │  │  └─ index.js   # theme entry
│  │  └─ config.js     # config file
│  └─ index.md
└─ package.json
```

VitePress akan selalu menggunakan tema kustom alih-alih tema default ketika mendeteksi keberadaan theme entry file. Namun, Anda dapat [memperluas tema default](./extending-default-theme) untuk melakukan kustomisasi lanjutan di atasnya.

## Antarmuka Tema

Tema kustom VitePress didefinisikan sebagai objek dengan antarmuka berikut:

```ts
interface Theme {
  /**
   * Komponen layout root untuk setiap halaman
   * @required
   */
  Layout: Component
  /**
   * Tingkatkan instance aplikasi Vue
   * @optional
   */
  enhanceApp?: (ctx: EnhanceAppContext) => Awaitable<void>
  /**
   * Perluas tema lain, memanggil `enhanceApp`-nya sebelum milik kita
   * @optional
   */
  extends?: Theme
}

interface EnhanceAppContext {
  app: App // instance aplikasi Vue
  router: Router // instance router VitePress
  siteData: Ref<SiteData> // metadata tingkat situs
}
```

Theme entry file harus mengekspor tema sebagai default export-nya:

```js [.vitepress/theme/index.js]

// Anda dapat langsung mengimpor file Vue di theme entry
// VitePress sudah dikonfigurasi dengan @vitejs/plugin-vue.
import Layout from './Layout.vue'

export default {
  Layout,
  enhanceApp({ app, router, siteData }) {
    // ...
  }
}
```

Default export adalah satu-satunya kontrak untuk tema kustom, dan hanya properti `Layout` yang diperlukan. Jadi secara teknis, tema VitePress dapat sesederhana satu komponen Vue.

Di dalam komponen layout Anda, ia bekerja seperti aplikasi Vite + Vue 3 biasa. Perhatikan bahwa tema juga harus [SSR-compatible](./ssr-compat).

## Membangun Layout

Komponen layout paling dasar perlu berisi komponen [`<Content />`](../reference/runtime-api#content):

```vue [.vitepress/theme/Layout.vue]
<template>
  <h1>Custom Layout!</h1>

  <!-- di sinilah konten markdown akan dirender -->
  <Content />
</template>
```

Layout di atas hanya merender markdown setiap halaman sebagai HTML. Peningkatan pertama yang dapat kita tambahkan adalah menangani error 404:

```vue{1-4,9-12}
<script setup>
import { useData } from 'vitepress'
const { page } = useData()
</script>

<template>
  <h1>Custom Layout!</h1>

  <div v-if="page.isNotFound">
    Halaman 404 kustom!
  </div>
  <Content v-else />
</template>
```

Helper [`useData()`](../reference/runtime-api#usedata) memberi kita semua data runtime yang kita perlukan untuk merender layout yang berbeda secara kondisional. Salah satu data lain yang dapat kita akses adalah frontmatter halaman saat ini. Kita dapat memanfaatkan ini untuk memungkinkan pengguna akhir mengontrol layout di setiap halaman. Misalnya, pengguna dapat menunjukkan halaman harus menggunakan layout home page khusus dengan:

```md
---
layout: home
---
```

Dan kita dapat menyesuaikan tema kita untuk menangani ini:

```vue{3,12-14}
<script setup>
import { useData } from 'vitepress'
const { page, frontmatter } = useData()
</script>

<template>
  <h1>Custom Layout!</h1>

  <div v-if="page.isNotFound">
    Halaman 404 kustom!
  </div>
  <div v-if="frontmatter.layout === 'home'">
    Halaman home kustom!
  </div>
  <Content v-else />
</template>
```

Anda tentu saja dapat membagi layout menjadi lebih banyak komponen:

```vue{3-5,12-15}
<script setup>
import { useData } from 'vitepress'
import NotFound from './NotFound.vue'
import Home from './Home.vue'
import Page from './Page.vue'

const { page, frontmatter } = useData()
</script>

<template>
  <h1>Custom Layout!</h1>

  <NotFound v-if="page.isNotFound" />
  <Home v-if="frontmatter.layout === 'home'" />
  <Page v-else /> <!-- <Page /> merender <Content /> -->
</template>
```

Lihat [Referensi Runtime API](../reference/runtime-api) untuk semua yang tersedia di komponen tema. Selain itu, Anda dapat memanfaatkan [Build-Time Data Loading](./data-loading) untuk menghasilkan layout berbasis data, misalnya, halaman yang mencantumkan semua posting blog di proyek saat ini.

## Mendistribusikan Tema Kustom

Cara termudah untuk mendistribusikan tema kustom adalah dengan menyediakannya sebagai [template repository di GitHub](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository).

Jika Anda ingin mendistribusikan tema sebagai paket npm, ikuti langkah-langkah berikut:

1. Ekspor objek tema sebagai default export di entry paket Anda.

2. Jika berlaku, ekspor definisi tipe konfigurasi tema Anda sebagai `ThemeConfig`.

3. Jika tema Anda memerlukan penyesuaian konfigurasi VitePress, ekspor konfigurasi tersebut di bawah sub-path paket (mis. `my-theme/config`) sehingga pengguna dapat memperluasnya.

4. Dokumentasikan opsi konfigurasi tema (baik melalui file konfigurasi maupun frontmatter).

5. Berikan instruksi yang jelas tentang cara menggunakan tema Anda (lihat di bawah).

## Menggunakan Tema Kustom

Untuk menggunakan tema eksternal, impor dan ekspor ulang dari theme entry kustom:

```js [.vitepress/theme/index.js]
import Theme from 'awesome-vitepress-theme'

export default Theme
```

Jika tema perlu diperluas:

```js [.vitepress/theme/index.js]
import Theme from 'awesome-vitepress-theme'

export default {
  extends: Theme,
  enhanceApp(ctx) {
    // ...
  }
}
```

Jika tema memerlukan konfigurasi VitePress khusus, Anda juga perlu memperluasnya di konfigurasi Anda sendiri:

```ts [.vitepress/config.ts]
import baseConfig from 'awesome-vitepress-theme/config'

export default {
  // perluas konfigurasi dasar tema (jika diperlukan)
  extends: baseConfig
}
```

Terakhir, jika tema menyediakan tipe untuk konfigurasi temanya:

```ts [.vitepress/config.ts]
import baseConfig from 'awesome-vitepress-theme/config'
import { defineConfigWithTheme } from 'vitepress'
import type { ThemeConfig } from 'awesome-vitepress-theme'

export default defineConfigWithTheme<ThemeConfig>({
  extends: baseConfig,
  themeConfig: {
    // Type adalah `ThemeConfig`
  }
})
```
