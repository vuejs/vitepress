---
outline: deep
description: Referensi lengkap opsi konfigurasi situs VitePress termasuk pengaturan tingkat aplikasi, tema, dan opsi build.
---

# Konfigurasi Situs

Konfigurasi situs adalah tempat Anda dapat mendefinisikan pengaturan global situs. Opsi konfigurasi aplikasi mendefinisikan pengaturan yang berlaku untuk setiap situs VitePress, terlepas dari tema apa yang digunakannya. Misalnya, direktori dasar atau judul situs.

## Ringkasan

### Resolusi Config

File config selalu di-resolve dari `<root>/.vitepress/config.[ext]`, di mana `<root>` adalah [root proyek](../guide/routing#root-and-source-directory) VitePress Anda, dan `[ext]` adalah salah satu ekstensi file yang didukung. TypeScript didukung secara bawaan. Ekstensi yang didukung meliputi `.js`, `.ts`, `.mjs`, dan `.mts`.

Disarankan untuk menggunakan sintaks modul ES di file config. File config harus mengekspor default sebuah objek:

```ts
export default {
  // opsi config tingkat aplikasi
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',
  ...
}
```

::: details Config Dinamis (Async)

Jika Anda perlu menghasilkan config secara dinamis, Anda juga dapat mengekspor default sebuah fungsi. Misalnya:

```ts
import { defineConfig } from 'vitepress'

export default async () => {
  const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

  return defineConfig({
    // opsi config tingkat aplikasi
    lang: 'en-US',
    title: 'VitePress',
    description: 'Vite & Vue powered static site generator.',

    // opsi config tingkat tema
    themeConfig: {
      sidebar: [
        ...posts.map((post) => ({
          text: post.name,
          link: `/posts/${post.name}`
        }))
      ]
    }
  })
}
```

Anda juga dapat menggunakan `await` tingkat atas. Misalnya:

```ts
import { defineConfig } from 'vitepress'

const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

export default defineConfig({
  // opsi config tingkat aplikasi
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',

  // opsi config tingkat tema
  themeConfig: {
    sidebar: [
      ...posts.map((post) => ({
        text: post.name,
        link: `/posts/${post.name}`
      }))
    ]
  }
})
```

:::

### Intellisense Config

Menggunakan helper `defineConfig` akan memberikan intellisense berbasis TypeScript untuk opsi config. Dengan asumsi IDE Anda mendukungnya, ini seharusnya berfungsi di JavaScript dan TypeScript.

```js
import { defineConfig } from 'vitepress'

export default defineConfig({
  // ...
})
```

### Konfigurasi Tema Bertipe

Secara default, helper `defineConfig` mengharapkan tipe config tema dari tema default:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    // Tipe adalah `DefaultTheme.Config`
  }
})
```

Jika Anda menggunakan tema kustom dan menginginkan pengecekan tipe untuk config tema, Anda perlu menggunakan `defineConfigWithTheme`, dan mengirimkan tipe config untuk tema kustom Anda melalui argumen generik:

```ts
import { defineConfigWithTheme } from 'vitepress'
import type { ThemeConfig } from 'your-theme'

