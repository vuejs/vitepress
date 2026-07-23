---
description: Mulai dan jalankan VitePress. Pelajari cara menginstal, membuat scaffold, dan mulai mengembangkan situs dokumentasi Anda.
---

# Memulai

## Coba Online

Anda dapat mencoba VitePress langsung di browser Anda di [StackBlitz](https://vitepress.new).

## Instalasi

### Prasyarat

- [Node.js](https://nodejs.org/) versi 20 atau lebih tinggi.
- Terminal untuk mengakses VitePress melalui command line interface (CLI).
- Text Editor dengan dukungan sintaks [Markdown](https://en.wikipedia.org/wiki/Markdown).
  - [VSCode](https://code.visualstudio.com/) direkomendasikan, bersama dengan [ekstensi resmi Vue](https://marketplace.visualstudio.com/items?itemName=Vue.volar).

VitePress dapat digunakan sendiri, atau diinstal ke dalam proyek yang sudah ada. Dalam kedua kasus, Anda dapat menginstalnya dengan:

::: code-group

```sh [npm]
$ npm add -D vitepress@next
```

```sh [pnpm]
$ pnpm add -D vitepress@next
```

```sh [yarn]
$ yarn add -D vitepress@next vue
```

```sh [bun]
$ bun add -D vitepress@next
```

:::

::: tip CATATAN

VitePress adalah paket ESM-only. Jangan gunakan `require()` untuk mengimpornya, dan pastikan `package.json` terdekat Anda berisi `"type": "module"`, atau ubah ekstensi file terkait Anda seperti `.vitepress/config.js` menjadi `.mjs`/`.mts`. Lihat [panduan troubleshooting Vite](http://vitejs.dev/guide/troubleshooting.html#this-package-is-esm-only) untuk detail lebih lanjut. Juga, di dalam konteks CJS async, Anda dapat menggunakan `await import('vitepress')` sebagai gantinya.

:::

### Setup Wizard

VitePress hadir dengan command line setup wizard yang akan membantu Anda membuat scaffold proyek dasar. Setelah instalasi, mulai wizard dengan menjalankan:

::: code-group

```sh [npm]
$ npx vitepress init
```

```sh [pnpm]
$ pnpm vitepress init
```

```sh [yarn]
$ yarn vitepress init
```

```sh [bun]
$ bun vitepress init
```

:::

Anda akan disambut dengan beberapa pertanyaan sederhana:

<<< @/snippets/init.ansi

::: tip Vue sebagai Peer Dependency
Jika Anda berniat melakukan kustomisasi yang menggunakan komponen atau API Vue, Anda juga harus menginstal `vue` secara eksplisit sebagai dependensi.
:::

## Struktur File

Jika Anda membangun situs VitePress standalone, Anda dapat membuat scaffold situs di direktori Anda saat ini (`./`). Namun, jika Anda menginstal VitePress di proyek yang sudah ada bersama kode sumber lainnya, disarankan untuk membuat scaffold situs di direktori bersarang (mis. `./docs`) sehingga terpisah dari bagian proyek lainnya.

Dengan asumsi Anda memilih untuk membuat scaffold proyek VitePress di `./docs`, struktur file yang dihasilkan akan terlihat seperti ini:

```
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.js
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  └─ index.md
└─ package.json
```

Direktori `docs` dianggap sebagai **project root** dari situs VitePress. Direktori `.vitepress` adalah lokasi khusus untuk file konfigurasi VitePress, cache dev server, output build, dan kode kustomisasi tema opsional.

::: tip
Secara default, VitePress menyimpan cache dev server-nya di `.vitepress/cache`, dan output build produksi di `.vitepress/dist`. Jika menggunakan Git, Anda harus menambahkannya ke file `.gitignore` Anda. Lokasi ini juga dapat [dikonfigurasi](../reference/site-config#outdir).
:::

### File Konfigurasi

File konfigurasi (`.vitepress/config.js`) dapat digunakan untuk menyesuaikan berbagai aspek situs VitePress Anda, dengan opsi paling dasar adalah judul dan deskripsi situs:

```js [.vitepress/config.js]
export default {
  // opsi tingkat situs
  title: 'VitePress',
  description: 'Just playing around.',

  themeConfig: {
    // opsi tingkat tema
  }
}
```

Anda juga dapat mengonfigurasi perilaku tema melalui opsi `themeConfig`. Lihat [Referensi Konfigurasi](../reference/site-config) untuk detail lengkap semua opsi konfigurasi.

### File Sumber

File Markdown di luar direktori `.vitepress` dianggap sebagai **file sumber**.

VitePress menggunakan **file-based routing**: setiap file `.md` dikompilasi menjadi file `.html` yang sesuai dengan path yang sama. Misalnya, `index.md` akan dikompilasi menjadi `index.html`, dan dapat dikunjungi di path root `/` dari situs VitePress yang dihasilkan.

VitePress juga menyediakan kemampuan untuk menghasilkan URL yang bersih, menulis ulang path, dan menghasilkan halaman secara dinamis. Ini akan dibahas di [Panduan Routing](./routing).

## Menjalankan

Tool ini seharusnya juga telah menyuntikkan npm script berikut ke `package.json` Anda jika Anda mengizinkannya selama proses setup:

```json [package.json]
{
  ...
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  },
  ...
}
```

Script `docs:dev` akan memulai server dev lokal dengan hot updates instan. Jalankan dengan perintah berikut:

::: code-group

```sh [npm]
$ npm run docs:dev
```

```sh [pnpm]
$ pnpm run docs:dev
```

```sh [yarn]
$ yarn docs:dev
```

```sh [bun]
$ bun run docs:dev
```

:::

Alih-alih npm script, Anda juga dapat memanggil VitePress langsung dengan:

::: code-group

```sh [npm]
$ npx vitepress dev docs
```

```sh [pnpm]
$ pnpm vitepress dev docs
```

```sh [yarn]
$ yarn vitepress dev docs
```

```sh [bun]
$ bun vitepress dev docs
```

:::

Penggunaan command line lainnya didokumentasikan di [Referensi CLI](../reference/cli).

Server pengembangan seharusnya berjalan di `http://localhost:5173`. Kunjungi URL tersebut di browser Anda untuk melihat situs baru Anda beraksi!

## Selanjutnya?

- Untuk lebih memahami bagaimana file markdown dipetakan ke HTML yang dihasilkan, lanjutkan ke [Panduan Routing](./routing).

- Untuk menemukan lebih banyak tentang apa yang dapat Anda lakukan di halaman, seperti menulis konten markdown atau menggunakan Komponen Vue, lihat bagian "Writing" dari panduan. Tempat yang bagus untuk memulai adalah mempelajari tentang [Ekstensi Markdown](./markdown).

- Untuk menjelajahi fitur yang disediakan oleh tema dokumentasi default, lihat [Referensi Konfigurasi Tema Default](../reference/default-theme-config).

- Jika Anda ingin lebih menyesuaikan tampilan situs Anda, jelajahi cara untuk [Memperluas Tema Default](./extending-default-theme) atau [Membangun Tema Kustom](./custom-theme).

- Setelah situs dokumentasi Anda mulai terbentuk, pastikan untuk membaca [Panduan Deployment](./deploy).
