---
description: Pahami routing berbasis file VitePress, rute dinamis, URL bersih, dan penulisan ulang path.
outline: deep
---

# Routing

## File-Based Routing

VitePress menggunakan file-based routing, yang berarti halaman HTML yang dihasilkan dipetakan dari struktur direktori file sumber Markdown. Misalnya, dengan struktur direktori berikut:

```
.
├─ guide
│  ├─ getting-started.md
│  └─ index.md
├─ index.md
└─ prologue.md
```

Halaman HTML yang dihasilkan akan menjadi:

```
index.md                  -->  /index.html (dapat diakses sebagai /)
prologue.md               -->  /prologue.html
guide/index.md            -->  /guide/index.html (dapat diakses sebagai /guide/)
guide/getting-started.md  -->  /guide/getting-started.html
```

HTML yang dihasilkan dapat dihosting di server web apa pun yang dapat menyajikan file statis.

## Root dan Source Directory

Ada dua konsep penting dalam struktur file proyek VitePress: **project root** dan **source directory**.

### Project Root

Project root adalah tempat VitePress akan mencoba mencari direktori khusus `.vitepress`. Direktori `.vitepress` adalah lokasi khusus untuk file konfigurasi VitePress, cache dev server, output build, dan kode kustomisasi tema opsional.

Ketika Anda menjalankan `vitepress dev` atau `vitepress build` dari command line, VitePress akan menggunakan direktori kerja saat ini sebagai project root. Untuk menentukan sub-direktori sebagai root, Anda perlu meneruskan path relatif ke perintah. Misalnya, jika proyek VitePress Anda terletak di `./docs`, Anda harus menjalankan `vitepress dev docs`:

```
.
├─ docs                    # project root
│  ├─ .vitepress           # config dir
│  ├─ getting-started.md
│  └─ index.md
└─ ...
```

```sh
vitepress dev docs
```

Ini akan menghasilkan pemetaan sumber-ke-HTML berikut:

```
docs/index.md            -->  /index.html (dapat diakses sebagai /)
docs/getting-started.md  -->  /getting-started.html
```

### Source Directory