export default defineConfigWithTheme<ThemeConfig>({
  themeConfig: {
    // Tipe adalah `ThemeConfig`
  }
})
```

### Konfigurasi Vite, Vue, dan Markdown

- **Vite**

  Anda dapat mengonfigurasi instance Vite yang mendasarinya menggunakan opsi [vite](#vite) di config VitePress Anda. Tidak perlu membuat file config Vite terpisah.

- **Vue**

  VitePress sudah menyertakan plugin Vue resmi untuk Vite ([@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue)). Anda dapat mengonfigurasi opsinya menggunakan opsi [vue](#vue) di config VitePress Anda.

- **Markdown**

  Anda dapat mengonfigurasi instance [Markdown-It](https://github.com/markdown-it/markdown-it) yang mendasarinya menggunakan opsi [markdown](#markdown) di config VitePress Anda.

## Metadata Situs

### title

- Tipe: `string`
- Default: `VitePress`
- Dapat ditimpa per halaman melalui [frontmatter](./frontmatter-config#title)

Judul untuk situs. Ketika menggunakan tema default, ini akan ditampilkan di bilah nav.

Ini juga akan digunakan sebagai sufiks default untuk semua judul halaman individual, kecuali [`titleTemplate`](#titletemplate) didefinisikan. Judul akhir halaman individual akan berupa konten teks dari header `<h1>` pertamanya, digabungkan dengan `title` global sebagai sufiks. Misalnya dengan config dan konten halaman berikut:

```ts
export default {
  title: 'My Awesome Site'
}
```

```md
# Hello
```

Judul halaman akan menjadi `Hello | My Awesome Site`.

### titleTemplate

- Tipe: `string | boolean`
- Dapat ditimpa per halaman melalui [frontmatter](./frontmatter-config#titletemplate)

Memungkinkan penyesuaian sufiks judul setiap halaman atau seluruh judul. Misalnya:

```ts
export default {
  title: 'My Awesome Site',
  titleTemplate: 'Custom Suffix'
}
```

```md
# Hello
```

Judul halaman akan menjadi `Hello | Custom Suffix`.

Untuk sepenuhnya menyesuaikan bagaimana judul harus dirender, Anda dapat menggunakan simbol `:title` di `titleTemplate`:

```ts
export default {
  titleTemplate: ':title - Custom Suffix'
}
```

Di sini `:title` akan diganti dengan teks yang disimpulkan dari header `<h1>` pertama halaman. Judul halaman contoh sebelumnya akan menjadi `Hello - Custom Suffix`.

Opsi ini dapat diatur ke `false` untuk menonaktifkan sufiks judul.

### description

- Tipe: `string`
- Default: `A VitePress site`
- Dapat ditimpa per halaman melalui [frontmatter](./frontmatter-config#description)

Deskripsi untuk situs. Ini akan dirender sebagai tag `<meta>` di HTML halaman.

```ts
export default {
  description: 'A VitePress site'
}
```

### head

- Tipe: `HeadConfig[]`
- Default: `[]`
- Dapat ditambahkan per halaman melalui [frontmatter](./frontmatter-config#head)

Elemen tambahan untuk dirender di tag `<head>` di HTML halaman. Tag yang ditambahkan pengguna dirender sebelum tag penutup `head`, setelah tag VitePress.

```ts
type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

#### Contoh: Menambahkan favicon

```ts
export default {
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]]
} // letakkan favicon.ico di direktori public, jika base diatur, gunakan /base/favicon.ico

/* Akan merender:
  <link rel="icon" href="/favicon.ico">
*/
```

#### Contoh: Menambahkan Google Fonts

```ts
export default {
  head: [
    [
      'link',
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' }
    ],
    [
      'link',
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
    ],
    [
      'link',
      { href: 'https://fonts.googleapis.com/css2?family=Roboto&display=swap', rel: 'stylesheet' }
    ]
  ]
}

/* Akan merender:
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
*/
```

#### Contoh: Mendaftarkan service worker

```ts
export default {
  head: [
    [
      'script',
      { id: 'register-sw' },
      `;(() => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js')
        }
      })()`
    ]
  ]
}

/* Akan merender:
  <script id="register-sw">
    ;(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
      }
    })()
  </script>
*/
```

#### Contoh: Menggunakan Google Analytics

```ts
export default {
  head: [
    [
      'script',
      { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=TAG_ID' }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'TAG_ID');`
    ]
  ]
}

/* Akan merender:
  <script async src="https://www.googletagmanager.com/gtag/js?id=TAG_ID"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'TAG_ID');
  </script>
*/
```

### lang

- Tipe: `string`
- Default: `en-US`

Atribut lang untuk situs. Ini akan dirender sebagai tag `<html lang="en-US">` di HTML halaman.

```ts
export default {
  lang: 'en-US'
}
```

### base

- Tipe: `string`
- Default: `/`

URL dasar tempat situs akan di-deploy. Anda perlu mengatur ini jika berencana men-deploy situs Anda di bawah sub path, misalnya, GitHub pages. Jika Anda berencana men-deploy situs Anda ke `https://foo.github.io/bar/`, maka Anda harus mengatur base ke `'/bar/'`. Ini harus selalu dimulai dan diakhiri dengan slash. Base relatif tidak didukung.

Base secara otomatis ditambahkan di depan semua URL yang dimulai dengan / di opsi lain, jadi Anda hanya perlu menentukannya sekali.

```ts
export default {
  base: '/base/'
}
```

## Routing

### cleanUrls

- Tipe: `boolean`
- Default: `false`

