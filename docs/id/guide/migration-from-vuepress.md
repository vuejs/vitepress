# Migrasi dari VuePress

## Config

### Sidebar

Sidebar tidak lagi otomatis diisi dari frontmatter. Anda dapat [membaca frontmatter sendiri](https://github.com/vuejs/vitepress/issues/572#issuecomment-1170116225) untuk mengisi sidebar secara dinamis. [Utilitas tambahan untuk ini](https://github.com/vuejs/vitepress/issues/96) mungkin disediakan di masa mendatang.

## Markdown

### Gambar

Tidak seperti VuePress, VitePress menangani [`base`](./asset-handling#base-url) dari konfigurasi Anda secara otomatis saat Anda menggunakan gambar statis.

Oleh karena itu, sekarang Anda dapat merender gambar tanpa tag `img`.

```diff
- <img :src="$withBase('/foo.png')" alt="foo">
+ ![foo](/foo.png)
```

::: warning
Untuk gambar dinamis Anda tetap memerlukan `withBase` seperti yang ditunjukkan di [panduan Base URL](./asset-handling#base-url).
:::

Gunakan regex `<img.*withBase\('(.*)'\).*alt="([^"]*)".*>` untuk mencari dan menggantinya dengan `![$2]($1)` untuk mengganti semua gambar dengan sintaks `![](...)`.

---

selengkapnya menyusul...
