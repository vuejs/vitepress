---
description: Konfigurasikan footer global yang ditampilkan di bagian bawah halaman VitePress.
---

# Footer

VitePress akan menampilkan footer global di bagian bawah halaman ketika `themeConfig.footer` tersedia.

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
  // Pesan yang ditampilkan tepat sebelum copyright.
  message?: string

  // Teks copyright sebenarnya.
  copyright?: string
}
```

Konfigurasi di atas juga mendukung string HTML. Jadi, misalnya, jika Anda ingin mengonfigurasi teks footer agar memiliki beberapa tautan, Anda dapat menyesuaikan konfigurasi sebagai berikut:

```ts
export default {
  themeConfig: {
    footer: {
      message: 'Dirilis di bawah <a href="https://github.com/vuejs/vitepress/blob/main/LICENSE">Lisensi MIT</a>.',
      copyright: 'Hak Cipta © 2019-sekarang <a href="https://github.com/yyx990803">Evan You</a>'
    }
  }
}
```

::: warning
Hanya elemen inline yang dapat digunakan di `message` dan `copyright` karena dirender di dalam elemen `<p>`. Jika Anda ingin menambahkan elemen block, pertimbangkan untuk menggunakan slot [`layout-bottom`](../guide/extending-default-theme#layout-slots).
:::

Perhatikan bahwa footer tidak akan ditampilkan ketika [SideBar](./default-theme-sidebar) terlihat.

## Konfigurasi Frontmatter

Ini dapat dinonaktifkan per halaman menggunakan opsi `footer` di frontmatter:

```yaml
---
footer: false
---
```