Ketika diatur ke `true`, VitePress akan menghapus `.html` di akhir URL. Lihat juga [Generating Clean URLs](../guide/routing#generating-clean-urls).

::: warning Diperlukan Dukungan Server
Mengaktifkan ini mungkin memerlukan konfigurasi tambahan di platform hosting Anda. Agar berfungsi, server Anda harus dapat menyajikan `/foo.html` ketika mengunjungi `/foo` **tanpa redirect**.
:::

### rewrites

- Tipe: `Record<string, string>`

Mendefinisikan pemetaan direktori kustom &lt;-&gt; URL. Lihat [Routing: Route Rewrites](../guide/routing#route-rewrites) untuk detail lebih lanjut.

```ts
export default {
  rewrites: {
    'source/:page': 'destination/:page'
  }
}
```

## Build

### srcDir

- Tipe: `string`
- Default: `.`

Direktori tempat halaman markdown Anda disimpan, relatif terhadap root proyek. Lihat juga [Root and Source Directory](../guide/routing#root-and-source-directory).

```ts
export default {
  srcDir: './src'
}
```

### srcExclude

- Tipe: `string[]`
- Default: `undefined`

Pola [glob](https://github.com/mrmlnc/fast-glob#pattern-syntax) untuk mencocokkan file markdown yang harus dikecualikan sebagai konten sumber.

```ts
export default {
  srcExclude: ['**/README.md', '**/TODO.md']
}
```

### outDir

- Tipe: `string`
- Default: `./.vitepress/dist`

Lokasi output build untuk situs, relatif terhadap [root proyek](../guide/routing#root-and-source-directory).

```ts
export default {
  outDir: '../public'
}
```

### assetsDir

- Tipe: `string`
- Default: `assets`

Menentukan direktori untuk menyarangkan aset yang dihasilkan. Path harus berada di dalam [`outDir`](#outdir) dan di-resolve relatif terhadapnya.

```ts
export default {
  assetsDir: 'static'
}
```

### cacheDir

- Tipe: `string`
- Default: `./.vitepress/cache`

Direktori untuk file cache, relatif terhadap [root proyek](../guide/routing#root-and-source-directory). Lihat juga: [cacheDir](https://vitejs.dev/config/shared-options.html#cachedir).

```ts
export default {
  cacheDir: './.vitepress/.vite'
}
```

### ignoreDeadLinks

- Tipe: `boolean | 'localhostLinks' | (string | RegExp | ((link: string, source: string) => boolean))[]`
- Default: `false`

Ketika diatur ke `true`, VitePress tidak akan menggagalkan build karena dead link.

Ketika diatur ke `'localhostLinks'`, build akan gagal pada dead link, tetapi tidak akan memeriksa tautan `localhost`.

```ts
export default {
  ignoreDeadLinks: true
}
```

Ini juga dapat berupa array dari string URL persis, pola regex, atau fungsi filter kustom.

```ts
export default {
  ignoreDeadLinks: [
    // abaikan URL persis "/playground"
    '/playground',
    // abaikan semua tautan localhost
    /^https?:\/\/localhost/,
    // abaikan semua tautan yang menyertakan "/repl/"
    /\/repl\//,
    // fungsi kustom, abaikan semua tautan yang menyertakan "ignore"
    (url) => {
      return url.toLowerCase().includes('ignore')
    }
  ]
}
```

### metaChunk <Badge type="warning" text="eksperimental" />

- Tipe: `boolean`
- Default: `false`

Ketika diatur ke `true`, mengekstrak metadata halaman ke chunk JavaScript terpisah alih-alih meng-inline-nya di HTML awal. Ini membuat payload HTML setiap halaman lebih kecil dan membuat metadata halaman dapat di-cache, sehingga mengurangi bandwidth server ketika Anda memiliki banyak halaman di situs.

### mpa <Badge type="warning" text="eksperimental" />

- Tipe: `boolean`
- Default: `false`

Ketika diatur ke `true`, aplikasi production akan dibangun dalam [Mode MPA](../guide/mpa-mode). Mode MPA mengirimkan 0kb JavaScript secara default, dengan mengorbankan penonaktifan navigasi sisi klien dan memerlukan opt-in eksplisit untuk interaktivitas.

## Tema

### appearance

- Tipe: `boolean | 'dark' | 'force-dark' | 'force-auto' | import('@vueuse/core').UseDarkOptions`
- Default: `true`

Apakah akan mengaktifkan mode gelap (dengan menambahkan kelas `.dark` ke elemen `<html>`).

- Jika opsi diatur ke `true`, tema default akan ditentukan oleh skema warna pilihan pengguna.
- Jika opsi diatur ke `dark`, tema akan menjadi gelap secara default, kecuali pengguna secara manual mengubahnya.
- Jika opsi diatur ke `false`, pengguna tidak akan dapat mengubah tema.
- Jika opsi diatur ke `'force-dark'`, tema akan selalu gelap dan pengguna tidak akan dapat mengubahnya.
- Jika opsi diatur ke `'force-auto'`, tema akan selalu ditentukan oleh skema warna pilihan pengguna dan pengguna tidak akan dapat mengubahnya.

Opsi ini menyuntikkan script inline yang memulihkan pengaturan pengguna dari local storage menggunakan kunci `vitepress-theme-appearance`. Ini memastikan kelas `.dark` diterapkan sebelum halaman dirender untuk menghindari flickering.

`appearance.initialValue` hanya dapat berupa `'dark' | undefined`. Ref atau getter tidak didukung.

### lastUpdated

- Tipe: `boolean`
- Default: `false`

Apakah akan mendapatkan timestamp terakhir diperbarui untuk setiap halaman menggunakan Git. Timestamp akan disertakan dalam data halaman setiap halaman, dapat diakses melalui [`useData`](./runtime-api#usedata).

Ketika menggunakan tema default, mengaktifkan opsi ini akan menampilkan waktu terakhir diperbarui setiap halaman. Anda dapat menyesuaikan teksnya melalui opsi [`themeConfig.lastUpdatedText`](./default-theme-config#lastupdatedtext).

## Kustomisasi

### markdown

- Tipe: `MarkdownOption`

Mengonfigurasi opsi parser Markdown. VitePress menggunakan [Markdown-it](https://github.com/markdown-it/markdown-it) sebagai parser, dan [Shiki](https://github.com/shikijs/shiki) untuk menyorot sintaks bahasa. Di dalam opsi ini, Anda dapat memberikan berbagai opsi terkait Markdown sesuai kebutuhan Anda.

```js
export default {
  markdown: {...}
}
```

Periksa [deklarasi tipe dan jsdocs](https://github.com/vuejs/vitepress/blob/main/src/node/markdown/markdown.ts) untuk semua opsi yang tersedia.

### vite

- Tipe: `import('vite').UserConfig`

Meneruskan [Vite Config](https://vitejs.dev/config/) mentah ke Vite dev server / bundler internal.

```js
export default {
  vite: {
    // opsi config Vite
  }
}
```

### vue

- Tipe: `import('@vitejs/plugin-vue').Options`

Meneruskan [opsi `@vitejs/plugin-vue`](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#options) mentah ke instance plugin internal.

```js
export default {
  vue: {
    // opsi @vitejs/plugin-vue
  }
}
```

## Build Hooks

Build hooks VitePress dapat digunakan untuk menambahkan fungsionalitas dan perilaku baru ke situs Anda:

- Sitemap
- Search Indexing
- PWA
- Teleports

### buildEnd

- Tipe: `(siteConfig: SiteConfig) => Awaitable<void>`

`buildEnd` adalah build CLI hook, ini akan berjalan setelah build (SSG) selesai tetapi sebelum proses VitePress CLI keluar.

```ts
export default {
  async buildEnd(siteConfig) {
    // ...
  }
}
```

### postRender

- Tipe: `(context: SSGContext) => Awaitable<SSGContext | void>`

`postRender` adalah build hook, dipanggil ketika rendering SSG selesai. Hook ini dapat digunakan untuk menangani konten teleports selama SSG.

```ts
export default {
  async postRender(context) {
    // ...
  }
}
```

```ts
interface SSGContext {
  content: string
  teleports?: Record<string, string>
  [key: string]: any
}
```

### transformHead

- Tipe: `(context: TransformContext) => Awaitable<HeadConfig[]>`

`transformHead` adalah build hook untuk menambahkan tag tambahan ke `<head>` setiap halaman. Hook ini dapat digunakan untuk menambahkan entri head yang tidak dapat ditambahkan secara statis ke config VitePress Anda. Anda hanya perlu mengembalikan entri tambahan, mereka akan digabungkan secara otomatis dengan yang sudah ada.

::: warning
Jangan memutasi apa pun di dalam `context`.
:::

```ts
export default {
  async transformHead(context) {
    // ...
  }
}
```

```ts
interface TransformContext {
  page: string // mis. index.md (relatif terhadap srcDir)
  assets: string[] // semua aset non-js/css sebagai URL publik yang sepenuhnya di-resolve
  siteConfig: SiteConfig
  siteData: SiteData
  pageData: PageData
  title: string
  description: string
  head: HeadConfig[]
  content: string
}
```

Hook ini hanya dipanggil ketika melakukan build, tidak dipanggil selama dev.

Tag tambahan akan ditambahkan ke file HTML statis yang dihasilkan oleh build. Mereka tidak akan diperbarui selama navigasi sisi klien.

Dalam banyak kasus, menggunakan hook [`transformPageData`](#transformpagedata) adalah solusi yang lebih bersih. Hook itu juga akan diterapkan pada navigasi sisi klien dan selama dev. Namun jika menghasilkan tag head membutuhkan komputasi yang mahal, maka `transformHead` akan menghindari overhead tersebut selama dev.

#### Contoh: Menambahkan meta `og:image`

```ts
export default {
  async transformHead(context) {
    if (context.page === '404.md') {
      return
    }

    // Detail implementasi `generatePageImage` akan bergantung
    // pada kebutuhan Anda. Di sini kita asumsikan ia menghasilkan
    // gambar yang sesuai untuk setiap halaman dan mengembalikan URL gambar.
    const imageUrl = await generatePageImage(context)
    
    return [[
      'meta',
      { name: 'og:image', content: imageUrl }
    ]]
  }
}
```

Di sini kita mengasumsikan bahwa URL gambar bersifat dinamis dan memakan waktu untuk dihasilkan. Menggunakan `transformHead` menghindari overhead tersebut selama pengembangan.

Untuk kasus yang lebih sederhana, mungkin dapat menggunakan pengaturan [`head`](./frontmatter-config#head) di frontmatter, atau [`transformPageData`](#transformpagedata).

### transformHtml

- Tipe: `(code: string, id: string, context: TransformContext) => Awaitable<string | void>`

`transformHtml` adalah build hook untuk mentransformasi konten setiap halaman sebelum disimpan ke disk.

::: warning
Jangan memutasi apa pun di dalam `context`. Selain itu, memodifikasi konten html dapat menyebabkan masalah hidrasi di runtime.
:::

```ts
export default {
  async transformHtml(code, id, context) {
    // ...
  }
}
```

### transformPageData

- Tipe: `(pageData: PageData, context: TransformPageContext) => Awaitable<Partial<PageData> | { [key: string]: any } | void>`

`transformPageData` adalah hook untuk mentransformasi `pageData` setiap halaman. Anda dapat langsung memutasi `pageData` atau mengembalikan nilai yang diubah yang akan digabungkan ke dalam data halaman.

::: warning
Jangan memutasi apa pun di dalam `context` dan berhati-hatilah bahwa ini dapat memengaruhi kinerja server pengembangan, terutama jika Anda memiliki beberapa permintaan jaringan atau komputasi berat (seperti menghasilkan gambar) di hook. Anda dapat memeriksa `process.env.NODE_ENV === 'production'` untuk logika kondisional.
:::

```ts
export default {
  async transformPageData(pageData, { siteConfig }) {
    pageData.contributors = await getPageContributors(pageData.relativePath)
  }

  // atau kembalikan data untuk digabungkan
  async transformPageData(pageData, { siteConfig }) {
    return {
      contributors: await getPageContributors(pageData.relativePath)
    }
  }
}
```

```ts
interface TransformPageContext {
  siteConfig: SiteConfig
}
```

#### Contoh: Menambahkan `<meta name="og:title">`

```ts
export default {
  transformPageData(pageData) {
    const title = pageData.frontmatter.layout === 'home'
      ? 'VitePress'
      : `${pageData.title} | VitePress`

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push([
      'meta',
      { name: 'og:title', content: title }
    ])
  }
}
```

#### Contoh: Menambahkan URL kanonikal `<link>`

```ts
export default {
  transformPageData(pageData) {
    const canonicalUrl = `https://example.com/${pageData.relativePath}`
      .replace(/index\.md$/, '')
      .replace(/\.md$/, '.html')

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push([
      'link',
      { rel: 'canonical', href: canonicalUrl }
    ])
  }
}
```
