---
description: Pilih antara layout doc, page, dan home di tema default VitePress.
---

# Layout

Anda dapat memilih layout halaman dengan mengatur opsi `layout` di [frontmatter](./frontmatter-config) halaman. Tersedia 3 opsi layout, `doc`, `page`, dan `home`. Jika tidak ada yang ditentukan, maka halaman diperlakukan sebagai halaman `doc`.

```yaml
---
layout: doc
---
```

## Layout Doc

Opsi `doc` adalah layout default dan memberikan gaya pada seluruh konten Markdown menjadi tampilan "dokumentasi". Ini bekerja dengan membungkus seluruh konten dalam kelas css `vp-doc`, dan menerapkan gaya pada elemen-elemen di dalamnya.

Hampir semua elemen generik seperti `p`, atau `h2` mendapatkan gaya khusus. Oleh karena itu, perlu diingat bahwa jika Anda menambahkan HTML kustom di dalam konten Markdown, elemen-elemen tersebut juga akan terpengaruh oleh gaya tersebut.

Layout ini juga menyediakan fitur khusus dokumentasi yang tercantum di bawah. Fitur-fitur ini hanya diaktifkan di layout ini.

- Edit Link
- Prev Next Link
- Outline
- [Carbon Ads](./default-theme-carbon-ads)

## Layout Page

Opsi `page` diperlakukan sebagai "halaman kosong". Markdown akan tetap di-parse, dan semua [Ekstensi Markdown](../guide/markdown) bekerja sama seperti layout `doc`, tetapi konten tidak mendapatkan gaya default apa pun.

Dengan layout page, Anda dapat mengatur gaya semuanya sendiri tanpa tema VitePress memengaruhi markup. Ini berguna ketika Anda ingin membuat halaman kustom Anda sendiri.

Perhatikan bahwa bahkan di layout ini, sidebar tetap akan muncul jika halaman memiliki konfigurasi sidebar yang cocok.

## Layout Home

Opsi `home` akan menghasilkan "Homepage" bertemplate. Dalam layout ini, Anda dapat mengatur opsi tambahan seperti `hero` dan `features` untuk menyesuaikan konten lebih lanjut. Kunjungi [Default Theme: Home Page](./default-theme-home-page) untuk detail lebih lanjut.

## Tanpa Layout

Jika Anda tidak menginginkan layout apa pun, Anda dapat mengirimkan `layout: false` melalui frontmatter. Opsi ini berguna jika Anda menginginkan landing page yang sepenuhnya dapat disesuaikan (tanpa sidebar, navbar, atau footer secara default).

## Layout Kustom

Anda juga dapat menggunakan layout kustom:

```md
---
layout: foo
---
```

Ini akan mencari komponen bernama `foo` yang terdaftar dalam konteks. Misalnya, Anda dapat mendaftarkan komponen Anda secara global di `.vitepress/theme/index.ts`:

```ts
import DefaultTheme from 'vitepress/theme'
import Foo from './Foo.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('foo', Foo)
  }
}
```
