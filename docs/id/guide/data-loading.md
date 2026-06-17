---
description: Muat data apa pun pada waktu build menggunakan data loader VitePress dan impor dari halaman atau komponen.
---

# Build-Time Data Loading

VitePress menyediakan fitur yang disebut **data loader** yang dapat digunakan untuk memuat data apa pun dan mengimpornya dari halaman atau komponen. Pemuatan data dieksekusi **hanya pada waktu build**: data yang dihasilkan akan diserialisasi sebagai JSON dalam bundel JavaScript akhir.

Data loader dapat digunakan untuk mengambil data remote, atau menghasilkan metadata berdasarkan file lokal. Misalnya, Anda dapat menggunakan data loader untuk mem-parse semua halaman API lokal Anda dan secara otomatis menghasilkan indeks semua entri API.

## Penggunaan Dasar

File data loader harus diakhiri dengan `.data.js` atau `.data.ts`. File tersebut harus menyediakan default export berupa objek dengan metode `load()`:

```js [example.data.js]
export default {
  load() {
    return {
      hello: 'world'
    }
  }
}
```

Modul loader dievaluasi hanya di Node.js, sehingga Anda dapat mengimpor Node API dan dependensi npm sesuai kebutuhan.

Anda kemudian dapat mengimpor data dari file ini di halaman `.md` dan komponen `.vue` menggunakan named export `data`:

```vue
<script setup>
import { data } from './example.data.js'
</script>

<pre>{{ data }}</pre>
```

Output:

```json
{
  "hello": "world"
}
```

Anda akan melihat bahwa data loader sendiri tidak mengekspor `data`. VitePress-lah yang memanggil metode `load()` di belakang layar dan secara implisit mengekspos hasilnya melalui named export `data`.

Ini berfungsi bahkan jika loader bersifat async:

```js
export default {
  async load() {
    // ambil data remote
    return (await fetch('...')).json()
  }
}
```

## Data dari File Lokal

Ketika Anda perlu menghasilkan data berdasarkan file lokal, Anda harus menggunakan opsi `watch` di data loader sehingga perubahan yang dibuat pada file-file ini dapat memicu hot updates.

