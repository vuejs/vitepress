---
description: Pelajari cara mereferensikan dan menangani aset statis seperti gambar, media, dan font di VitePress.
---

# Penanganan Aset

## Mereferensikan Aset Statis

Semua file Markdown dikompilasi menjadi komponen Vue dan diproses oleh [Vite](https://vitejs.dev/guide/assets.html). Anda dapat, **dan sebaiknya**, mereferensikan aset apa pun menggunakan URL relatif:

```md
![An image](./image.png)
```

Anda dapat mereferensikan aset statis di file markdown Anda, komponen `*.vue` di tema, style, dan file `.css` biasa menggunakan path publik absolut (berdasarkan project root) atau path relatif (berdasarkan file system Anda). Yang terakhir mirip dengan perilaku yang biasa Anda gunakan jika Anda pernah menggunakan Vite, Vue CLI, atau `file-loader` webpack.

Tipe file gambar, media, dan font yang umum dideteksi dan disertakan sebagai aset secara otomatis.

::: tip File yang ditautkan tidak diperlakukan sebagai aset
PDF atau dokumen lain yang direferensikan oleh tautan dalam file markdown tidak secara otomatis diperlakukan sebagai aset. Untuk membuat file yang ditautkan dapat diakses, Anda harus menempatkannya secara manual di dalam direktori [`public`](#direktori-public) proyek Anda.
:::

Semua aset yang direferensikan, termasuk yang menggunakan path absolut, akan disalin ke direktori output dengan nama file yang di-hash pada build produksi. Aset yang tidak pernah direferensikan tidak akan disalin. Aset gambar yang lebih kecil dari 4kb akan di-inline base64, dan ini dapat dikonfigurasi melalui opsi konfigurasi [`vite`](../reference/site-config#vite).

Semua referensi path **statis**, termasuk path absolut, harus didasarkan pada struktur direktori kerja Anda.

## Direktori Public

Terkadang Anda mungkin perlu menyediakan aset statis yang tidak direferensikan secara langsung di komponen Markdown atau tema Anda, atau Anda mungkin ingin menyajikan file tertentu dengan nama file asli. Contoh file tersebut termasuk `robots.txt`, favicon, dan ikon PWA.

Anda dapat menempatkan file-file ini di direktori `public` di bawah [source directory](./routing#source-directory). Misalnya, jika project root Anda adalah `./docs` dan menggunakan lokasi source directory default, maka direktori public Anda akan menjadi `./docs/public`.

Aset yang ditempatkan di `public` akan disalin ke root direktori output apa adanya.

Perhatikan bahwa Anda harus mereferensikan file yang ditempatkan di `public` menggunakan path absolut root: misalnya, `public/icon.png` harus selalu direferensikan di kode sumber sebagai `/icon.png`.

## Base URL

Jika situs Anda dideploy ke URL non-root, Anda perlu mengatur opsi `base` di `.vitepress/config.js`. Misalnya, jika Anda berencana mendeploy situs Anda ke `https://foo.github.io/bar/`, maka `base` harus diatur ke `'/bar/'` (harus selalu dimulai dan diakhiri dengan garis miring).

Semua path aset statis Anda secara otomatis diproses untuk menyesuaikan dengan nilai konfigurasi `base` yang berbeda. Misalnya, jika Anda memiliki referensi absolut ke aset di bawah `public` dalam markdown Anda:

```md
![An image](/image-inside-public.png)
```

Anda **tidak** perlu memperbaruinya saat Anda mengubah nilai konfigurasi `base` dalam kasus ini.

Namun, jika Anda menulis komponen tema yang menautkan ke aset secara dinamis, misalnya gambar yang `src`-nya didasarkan pada nilai konfigurasi tema:

```vue
<img :src="theme.logoPath" />
```

Dalam kasus ini disarankan untuk membungkus path dengan [`withBase` helper](../reference/runtime-api#withbase) yang disediakan oleh VitePress:

```vue
<script setup>
import { withBase, useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <img :src="withBase(theme.logoPath)" />
</template>
```