Source directory adalah tempat file sumber Markdown Anda berada. Secara default, ini sama dengan project root. Namun, Anda dapat mengonfigurasinya melalui opsi konfigurasi [`srcDir`](../reference/site-config#srcdir).

Opsi `srcDir` diselesaikan relatif terhadap project root. Misalnya, dengan `srcDir: 'src'`, struktur file Anda akan terlihat seperti ini:

```
.                          # project root
├─ .vitepress              # config dir
└─ src                     # source dir
   ├─ getting-started.md
   └─ index.md
```

Pemetaan sumber-ke-HTML yang dihasilkan:

```
src/index.md            -->  /index.html (dapat diakses sebagai /)
src/getting-started.md  -->  /getting-started.html
```

## Menautkan Antar Halaman

Anda dapat menggunakan path absolut dan relatif saat menautkan antar halaman. Perhatikan bahwa meskipun ekstensi `.md` dan `.html` akan berfungsi, praktik terbaik adalah menghilangkan ekstensi file sehingga VitePress dapat menghasilkan URL akhir berdasarkan konfigurasi Anda.

```md
<!-- Lakukan -->
[Getting Started](./getting-started)
[Getting Started](../guide/getting-started)

<!-- Jangan -->
[Getting Started](./getting-started.md)
[Getting Started](./getting-started.html)
```

Pelajari lebih lanjut tentang menautkan ke aset seperti gambar di [Penanganan Aset](./asset-handling).

### Menautkan ke Halaman Non-VitePress

Jika Anda ingin menautkan ke halaman di situs Anda yang tidak dihasilkan oleh VitePress, Anda perlu menggunakan URL penuh (terbuka di tab baru) atau secara eksplisit menentukan target:

**Input**

```md
[Link to pure.html](/pure.html){target="_self"}
```

**Output**

[Link to pure.html](/pure.html){target="_self"}

::: tip Catatan

Dalam tautan Markdown, `base` secara otomatis ditambahkan ke URL. Ini berarti jika Anda ingin menautkan ke halaman di luar base Anda, Anda perlu sesuatu seperti `../../pure.html` di tautan (diselesaikan relatif terhadap halaman saat ini oleh browser).

Alternatifnya, Anda dapat langsung menggunakan sintaks tag anchor:

```md
<a href="/pure.html" target="_self">Link to pure.html</a>
```

:::

## Menghasilkan URL Bersih

::: warning Dukungan Server Diperlukan
Untuk menyajikan URL bersih dengan VitePress, dukungan sisi server diperlukan.
:::

Secara default, VitePress menyelesaikan tautan masuk ke URL yang diakhiri dengan `.html`. Namun, beberapa pengguna mungkin lebih suka "Clean URLs" tanpa ekstensi `.html`, misalnya, `example.com/path` alih-alih `example.com/path.html`.

Beberapa server atau platform hosting (misalnya Netlify, Vercel, GitHub Pages) menyediakan kemampuan untuk memetakan URL seperti `/foo` ke `/foo.html` jika ada, tanpa redirect:

- Netlify dan GitHub Pages mendukung ini secara default.
- Vercel memerlukan pengaktifan [opsi `cleanUrls` di `vercel.json`](https://vercel.com/docs/concepts/projects/project-configuration#cleanurls).

Jika fitur ini tersedia untuk Anda, Anda juga dapat mengaktifkan opsi konfigurasi [`cleanUrls`](../reference/site-config#cleanurls) milik VitePress sehingga:

- Tautan masuk antar halaman dihasilkan tanpa ekstensi `.html`.
- Jika path saat ini diakhiri dengan `.html`, router akan melakukan redirect sisi klien ke path tanpa ekstensi.

Namun, jika Anda tidak dapat mengonfigurasi server Anda dengan dukungan tersebut, Anda harus secara manual menggunakan struktur direktori berikut:

```
.
├─ getting-started
│  └─ index.md
├─ installation
│  └─ index.md
└─ index.md
```

## Route Rewrites

Anda dapat menyesuaikan pemetaan antara struktur source directory dan halaman yang dihasilkan. Ini berguna ketika Anda memiliki struktur proyek yang kompleks. Misalnya, katakanlah Anda memiliki monorepo dengan banyak paket, dan ingin menempatkan dokumentasi bersama file sumber seperti ini:

```
.
└─ packages
   ├─ pkg-a
   │  └─ src
   │     ├─ foo.md
   │     └─ index.md
   └─ pkg-b
      └─ src
         ├─ bar.md
         └─ index.md
```

Dan Anda ingin halaman VitePress dihasilkan seperti ini:

```
packages/pkg-a/src/index.md  -->  /pkg-a/index.html
packages/pkg-a/src/foo.md    -->  /pkg-a/foo.html
packages/pkg-b/src/index.md  -->  /pkg-b/index.html
packages/pkg-b/src/bar.md    -->  /pkg-b/bar.html
```

Anda dapat mencapai ini dengan mengonfigurasi opsi [`rewrites`](../reference/site-config#rewrites) seperti ini:

```ts [.vitepress/config.js]
export default {
  rewrites: {
    'packages/pkg-a/src/index.md': 'pkg-a/index.md',
    'packages/pkg-a/src/foo.md': 'pkg-a/foo.md',
    'packages/pkg-b/src/index.md': 'pkg-b/index.md',
    'packages/pkg-b/src/bar.md': 'pkg-b/bar.md'
  }
}
```

Opsi `rewrites` juga mendukung parameter rute dinamis. Pada contoh di atas, akan sangat verbose untuk mencantumkan semua path jika Anda memiliki banyak paket. Mengingat semuanya memiliki struktur file yang sama, Anda dapat menyederhanakan konfigurasi seperti ini:

```ts
export default {
  rewrites: {
    'packages/:pkg/src/:slug*': ':pkg/:slug*'
  }
}
```

Path rewrite dikompilasi menggunakan paket `path-to-regexp`; lihat [dokumentasinya](https://github.com/pillarjs/path-to-regexp/tree/6.x#parameters) untuk sintaks yang lebih lanjut.

`rewrites` juga dapat berupa fungsi yang menerima path asli dan mengembalikan path baru:

```ts
export default {
  rewrites(id) {
    return id.replace(/^packages\/([^/]+)\/src\//, '$1/')
  }
}
```

::: warning Tautan Relatif dengan Rewrites

Ketika rewrite diaktifkan, **tautan relatif harus didasarkan pada path yang di-rewrite**. Misalnya, untuk membuat tautan relatif dari `packages/pkg-a/src/pkg-a-code.md` ke `packages/pkg-b/src/pkg-b-code.md`, Anda harus menggunakan:

```md
[Link to PKG B](../pkg-b/pkg-b-code)
```
:::

## Rute Dinamis

Anda dapat menghasilkan banyak halaman menggunakan satu file Markdown dan data dinamis. Misalnya, Anda dapat membuat file `packages/[pkg].md` yang menghasilkan halaman terkait untuk setiap paket dalam sebuah proyek. Di sini, segmen `[pkg]` adalah **parameter** rute yang membedakan setiap halaman dari yang lain.

### File Paths Loader

Karena VitePress adalah generator situs statis, path halaman yang mungkin harus ditentukan pada waktu build. Oleh karena itu, halaman rute dinamis **harus** disertai dengan **file paths loader**. Untuk `packages/[pkg].md`, kita akan memerlukan `packages/[pkg].paths.js` (`.ts` juga didukung):

```
.
└─ packages
   ├─ [pkg].md         # template rute
   └─ [pkg].paths.js   # route paths loader
```

Paths loader harus menyediakan objek dengan metode `paths` sebagai default export-nya. Metode `paths` harus mengembalikan array objek dengan properti `params`. Setiap objek ini akan menghasilkan halaman yang sesuai.

Dengan array `paths` berikut:

```js
// packages/[pkg].paths.js
export default {
  paths() {
    return [
      { params: { pkg: 'foo' }},
      { params: { pkg: 'bar' }}
    ]
  }
}
```

Halaman HTML yang dihasilkan akan menjadi:

```
.
└─ packages
   ├─ foo.html
   └─ bar.html
```

### Type-safe loader dengan `defineRoutes`

Jika Anda menggunakan TypeScript, Anda dapat membungkus loader dengan `defineRoutes` dari `vitepress` untuk mendapatkan petunjuk tipe untuk hook rute seperti `paths`, `watch`, dan `transformPageData`:

```ts
// packages/[pkg].paths.ts
import { defineRoutes } from 'vitepress'

export default defineRoutes({
  watch: ['../data/**/*.json'],
  async paths() {
    return [
      { params: { pkg: 'foo' } },
      { params: { pkg: 'bar' } }
    ]
  },
  async transformPageData(pageData) {
    pageData.title = `${pageData.title} · Packages`
  }
})
```

`defineRoutes` bersifat opsional, tetapi direkomendasikan saat menulis file `.paths.ts`.

### Multiple Params

Rute dinamis dapat berisi beberapa params:

**Struktur File**

```
.
└─ packages
   ├─ [pkg]-[version].md
   └─ [pkg]-[version].paths.js
```

**Paths Loader**

```js
export default {
  paths: () => [
    { params: { pkg: 'foo', version: '1.0.0' }},
    { params: { pkg: 'foo', version: '2.0.0' }},
    { params: { pkg: 'bar', version: '1.0.0' }},
    { params: { pkg: 'bar', version: '2.0.0' }}
  ]
}
```

**Output**

```
.
└─ packages
   ├─ foo-1.0.0.html
   ├─ foo-2.0.0.html
   ├─ bar-1.0.0.html
   └─ bar-2.0.0.html
```

### Menghasilkan Path Secara Dinamis

Modul paths loader dijalankan di Node.js dan hanya dieksekusi selama waktu build. Anda dapat menghasilkan array paths secara dinamis menggunakan data apa pun, baik lokal maupun remote.

Menghasilkan path dari file lokal:

```js
import fs from 'fs'

export default {
  paths() {
    return fs
      .readdirSync('packages')
      .map((pkg) => {
        return { params: { pkg }}
      })
  }
}
```

Menghasilkan path dari data remote:

```js
export default {
  async paths() {
    const pkgs = await (await fetch('https://my-api.com/packages')).json()

    return pkgs.map((pkg) => {
      return {
        params: {
          pkg: pkg.name,
          version: pkg.version
        }
      }
    })
  }
}
```

### Memantau File Template dan Data

Saat menghasilkan konten halaman dari template atau sumber data eksternal, Anda dapat menggunakan opsi watch untuk secara otomatis membangun ulang halaman ketika file-file tersebut berubah selama pengembangan:

```js
// posts/[slug].paths.js
import fs from 'node:fs'
import { renderTemplate } from './templates/renderer.js'

export default {
  // Pantau perubahan pada file template dan sumber data
  watch: [
    './templates/**/*.njk',     // File template
    '../data/**/*.json'         // File data
  ],

  paths(watchedFiles) {
    // watchedFiles akan berupa array path absolut dari file yang cocok
    // Baca file data untuk menghasilkan rute
    const dataFiles = watchedFiles.filter(file => file.endsWith('.json'))

    return dataFiles.map(file => {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'))

      return {
        params: { slug: data.slug },
        content: renderTemplate(data)  // Gunakan template untuk menghasilkan konten
      }
    })
  }
}
```

Opsi `watch` bekerja dengan cara yang sama seperti pada [data loader](./data-loading#data-dari-file-lokal):

- Menerima [glob patterns](https://github.com/mrmlnc/fast-glob#pattern-syntax) untuk mencocokkan file
- Pattern relatif terhadap file `.paths.js` itu sendiri
- Perubahan pada file yang dipantau memicu regenerasi halaman dan HMR selama pengembangan
- Pada build produksi, semua halaman dihasilkan sekali terlepas dari konfigurasi watch

### Mengakses Params di Halaman

Anda dapat menggunakan params untuk meneruskan data tambahan ke setiap halaman. File rute Markdown dapat mengakses params halaman saat ini dalam ekspresi Vue melalui properti global `$params`:

```md
- nama paket: {{ $params.pkg }}
- versi: {{ $params.version }}
```

Anda juga dapat mengakses params halaman saat ini melalui runtime API [`useData`](../reference/runtime-api#usedata). Ini tersedia baik di file Markdown maupun komponen Vue:

```vue
<script setup>
import { useData } from 'vitepress'

// params adalah Vue ref
const { params } = useData()

console.log(params.value)
</script>
```

### Merender Konten Mentah

Params yang diteruskan ke halaman akan diserialisasi dalam payload JavaScript klien, jadi Anda harus menghindari meneruskan data berat dalam params, misalnya konten Markdown mentah atau HTML yang diambil dari CMS remote.

Sebagai gantinya, Anda dapat meneruskan konten tersebut ke setiap halaman menggunakan properti `content` pada setiap objek path:

```js
export default {
  async paths() {
    const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

    return posts.map((post) => {
      return {
        params: { id: post.id },
        content: post.content // Markdown mentah atau HTML
      }
    })
  }
}
```

Kemudian, gunakan sintaks khusus berikut untuk merender konten sebagai bagian dari file Markdown itu sendiri:

```md
<!-- @content -->
```