Opsi `watch` juga nyaman karena Anda dapat menggunakan [glob patterns](https://github.com/mrmlnc/fast-glob#pattern-syntax) untuk mencocokkan banyak file. Pattern dapat relatif terhadap file loader itu sendiri, dan fungsi `load()` akan menerima file yang cocok sebagai path absolut.

Contoh berikut menunjukkan memuat file CSV dan mengubahnya menjadi JSON menggunakan [csv-parse](https://github.com/adaltas/node-csv/tree/master/packages/csv-parse/). Karena file ini hanya dieksekusi pada waktu build, Anda tidak akan mengirimkan parser CSV ke klien!

```js
import fs from 'node:fs'
import { parse } from 'csv-parse/sync'

export default {
  watch: ['./data/*.csv'],
  load(watchedFiles) {
    // watchedFiles akan berupa array path absolut dari file yang cocok.
    // hasilkan array metadata posting blog yang dapat digunakan untuk
    // merender daftar di layout tema
    return watchedFiles.map((file) => {
      return parse(fs.readFileSync(file, 'utf-8'), {
        columns: true,
        skip_empty_lines: true
      })
    })
  }
}
```

## `createContentLoader`

Saat membangun situs yang berfokus pada konten, kita sering perlu membuat halaman "arsip" atau "indeks": halaman di mana kita mencantumkan semua entri yang tersedia dalam koleksi konten kita, misalnya posting blog atau halaman API. Kita **dapat** mengimplementasikan ini langsung dengan API data loader, tetapi karena ini adalah use case yang sangat umum, VitePress juga menyediakan helper `createContentLoader` untuk menyederhanakannya:

```js [posts.data.js]
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', /* options */)
```

Helper ini menerima glob pattern relatif terhadap [source directory](./routing#source-directory), dan mengembalikan objek data loader `{ watch, load }` yang dapat digunakan sebagai default export di file data loader. Ini juga mengimplementasikan caching berdasarkan timestamp modifikasi file untuk meningkatkan performa dev.

Perhatikan bahwa loader hanya bekerja dengan file Markdown; file non-Markdown yang cocok akan dilewati.

Data yang dimuat akan berupa array dengan tipe `ContentData[]`:

```ts
interface ContentData {
  // URL yang dipetakan untuk halaman. mis. /posts/hello.html (tidak termasuk base)
  // iterasi secara manual atau gunakan `transform` kustom untuk menormalkan path
  url: string
  // data frontmatter halaman
  frontmatter: Record<string, any>

  // berikut hanya ada jika opsi terkait diaktifkan
  // kita akan membahasnya di bawah
  src: string | undefined
  html: string | undefined
  excerpt: string | undefined
}
```

Secara default, hanya `url` dan `frontmatter` yang disediakan. Ini karena data yang dimuat akan di-inline sebagai JSON di bundel klien, jadi kita perlu berhati-hati tentang ukurannya. Berikut contoh menggunakan data untuk membangun halaman indeks blog minimal:

```vue
<script setup>
import { data as posts } from './posts.data.js'
</script>

<template>
  <h1>Semua Posting Blog</h1>
  <ul>
    <li v-for="post of posts">
      <a :href="post.url">{{ post.frontmatter.title }}</a>
      <span>oleh {{ post.frontmatter.author }}</span>
    </li>
  </ul>
</template>
```

### Opsi

Data default mungkin tidak sesuai untuk semua kebutuhan. Anda dapat memilih untuk mentransformasi data menggunakan opsi:

```js [posts.data.js]
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', {
  includeSrc: true, // sertakan sumber markdown mentah?
  render: true,     // sertakan HTML halaman penuh yang dirender?
  excerpt: true,    // sertakan excerpt?
  transform(rawData) {
    // map, sort, atau filter data mentah sesuai keinginan.
    // hasil akhir adalah apa yang akan dikirim ke klien.
    return rawData.sort((a, b) => {
      return +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date)
    }).map((page) => {
      page.src     // sumber markdown mentah
      page.html    // HTML halaman penuh yang dirender
      page.excerpt // HTML excerpt yang dirender (konten di atas `---` pertama)
      return {/* ... */}
    })
  }
})
```

Lihat bagaimana ini digunakan di [blog Vue.js](https://github.com/vuejs/blog/blob/main/.vitepress/theme/posts.data.ts).

API `createContentLoader` juga dapat digunakan di dalam [build hooks](../reference/site-config#build-hooks):

```js [.vitepress/config.js]
export default {
  async buildEnd() {
    const posts = await createContentLoader('posts/*.md').load()
    // hasilkan file berdasarkan metadata posting, mis. RSS feed
  }
}
```

**Tipe**

```ts
interface ContentOptions<T = ContentData[]> {
  /**
   * Sertakan src?
   * @default false
   */
  includeSrc?: boolean

  /**
   * Render src ke HTML dan sertakan dalam data?
   * @default false
   */
  render?: boolean

  /**
   * Jika `boolean`, apakah akan mem-parse dan menyertakan excerpt? (dirender sebagai HTML)
   *
   * Jika `function`, kontrol bagaimana excerpt diekstrak dari konten.
   *
   * Jika `string`, tentukan separator kustom yang digunakan untuk mengekstrak
   * excerpt. Separator default adalah `---` jika `excerpt` adalah `true`.
   *
   * @see https://github.com/jonschlinkert/gray-matter#optionsexcerpt
   * @see https://github.com/jonschlinkert/gray-matter#optionsexcerpt_separator
   *
   * @default false
   */
  excerpt?:
    | boolean
    | ((file: { data: { [key: string]: any }; content: string; excerpt?: string }, options?: any) => void)
    | string

  /**
   * Transformasikan data. Perhatikan data akan di-inline sebagai JSON di
   * bundel klien jika diimpor dari komponen atau file markdown.
   */
  transform?: (data: ContentData[]) => T | Promise<T>
}
```

## Typed Data Loader

Saat menggunakan TypeScript, Anda dapat mengetik loader dan ekspor `data` seperti ini:

```ts
import { defineLoader } from 'vitepress'

export interface Data {
  // tipe data
}

declare const data: Data
export { data }

export default defineLoader({
  // opsi loader yang diperiksa tipe
  watch: ['...'],
  async load(): Promise<Data> {
    // ...
  }
})
```

## Konfigurasi

Untuk mendapatkan informasi konfigurasi di dalam loader, Anda dapat menggunakan kode seperti ini:

```ts
import type { SiteConfig } from 'vitepress'

const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG
```
